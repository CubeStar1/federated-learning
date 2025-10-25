"use client";

import { BarChart3, ScrollText } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { Json } from "@/lib/fetchers/types";

import LogViewer from "./log-viewer";

interface RuntimeLogsProps {
  superlinkLog: string;
  runLog: string;
  metrics: Json | null;
  runActive: boolean;
  coordinatorDetected: boolean;
  isSuperlinkLoading: boolean;
  isRunLoading: boolean;
}

export default function RuntimeLogs({
  superlinkLog,
  runLog,
  metrics,
  runActive,
  coordinatorDetected,
  isSuperlinkLoading,
  isRunLoading,
}: RuntimeLogsProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border bg-linear-to-br from-violet-50 via-white to-sky-100 p-6 shadow-xl ring-1 transition lg:col-span-2",
        "border-violet-200/70 ring-violet-200/60 dark:border-violet-400/20 dark:from-violet-500/10 dark:via-transparent dark:to-sky-500/15",
      )}
    >
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-violet-400 via-sky-300 to-emerald-400"
        aria-hidden
      />
      <Tabs defaultValue="superlink" className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-700 shadow-sm dark:bg-white/10 dark:text-violet-100">
              <ScrollText className="h-4 w-4" />
              Runtime telemetry
            </div>
            <p className="text-sm text-muted-foreground">
              Aggregated log streams captured in Supabase for this federation.
            </p>
          </div>
          <Badge className="rounded-full bg-violet-500/10 text-[11px] font-semibold uppercase tracking-wide text-violet-700 dark:bg-violet-500/20 dark:text-violet-100">
            Live capture
          </Badge>
        </div>

        <TabsList className="inline-flex rounded-full bg-white/80 p-1 text-muted-foreground shadow-sm backdrop-blur dark:bg-white/10">
          <TabsTrigger
            value="superlink"
            className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide text-foreground transition data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-700 dark:data-[state=active]:bg-violet-500/25 dark:data-[state=active]:text-violet-100"
          >
            SuperLink
          </TabsTrigger>
          <TabsTrigger
            value="run"
            disabled={!runActive && !runLog}
            className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide text-foreground transition data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-700 dark:data-[state=active]:bg-sky-500/25 dark:data-[state=active]:text-sky-100 disabled:opacity-40"
          >
            Active Run
          </TabsTrigger>
          <TabsTrigger
            value="metrics"
            disabled={!metrics}
            className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide text-foreground transition data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-500/25 dark:data-[state=active]:text-emerald-100 disabled:opacity-40"
          >
            Metrics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="superlink">
          <LogViewer
            isLoading={isSuperlinkLoading}
            content={superlinkLog}
            emptyLabel={
              coordinatorDetected
                ? "SuperLink logs will appear once the process starts."
                : "No coordinator node registered yet."
            }
          />
        </TabsContent>
        <TabsContent value="run">
          <LogViewer
            isLoading={isRunLoading}
            content={runLog}
            emptyLabel="Start a federated run to stream logs here."
          />
        </TabsContent>
        <TabsContent value="metrics">
          <div className="rounded-2xl border border-emerald-200/60 bg-white/70 p-4 shadow-inner dark:border-emerald-400/30 dark:bg-white/10">
            <div className="flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-100">
              <span className="inline-flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> Snapshot metrics
              </span>
              <Badge variant="outline" className="rounded-full border-emerald-300/60 text-[11px] uppercase tracking-wide text-emerald-700 dark:border-emerald-400/40 dark:text-emerald-100">
                JSON view
              </Badge>
            </div>
            <div className="mt-3 max-h-80 overflow-auto rounded-xl border border-emerald-200/50 bg-emerald-500/5 p-4 dark:border-emerald-400/30 dark:bg-emerald-500/10">
              <pre className="text-xs leading-relaxed text-emerald-900 dark:text-emerald-100">
                {metrics ? JSON.stringify(metrics, null, 2) : "{}"}
              </pre>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
