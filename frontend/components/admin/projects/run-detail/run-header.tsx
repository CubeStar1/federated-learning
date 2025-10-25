"use client";

import Link from "next/link";
import { formatDistance, formatDistanceToNow } from "date-fns";
import { Activity, Clock, Cpu, HeartPulse } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/admin/projects/shared/glass-card";
import { FederatedRun } from "@/lib/fetchers/types";

interface RunHeaderProps {
  run: FederatedRun;
  projectId: string;
  projectName?: string | null;
}

const formatTimestamp = (value?: string | null) => {
  if (!value) return "—";
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true });
  } catch {
    return value;
  }
};

const statusVariant = (status: string) => {
  switch (status) {
    case "running":
      return "default" as const;
    case "completed":
      return "outline" as const;
    case "failed":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
};

const relativeTime = (value?: string | null) => {
  if (!value) return null;
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true });
  } catch {
    return value;
  }
};

const formatDuration = (start?: string | null, end?: string | null) => {
  if (!start || !end) return null;
  try {
    return formatDistance(new Date(end), new Date(start));
  } catch {
    return null;
  }
};

export default function RunHeader({ run, projectId, projectName }: RunHeaderProps) {
  const runLabel = run.label ?? run.id;
  const startedRelative = relativeTime(run.started_at);
  const endedRelative = relativeTime(run.ended_at);
  const duration = formatDuration(run.started_at, run.ended_at);

  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-sky-200/70 bg-linear-to-br from-sky-50 via-white to-emerald-50 p-8 shadow-xl ring-1 ring-sky-200/60 dark:border-sky-400/20 dark:from-sky-500/10 dark:via-transparent dark:to-emerald-500/15"
    >
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-sky-400 via-emerald-300 to-violet-300"
        aria-hidden
      />
      <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-primary shadow-sm dark:bg-white/10 dark:text-primary-foreground">
            <HeartPulse className="h-3.5 w-3.5" />
            Federation run insight
          </div>
          <div className="space-y-3">
            <CardTitle className="text-3xl font-semibold leading-tight sm:text-4xl">
              {runLabel}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground sm:text-base">
              {projectName ? `Run for ${projectName}` : "Overview of this federated learning cycle."}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:text-sm">
            <Badge variant={statusVariant(run.status)} className="rounded-full px-3 py-1 text-[11px] capitalize">
              {run.status}
            </Badge>
            <span className="rounded-full bg-white/70 px-3 py-1 font-medium tracking-wide text-muted-foreground shadow-sm dark:bg-white/10">
              Run ID • {run.id}
            </span>
            {startedRelative ? (
              <span className="rounded-full bg-white/70 px-3 py-1 font-medium tracking-wide text-muted-foreground shadow-sm dark:bg-white/10">
                Started {startedRelative}
              </span>
            ) : null}
            {endedRelative ? (
              <span className="rounded-full bg-white/70 px-3 py-1 font-medium tracking-wide text-muted-foreground shadow-sm dark:bg-white/10">
                Ended {endedRelative}
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href={`/admin/projects/${projectId}/control-panel`}>Open control panel</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/projects/${projectId}/runs`}>Back to runs</Link>
            </Button>
          </div>
        </div>

        <GlassCard className="w-full max-w-sm shadow-xl" accent="violet">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
              Run pulse
            </CardTitle>
            <CardDescription>Live signals from the coordinator session.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 px-3 py-2 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200">
              <span>Status</span>
              <Badge variant={statusVariant(run.status)} className="capitalize">
                {run.status}
              </Badge>
            </div>
            <div className="space-y-3 text-xs text-muted-foreground sm:text-sm">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-foreground">
                  <Activity className="h-4 w-4 text-primary" />
                  Coordinator session
                </span>
                <span className="font-medium text-foreground">
                  {run.coordinator_session_id ?? "Pending"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  Started
                </span>
                <span className="font-medium text-foreground">
                  {formatTimestamp(run.started_at)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-foreground">
                  <Cpu className="h-4 w-4 text-primary" />
                  Duration
                </span>
                <span className="font-medium text-foreground">
                  {duration ?? "Active"}
                </span>
              </div>
            </div>
          </CardContent>
        </GlassCard>
      </div>
    </section>
  );
}
