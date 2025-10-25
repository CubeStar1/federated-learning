"use client";

import { ProjectSummary } from "@/lib/fetchers/types";

import ProjectCard from "./project-card";

interface ProjectsGridProps {
  projects: ProjectSummary[];
}

export default function ProjectsGrid({ projects }: ProjectsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {projects.map((summary) => (
        <ProjectCard key={summary.project.id} summary={summary} />
      ))}
    </div>
  );
}
