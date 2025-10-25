"use client";

import { format } from "date-fns";
import { CalendarDays, Clock, Hourglass } from "lucide-react";

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/admin/projects/shared/glass-card";
import { FederatedRun } from "@/lib/fetchers/types";

interface RunTimelineProps {
  run: FederatedRun;
}

const formatStamp = (value?: string | null) => {
  if (!value) return "—";
  try {
    return format(new Date(value), "PPpp");
  } catch {
    return value;
  }
};

export default function RunTimeline({ run }: RunTimelineProps) {
  return (
    <GlassCard accent="primary">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <CalendarDays className="h-4 w-4 text-primary" />
          Timeline
        </CardTitle>
        <CardDescription>Track the major lifecycle events for this run.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4 text-foreground shadow-inner dark:bg-primary/15">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Started</p>
          <p className="mt-1 text-sm text-muted-foreground">{formatStamp(run.started_at)}</p>
        </div>
        <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4 text-foreground shadow-inner dark:bg-primary/15">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
            <Clock className="h-4 w-4" />
            Ended
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{formatStamp(run.ended_at)}</p>
        </div>
        <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4 text-foreground shadow-inner dark:bg-primary/15">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
            <Hourglass className="h-4 w-4" />
            Status
          </p>
          <p className="mt-1 text-sm capitalize text-muted-foreground">{run.status}</p>
        </div>
      </CardContent>
    </GlassCard>
  );
}
