"use client";

import { useState } from "react";
import { Activity, Waves } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import { RunStartPayload } from "@/lib/fetchers/types";

interface RunControlsProps {
  canStart: boolean;
  runActive: boolean;
  isStarting: boolean;
  isStopping: boolean;
  onStart: (payload: RunStartPayload) => void;
  onStop: () => void;
}

export default function RunControls({
  canStart,
  runActive,
  isStarting,
  isStopping,
  onStart,
  onStop,
}: RunControlsProps) {
  const [federationName, setFederationName] = useState("production");
  const [streamLogs, setStreamLogs] = useState(true);

  const handleStart = () => {
    onStart({
      federation_name: federationName.trim() || "production",
      stream: streamLogs,
    });
  };

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border bg-linear-to-br p-6 shadow-xl ring-1 transition lg:col-span-3",
        "from-sky-50 via-white to-violet-100 border-sky-200/60 ring-sky-200/60 dark:border-sky-400/20 dark:from-sky-500/10 dark:via-transparent dark:to-violet-500/15",
      )}
    >
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-sky-400 via-cyan-300 to-violet-400"
        aria-hidden
      />
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700 shadow-sm dark:bg-white/10 dark:text-sky-100">
            <Activity className="h-4 w-4" />
            Federated run
          </div>
          <p className="text-sm text-muted-foreground">
            Launch Flower workloads and stream telemetry for this project.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700 dark:bg-sky-500/20 dark:text-sky-100">
          <Waves className="h-4 w-4" />
          {runActive ? "In progress" : "Idle"}
        </span>
      </div>

      <div className="mt-6 space-y-4 text-sm">
        <div className="space-y-2">
          <Label htmlFor="federation-name" className="text-sm font-medium text-foreground">
            Federation name
          </Label>
          <Input
            id="federation-name"
            placeholder="production"
            value={federationName}
            onChange={(event) => setFederationName(event.target.value)}
            disabled={runActive || isStarting}
            className="border-sky-200/60 bg-white/80 shadow-inner focus-visible:ring-sky-500 dark:border-sky-400/30"
          />
        </div>

        <div className="flex items-center justify-between gap-6 rounded-2xl border border-sky-200/60 bg-white/70 p-4 shadow-inner dark:border-sky-400/30 dark:bg-white/10">
          <div className="space-y-1">
            <Label htmlFor="stream-toggle" className="text-sm font-semibold text-foreground">
              Stream metrics
            </Label>
            <p className="text-xs text-muted-foreground">
              Attach Flower stream to the Supabase log buffer.
            </p>
          </div>
          <Switch
            id="stream-toggle"
            checked={streamLogs}
            onCheckedChange={setStreamLogs}
            disabled={runActive || isStarting}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            className="flex-1"
            onClick={handleStart}
            disabled={!canStart || isStarting}
          >
            {isStarting ? "Starting…" : "Start Run"}
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={onStop}
            disabled={!runActive || isStopping}
          >
            {isStopping ? "Stopping…" : "Stop"}
          </Button>
        </div>
      </div>
    </section>
  );
}
