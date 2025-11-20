"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Activity, Clock, HeartPulse, Users } from "lucide-react";
import { toast } from "sonner";

import LatestRunCard from "@/components/admin/projects/detail/latest-run-card";
import NodesPanel from "@/components/admin/projects/detail/nodes-panel";
import ProjectDetailSkeleton from "@/components/admin/projects/detail/project-detail-skeleton";
import ProjectHeader from "@/components/admin/projects/detail/project-header";
import ProjectQuickActions from "@/components/admin/projects/detail/project-quick-actions";
import ProjectStats from "@/components/admin/projects/detail/project-stats";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/admin/projects/shared/glass-card";
import { fetchProject, fetchProjectNodes } from "@/lib/fetchers/projects";
import { startRun, stopRun } from "@/lib/fetchers/admin";
import { RunStartPayload } from "@/lib/fetchers/types";

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();

  const {
    data: projectDetail,
    isLoading: projectLoading,
    isError: projectError,
    refetch: refetchProject,
  } = useQuery({
    queryKey: ["admin", "projects", projectId, "detail"],
    queryFn: () => fetchProject(projectId),
    enabled: Boolean(projectId),
    refetchInterval: 30000,
  });

  const {
    data: projectNodes,
    isLoading: nodesLoading,
    isError: nodesError,
    refetch: refetchNodes,
  } = useQuery({
    queryKey: ["admin", "projects", projectId, "nodes"],
    queryFn: () => fetchProjectNodes(projectId),
    enabled: Boolean(projectId),
    refetchInterval: 45000,
  });

  const runActive = Boolean(
    projectDetail?.stats.activeRun && projectDetail.stats.activeRun.status === "running"
  );

  const startRunMutation = useMutation({
    mutationFn: (payload: RunStartPayload) => startRun(payload),
    onSuccess: async () => {
      toast.success("Run started");
      await Promise.all([refetchProject(), refetchNodes()]);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to start run";
      toast.error(message);
    },
  });

  const stopRunMutation = useMutation({
    mutationFn: () => stopRun(),
    onSuccess: async () => {
      toast.success("Run stopped");
      await Promise.all([refetchProject(), refetchNodes()]);
      await queryClient.invalidateQueries({ queryKey: ["admin", "projects", projectId, "runs"] });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to stop run";
      toast.error(message);
    },
  });

  const isLoading = projectLoading || nodesLoading;
  const hasError = projectError || nodesError;

  const canStart = !runActive && Boolean(projectDetail);

  const projectName = projectDetail?.project.name ?? "Project";

  const relativeTime = (value?: string | null) => {
    if (!value) return null;
    try {
      return formatDistanceToNow(new Date(value), { addSuffix: true });
    } catch {
      return value;
    }
  };

  if (isLoading) {
    return <ProjectDetailSkeleton />;
  }

  if (hasError || !projectDetail) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight">Project</h1>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/projects">Back to projects</Link>
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertTitle>Unable to load project</AlertTitle>
          <AlertDescription>
            Something went wrong while fetching the project details. Try refreshing or return to the
            projects list.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { project, stats } = projectDetail;
  const createdRelative = relativeTime(project.created_at);
  const updatedRelative = relativeTime(project.updated_at);
  const latestRunRelative = relativeTime(stats.latestRun?.started_at ?? null);

  return (
    <div className="space-y-10">
      <section
        className="relative overflow-hidden rounded-3xl border border-sky-200/70 bg-linear-to-br from-sky-50 via-white to-emerald-50 p-8 shadow-xl ring-1 ring-sky-200/60 dark:border-sky-400/20 dark:from-sky-500/10 dark:via-transparent dark:to-emerald-500/15"
      >
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-sky-400 via-emerald-300 to-violet-300"
          aria-hidden
        />
        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-primary shadow-sm dark:bg-white/10 dark:text-primary-foreground">
              <HeartPulse className="h-3.5 w-3.5" />
              Clinical federation overview
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {project.name}
              </h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                {project.description ?? "No description provided for this federated learning project."}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground sm:text-sm">
              {createdRelative ? <span className="rounded-full bg-white/70 px-3 py-1 shadow-sm dark:bg-white/10">Created {createdRelative}</span> : null}
              {updatedRelative ? <span className="rounded-full bg-white/70 px-3 py-1 shadow-sm dark:bg-white/10">Updated {updatedRelative}</span> : null}
              <Badge variant="outline" className="rounded-full border-primary/40 bg-white/80 text-[11px] font-medium uppercase tracking-wide text-primary dark:bg-primary/20">
                Project ID • {project.id}
              </Badge>
              <Badge variant="secondary" className="rounded-full bg-primary/15 text-[11px] font-medium uppercase tracking-wide text-primary dark:bg-primary/25">
                Slug • {project.slug}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link href={`/admin/projects/${projectId}/control-panel`}>Open control panel</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/projects/${projectId}/runs`}>Browse run history</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/projects">Back to projects</Link>
              </Button>
            </div>
          </div>
          <GlassCard className="w-full max-w-sm shadow-xl" accent="emerald">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
                Project pulse
              </CardTitle>
              <CardDescription>Live glimpses across nodes and recent runs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 px-3 py-2 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200">
                <span>Status</span>
                <Badge variant={runActive ? "default" : "secondary"} className="uppercase">
                  {runActive ? stats.activeRun?.status ?? "running" : "Idle"}
                </Badge>
              </div>
              <div className="space-y-3 text-xs text-muted-foreground sm:text-sm">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-foreground">
                    <Activity className="h-4 w-4 text-primary" />
                    Latest run
                  </span>
                  <span className="font-medium text-foreground">
                    {latestRunRelative ?? "No runs yet"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-foreground">
                    <Clock className="h-4 w-4 text-primary" />
                    Last updated
                  </span>
                  <span className="font-medium text-foreground">
                    {updatedRelative ?? "Unknown"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-foreground">
                    <Users className="h-4 w-4 text-primary" />
                    Registered nodes
                  </span>
                  <span className="font-medium text-foreground">
                    {stats.nodeCount} total
                  </span>
                </div>
              </div>
            </CardContent>
          </GlassCard>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          {/* <ProjectHeader project={project} /> */}
          <ProjectStats stats={stats} />
          <NodesPanel nodes={projectNodes?.nodes ?? []} sessions={projectNodes?.sessions ?? []} />
        </div>

        <div className="space-y-6">
          <GlassCard showAccent={false}>
            <CardHeader>
              <CardTitle className="text-lg">Workflow shortcuts</CardTitle>
              <CardDescription>
                Quick navigation with this project locked as context.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link href={`/admin/projects/${projectId}/control-panel`}>Open control panel</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/projects/${projectId}/runs`}>Browse run history</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/projects">Back to all projects</Link>
              </Button>
            </CardContent>
          </GlassCard>
          <ProjectQuickActions
            projectId={project.id}
            projectName={projectName}
            canStart={canStart}
            runActive={runActive}
            isStarting={startRunMutation.isPending}
            isStopping={stopRunMutation.isPending}
            onStart={(payload) => startRunMutation.mutate(payload)}
            onStop={() => stopRunMutation.mutate()}
          />
          <LatestRunCard
            projectId={project.id}
            activeRun={stats.activeRun}
            latestRun={stats.latestRun}
          />
        </div>
      </div>
    </div>
  );
}
