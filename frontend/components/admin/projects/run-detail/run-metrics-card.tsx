"use client";

import { useMemo } from "react";

import { ClipboardCheck } from "lucide-react";

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/admin/projects/shared/glass-card";

interface RunMetricsCardProps {
  metrics: Record<string, unknown> | null;
}

export default function RunMetricsCard({ metrics }: RunMetricsCardProps) {
  const prettyMetrics = useMemo(() => {
    if (!metrics) {
      return null;
    }

    try {
      return JSON.stringify(metrics, null, 2);
    } catch {
      return String(metrics);
    }
  }, [metrics]);

  return (
    <GlassCard accent="primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <ClipboardCheck className="h-4 w-4 text-primary" />
          Metrics
        </CardTitle>
        <CardDescription>Serialized metrics payload emitted by the coordinator.</CardDescription>
      </CardHeader>
      <CardContent>
        {prettyMetrics ? (
          <pre className="max-h-80 overflow-auto rounded-xl border border-primary/10 bg-background/70 p-4 text-xs leading-relaxed shadow-sm">
            {prettyMetrics}
          </pre>
        ) : (
          <p className="text-sm text-muted-foreground">No metrics recorded for this run.</p>
        )}
      </CardContent>
    </GlassCard>
  );
}
