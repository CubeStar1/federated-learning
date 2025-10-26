"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Activity, ArrowUpRight, Radio } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClientCard } from "@/components/client/shared/client-card";
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectSummary } from "@/lib/fetchers/types";

interface ClientProjectCardProps {
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

export default function ClientProjectCard({ summary }: ClientProjectCardProps) {
  const { project, activeRunCount, latestRun, participantCount } = summary;

  const activeBadgeLabel = activeRunCount > 0 ? `${activeRunCount} active` : "Idle";
  const latestRunTimestamp = formatTimestamp(latestRun?.started_at ?? null);

  return (
    <ClientCard accent="emerald" className="group flex h-full flex-col transition hover:-translate-y-1 hover:shadow-xl">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <Badge variant="outline" className="rounded-full border-emerald-200 bg-emerald-50 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/20 dark:text-emerald-100">
              Participant Workspace
            </Badge>
            <CardTitle className="text-2xl font-semibold leading-tight text-foreground">
              {project.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {project.description ?? "Federated client ready to connect to the coordinator."}
            </p>
          </div>
          <Badge className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
            {activeBadgeLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-200/20">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Radio className="h-3.5 w-3.5" />
            Connected Nodes
          </div>
          <span className="text-xl font-semibold text-foreground">{participantCount}</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-200/20">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Activity className="h-3.5 w-3.5" />
              Recent Activity
            </span>
            <Badge variant="outline" className="rounded-full border-slate-300 text-[10px] uppercase tracking-wide text-muted-foreground dark:border-slate-700 dark:text-slate-200">
              {latestRun?.status ?? "Pending"}
            </Badge>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {latestRunTimestamp ? `Seen ${latestRunTimestamp}.` : "No run telemetry yet."}
          </p>
        </div>
      </CardContent>
      <CardFooter className="mt-auto flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 text-xs text-muted-foreground dark:border-slate-800 dark:bg-slate-200/20">
        <div className="flex flex-col">
          <span className="font-medium text-foreground">Created</span>
          <span>{formatTimestamp(project.created_at) ?? "unknown"}</span>
        </div>
        <Button asChild size="sm" className="gap-2">
          <Link href={`/client/${project.id}`}>
            Open client space
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </ClientCard>
  );
}
