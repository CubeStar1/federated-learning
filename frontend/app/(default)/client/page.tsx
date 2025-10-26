"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Activity, ArrowRight, Plug } from "lucide-react";
import { toast } from "sonner";

import ClientProjectsEmpty from "@/components/client/projects/client-projects-empty";
import ClientProjectsGrid from "@/components/client/projects/client-projects-grid";
import ClientProjectsSkeleton from "@/components/client/projects/client-projects-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardSurface } from "@/components/ui/dashboard-surface";
import { fetchClientHealth } from "@/lib/fetchers/client";
import { fetchClientProjects, joinClientProject } from "@/lib/fetchers/projects";
import { JoinProjectResponse } from "@/lib/fetchers/types";

const formatTimestamp = (value?: string | null) => {
  if (!value) return null;
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true });
  } catch {
    return value;
  }
};

export default function ClientHomePage() {
  const router = useRouter();
  const {
    data: health,
    isLoading: healthLoading,
  } = useQuery({
    queryKey: ["client", "health"],
    queryFn: fetchClientHealth,
    refetchInterval: 5000,
  });

  const {
    data: projects,
    isLoading: projectsLoading,
  } = useQuery({
    queryKey: ["client", "projects"],
    queryFn: fetchClientProjects,
    refetchInterval: 20000,
  });

  const joinProjectMutation = useMutation<JoinProjectResponse, Error, string>({
    mutationFn: (projectId: string) => joinClientProject(projectId),
    onSuccess: ({ project, already_registered }) => {
      toast.success(
        already_registered
          ? "You are already enrolled in this federation."
          : "Participant node registered."
      );
      router.push(`/client/${project.id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to join project");
    },
  });

  const joiningProjectId = joinProjectMutation.isPending
    ? joinProjectMutation.variables ?? null
    : null;

  const handleJoinProject = (projectId: string) => {
    if (!joinProjectMutation.isPending) {
      joinProjectMutation.mutate(projectId);
    }
  };

  const supernodeRunning = health?.supernode_running ?? false;
  const startedAtText = formatTimestamp(health?.started_at ?? null);

  return (
    <div className="space-y-10">
      <DashboardSurface variant="gradient" tone="violet" className="p-8">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-100">
              <Plug className="h-3.5 w-3.5" />
              Participant console
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Connect your hospital node in minutes
              </h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                Launch SuperNode sessions, stream logs, and join federated rounds orchestrated by the clinical network.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {startedAtText ? (
                <span className="rounded-full bg-white/70 px-3 py-1 shadow-sm backdrop-blur dark:bg-white/10">
                  Running since {startedAtText}
                </span>
              ) : (
                <span className="rounded-full bg-white/70 px-3 py-1 shadow-sm backdrop-blur dark:bg-white/10">
                  SuperNode is currently offline
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link href="#projects">
                  Open client projects
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/admin/projects">Admin view</Link>
              </Button>
            </div>
          </div>
          <Card className="w-full max-w-sm border border-slate-200 bg-white/85 text-foreground shadow-lg backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
                <Activity className="h-4 w-4" />
                SuperNode status
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Snapshot of the local process exposed by the client server.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60">
                <span>Status</span>
                <Badge
                  variant="outline"
                  className={supernodeRunning
                    ? "rounded-full border-emerald-200 bg-emerald-50 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:border-emerald-500/50 dark:bg-emerald-500/20 dark:text-emerald-100"
                    : "rounded-full border-slate-300 bg-slate-100 text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300"}
                >
                  {healthLoading ? "Checking…" : supernodeRunning ? "Running" : "Offline"}
                </Badge>
              </div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Session ID</span>
                  <span className="font-medium text-foreground">
                    {health?.session_id ? health.session_id : "None"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Log path</span>
                  <span
                    className="truncate text-right text-[11px] font-medium text-foreground"
                    title={health?.log_path ?? ""}
                  >
                    {health?.log_path ?? "—"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardSurface>

      <section id="projects" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-foreground">Available federations</h2>
            <p className="text-sm text-muted-foreground">
              Choose a project to connect your site and monitor training progress.
            </p>
          </div>
        </div>

        {projectsLoading ? (
          <ClientProjectsSkeleton count={3} />
        ) : projects && projects.length > 0 ? (
          <ClientProjectsGrid
            projects={projects}
            onJoin={handleJoinProject}
            joiningProjectId={joiningProjectId}
          />
        ) : (
          <ClientProjectsEmpty />
        )}
      </section>
    </div>
  );
}
