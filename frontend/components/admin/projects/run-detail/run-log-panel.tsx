"use client";

import { useMemo } from "react";
import { ScrollText } from "lucide-react";

import LogViewer from "@/components/admin/control-center/log-viewer";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/admin/projects/shared/glass-card";

interface RunLogPanelProps {
  label: string;
  content: string | null;
}

export default function RunLogPanel({ label, content }: RunLogPanelProps) {
  const logContent = useMemo(() => content ?? "", [content]);

  return (
    <GlassCard accent="emerald">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <ScrollText className="h-4 w-4 text-primary" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border/50 bg-background/50 p-3 shadow-inner">
          <LogViewer content={logContent} isLoading={false} emptyLabel="No log output captured." />
        </div>
      </CardContent>
    </GlassCard>
  );
}
