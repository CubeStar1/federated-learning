"use client";

import Link from "next/link";

import { ClipboardList, Stethoscope } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RunsHeaderProps {
  projectName?: string;
  projectId: string;
}

export default function RunsHeader({ projectName, projectId }: RunsHeaderProps) {
  const title = projectName ? `${projectName} Runs` : "Federated Runs";

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border border-sky-200/70 bg-linear-to-br from-sky-50 via-white to-emerald-50 p-8 shadow-xl ring-1 ring-sky-200/60",
        "dark:border-sky-400/20 dark:from-sky-500/10 dark:via-transparent dark:to-emerald-500/15",
      )}
    >
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-sky-400 via-emerald-300 to-violet-300"
        aria-hidden
      />
      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700 shadow-sm dark:bg-white/10 dark:text-sky-100">
            <Stethoscope className="h-4 w-4" />
            Run history
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Inspect every federation execution, surface clinical insights, and drill into detailed telemetry for quality assurance.
            </p>
          </div>
          <Badge className="rounded-full bg-emerald-500/10 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-100">
            <span className="inline-flex items-center gap-1">
              <ClipboardList className="h-3.5 w-3.5" />
              Healthcare dataset federation
            </span>
          </Badge>
        </div>
        <div className="flex flex-col items-start gap-3 lg:items-end">
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline" className="backdrop-blur">
              <Link href={`/admin/projects/${projectId}`}>Back to project</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="backdrop-blur">
              <Link href={`/admin/projects/${projectId}/control-panel`}>Open control panel</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Updated automatically as new runs complete.
          </p>
        </div>
      </div>
    </section>
  );
}
