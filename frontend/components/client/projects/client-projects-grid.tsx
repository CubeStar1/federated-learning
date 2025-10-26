"use client";

import ClientProjectCard from "./client-project-card";
import { ProjectSummary } from "@/lib/fetchers/types";

interface ClientProjectsGridProps {
  projects: ProjectSummary[];
}

export default function ClientProjectsGrid({ projects }: ClientProjectsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {projects.map((summary) => (
        <ClientProjectCard key={summary.project.id} summary={summary} />
      ))}
    </div>
  );
}
