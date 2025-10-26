"use client";

import { useState } from "react";
import { HeartPulse, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import { SuperlinkStartPayload } from "@/lib/fetchers/types";

interface SuperlinkControlsProps {
  superlinkRunning: boolean;
  isStarting: boolean;
  isStopping: boolean;
  canStart?: boolean;
  onStart: (payload: SuperlinkStartPayload) => void;
  onStop: () => void;
}

export default function SuperlinkControls({
  superlinkRunning,
  isStarting,
  isStopping,
  canStart = true,
  onStart,
  onStop,
}: SuperlinkControlsProps) {
  const [listenAddress, setListenAddress] = useState("");
  const [insecureMode, setInsecureMode] = useState(true);

  const statusLabel = isStarting
    ? "Starting…"
    : isStopping
    ? "Stopping…"
    : superlinkRunning
    ? "Running"
    : !canStart
    ? "Awaiting coordinator"
    : "Standby";

  const statusTone = cn(
    "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
    superlinkRunning && !isStopping && !isStarting &&
      "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-100",
    isStarting && "bg-sky-500/10 text-sky-700 dark:bg-sky-500/20 dark:text-sky-100",
    isStopping && "bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-100",
    !superlinkRunning && !isStarting && !isStopping &&
      "bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-100",
  );

  const handleStart = () => {
    const trimmedAddress = listenAddress.trim();
    onStart({
      insecure: insecureMode,
      listen_address: trimmedAddress ? trimmedAddress : undefined,
    });
  };

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border bg-linear-to-br p-6 shadow-xl ring-1 transition lg:col-span-2",
        "from-emerald-50 via-white to-emerald-100 border-emerald-200/70 ring-emerald-200/60 dark:border-emerald-400/20 dark:from-emerald-500/10 dark:via-transparent dark:to-emerald-500/15",
      )}
    >
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-emerald-400 via-sky-300 to-emerald-500"
        aria-hidden
      />
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 shadow-sm dark:bg-white/10 dark:text-emerald-100">
            <HeartPulse className="h-4 w-4" />
            SuperLink controls
          </div>
          <p className="text-sm text-muted-foreground">
            Manage the aggregator process coordinating all hospitals.
          </p>
        </div>
        <span className={statusTone}>
          <ShieldCheck className="h-4 w-4" />
          {statusLabel}
        </span>
      </div>

      <div className="mt-6 space-y-4 text-sm">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="listen-address" className="text-sm font-medium text-foreground">
              Listen address
            </Label>
            <span className="text-xs text-muted-foreground">optional</span>
          </div>
          <Input
            id="listen-address"
            placeholder="0.0.0.0:9091"
            value={listenAddress}
            onChange={(event) => setListenAddress(event.target.value)}
            disabled={superlinkRunning || isStarting}
            className="border-emerald-200/60 bg-white/80 shadow-inner focus-visible:ring-emerald-500 dark:border-emerald-400/30"
          />
        </div>

        <div className="flex items-center justify-between gap-6 rounded-2xl border border-emerald-200/60 bg-white/70 p-4 shadow-inner dark:border-emerald-400/30 dark:bg-white/10">
          <div className="space-y-1">
            <Label htmlFor="insecure-toggle" className="text-sm font-semibold text-foreground">
              Allow insecure transport
            </Label>
            <p className="text-xs text-muted-foreground">
              Toggle TLS enforcement for sandbox deployments.
            </p>
          </div>
          <Switch
            id="insecure-toggle"
            checked={insecureMode}
            onCheckedChange={setInsecureMode}
            disabled={superlinkRunning || isStarting}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            className="flex-1"
            onClick={handleStart}
            disabled={superlinkRunning || isStarting || !canStart}
          >
            {isStarting ? "Starting…" : "Start SuperLink"}
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={onStop}
            disabled={!superlinkRunning || isStopping}
          >
            {isStopping ? "Stopping…" : "Stop"}
          </Button>
        </div>
      </div>
    </section>
  );
}
