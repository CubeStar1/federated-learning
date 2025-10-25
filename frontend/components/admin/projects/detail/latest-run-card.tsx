"use client";

import Link from "next/link";
import { ClipboardList, Stethoscope } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FederatedRun } from "@/lib/fetchers/types";
import { GlassCard } from "@/components/admin/projects/shared/glass-card";

interface LatestRunCardProps {
  projectId: string;
  activeRun: FederatedRun | null;
  latestRun: FederatedRun | null;
}

const formatLabel = (run: FederatedRun) => run.label ?? run.id;

const formatTimestamp = (value?: string | null) => {
  if (!value) return "unknown";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

export default function LatestRunCard({ projectId, activeRun, latestRun }: LatestRunCardProps) {
  const targetRun = activeRun ?? latestRun ?? null;

  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <ClipboardList className="h-4 w-4 text-primary" />
          Run snapshot
        </CardTitle>
        <CardDescription>
          {targetRun ? "Most recent federated run details." : "No runs recorded yet."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        {targetRun ? (
          <>
            <div className="flex flex-wrap items-center gap-2 text-foreground">
              <Badge
                variant={targetRun.status === "running" ? "default" : "secondary"}
                className="rounded-full px-3 py-1 text-[11px] uppercase tracking-wide"
              >
                {targetRun.status}
              </Badge>
              <span className="font-semibold">{formatLabel(targetRun)}</span>
            </div>
            <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4 text-xs shadow-inner dark:bg-primary/20">
              <div className="space-y-2 text-foreground">
                <p>Started {formatTimestamp(targetRun.started_at)}</p>
                {targetRun.ended_at ? <p>Ended {formatTimestamp(targetRun.ended_at)}</p> : null}
                <p>Run ID • {targetRun.id}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button asChild size="sm">
                <Link href={`/admin/projects/${projectId}/runs`}>View run history</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/projects/${projectId}/runs/${targetRun.id}`}>Inspect run</Link>
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-foreground">
              <Stethoscope className="h-4 w-4 text-primary" />
              <span className="text-sm">Start a run to populate this panel.</span>
            </div>
            <p>
              Once a federation completes you can review the execution timeline and metrics from the
              run history view.
            </p>
            <Button asChild size="sm">
              <Link href={`/admin/projects/${projectId}/runs`}>Go to run history</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </GlassCard>
  );
}
