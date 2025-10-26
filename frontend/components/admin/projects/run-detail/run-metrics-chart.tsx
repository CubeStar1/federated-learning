"use client";

import { useMemo } from "react";

import { LineChart as LineChartIcon, TrendingUp, TrendingDown } from "lucide-react";
import { CartesianGrid, Line, LineChart as RechartsLineChart, XAxis, YAxis } from "recharts";

import { GlassCard } from "@/components/admin/projects/shared/glass-card";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface RunMetricsChartProps {
  metrics: Record<string, unknown> | null;
}

interface ChartSeriesMeta {
  key: string;
  label: string;
  color: string;
}

const chartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];

const sanitizeMetricKey = (phase: string, metric: string) =>
  `${phase}_${metric}`.toLowerCase().replace(/[^a-z0-9]+/g, "_");

const formatMetricLabel = (phase: string, metric: string) => {
  const prettyPhase = phase.replace(/[_-]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  const prettyMetric = metric.replace(/[_-]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  return `${prettyPhase} · ${prettyMetric}`;
};

export default function RunMetricsChart({ metrics }: RunMetricsChartProps) {
  const { data, config, aggregateStats } = useMemo(() => {
    if (!metrics || typeof metrics !== "object") {
      return { 
        data: [] as Array<Record<string, number | string>>, 
        config: {} as ChartConfig,
        aggregateStats: null 
      };
    }

    const points = new Map<number, Record<string, number | string>>();
    const seriesMeta: ChartSeriesMeta[] = [];
    const allValues: Record<string, number[]> = {};

    const colorIterator = chartColors.values();

    const ensurePoint = (round: number) => {
      if (!points.has(round)) {
        points.set(round, { round });
      }
      return points.get(round)!;
    };

    const registerSeries = (key: string, label: string) => {
      if (seriesMeta.find((item) => item.key === key)) {
        return;
      }

      const color = colorIterator.next().value ?? "var(--chart-1)";
      seriesMeta.push({ key, label, color });
      allValues[key] = [];
    };

    for (const [phase, rounds] of Object.entries(metrics)) {
      if (!rounds || typeof rounds !== "object") {
        continue;
      }

      for (const [roundKey, roundMetrics] of Object.entries(rounds as Record<string, unknown>)) {
        const roundNumber = Number.parseInt(roundKey, 10);
        if (!Number.isFinite(roundNumber)) {
          continue;
        }

        if (!roundMetrics || typeof roundMetrics !== "object") {
          continue;
        }

        const point = ensurePoint(roundNumber);

        for (const [metricName, metricValue] of Object.entries(roundMetrics as Record<string, unknown>)) {
          if (typeof metricValue !== "number" || Number.isNaN(metricValue)) {
            continue;
          }

          const key = sanitizeMetricKey(phase, metricName);
          const label = formatMetricLabel(phase, metricName);
          registerSeries(key, label);
          point[key] = metricValue;
          allValues[key].push(metricValue);
        }
      }
    }

    const sortedPoints = Array.from(points.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([, value]) => value);

    const chartConfig: ChartConfig = seriesMeta.reduce((acc, { key, label, color }) => {
      return {
        ...acc,
        [key]: {
          label,
          color,
        },
      };
    }, {} as ChartConfig);

    const aggregateStats = seriesMeta.length > 0 ? seriesMeta.slice(0, 3).map(({ key, label }) => {
      const values = allValues[key] || [];
      const latest = values[values.length - 1];
      const previous = values[values.length - 2];
      const trend = previous !== undefined ? ((latest - previous) / previous) * 100 : 0;
      
      return {
        key,
        label: label.split(' · ')[1] || label,
        value: latest?.toFixed(4) || '0',
        trend: trend.toFixed(2),
        isPositive: trend >= 0,
      };
    }) : null;

    return { data: sortedPoints, config: chartConfig, aggregateStats };
  }, [metrics]);

  const seriesKeys = useMemo(() => Object.keys(config), [config]);

  if (!data.length || !seriesKeys.length) {
    return (
      <GlassCard accent="emerald">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <LineChartIcon className="h-4 w-4 text-primary" />
            Round performance
          </CardTitle>
          <CardDescription>Metrics will appear here once training rounds emit values.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[400px] items-center justify-center text-sm text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </GlassCard>
    );
  }

  return (
    <GlassCard accent="emerald">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <LineChartIcon className="h-4 w-4 text-primary" />
              Aggregate Model Performance Metrics
            </CardTitle>
            <CardDescription>Key metrics across federated training rounds</CardDescription>
          </div>
          
          {aggregateStats && (
            <div className="grid gap-4 sm:grid-cols-3">
              {aggregateStats.map((stat) => (
                <div
                  key={stat.key}
                  className="rounded-lg border border-border/50 bg-card p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      {stat.label}
                    </span>
                    <Badge 
                      variant={stat.isPositive ? "default" : "secondary"}
                      className="flex items-center gap-1 text-xs"
                    >
                      {stat.isPositive ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {stat.trend}%
                    </Badge>
                  </div>
                  <div className="mt-2 text-2xl font-bold">{stat.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-[400px] w-full">
          <RechartsLineChart data={data} margin={{ left: 12, right: 12, top: 12, bottom: 12 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
            <XAxis 
              dataKey="round" 
              tickLine={false} 
              axisLine={false} 
              tickMargin={8}
              className="text-xs"
            />
            <YAxis 
              tickLine={false} 
              axisLine={false} 
              tickMargin={8} 
              width={50}
              className="text-xs"
            />
            <ChartTooltip 
              cursor={{ strokeDasharray: "4 4" }} 
              content={<ChartTooltipContent />} 
            />
            {seriesKeys.map((key) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={`var(--color-${key})`}
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
            ))}
            <ChartLegend className="pt-4" />
          </RechartsLineChart>
        </ChartContainer>
      </CardContent>
    </GlassCard>
  );
}
