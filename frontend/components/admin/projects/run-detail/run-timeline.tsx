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
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <CalendarDays className="h-4 w-4 text-primary" />
          Timeline
        </CardTitle>
        <CardDescription>Track the major lifecycle events for this run.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-primary/10 bg-primary/5 p-4 shadow-sm dark:bg-primary/15">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>Started</span>
            </div>
            <p className="mt-2 text-sm font-medium text-foreground">{formatStamp(run.started_at)}</p>
          </div>
          
          <div className="rounded-xl border border-primary/10 bg-primary/5 p-4 shadow-sm dark:bg-primary/15">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
              <Clock className="h-3.5 w-3.5" />
              <span>Ended</span>
            </div>
            <p className="mt-2 text-sm font-medium text-foreground">{formatStamp(run.ended_at)}</p>
          </div>
          
          <div className="rounded-xl border border-primary/10 bg-primary/5 p-4 shadow-sm dark:bg-primary/15">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
              <Hourglass className="h-3.5 w-3.5" />
              <span>Status</span>
            </div>
            <p className="mt-2 text-sm font-medium capitalize text-foreground">{run.status}</p>
          </div>
        </div>
      </CardContent>
    </GlassCard>
  );
}
