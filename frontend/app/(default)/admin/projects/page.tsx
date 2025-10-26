"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import CreateProjectForm from "@/components/admin/projects/overview/create-project-form";
import ProjectsEmpty from "@/components/admin/projects/overview/projects-empty";
import ProjectsGrid from "@/components/admin/projects/overview/projects-grid";
import ProjectsSkeleton from "@/components/admin/projects/overview/projects-skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { fetchProjects } from "@/lib/fetchers/projects";

export default function AdminProjectsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Review each deployment, inspect connected SuperNodes, and jump into run history.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin">Back to control center</Link>
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">New project</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Register a healthcare federation</DialogTitle>
                <DialogDescription>
                  Provision a coordinator node with your Supabase identity. We will generate identifiers if you leave them blank.
                </DialogDescription>
              </DialogHeader>
              <CreateProjectForm onSuccess={() => setIsCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isError ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to load projects</AlertTitle>
          <AlertDescription>
            Something went wrong while fetching your federations. Please refresh the page or try again later.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Federations you manage</h2>
            <p className="text-sm text-muted-foreground">
              Review coordinator health, launch control panels, and invite participant hospitals from this list.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="rounded-full border-primary/30 bg-white/80 text-[11px] font-medium uppercase tracking-wide text-primary dark:bg-primary/20">
              {projects?.length ? `${projects.length} registered` : "0 registered"}
            </Badge>
            <Badge variant={isFetching ? "default" : "secondary"} className="rounded-full text-[11px] uppercase tracking-wide">
              {isFetching ? "Refreshing" : "Live every 20s"}
            </Badge>
            <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}>
              Refresh now
            </Button>
          </div>
        </div>

        {isLoading ? (
          <ProjectsSkeleton count={3} />
        ) : projects && projects.length > 0 ? (
          <ProjectsGrid projects={projects} />
        ) : (
          <ProjectsEmpty message="Once you register a coordinator, it will appear here." />
        )}
      </div>
    </div>
  );
}
