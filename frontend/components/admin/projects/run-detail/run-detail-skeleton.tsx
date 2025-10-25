"use client";

export default function RunDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-32 rounded-lg border bg-muted/40" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-36 rounded-lg border bg-muted/40" />
        <div className="h-36 rounded-lg border bg-muted/40" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-80 rounded-lg border bg-muted/40" />
        <div className="h-80 rounded-lg border bg-muted/40" />
      </div>
      <div className="h-80 rounded-lg border bg-muted/40" />
    </div>
  );
}
