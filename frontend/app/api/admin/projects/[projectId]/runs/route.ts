import { NextRequest, NextResponse } from "next/server";

import { getUser } from "@/hooks/get-user";
import supabaseAdmin from "@/lib/supabase/admin";
import { FederatedRun } from "@/lib/fetchers/types";

interface Params {
  params: {
    projectId: string;
  };
}

export async function GET(request: NextRequest, { params }: Params) {
  const { projectId } = params;
  if (!projectId) {
    return NextResponse.json({ error: "Project id is required" }, { status: 400 });
  }

  const limitParam = request.nextUrl.searchParams.get("limit");
  const limit = Number(limitParam ?? "25");

  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = supabaseAdmin();

    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("created_by", user.id)
      .maybeSingle();

    if (projectError) {
      return NextResponse.json({ error: projectError.message }, { status: 500 });
    }

    if (!projectData) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const { data: runData, error: runError } = await supabase
      .from("federated_runs")
      .select("*")
      .eq("project_id", projectId)
      .order("started_at", { ascending: false })
      .limit(Number.isFinite(limit) && limit > 0 ? limit : 25);

    if (runError) {
      return NextResponse.json({ error: runError.message }, { status: 500 });
    }

    const runs = (runData ?? []) as FederatedRun[];
    return NextResponse.json({ runs });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
