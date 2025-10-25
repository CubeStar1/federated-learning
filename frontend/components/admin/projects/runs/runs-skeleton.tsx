"use client";

export default function RunsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-16 rounded-lg border bg-muted/40" />
      <div className="h-12 rounded-lg border bg-muted/40" />
      <div className="h-64 rounded-lg border bg-muted/40" />
    </div>
  );
}
