"use client";

import { useState } from "react";
import { Play, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RunStartPayload } from "@/lib/fetchers/types";
import { GlassCard } from "@/components/admin/projects/shared/glass-card";

interface ProjectQuickActionsProps {
  projectName: string;
  canStart: boolean;
  runActive: boolean;
  isStarting: boolean;
  isStopping: boolean;
  onStart: (payload: RunStartPayload) => void;
  onStop: () => void;
}

export default function ProjectQuickActions({
  projectName,
  canStart,
  runActive,
  isStarting,
  isStopping,
  onStart,
  onStop,
}: ProjectQuickActionsProps) {
  const [label, setLabel] = useState(`${projectName} federation`);
  const [stream, setStream] = useState(true);

  const handleStart = () => {
    const payload: RunStartPayload = {
      federation_name: label.trim() || undefined,
      stream,
    };
    onStart(payload);
  };

  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick actions</CardTitle>
        <CardDescription>Launch or stop runs for this project.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="runLabel" className="text-sm font-medium text-foreground">
            Run label
          </Label>
          <Input
            id="runLabel"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="Federation label"
            className="border-primary/20 bg-white/70 focus-visible:ring-primary"
          />
        </div>
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-primary/10 bg-primary/5 p-4 text-sm shadow-inner dark:bg-primary/20">
          <div className="space-y-1">
            <Label htmlFor="streamToggle" className="text-sm font-semibold text-foreground">
              Stream logs to dashboard
            </Label>
            <p className="text-xs text-muted-foreground">
              When enabled we keep the log stream open in the active run panel.
            </p>
          </div>
          <Switch id="streamToggle" checked={stream} onCheckedChange={setStream} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleStart} disabled={!canStart || isStarting} className="inline-flex items-center gap-2">
            <Play className="h-4 w-4" />
            {isStarting ? "Starting…" : "Start run"}
          </Button>
          <Button
            variant="outline"
            onClick={onStop}
            disabled={!runActive || isStopping}
            className="inline-flex items-center gap-2"
          >
            <Square className="h-4 w-4" />
            {isStopping ? "Stopping…" : "Stop run"}
          </Button>
        </div>
      </CardContent>
    </GlassCard>
  );
}
