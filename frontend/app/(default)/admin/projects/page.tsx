"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import ProjectsEmpty from "@/components/admin/projects/overview/projects-empty";
import ProjectsGrid from "@/components/admin/projects/overview/projects-grid";
import ProjectsSkeleton from "@/components/admin/projects/overview/projects-skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { fetchProjects } from "@/lib/fetchers/projects";

export default function AdminProjectsPage() {
  const {
    data: projects,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["admin", "projects"],
    queryFn: fetchProjects,
    refetchInterval: 20000,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
        <p className="text-muted-foreground">
          Review each deployment, inspect connected SuperNodes, and jump into run history.
        </p>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin">Back to control center</Link>
        </Button>
        <Button onClick={() => refetch()} size="sm" disabled={isFetching}>
          Refresh
        </Button>
      </div>

      {isError ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to load projects</AlertTitle>
          <AlertDescription>
            Check your Supabase connection or try refreshing manually.
          </AlertDescription>
        </Alert>
      ) : null}

      {isLoading ? (
        <ProjectsSkeleton count={6} />
      ) : projects && projects.length > 0 ? (
        <ProjectsGrid projects={projects} />
      ) : (
        <ProjectsEmpty />
      )}
    </div>
  );
}
