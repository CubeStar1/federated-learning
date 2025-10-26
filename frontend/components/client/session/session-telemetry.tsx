"use client";

import { useMemo } from "react";
import { Activity, Gauge, ScrollText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { ClientCard } from "@/components/client/shared/client-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LogViewer from "@/components/admin/control-center/log-viewer";
import { Json, FederatedRun } from "@/lib/fetchers/types";

interface SessionTelemetryProps {
  sessionLog: string;
  run: FederatedRun | null;
  metrics: Json | null;
  isLoading: boolean;
}

const formatTimestamp = (value?: string | null) => {
  if (!value) return null;
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true });
  } catch {
    return value;
  }
};

export default function SessionTelemetry({ sessionLog, run, metrics, isLoading }: SessionTelemetryProps) {
  const runStarted = formatTimestamp(run?.started_at ?? null);
  const runStatus = run?.status ?? "idle";
  const hasMetrics = Boolean(metrics);

  const metricsPretty = useMemo(() => (metrics ? JSON.stringify(metrics, null, 2) : "{}"), [metrics]);

  return (
    <ClientCard accent="emerald" className="space-y-6 p-6">
      <Tabs defaultValue="logs" className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-700 dark:bg-violet-500/20 dark:text-violet-100">
              <ScrollText className="h-3.5 w-3.5" />
              Live telemetry
            </div>
            <p className="text-sm text-muted-foreground">
              Supabase mirrors the stream in near real-time so remote teams can troubleshoot safely.
            </p>
          </div>
          <Badge
            variant="outline"
            className="rounded-full border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] uppercase tracking-wide text-emerald-700 dark:border-emerald-500/50 dark:bg-emerald-500/20 dark:text-emerald-100"
          >
            {runStatus.toUpperCase()}
          </Badge>
        </div>

    <TabsList className="inline-flex rounded-full bg-white/80 p-1 text-muted-foreground shadow-sm backdrop-blur dark:bg-slate-800/50">
          <TabsTrigger
            value="logs"
            className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide text-foreground data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-100"
          >
            Node logs
          </TabsTrigger>
          <TabsTrigger
            value="metrics"
            disabled={!hasMetrics}
            className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide text-foreground data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-700 disabled:opacity-40 dark:data-[state=active]:text-sky-100"
          >
            Run metrics
          </TabsTrigger>
          <TabsTrigger
            value="run"
            disabled={!run}
            className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide text-foreground data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-700 disabled:opacity-40 dark:data-[state=active]:text-violet-100"
          >
            Run details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
          <LogViewer
            isLoading={isLoading}
            content={sessionLog}
            emptyLabel="Start this SuperNode to capture log output."
          />
        </TabsContent>

        <TabsContent value="metrics">
          <Card className="border border-slate-200 bg-white/90 dark:border-slate-700 dark:bg-slate-800/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-100">
                <Gauge className="h-4 w-4" />
                Metrics snapshot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="max-h-80 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-sky-700 dark:border-slate-700 dark:bg-slate-800/30 dark:text-sky-100">
                {metricsPretty}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="run">
          <Card className="border border-slate-200 bg-white/90 dark:border-slate-700 dark:bg-slate-800/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-100">
                <Activity className="h-4 w-4" />
                Active run
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {run ? (
                <>
                  <p>
                    <span className="font-semibold text-foreground">Run ID:</span> {run.id}
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Label:</span> {run.label ?? "—"}
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Status:</span> {run.status}
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Started:</span> {runStarted ?? "unknown"}
                  </p>
                </>
              ) : (
                <p>No run is currently associated with this project.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ClientCard>
  );
}
