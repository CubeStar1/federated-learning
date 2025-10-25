"use client";

import { formatDistanceToNow } from "date-fns";

import { Activity, Clock, Cpu, Network } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/admin/projects/shared/glass-card";
import { NodeSession } from "@/lib/fetchers/types";

interface RunNodeSessionCardProps {
  session: NodeSession | null;
}

const formatTimestamp = (value?: string | null) => {
  if (!value) return "—";
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true });
  } catch {
    return value;
  }
};

export default function RunNodeSessionCard({ session }: RunNodeSessionCardProps) {
  if (!session) {
    return (
      <GlassCard className="border border-dashed border-primary/20 bg-white/70" showAccent={false}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Network className="h-4 w-4 text-primary" />
            Coordinator session
          </CardTitle>
          <CardDescription>No coordinator session information available.</CardDescription>
        </CardHeader>
      </GlassCard>
    );
  }

  return (
    <GlassCard accent="emerald">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Network className="h-4 w-4 text-primary" />
          Coordinator session
        </CardTitle>
        <CardDescription>State of the coordinator node during this run.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 px-3 py-2 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200">
          <span>Status</span>
          <Badge variant={session.status === "running" ? "default" : "secondary"} className="capitalize">
            {session.status}
          </Badge>
        </div>
        <div className="space-y-2 text-xs text-muted-foreground sm:text-sm">
          <div className="flex items-center justify-between text-foreground">
            <span className="inline-flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Session ID
            </span>
            <span className="font-medium">{session.id}</span>
          </div>
          <div className="flex items-center justify-between text-foreground">
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Started
            </span>
            <span className="font-medium">{formatTimestamp(session.started_at)}</span>
          </div>
          <div className="flex items-center justify-between text-foreground">
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Ended
            </span>
            <span className="font-medium">{formatTimestamp(session.ended_at)}</span>
          </div>
          <div className="flex items-center justify-between text-foreground">
            <span className="inline-flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" />
              PID
            </span>
            <span className="font-medium">{session.pid ?? "—"}</span>
          </div>
        </div>
        {session.runtime_config ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Runtime config</p>
            <pre className="max-h-60 overflow-auto rounded-xl border border-primary/10 bg-background/70 p-4 text-xs leading-relaxed shadow-sm">
              {JSON.stringify(session.runtime_config, null, 2)}
            </pre>
          </div>
        ) : null}
      </CardContent>
    </GlassCard>
  );
}
