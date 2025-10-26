"use client";

import { useMemo, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { HeartPulse, Activity, Server, Users } from "lucide-react";
import { toast } from "sonner";

import OverviewCards from "@/components/admin/control-center/overview-cards";
import ConnectedNodesCard from "@/components/admin/control-center/connected-nodes-card";
import RunControls from "@/components/admin/control-center/run-controls";
import RuntimeLogs from "@/components/admin/control-center/runtime-logs";
import SuperlinkControls from "@/components/admin/control-center/superlink-controls";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import useUser from "@/hooks/use-user";
import {
  fetchAdminHealth,
  fetchActiveRun,
  startRun,
  startSuperlink,
  stopRun,
  stopSuperlink,
} from "@/lib/fetchers/admin";
import { fetchDashboardData, fetchProject } from "@/lib/fetchers/projects";
import {
  DashboardData,
  Node,
  NodeSession,
  RunStartPayload,
  SuperlinkStartPayload,
} from "@/lib/fetchers/types";

const formatTimestamp = (value?: string | null) => {
  if (!value) return "—";
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true });
  } catch (error) {
    return value;
  }
};

const selectLatestSessionsByNode = (sessions: NodeSession[]) => {
  const byNode = new Map<string, NodeSession>();
  sessions.forEach((session) => {
    const current = byNode.get(session.node_id);
    const currentTime = current?.started_at ? new Date(current.started_at).getTime() : 0;
    const candidateTime = session.started_at ? new Date(session.started_at).getTime() : 0;
    if (!current || candidateTime > currentTime) {
      byNode.set(session.node_id, session);
    }
  });
  return byNode;
};

export default function ProjectControlPanelPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();
  const { data: activeUser } = useUser();

  const {
    data: projectDetail,
    isError: projectError,
    isLoading: projectLoading,
  } = useQuery({
    queryKey: ["admin", "projects", projectId, "detail"],
    queryFn: () => fetchProject(projectId),
    enabled: Boolean(projectId),
    staleTime: 60000,
  });

  const {
    data: health,
    isLoading: healthLoading,
    isFetching: healthFetching,
  } = useQuery({
    queryKey: ["admin", "health"],
    queryFn: fetchAdminHealth,
    refetchInterval: 5000,
  });

  const {
    data: dashboard,
    isLoading: dashboardLoading,
    refetch: refetchDashboard,
  } = useQuery<DashboardData>({
    queryKey: ["admin", "dashboard", projectId],
    queryFn: () => fetchDashboardData(projectId as string),
    enabled: Boolean(projectId),
    refetchInterval: 7000,
  });

  useQuery({
    queryKey: ["admin", "active-run"],
    queryFn: fetchActiveRun,
    enabled: Boolean(projectId),
    refetchInterval: 7000,
  });

  const coordinatorNode = useMemo(
    () => dashboard?.nodes.find((node) => node.role === "coordinator") ?? null,
    [dashboard]
  );

  const latestSessions = useMemo(
    () => selectLatestSessionsByNode(dashboard?.nodeSessions ?? []),
    [dashboard?.nodeSessions]
  );

  const coordinatorSession = useMemo(
    () => (coordinatorNode ? latestSessions.get(coordinatorNode.id) ?? null : null),
    [coordinatorNode, latestSessions]
  );

  const onlineNodes = useMemo(() => {
    if (!dashboard) {
      return [] as Array<{ node: Node; session?: NodeSession }>;
    }

    return dashboard.nodes
      .map((node) => ({ node, session: latestSessions.get(node.id) }))
      .filter(({ session }) => session && session.status === "running");
  }, [dashboard, latestSessions]);

  const onlineParticipantCount = useMemo(
    () => onlineNodes.filter(({ node }) => node.role === "participant").length,
    [onlineNodes]
  );

  const resolvedProjectId = useMemo(() => {
    return (
      projectDetail?.project.id ??
      dashboard?.project?.id ??
      health?.active_project_id ??
      health?.default_project_id ??
      projectId ??
      null
    );
  }, [projectDetail?.project.id, dashboard?.project?.id, health?.active_project_id, health?.default_project_id, projectId]);

  const resolvedCoordinatorNodeId = useMemo(() => {
    return (
      coordinatorNode?.id ??
      health?.active_coordinator_node_id ??
      health?.default_coordinator_node_id ??
      null
    );
  }, [coordinatorNode?.id, health?.active_coordinator_node_id, health?.default_coordinator_node_id]);

  const resolvedUserId = useMemo(() => {
    return activeUser?.id ?? health?.active_user_id ?? null;
  }, [activeUser?.id, health?.active_user_id]);

  const { mutate: triggerStartSuperlink, isPending: startSuperlinkPending } = useMutation({
    mutationFn: startSuperlink,
    onSuccess: async () => {
      toast.success("SuperLink started");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "health"] }),
        refetchDashboard(),
      ]);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to start SuperLink";
      toast.error(message);
    },
  });

  const { mutate: triggerStopSuperlink, isPending: stopSuperlinkPending } = useMutation({
    mutationFn: stopSuperlink,
    onSuccess: async () => {
      toast.success("SuperLink stopped");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "health"] }),
        refetchDashboard(),
      ]);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to stop SuperLink";
      toast.error(message);
    },
  });

  const { mutate: triggerStartRun, isPending: startRunPending } = useMutation({
    mutationFn: startRun,
    onSuccess: async () => {
      toast.success("Federated run started");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "health"] }),
        refetchDashboard(),
      ]);
      await queryClient.invalidateQueries({ queryKey: ["admin", "active-run"] });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to start run";
      toast.error(message);
    },
  });

  const { mutate: triggerStopRun, isPending: stopRunPending } = useMutation({
    mutationFn: stopRun,
    onSuccess: async () => {
      toast.success("Federated run stopped");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "health"] }),
        refetchDashboard(),
      ]);
      await queryClient.invalidateQueries({ queryKey: ["admin", "active-run"] });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to stop run";
      toast.error(message);
    },
  });

  const superlinkRunning = health?.superlink_running ?? false;
  const runActive = Boolean(dashboard?.activeRun && dashboard.activeRun.status === "running");
  const runLog = dashboard?.activeRun?.log_stream ?? "";
  const superlinkLog = coordinatorSession?.log_stream ?? "";
  const metrics = dashboard?.activeRun?.metrics ?? null;

  const superlinkStartedAtText = formatTimestamp(health?.superlink_started_at);
  const runStartedAtText = formatTimestamp(dashboard?.activeRun?.started_at);

  const canStartRun = !runActive && superlinkRunning && Boolean(resolvedProjectId && resolvedCoordinatorNodeId);
  const canStartSuperlink = Boolean(resolvedProjectId && resolvedCoordinatorNodeId);

  const handleStartSuperlink = useCallback(
    (payload: SuperlinkStartPayload) => {
      if (!resolvedProjectId || !resolvedCoordinatorNodeId) {
        toast.error("Coordinator metadata is not available yet.");
        return;
      }

      triggerStartSuperlink({
        ...payload,
        project_id: payload.project_id ?? resolvedProjectId,
        node_id: payload.node_id ?? resolvedCoordinatorNodeId,
        user_id: payload.user_id ?? resolvedUserId ?? undefined,
      });
    },
    [resolvedProjectId, resolvedCoordinatorNodeId, resolvedUserId, triggerStartSuperlink]
  );

  const handleStartRun = useCallback(
    (payload: RunStartPayload) => {
      if (!resolvedProjectId || !resolvedCoordinatorNodeId) {
        toast.error("Coordinator metadata is not available yet.");
        return;
      }

      triggerStartRun({
        ...payload,
        project_id: payload.project_id ?? resolvedProjectId,
        coordinator_node_id:
          payload.coordinator_node_id ?? resolvedCoordinatorNodeId,
        user_id: payload.user_id ?? resolvedUserId ?? undefined,
      });
    },
    [resolvedProjectId, resolvedCoordinatorNodeId, resolvedUserId, triggerStartRun]
  );

  if (!projectId) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTitle>Missing project</AlertTitle>
          <AlertDescription>
            The project identifier was not supplied. Head back to the projects list and try again.
          </AlertDescription>
        </Alert>
        <Button asChild size="sm">
          <Link href="/admin/projects">Back to projects</Link>
        </Button>
      </div>
    );
  }

  if (projectError) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTitle>Unable to load project</AlertTitle>
          <AlertDescription>
            Something went wrong while fetching this project. Try refreshing or return to the projects list.
          </AlertDescription>
        </Alert>
        <Button asChild size="sm">
          <Link href="/admin/projects">Back to projects</Link>
        </Button>
      </div>
    );
  }

  const projectName = projectDetail?.project.name ?? dashboard?.project?.name ?? "Project";

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-violet-200/70 bg-linear-to-br from-violet-50 via-white to-sky-100 p-8 shadow-xl ring-1 ring-violet-200/60 dark:border-violet-400/20 dark:from-violet-500/10 dark:via-transparent dark:to-sky-500/15">
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-violet-400 via-sky-300 to-emerald-400"
          aria-hidden
        />
        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-700 shadow-sm dark:bg-white/10 dark:text-violet-100">
              <HeartPulse className="h-4 w-4" />
              Control center
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {projectName} Control Panel
              </h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                {projectDetail?.project.description ??
                  "Coordinate your clinical federation, orchestrate runs, and keep SuperLink healthy with real-time insights."}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
              <Badge className="rounded-full bg-emerald-500/10 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-100">
                <span className="inline-flex items-center gap-1">
                  <Server className="h-3.5 w-3.5" />
                  SuperLink • {superlinkRunning ? "Active" : "Offline"}
                </span>
              </Badge>
              <Badge variant="outline" className="rounded-full border-sky-300/60 bg-white/80 text-[11px] font-semibold uppercase tracking-wide text-sky-700 dark:border-sky-400/40 dark:bg-white/10 dark:text-sky-100">
                <span className="inline-flex items-center gap-1">
                  <Activity className="h-3.5 w-3.5" />
                  Run • {runActive ? "In progress" : "Idle"}
                </span>
              </Badge>
              <Badge variant="secondary" className="rounded-full bg-violet-500/15 text-[11px] font-semibold uppercase tracking-wide text-violet-700 dark:bg-violet-500/25 dark:text-violet-100">
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {onlineParticipantCount} nodes online
                </span>
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {superlinkStartedAtText ? (
                <span className="rounded-full bg-white/70 px-3 py-1 shadow-sm dark:bg-white/10">
                  SuperLink since {superlinkStartedAtText}
                </span>
              ) : null}
              {runStartedAtText ? (
                <span className="rounded-full bg-white/70 px-3 py-1 shadow-sm dark:bg-white/10">
                  Active run since {runStartedAtText}
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline" className="backdrop-blur">
                <Link href={`/admin/projects/${projectId}`}>Project overview</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="backdrop-blur">
                <Link href={`/admin/projects/${projectId}/runs`}>Run history</Link>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link href="/admin/projects">All projects</Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Refreshed every few seconds for live orchestration.
            </p>
          </div>
        </div>
      </section>

      <OverviewCards
        superlinkRunning={superlinkRunning}
        superlinkStartedAt={superlinkStartedAtText}
        superlinkPid={health?.run_info?.pid ?? "—"}
        runActive={runActive}
        activeRunLabel={dashboard?.activeRun?.label ?? "No active run"}
        activeRunStartedAt={runStartedAtText}
        onlineParticipantsCount={onlineParticipantCount}
        isOnlineLoading={dashboardLoading || projectLoading}
        projectId={projectId}
      />

      <div className="grid gap-4 lg:grid-cols-5">
        <SuperlinkControls
          superlinkRunning={superlinkRunning}
          isStarting={startSuperlinkPending}
          isStopping={stopSuperlinkPending}
          canStart={canStartSuperlink}
          onStart={handleStartSuperlink}
          onStop={() => triggerStopSuperlink()}
        />
        <RunControls
          canStart={canStartRun}
          runActive={runActive}
          isStarting={startRunPending}
          isStopping={stopRunPending}
          onStart={handleStartRun}
          onStop={() => triggerStopRun()}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <RuntimeLogs
          superlinkLog={superlinkLog}
          runLog={runLog}
          metrics={metrics}
          runActive={runActive}
          coordinatorDetected={Boolean(coordinatorNode)}
          isSuperlinkLoading={healthLoading || healthFetching || dashboardLoading}
          isRunLoading={dashboardLoading}
        />

        <ConnectedNodesCard
          nodes={onlineNodes}
          formatTimestamp={formatTimestamp}
          isLoading={dashboardLoading}
        />
      </div>
    </div>
  );
}
