"use client";

import { useMemo } from "react";

import { ClipboardCheck } from "lucide-react";

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/admin/projects/shared/glass-card";

interface RunMetricsCardProps {
  metrics: Record<string, unknown> | null;
}

export default function RunMetricsCard({ metrics }: RunMetricsCardProps) {
  const groupedMetrics = useMemo(() => {
    if (!metrics || typeof metrics !== "object") {
      return [] as Array<{
        phase: string;
        label: string;
        rounds: Array<{
          roundNumber: number;
          roundLabel: string;
          metrics: Array<{ key: string; label: string; value: string }>;
        }>;
      }>;
    }

    const toTitle = (value: string) =>
      value
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

    const formatValue = (value: unknown) => {
      if (typeof value === "number" && Number.isFinite(value)) {
        return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
      }

      return String(value);
    };

    const isRecord = (value: unknown): value is Record<string, unknown> =>
      typeof value === "object" && value !== null && !Array.isArray(value);

    const groups: Array<{
      phase: string;
      label: string;
      rounds: Array<{
        roundNumber: number;
        roundLabel: string;
        metrics: Array<{ key: string; label: string; value: string }>;
      }>;
    }> = [];

    for (const [phase, rounds] of Object.entries(metrics)) {
      if (!isRecord(rounds)) {
        continue;
      }

      const roundEntries: Array<{
        roundNumber: number;
        roundLabel: string;
        metrics: Array<{ key: string; label: string; value: string }>;
      }> = [];

      for (const [roundKey, roundMetrics] of Object.entries(rounds)) {
        if (!isRecord(roundMetrics)) {
          continue;
        }

        const roundNumber = Number.parseInt(roundKey, 10);
        if (!Number.isFinite(roundNumber)) {
          continue;
        }

        const metricEntries = Object.entries(roundMetrics)
          .filter(([, metricValue]) => metricValue !== null && metricValue !== undefined)
          .map(([metricKey, metricValue]) => ({
            key: metricKey,
            label: toTitle(metricKey),
            value: formatValue(metricValue),
          }))
          .sort((a, b) => a.label.localeCompare(b.label));

        if (!metricEntries.length) {
          continue;
        }

        roundEntries.push({
          roundNumber,
          roundLabel: `Round ${roundNumber}`,
          metrics: metricEntries,
        });
      }

      if (!roundEntries.length) {
        continue;
      }

      roundEntries.sort((a, b) => a.roundNumber - b.roundNumber);

      groups.push({
        phase,
        label: toTitle(phase),
        rounds: roundEntries,
      });
    }

    return groups;
  }, [metrics]);

  return (
    <GlassCard accent="primary">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <ClipboardCheck className="h-4 w-4 text-primary" />
          Metrics
        </CardTitle>
        <CardDescription>Key statistics reported by the coordinator across training rounds.</CardDescription>
      </CardHeader>
      <CardContent>
        {groupedMetrics.length ? (
          <div className="space-y-6">
            {groupedMetrics.map(({ phase, label, rounds }) => (
              <div key={phase} className="space-y-3">
                <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                  <h3 className="text-sm font-semibold text-foreground">{label}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {rounds.length} {rounds.length === 1 ? "round" : "rounds"}
                  </Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {rounds.map(({ roundNumber, roundLabel, metrics: entries }) => (
                    <div
                      key={`${phase}-${roundNumber}`}
                      className="rounded-lg border border-border/50 bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="mb-3 flex items-center justify-between border-b border-border/30 pb-2">
                        <span className="text-sm font-semibold text-foreground">{roundLabel}</span>
                        <Badge variant="outline" className="text-xs">
                          {entries.length}
                        </Badge>
                      </div>
                      <dl className="space-y-2">
                        {entries.map(({ key, label: metricLabel, value }) => (
                          <div
                            key={`${phase}-${roundNumber}-${key}`}
                            className="flex items-center justify-between gap-2 text-xs"
                          >
                            <dt className="text-muted-foreground">{metricLabel}</dt>
                            <dd className="font-mono font-semibold text-foreground">
                              {value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No metrics recorded for this run.
          </p>
        )}
      </CardContent>
    </GlassCard>
  );
}
