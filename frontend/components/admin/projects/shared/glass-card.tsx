import type { ComponentProps } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const accentMap: Record<string, string> = {
  primary: "bg-linear-to-r from-primary via-sky-400 to-emerald-400",
  violet: "bg-linear-to-r from-primary via-violet-400 to-indigo-400",
  emerald: "bg-linear-to-r from-emerald-400 via-primary to-sky-400",
};

interface GlassCardProps extends ComponentProps<typeof Card> {
  accent?: keyof typeof accentMap | "none";
  showAccent?: boolean;
}

export function GlassCard({
  className,
  accent = "primary",
  showAccent = true,
  children,
  ...props
}: GlassCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border-0 bg-white/80 shadow-lg ring-1 ring-primary/10 backdrop-blur-sm dark:bg-slate-200/10",
        className,
      )}
      {...props}
    >
      {showAccent && accent !== "none" ? (
        <span
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-1",
            accentMap[accent] ?? accentMap.primary,
          )}
          aria-hidden
        />
      ) : null}
      {children}
    </Card>
  );
}
