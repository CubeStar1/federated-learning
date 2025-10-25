import { NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabase/admin";
import {
  FederatedRun,
  Node,
  Project,
  ProjectSummary,
} from "@/lib/fetchers/types";

export async function GET() {
  try {
    const supabase = supabaseAdmin();

    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .select("*")
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
