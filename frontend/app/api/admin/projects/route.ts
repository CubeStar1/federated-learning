import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { CreateProjectPayload } from "@/lib/fetchers/types";
import supabaseAdmin from "@/lib/supabase/admin";
import {
  FederatedRun,
  Node,
  Project,
  ProjectSummary,
} from "@/lib/fetchers/types";
import { getUser } from "@/hooks/get-user";

const toSlug = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

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

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = supabaseAdmin();

    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });

    if (projectError) {
      return NextResponse.json({ error: projectError.message }, { status: 500 });
    }

    const projects = (projectData ?? []) as Project[];
    const projectIds = projects.map((project) => project.id);

    let nodes: Node[] = [];
    if (projectIds.length) {
      const { data: nodeData, error: nodeError } = await supabase
        .from("nodes")
        .select("*")
        .in("project_id", projectIds);

      if (nodeError) {
        return NextResponse.json({ error: nodeError.message }, { status: 500 });
      }

      nodes = (nodeData ?? []) as Node[];
    }

    let runs: FederatedRun[] = [];
    if (projectIds.length) {
      const { data: runData, error: runError } = await supabase
        .from("federated_runs")
        .select("*")
        .in("project_id", projectIds)
        .order("started_at", { ascending: false });

      if (runError) {
        return NextResponse.json({ error: runError.message }, { status: 500 });
      }

      runs = (runData ?? []) as FederatedRun[];
    }

    const summaries: ProjectSummary[] = projects.map((project) => {
      const projectNodes = nodes.filter((node) => node.project_id === project.id);
      const projectRuns = runs.filter((run) => run.project_id === project.id);
      const coordinatorCount = projectNodes.filter(
        (node) => node.role === "coordinator"
      ).length;
      const participantCount = projectNodes.filter(
        (node) => node.role === "participant"
      ).length;
      const nodeCount = projectNodes.length;
      const activeRunCount = projectRuns.filter(
        (run) => run.status === "running"
      ).length;
      const latestRun = projectRuns.reduce<FederatedRun | null>((latest, run) => {
        if (!latest) {
          return run;
        }
        const latestTime = latest.started_at
          ? new Date(latest.started_at).getTime()
          : 0;
        const runTime = run.started_at ? new Date(run.started_at).getTime() : 0;
        return runTime > latestTime ? run : latest;
      }, null);

      return {
        project,
        nodeCount,
        coordinatorCount,
        participantCount,
        activeRunCount,
        latestRun: latestRun ?? null,
      };
    });

    return NextResponse.json(summaries);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload: CreateProjectPayload;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const name = typeof payload.name === "string" ? payload.name.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    const description =
      typeof payload.description === "string" && payload.description.trim().length
        ? payload.description.trim()
        : null;

    const supabase = supabaseAdmin();

    const slugBaseSource =
      typeof payload.slug === "string" && payload.slug.trim().length
        ? payload.slug
        : name;
    const baseSlug = toSlug(slugBaseSource);
    const slug = await ensureUniqueValue(
      supabase,
      "projects",
      "slug",
      baseSlug,
      "project"
    );

    const coordinatorDisplayName =
      typeof payload.coordinator_display_name === "string" &&
      payload.coordinator_display_name.trim().length
        ? payload.coordinator_display_name.trim()
        : `${name} Coordinator`;

    const coordinatorExternalBase =
      typeof payload.coordinator_external_id === "string" &&
      payload.coordinator_external_id.trim().length
        ? payload.coordinator_external_id
        : `${slug}-coordinator`;

    const coordinatorExternalId = await ensureUniqueValue(
      supabase,
      "nodes",
      "external_id",
      toIdentifier(coordinatorExternalBase),
      `${slug}-coordinator`
    );

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        name,
        slug,
        description,
        created_by: user.id,
      })
      .select("*")
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: projectError?.message ?? "Failed to create project" },
        { status: 500 }
      );
    }

    const { data: coordinatorNode, error: nodeError } = await supabase
      .from("nodes")
      .insert({
        project_id: project.id,
        user_id: user.id,
        external_id: coordinatorExternalId,
        role: "coordinator",
        display_name: coordinatorDisplayName,
        metadata: {
          registered_via: "admin_portal",
          created_at: new Date().toISOString(),
        },
      })
      .select("*")
      .single();

    if (nodeError || !coordinatorNode) {
      await supabase.from("projects").delete().eq("id", project.id);
      return NextResponse.json(
        { error: nodeError?.message ?? "Failed to create coordinator node" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { project, coordinator_node: coordinatorNode },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
