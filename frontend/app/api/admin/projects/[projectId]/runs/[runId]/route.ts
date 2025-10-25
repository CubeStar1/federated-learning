import { NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabase/admin";
import { FederatedRun, NodeSession } from "@/lib/fetchers/types";

interface Params {
  params: {
    projectId: string;
    runId: string;
  };
}

export async function GET(_request: Request, { params }: Params) {
  const { projectId, runId } = params;
  if (!projectId || !runId) {
    return NextResponse.json(
      { error: "Project id and run id are required" },
      { status: 400 }
    );
  }

  try {
    const supabase = supabaseAdmin();

    const { data: runData, error: runError } = await supabase
      .from("federated_runs")
      .select("*")
      .eq("project_id", projectId)
      .eq("id", runId)
      .maybeSingle();

    if (runError) {
      return NextResponse.json({ error: runError.message }, { status: 500 });
    }

    if (!runData) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }

    const run = runData as FederatedRun;

    let coordinatorSession: NodeSession | null = null;
    if (run.coordinator_session_id) {
      const { data: sessionData, error: sessionError } = await supabase
        .from("node_sessions")
        .select("*")
        .eq("id", run.coordinator_session_id)
        .maybeSingle();

      if (sessionError) {
        return NextResponse.json({ error: sessionError.message }, { status: 500 });
      }

      coordinatorSession = (sessionData ?? null) as NodeSession | null;
    }

    return NextResponse.json({ run, coordinatorSession });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
