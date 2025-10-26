import { NextRequest, NextResponse } from "next/server";

import { getUser } from "@/hooks/get-user";
import supabaseAdmin from "@/lib/supabase/admin";
import {
  DashboardData,
  FederatedRun,
  Node,
  NodeSession,
  Project,
} from "@/lib/fetchers/types";

export async function GET(request: NextRequest) {
  const projectId = request.nextUrl.searchParams.get("projectId");
  if (!projectId) {
    return NextResponse.json(
      { error: "projectId query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const { data: nodesData, error: nodesError } = await supabase
      .from("nodes")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    if (nodesError) {
      return NextResponse.json({ error: nodesError.message }, { status: 500 });
    }

    const nodes = (nodesData ?? []) as Node[];
    const ownsProject = project.created_by === user.id;
    const participatesInProject = nodes.some((node) => node.user_id === user.id);

    if (!ownsProject && !participatesInProject) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const nodeIds = nodes.map((node) => node.id);
    let nodeSessions: NodeSession[] = [];
    if (nodeIds.length) {
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("node_sessions")
        .select("*")
        .in("node_id", nodeIds)
        .order("created_at", { ascending: false })
        .limit(100);

      if (sessionsError) {
        return NextResponse.json({ error: sessionsError.message }, { status: 500 });
      }

      nodeSessions = (sessionsData ?? []) as NodeSession[];
    }

    const { data: runsData, error: runsError } = await supabase
      .from("federated_runs")
      .select("*")
      .eq("project_id", projectId)
      .order("started_at", { ascending: false })
      .limit(20);

    if (runsError) {
      return NextResponse.json({ error: runsError.message }, { status: 500 });
    }

    const runs = (runsData ?? []) as FederatedRun[];
    const activeRun = runs.find((run) => run.status === "running") ?? null;

    const payload: DashboardData = {
      project,
      nodes,
      nodeSessions,
      activeRun,
      recentRuns: runs,
    };

    return NextResponse.json(payload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
