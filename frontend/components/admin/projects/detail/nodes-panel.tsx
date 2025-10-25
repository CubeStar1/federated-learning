"use client";

import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GlassCard } from "@/components/admin/projects/shared/glass-card";
import { Node, NodeSession } from "@/lib/fetchers/types";

interface NodesPanelProps {
  nodes: Node[];
  sessions: NodeSession[];
}

const describeSession = (session?: NodeSession | null) => {
  if (!session) {
    return "No sessions yet";
  }

  const startedAt = session.started_at
    ? formatDistanceToNow(new Date(session.started_at), { addSuffix: true })
    : "an unknown time";
  const endedAt = session.ended_at
    ? formatDistanceToNow(new Date(session.ended_at), { addSuffix: true })
    : null;

  if (session.status === "running") {
    return `Running • started ${startedAt}`;
  }

  return endedAt
    ? `${session.status ?? "finished"} • ended ${endedAt}`
    : `${session.status ?? "offline"} • started ${startedAt}`;
};

const getLatestSessions = (sessions: NodeSession[]) => {
  const byNode = new Map<string, NodeSession>();
  sessions.forEach((session) => {
    const current = byNode.get(session.node_id);
    const candidateTime = session.started_at ? new Date(session.started_at).getTime() : 0;
    const currentTime = current?.started_at ? new Date(current.started_at).getTime() : 0;
    if (!current || candidateTime > currentTime) {
      byNode.set(session.node_id, session);
    }
  });
  return byNode;
};

const NodeRow = ({ node, session }: { node: Node; session?: NodeSession }) => (
  <div className="rounded-2xl border border-primary/10 bg-white/80 p-4 shadow-sm transition hover:border-primary/40 hover:shadow-md dark:bg-slate-200/10">
    <div className="flex items-center justify-between gap-3">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{node.display_name ?? node.external_id}</p>
        <p className="text-xs text-muted-foreground">External ID • {node.external_id}</p>
      </div>
      <Badge
        variant={session?.status === "running" ? "default" : "secondary"}
        className="rounded-full px-3 py-1 text-[11px] uppercase tracking-wide"
      >
        {session?.status ?? "offline"}
      </Badge>
    </div>
    <p className="mt-3 text-xs text-muted-foreground">{describeSession(session)}</p>
    {session?.pid ? (
      <p className="mt-2 text-xs text-muted-foreground">PID • {session.pid}</p>
    ) : null}
  </div>
);

export default function NodesPanel({ nodes, sessions }: NodesPanelProps) {
  const latestSessions = useMemo(() => getLatestSessions(sessions), [sessions]);

  const coordinators = useMemo(
    () => nodes.filter((node) => node.role === "coordinator"),
    [nodes]
  );
  const participants = useMemo(
    () => nodes.filter((node) => node.role === "participant"),
    [nodes]
  );

  return (
    <GlassCard  accent="primary">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Connected nodes</CardTitle>
        <CardDescription>
          Latest heartbeat per node. Use the control panel to manage SuperLink connectivity.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <section className="space-y-3">
            <div className="flex items-center justify-between text-sm font-medium text-foreground">
              <span>Coordinators</span>
              <Badge variant="outline" className="rounded-full border-primary/40 px-3 py-1 text-[11px] uppercase tracking-wide text-primary">
                {coordinators.length}
              </Badge>
            </div>
            {coordinators.length ? (
              <ScrollArea className="h-64">
                <div className="space-y-3 pr-2">
                  {coordinators.map((node) => (
                    <NodeRow key={node.id} node={node} session={latestSessions.get(node.id)} />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground">No coordinators registered.</p>
            )}
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between text-sm font-medium text-foreground">
              <span>Participants</span>
              <Badge variant="outline" className="rounded-full border-primary/40 px-3 py-1 text-[11px] uppercase tracking-wide text-primary">
                {participants.length}
              </Badge>
            </div>
            {participants.length ? (
              <ScrollArea className="h-64">
                <div className="space-y-3 pr-2">
                  {participants.map((node) => (
                    <NodeRow key={node.id} node={node} session={latestSessions.get(node.id)} />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground">No participants registered yet.</p>
            )}
          </section>
        </div>
      </CardContent>
    </GlassCard>
  );
}
