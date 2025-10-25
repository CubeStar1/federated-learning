"use client";

import { formatDistanceToNow } from "date-fns";
import { Activity, Gauge, Network } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/admin/projects/shared/glass-card";
import { ProjectDetailStats } from "@/lib/fetchers/types";

interface ProjectStatsProps {
  stats: ProjectDetailStats;
}

const formatTimestamp = (value?: string | null) => {
  if (!value) return "—";
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true });
  } catch {
    return value;
  }
};

export default function ProjectStats({ stats }: ProjectStatsProps) {
  const { nodeCount, coordinatorCount, participantCount, activeRun, latestRun } = stats;
  const coordinatorLabel = coordinatorCount === 1 ? "coordinator" : "coordinators";
  const participantLabel = participantCount === 1 ? "participant" : "participants";

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <GlassCard className="group" accent="primary">
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Network className="h-4 w-4 text-primary" />
            Node summary
          </CardTitle>
          <CardDescription>Total registered SuperNodes in this project.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-4xl font-semibold tracking-tight text-foreground">{nodeCount}</p>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>
              <strong className="font-semibold text-foreground">{coordinatorCount}</strong> {coordinatorLabel}
            </span>
            <span>
              <strong className="font-semibold text-foreground">{participantCount}</strong> {participantLabel}
            </span>
          </div>
        </CardContent>
      </GlassCard>

      <GlassCard accent="violet">
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Gauge className="h-4 w-4 text-primary" />
            Latest run
          </CardTitle>
          <CardDescription>Recently executed federation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          {latestRun ? (
            <>
              <Badge
                variant={latestRun.status === "running" ? "default" : "secondary"}
                className="w-fit rounded-full px-3 py-1 text-[11px] uppercase tracking-wide"
              >
                {latestRun.status}
              </Badge>
              <div className="space-y-1 text-foreground">
                <p className="font-semibold">{latestRun.label ?? latestRun.id}</p>
                <p className="text-xs text-muted-foreground">Run ID • {latestRun.id}</p>
              </div>
              <p>Started {formatTimestamp(latestRun.started_at)}</p>
              {latestRun.ended_at ? <p>Ended {formatTimestamp(latestRun.ended_at)}</p> : null}
            </>
          ) : (
            <p>No runs have been executed yet. Launch one from the control panel.</p>
          )}
        </CardContent>
      </GlassCard>

      <GlassCard accent="emerald">
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Activity className="h-4 w-4 text-primary" />
            Active run
          </CardTitle>
          <CardDescription>Real-time SuperLink workload status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          {activeRun ? (
            <>
              <Badge className="w-fit rounded-full px-3 py-1 text-[11px] uppercase tracking-wide">
                {activeRun.status}
              </Badge>
              <div className="space-y-1 text-foreground">
                <p className="font-semibold">{activeRun.label ?? activeRun.id}</p>
                <p className="text-xs text-muted-foreground">Started {formatTimestamp(activeRun.started_at)}</p>
              </div>
              <p>Use the control panel to stream logs or stop the federation when it completes.</p>
            </>
          ) : (
            <p>
              No active run right now. Visit the control panel to start a new federation round for this
              project.
            </p>
          )}
        </CardContent>
      </GlassCard>
    </div>
  );
}
