import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { getUser } from "@/hooks/get-user";
import { Node, Project } from "@/lib/fetchers/types";
import supabaseAdmin from "@/lib/supabase/admin";

const toIdentifier = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const ensureUniqueValue = async (
  supabase: ReturnType<typeof supabaseAdmin>,
  table: string,
  column: string,
  baseValue: string,
  fallbackPrefix: string
): Promise<string> => {
  let candidate = baseValue.length ? baseValue : `${fallbackPrefix}-${randomUUID().slice(0, 6)}`;
  let attempt = 1;

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select("id")
      .eq(column, candidate)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return candidate;
    }

    candidate = `${baseValue}-${attempt++}`;
    if (!baseValue.length) {
      candidate = `${fallbackPrefix}-${randomUUID().slice(0, 6)}`;
    }
  }
};

interface JoinProjectPayload {
  display_name?: string;
  external_id?: string;
}

interface Params {
  params: {
    projectId: string;
  };
}

export async function POST(request: Request, { params }: Params) {
  const { projectId } = params;
  if (!projectId) {
    return NextResponse.json({ error: "Project id is required" }, { status: 400 });
  }

  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload: JoinProjectPayload = {};
    try {
      payload = await request.json();
    } catch {
      payload = {};
    }

    const supabase = supabaseAdmin();

    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .maybeSingle();

    if (projectError) {
      return NextResponse.json({ error: projectError.message }, { status: 500 });
    }

    if (!projectData) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const project = projectData as Project;

    const { data: existingUserRecord, error: userLookupError } = await supabase
      .from("users")
      .select("id, role, display_name, email, metadata")
      .eq("id", user.id)
      .maybeSingle();

    if (userLookupError) {
      return NextResponse.json({ error: userLookupError.message }, { status: 500 });
    }

    const now = new Date().toISOString();
    const metadata = (user.user_metadata && typeof user.user_metadata === "object"
      ? user.user_metadata
      : {}) as Record<string, unknown>;
    const rawFullName = metadata["full_name"];
    const preferredName =
      typeof payload.display_name === "string" && payload.display_name.trim().length
        ? payload.display_name.trim()
        : typeof rawFullName === "string" && rawFullName.trim().length
        ? rawFullName.trim()
        : user.email ?? `${project.name} participant`;

    if (!existingUserRecord) {
      const { error: insertUserError } = await supabase.from("users").insert({
        id: user.id,
        role: "client",
        email: user.email ?? null,
        display_name: preferredName,
        metadata,
      });

      if (insertUserError) {
        return NextResponse.json({ error: insertUserError.message }, { status: 500 });
      }
    } else {
      const { error: updateUserError } = await supabase
        .from("users")
        .update({
          email: user.email ?? existingUserRecord.email ?? null,
          display_name: preferredName ?? existingUserRecord.display_name ?? null,
          metadata,
          updated_at: now,
        })
        .eq("id", user.id);

      if (updateUserError) {
        return NextResponse.json({ error: updateUserError.message }, { status: 500 });
      }
    }

    const { data: existingNode, error: existingNodeError } = await supabase
      .from("nodes")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingNodeError) {
      return NextResponse.json({ error: existingNodeError.message }, { status: 500 });
    }

    if (existingNode) {
      return NextResponse.json(
        { project, node: existingNode as Node, already_registered: true },
        { status: 200 }
      );
    }

    const baseExternalId =
      typeof payload.external_id === "string" && payload.external_id.trim().length
        ? payload.external_id.trim()
        : `${project.slug}-participant-${user.id.slice(0, 6)}`;

    const externalId = await ensureUniqueValue(
      supabase,
      "nodes",
      "external_id",
      toIdentifier(baseExternalId),
      `${project.slug}-participant`
    );

    const displayName = preferredName ?? `${project.name} participant`;

    const { data: insertedNode, error: insertNodeError } = await supabase
      .from("nodes")
      .insert({
        project_id: projectId,
        user_id: user.id,
        external_id: externalId,
        role: "participant",
        display_name: displayName,
        metadata: {
          registered_via: "client_portal",
          created_at: now,
          user_email: user.email ?? null,
        },
      })
      .select("*")
      .single();

    if (insertNodeError) {
      return NextResponse.json({ error: insertNodeError.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        project,
        node: insertedNode as Node,
        already_registered: false,
      },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
