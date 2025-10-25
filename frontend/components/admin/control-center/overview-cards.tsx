"use client";

import { Activity, Fingerprint, HeartPulse, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface OverviewCardsProps {
  superlinkRunning: boolean;
  superlinkStartedAt: string;
  superlinkPid: string;
  runActive: boolean;
  activeRunLabel: string;
  activeRunStartedAt: string;
  onlineParticipantsCount: number;
  isOnlineLoading: boolean;
  projectId: string | null;
}

const variantStyles = {
  emerald: {
    wrapper:
      "border-emerald-200/60 bg-linear-to-br from-emerald-50 via-white to-emerald-100 shadow-xl ring-1 ring-emerald-200/60 dark:border-emerald-400/20 dark:from-emerald-500/10 dark:via-transparent dark:to-emerald-500/15",
    accent: "bg-linear-to-r from-emerald-400 via-teal-300 to-emerald-500",
    icon: "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/30 dark:text-emerald-100",
    badge: "border-emerald-500/40 text-emerald-600 dark:text-emerald-200",
  },
  sky: {
    wrapper:
      "border-sky-200/60 bg-linear-to-br from-sky-50 via-white to-sky-100 shadow-xl ring-1 ring-sky-200/60 dark:border-sky-400/20 dark:from-sky-500/10 dark:via-transparent dark:to-sky-500/15",
    accent: "bg-linear-to-r from-sky-400 via-cyan-300 to-emerald-300",
    icon: "bg-sky-500/15 text-sky-700 dark:bg-sky-500/30 dark:text-sky-100",
    badge: "border-sky-500/40 text-sky-600 dark:text-sky-200",
  },
  violet: {
    wrapper:
      "border-violet-200/60 bg-linear-to-br from-violet-50 via-white to-violet-100 shadow-xl ring-1 ring-violet-200/60 dark:border-violet-400/20 dark:from-violet-500/10 dark:via-transparent dark:to-violet-500/15",
    accent: "bg-linear-to-r from-violet-400 via-fuchsia-300 to-sky-300",
    icon: "bg-violet-500/15 text-violet-700 dark:bg-violet-500/30 dark:text-violet-100",
    badge: "border-violet-500/40 text-violet-600 dark:text-violet-200",
  },
  blush: {
    wrapper:
      "border-rose-200/60 bg-linear-to-br from-rose-50 via-white to-rose-100 shadow-xl ring-1 ring-rose-200/60 dark:border-rose-400/20 dark:from-rose-500/10 dark:via-transparent dark:to-rose-500/15",
    accent: "bg-linear-to-r from-rose-400 via-amber-300 to-pink-300",
    icon: "bg-rose-500/15 text-rose-700 dark:bg-rose-500/30 dark:text-rose-100",
    badge: "border-rose-400/40 text-rose-600 dark:text-rose-200",
  },
} as const;

const StatusBadge = ({
  active,
  truthy = "Online",
  falsy = "Offline",
  className,
}: {
  active: boolean;
  truthy?: string;
  falsy?: string;
  className?: string;
}) => (
  <Badge
    variant={active ? "default" : "secondary"}
    className={cn("rounded-full px-3 py-1 text-[11px] uppercase tracking-wide", className)}
  >
    {active ? truthy : falsy}
  </Badge>
);

export default function OverviewCards({
  superlinkRunning,
  superlinkStartedAt,
  superlinkPid,
  runActive,
  activeRunLabel,
  activeRunStartedAt,
  onlineParticipantsCount,
  isOnlineLoading,
  projectId,
}: OverviewCardsProps) {
  const cards = [
    {
      key: "superlink",
      title: "SuperLink Activity",
      subtitle: "Coordinator service",
      variant: "emerald" as const,
      icon: HeartPulse,
      status: <StatusBadge active={superlinkRunning} truthy="Running" falsy="Idle" className={variantStyles.emerald.badge} />,
      body: `Most recent launch ${superlinkStartedAt}.`,
      meta: `PID ${superlinkPid}`,
    },
    {
      key: "run",
      title: "Active Federation",
      subtitle: "Current workload",
      variant: "sky" as const,
      icon: Activity,
      status: <StatusBadge active={runActive} truthy="Running" falsy="Idle" className={variantStyles.sky.badge} />,
      body: activeRunLabel,
      meta: `Started ${activeRunStartedAt}`,
    },
    {
      key: "participants",
      title: "Online Participants",
      subtitle: "Reporting SuperNodes",
      variant: "violet" as const,
      icon: Users,
      status: (
        <span className={cn(
          "rounded-full bg-white/70 px-3 py-1 text-sm font-medium text-violet-700 shadow-sm dark:bg-white/10 dark:text-violet-100",
          variantStyles.violet.badge,
        )}>
          {isOnlineLoading ? "Loading…" : `${onlineParticipantsCount} online`}
        </span>
      ),
      body: isOnlineLoading ? "Checking node health." : "Connected participants ready to coordinate.",
      meta: "Includes coordinators and hospitals streaming telemetry.",
    },
    {
      key: "project",
      title: "Project Context",
      subtitle: "Identifier",
      variant: "blush" as const,
      icon: Fingerprint,
      status: (
        <span className={cn(
          "rounded-full bg-white/70 px-3 py-1 text-xs font-medium uppercase tracking-wide text-rose-600 shadow-sm dark:bg-white/10 dark:text-rose-100",
          variantStyles.blush.badge,
        )}>
          Active scope
        </span>
      ),
      body: projectId ?? "No project detected",
      meta: "Control commands apply to this cohort only.",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ key, title, subtitle, variant, icon: Icon, status, body, meta }) => {
        const styles = variantStyles[variant];
        return (
          <article
            key={key}
            className={cn(
              "relative overflow-hidden rounded-3xl border p-6 text-sm dark:bg-slate-200/10",
              styles.wrapper,
            )}
          >
            <span className={cn("pointer-events-none absolute inset-x-0 top-0 h-1", styles.accent)} aria-hidden />
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-full", styles.icon)}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>{title}</span>
                </div>
                <p className="text-xs text-muted-foreground/80">{subtitle}</p>
              </div>
              {status}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{body}</p>
            <p className="mt-3 text-xs text-muted-foreground/90">{meta}</p>
          </article>
        );
      })}
    </div>
  );
}
