"use client";

import { ClientCard } from "@/components/client/shared/client-card";

interface ClientProjectsSkeletonProps {
  count?: number;
}

export default function ClientProjectsSkeleton({ count = 3 }: ClientProjectsSkeletonProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <ClientCard
          key={index}
          showAccent={false}
          className="animate-pulse space-y-4 p-6"
        >
          <div className="h-6 w-2/3 rounded bg-slate-200/80 dark:bg-slate-700/50" />
          <div className="h-4 w-full rounded bg-slate-200/70 dark:bg-slate-800/50" />
          <div className="grid grid-cols-3 gap-3 pt-4">
            <div className="h-12 rounded bg-slate-200/70 dark:bg-slate-800/50" />
            <div className="h-12 rounded bg-slate-200/70 dark:bg-slate-800/50" />
            <div className="h-12 rounded bg-slate-200/70 dark:bg-slate-800/50" />
          </div>
          <div className="h-10 w-full rounded bg-slate-200/70 dark:bg-slate-800/50" />
        </ClientCard>
      ))}
    </div>
  );
}
