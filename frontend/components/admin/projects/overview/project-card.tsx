"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { HeartPulse, Stethoscope } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectSummary } from "@/lib/fetchers/types";

interface ProjectCardProps {
  summary: ProjectSummary;
}

const formatTimestamp = (value?: string | null) => {
  if (!value) return null;
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true });
  } catch {
    return value;
  }
};

const RoleCount = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-2xl border border-primary/10 bg-white/70 p-4 text-xs shadow-sm transition group-hover:border-primary/40 dark:bg-slate-200/10">
    <span className="font-semibold tracking-wide text-muted-foreground/80">{label}</span>
    <span className="mt-2 block text-2xl font-semibold text-foreground">{value}</span>
  </div>
);

export default function ProjectCard({ summary }: ProjectCardProps) {
  const { project, nodeCount, coordinatorCount, participantCount, activeRunCount, latestRun } =
    summary;

  const latestRunTime = formatTimestamp(latestRun?.started_at ?? null);
  const statusBadge = latestRun
    ? `${latestRun.status === "running" ? "Live" : "Last"} run • ${latestRun.status}`
    : "Awaiting first run";

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden border-0 bg-white/80 shadow-lg ring-1 ring-primary/10 transition hover:-translate-y-1 hover:shadow-xl dark:bg-slate-200/10">
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-sky-400 to-emerald-400" aria-hidden />
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary dark:bg-primary/20">
              <HeartPulse className="h-3.5 w-3.5" />
              Clinical federation
            </div>
            <CardTitle className="text-2xl font-semibold leading-tight">{project.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {project.description ?? "No description provided."}
            </p>
          </div>
          <Badge variant="outline" className="whitespace-nowrap rounded-full border-primary/30 bg-primary/10 text-xs font-medium uppercase tracking-wide text-primary">
            {statusBadge}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <RoleCount label="Total nodes" value={nodeCount} />
          <RoleCount label="Coordinators" value={coordinatorCount} />
          <RoleCount label="Participants" value={participantCount} />
        </div>
        <div className="rounded-3xl border border-emerald-500/10 bg-linear-to-br from-emerald-500/10 via-background to-background p-4 text-sm shadow-sm dark:border-emerald-500/20 dark:from-emerald-500/20">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-200">
            <span className="inline-flex items-center gap-1">
              <Stethoscope className="h-3.5 w-3.5" />
              SuperLink activity
            </span>
            {activeRunCount > 0 ? (
              <Badge variant="default" className="rounded-full bg-emerald-600 text-[10px] uppercase tracking-wide">
                {activeRunCount} active {activeRunCount > 1 ? "runs" : "run"}
              </Badge>
            ) : (
              <Badge variant="outline" className="rounded-full border-emerald-500/40 text-[10px] uppercase tracking-wide text-emerald-600">
                Idle
              </Badge>
            )}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {latestRun
              ? latestRunTime
                ? `Most recent launch ${latestRunTime}.`
                : "Run timestamp unavailable."
              : "No training rounds have been launched yet."}
          </p>
        </div>
      </CardContent>
  <CardFooter className="mt-auto flex items-center justify-between gap-3 border-t border-primary/10 bg-primary/5 px-6 py-4 text-xs text-muted-foreground dark:bg-primary/10">
        <div className="flex flex-col">
          <span className="font-medium text-foreground">Created</span>
          <span>{formatTimestamp(project.created_at) ?? "unknown"}</span>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm">
            <Link href={`/admin/projects/${project.id}/control-panel`}>Control panel</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`/admin/projects/${project.id}`}>View project</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
