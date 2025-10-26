import { NextResponse } from "next/server";

import { getUser } from "@/hooks/get-user";
import supabaseAdmin from "@/lib/supabase/admin";
import { FederatedRun, Node, Project } from "@/lib/fetchers/types";

interface Params {
  params: {
    projectId: string;
  };
}

export async function GET(_: Request, { params }: Params) {
  const { projectId } = params;
  if (!projectId) {
    return NextResponse.json({ error: "Project id is required" }, { status: 400 });
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

    const [{ data: nodesData, error: nodesError }, { data: runsData, error: runsError }] =
      await Promise.all([
        supabase.from("nodes").select("*").eq("project_id", projectId),
        supabase
          .from("federated_runs")
          .select("*")
          .eq("project_id", projectId)
          .order("started_at", { ascending: false })
          .limit(10),
      ]);

    if (nodesError) {
      return NextResponse.json({ error: nodesError.message }, { status: 500 });
    }

    if (runsError) {
      return NextResponse.json({ error: runsError.message }, { status: 500 });
    }

    const nodes = (nodesData ?? []) as Node[];
    const runs = (runsData ?? []) as FederatedRun[];

    const coordinatorCount = nodes.filter((node) => node.role === "coordinator").length;
    const participantCount = nodes.filter((node) => node.role === "participant").length;
    const nodeCount = nodes.length;
    const activeRun = runs.find((run) => run.status === "running") ?? null;
    const latestRun = runs.reduce<FederatedRun | null>((latest, run) => {
      if (!latest) {
        return run;
      }
      const latestTime = latest.started_at ? new Date(latest.started_at).getTime() : 0;
      const runTime = run.started_at ? new Date(run.started_at).getTime() : 0;
      return runTime > latestTime ? run : latest;
    }, null);

    return NextResponse.json({
      project,
      stats: {
        nodeCount,
        coordinatorCount,
        participantCount,
        activeRun: activeRun ?? null,
        latestRun: latestRun ?? null,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
