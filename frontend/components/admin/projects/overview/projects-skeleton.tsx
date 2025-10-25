"use client";

const SkeletonCard = () => (
  <div className="animate-pulse space-y-4 rounded-lg border bg-muted/30 p-6">
    <div className="h-6 w-2/3 rounded bg-muted" />
    <div className="h-4 w-full rounded bg-muted/80" />
    <div className="grid grid-cols-3 gap-3 pt-4">
      <div className="h-12 rounded bg-muted/80" />
      <div className="h-12 rounded bg-muted/80" />
      <div className="h-12 rounded bg-muted/80" />
    </div>
    <div className="h-10 w-full rounded bg-muted/80" />
  </div>
);

interface ProjectsSkeletonProps {
  count?: number;
}

export default function ProjectsSkeleton({ count = 3 }: ProjectsSkeletonProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}
