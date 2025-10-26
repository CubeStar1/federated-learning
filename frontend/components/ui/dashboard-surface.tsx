import { forwardRef, HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type DashboardSurfaceTone = "emerald" | "violet" | "slate";

type DashboardSurfaceVariant = "plain" | "gradient";

type DashboardSurfaceProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Visual variant for the surface. "gradient" adds a subtle multi-stop background.
   */
  variant?: DashboardSurfaceVariant;
  /**
   * Tone influences both the gradient stop palette and the default text color.
   */
  tone?: DashboardSurfaceTone;
  /**
   * Optional accent rendered as a thin gradient bar along the top edge.
   */
  accent?: DashboardSurfaceTone | null;
};

const baseSurface = "relative overflow-hidden rounded-3xl border shadow-xl ring-1 transition";

const plainSurface =
  "border-slate-200 bg-white text-slate-900 ring-slate-200/60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:ring-slate-800";

const gradientSurface: Record<DashboardSurfaceTone, string> = {
  emerald:
    "border-emerald-200/70 bg-linear-to-br from-emerald-50 via-white to-sky-50 text-slate-900 ring-emerald-100/60 dark:border-emerald-400/20 dark:from-emerald-500/10 dark:via-transparent dark:to-sky-500/20 dark:text-slate-100 dark:ring-emerald-400/25",
  violet:
    "border-violet-200/70 bg-linear-to-br from-violet-50 via-white to-sky-100 text-slate-900 ring-violet-100/60 dark:border-zinc-800 dark:bg-linear-to-br dark:from-zinc-950 dark:via-zinc-900 dark:to-slate-900 dark:text-slate-100 dark:ring-zinc-700/80",
  slate:
    "border-slate-200/70 bg-linear-to-br from-slate-50 via-white to-slate-100 text-slate-900 ring-slate-100/60 dark:border-slate-700/60 dark:from-slate-900/70 dark:via-slate-950 dark:to-slate-900 dark:text-slate-100 dark:ring-slate-800/80",
};

const accentMap: Record<DashboardSurfaceTone, string> = {
  emerald: "from-emerald-400 via-teal-300 to-sky-400 dark:from-emerald-400 dark:via-sky-400 dark:to-violet-400",
  violet: "from-violet-400 via-sky-300 to-emerald-300 dark:from-violet-400 dark:via-sky-400 dark:to-emerald-400",
  slate: "from-slate-400 via-blue-300 to-indigo-300 dark:from-slate-200 dark:via-indigo-500 dark:to-blue-500",
};

const DashboardSurface = forwardRef<HTMLDivElement, DashboardSurfaceProps>(
  ({
    variant = "plain",
    tone = "slate",
    accent = tone,
    className,
    children,
    ...props
  }, ref) => {
    const surfaceClasses =
      variant === "gradient" ? gradientSurface[tone] : plainSurface;

    return (
      <div ref={ref} className={cn(baseSurface, surfaceClasses, className)} {...props}>
        {accent ? (
          <span
            className={cn(
              "pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r",
              accentMap[accent],
            )}
            aria-hidden
          />
        ) : null}
        {children}
      </div>
    );
  },
);

DashboardSurface.displayName = "DashboardSurface";

export { DashboardSurface };
