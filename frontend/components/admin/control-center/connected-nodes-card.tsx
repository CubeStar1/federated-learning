"use client";

import { ActivitySquare, Network } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { Node, NodeSession } from "@/lib/fetchers/types";

interface ConnectedNodesCardProps {
  nodes: Array<{ node: Node; session?: NodeSession }>;
  formatTimestamp: (value?: string | null) => string;
  isLoading: boolean;
}

export default function ConnectedNodesCard({
  nodes,
  formatTimestamp,
  isLoading,
}: ConnectedNodesCardProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border bg-linear-to-br from-violet-50 via-white to-emerald-50 p-6 shadow-xl ring-1 ring-violet-200/50 dark:border-violet-400/20 dark:from-violet-500/10 dark:via-transparent dark:to-emerald-500/10",
      )}
    >
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-violet-400 via-sky-300 to-emerald-400"
        aria-hidden
      />
      <header className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-700 shadow-sm dark:bg-white/10 dark:text-violet-100">
            <Network className="h-4 w-4" />
            Connected nodes
          </div>
          <p className="text-sm text-muted-foreground">Most recent heartbeat per node.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-700 dark:bg-violet-500/20 dark:text-violet-100">
          <ActivitySquare className="h-4 w-4" />
          {nodes.length} nodes
        </span>
      </header>

      <div className="mt-6">
        <ScrollArea className="h-80 pr-2">
          <div className="space-y-3">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading node status…</p>
            ) : null}
            {!isLoading && nodes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Waiting for SuperNodes to join this federation.
              </p>
            ) : null}
            {nodes.map(({ node, session }) => (
              <div
                key={node.id}
                className="rounded-2xl border border-violet-200/50 bg-white/70 p-4 shadow-sm transition hover:border-violet-300/70 dark:border-violet-400/30 dark:bg-white/10"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">
                      {node.display_name ?? node.external_id}
                    </p>
                    <p className="text-xs text-muted-foreground">Role: {node.role}</p>
                  </div>
                  <Badge variant="outline" className="rounded-full border-violet-400/40 px-3 py-1 text-[11px] uppercase tracking-wide text-violet-700 dark:text-violet-100">
                    {session?.status ?? "unknown"}
                  </Badge>
                </div>
                <Separator className="my-3" />
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>
                    Started {formatTimestamp(session?.started_at)} • PID {session?.pid ?? "—"}
                  </p>
                  <p>
                    Logs {session?.log_stream ? `${session.log_stream.length} chars` : "empty"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </section>
  );
}
