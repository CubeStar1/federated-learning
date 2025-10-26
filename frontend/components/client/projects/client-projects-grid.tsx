"use client";

import ClientProjectCard from "./client-project-card";
import { ProjectSummary } from "@/lib/fetchers/types";

interface ClientProjectsGridProps {
  projects: ProjectSummary[];
  onJoin?: (projectId: string) => void;
  joiningProjectId?: string | null;
}

export default function ClientProjectsGrid({
  projects,
  onJoin,
  joiningProjectId,
}: ClientProjectsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {projects.map((summary) => (
        <ClientProjectCard
          key={summary.project.id}
          summary={summary}
          onJoin={onJoin ? () => onJoin(summary.project.id) : undefined}
          isJoining={joiningProjectId === summary.project.id}
        />
      ))}
    </div>
  );
}
