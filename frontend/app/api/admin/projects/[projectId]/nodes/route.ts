import { NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabase/admin";
import { Node, NodeSession } from "@/lib/fetchers/types";

interface Params {
  params: {
    projectId: string;
  };
}

export async function GET(_request: Request, { params }: Params) {
  const { projectId } = params;
  if (!projectId) {
    return NextResponse.json({ error: "Project id is required" }, { status: 400 });
  }

  try {
    const supabase = supabaseAdmin();

    const { data: nodeData, error: nodeError } = await supabase
      .from("nodes")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    if (nodeError) {
      return NextResponse.json({ error: nodeError.message }, { status: 500 });
    }

    const nodes = (nodeData ?? []) as Node[];
    const nodeIds = nodes.map((node) => node.id);

    let sessions: NodeSession[] = [];
    if (nodeIds.length) {
      const { data: sessionData, error: sessionError } = await supabase
        .from("node_sessions")
        .select("*")
        .in("node_id", nodeIds)
        .order("created_at", { ascending: false })
        .limit(100);

      if (sessionError) {
        return NextResponse.json({ error: sessionError.message }, { status: 500 });
      }

      sessions = (sessionData ?? []) as NodeSession[];
    }

    return NextResponse.json({ nodes, sessions });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
