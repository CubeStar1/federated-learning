"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import ProjectsEmpty from "@/components/admin/projects/overview/projects-empty";
import ProjectsGrid from "@/components/admin/projects/overview/projects-grid";
import ProjectsSkeleton from "@/components/admin/projects/overview/projects-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HeartPulse } from "lucide-react";
import { fetchAdminHealth } from "@/lib/fetchers/admin";
import { fetchProjects } from "@/lib/fetchers/projects";

export default function AdminHomePage() {
  const {
    data: health,
    isLoading: healthLoading,
  } = useQuery({
    queryKey: ["admin", "health"],
    queryFn: fetchAdminHealth,
    refetchInterval: 5000,
  });

  const {
    data: projects,
    isLoading: projectsLoading,
  } = useQuery({
    queryKey: ["admin", "projects"],
    queryFn: fetchProjects,
    refetchInterval: 20000,
  });

  const superlinkRunning = health?.superlink_running ?? false;
  const activeRun = health?.run_info;
  const activeProjectId = health?.project_id ?? null;

  return (
    <div className="space-y-10">
      <section
        className="relative overflow-hidden rounded-3xl border border-sky-200/70 bg-linear-to-br from-sky-50 via-white to-emerald-50 p-8 shadow-xl ring-1 ring-sky-200/60 dark:border-sky-400/20 dark:from-sky-500/10 dark:via-transparent dark:to-emerald-500/15"
      >
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-sky-400 via-emerald-300 to-violet-300"
          aria-hidden
        />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary shadow-sm dark:bg-white/10 dark:text-primary-foreground">
              <HeartPulse className="h-3 w-3" />
              Healthcare Federation Ops Center
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Guide hospital networks through safe federated learning
              </h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                Monitor SuperLink health, coordinate cross-institution runs, and keep clinicians informed with a single control surface built for healthcare privacy requirements.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link href="/admin/projects">Explore projects</Link>
              </Button>
              {activeProjectId ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/projects/${activeProjectId}/control-panel`}>
                    Active control panel
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
          <Card className="w-full max-w-sm border-none bg-white/80 shadow-lg backdrop-blur-sm dark:bg-slate-200/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
                SuperLink Pulse
              </CardTitle>
              <CardDescription>Live snapshot of the coordinator service.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 px-3 py-2 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200">
                <span>Status</span>
                <Badge variant={superlinkRunning ? "default" : "secondary"}>
                  {healthLoading ? "Checking…" : superlinkRunning ? "Running" : "Offline"}
                </Badge>
              </div>
              <div className="grid gap-2 text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Active project</span>
                  <span className="font-medium text-foreground">
                    {activeProjectId ? activeProjectId : healthLoading ? "Loading…" : "None"}
                  </span>
                </div>
                {activeRun ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span>Federation PID</span>
                      <span className="font-medium text-foreground">{activeRun.pid}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Run ID</span>
                      <span className="truncate text-right text-xs font-medium text-foreground" title={activeRun.run_id}>
                        {activeRun.run_id}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-xs italic">No federation is currently active.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Healthcare federations</h2>
            <p className="text-sm text-muted-foreground">
              Each project represents a collaborative learning effort across hospitals and clinics.
            </p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/projects">Manage all projects</Link>
          </Button>
        </div>

        {projectsLoading ? (
          <ProjectsSkeleton count={3} />
        ) : projects && projects.length > 0 ? (
          <ProjectsGrid projects={projects} />
        ) : (
          <ProjectsEmpty message="No projects are currently registered. Create one in Supabase to begin." />
        )}
      </div>
    </div>
  );
}
