"use client";

import { ClientCard } from "@/components/client/shared/client-card";
import { CardContent } from "@/components/ui/card";

interface ClientProjectsEmptyProps {
  message?: string;
}

export default function ClientProjectsEmpty({ message }: ClientProjectsEmptyProps) {
  return (
    <ClientCard
      showAccent={false}
      className="border border-dashed border-slate-300 bg-white/80 text-muted-foreground dark:border-slate-700 dark:bg-slate-950/40"
    >
      <CardContent className="flex flex-col items-center justify-center gap-4 py-10 text-center">
        <div className="space-y-1">
          <p className="text-lg font-semibold text-foreground">No projects available</p>
          <p className="text-sm text-muted-foreground">
            {message ?? "Your Supabase workspace does not list any participant federations yet."}
          </p>
        </div>
      </CardContent>
    </ClientCard>
  );
}
