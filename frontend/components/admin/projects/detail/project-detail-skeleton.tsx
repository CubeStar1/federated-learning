"use client";

export default function ProjectDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-2/3 rounded bg-muted/70" />
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <div className="h-56 rounded-xl border bg-muted/40" />
          <div className="h-44 rounded-xl border bg-muted/30" />
          <div className="h-80 rounded-xl border bg-muted/30" />
        </div>
        <div className="space-y-6">
          <div className="h-44 rounded-xl border bg-muted/30" />
          <div className="h-72 rounded-xl border bg-muted/30" />
          <div className="h-72 rounded-xl border bg-muted/30" />
        </div>
      </div>
    </div>
  );
}
