import { NextResponse } from "next/server";

import { getUser } from "@/hooks/get-user";
import supabaseAdmin from "@/lib/supabase/admin";
import { FederatedRun, Node, NodeSession } from "@/lib/fetchers/types";

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
      .eq("id", runId)
      .maybeSingle();

    if (runError) {
      return NextResponse.json({ error: runError.message }, { status: 500 });
    }

    if (!runData) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }

    const run = runData as FederatedRun;

    const { data: nodesData, error: nodesError } = await supabase
      .from("nodes")
      .select("*")
      .eq("project_id", projectId);

    if (nodesError) {
      return NextResponse.json({ error: nodesError.message }, { status: 500 });
    }

    const nodes = (nodesData ?? []) as Node[];
    const coordinatorNode = nodes.find(n => n.role === "coordinator");
    const participantNodes = nodes.filter(n => n.role === "participant");

    const nodeIds = nodes.map(n => n.id);

    if (nodeIds.length === 0) {
      return NextResponse.json({ 
        run, 
        coordinatorSession: null,
        participantSessions: [] 
      });
    }

    const runStartTime = run.started_at;
    const runEndTime = run.ended_at || new Date().toISOString();

    const { data: sessionsData, error: sessionsError } = await supabase
      .from("node_sessions")
      .select("*")
      .in("node_id", nodeIds)
      .lte("started_at", runEndTime)
      .order("started_at", { ascending: false });

    if (sessionsError) {
      return NextResponse.json({ error: sessionsError.message }, { status: 500 });
    }

    const sessions = (sessionsData ?? []) as NodeSession[];
    
    const relevantSessions = sessions.filter(session => {
      const sessionStart = new Date(session.started_at || 0);
      const sessionEnd = session.ended_at ? new Date(session.ended_at) : new Date();
      const runStart = new Date(runStartTime || 0);
      const runEnd = new Date(runEndTime);
      
      return sessionStart <= runEnd && sessionEnd >= runStart;
    });

    const coordinatorSession = coordinatorNode 
      ? (() => {
          const session = relevantSessions.find(s => s.node_id === coordinatorNode.id);
          return session ? { session, node: coordinatorNode } : null;
        })()
      : null;

    const participantSessions = participantNodes
      .map(node => {
        const session = relevantSessions.find(s => s.node_id === node.id);
        return session ? { session, node } : null;
      })
      .filter((item): item is { session: NodeSession; node: Node } => item !== null);

    return NextResponse.json({ 
      run, 
      coordinatorSession,
      participantSessions 
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
