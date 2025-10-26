"use client";

import { useMemo } from "react";
import { Users, CheckCircle2, XCircle, Clock, Server } from "lucide-react";

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/admin/projects/shared/glass-card";
import { Node, NodeSession } from "@/lib/fetchers/types";
import { TopologyViewer } from "./topology/topology-viewer";

interface RunParticipantsProps {
  coordinator: {
    session: NodeSession;
    node: Node;
  } | null;
  participants: Array<{
    session: NodeSession;
    node: Node;
  }>;
}

const getStatusBadgeClass = (status: string) => {
  switch (status.toLowerCase()) {
    case "running":
      return "bg-green-500/10 text-green-600 border-green-500/20";
    case "completed":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    case "failed":
      return "bg-red-500/10 text-red-600 border-red-500/20";
    default:
      return "bg-gray-500/10 text-gray-600 border-gray-500/20";
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "running":
      return <Clock className="h-3 w-3" />;
    case "completed":
      return <CheckCircle2 className="h-3 w-3" />;
    case "failed":
      return <XCircle className="h-3 w-3" />;
    default:
      return <Clock className="h-3 w-3" />;
  }
};

export default function RunParticipants({ coordinator, participants }: RunParticipantsProps) {
  const allNodes = useMemo(() => {
    const list = [];
    if (coordinator) {
      list.push({ ...coordinator, isCoordinator: true });
    }
    list.push(...participants.map(p => ({ ...p, isCoordinator: false })));
    return list;
  }, [coordinator, participants]);

  const hasTopology = coordinator || participants.length > 0;

  return (
    <GlassCard accent="primary">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Users className="h-4 w-4 text-primary" />
              Network Topology
            </CardTitle>
            <CardDescription>
              Federated learning network structure for this run
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Server className="h-3 w-3" />
              {coordinator ? 1 : 0} Coordinator
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {participants.length} Participants
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {hasTopology ? (
            <>
              <TopologyViewer coordinator={coordinator} participants={participants} />

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {allNodes.map(({ session, node, isCoordinator }) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 bg-card p-3 transition-shadow hover:shadow-md"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        {isCoordinator && (
                          <Server className="h-3.5 w-3.5 text-primary" />
                        )}
                        <span className="text-sm font-semibold text-foreground">
                          {node.display_name || node.external_id}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {isCoordinator ? "Coordinator" : "Participant"}
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`flex items-center gap-1 text-xs ${getStatusBadgeClass(session.status)}`}
                    >
                      {getStatusIcon(session.status)}
                      <span className="capitalize">{session.status}</span>
                    </Badge>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No network topology data available for this run
            </p>
          )}
        </div>
      </CardContent>
    </GlassCard>
  );
}
