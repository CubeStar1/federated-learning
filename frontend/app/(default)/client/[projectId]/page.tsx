"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Activity, ArrowLeft, Fingerprint, PlugZap } from "lucide-react";
import { toast } from "sonner";

import ParticipantRoster from "@/components/client/session/participant-roster";
import SessionTelemetry from "@/components/client/session/session-telemetry";
import SupernodeControls from "@/components/client/session/supernode-controls";
import useUser from "@/hooks/use-user";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardSurface } from "@/components/ui/dashboard-surface";
import { cn } from "@/lib/utils";
import { fetchClientHealth, startSupernode, stopSupernode } from "@/lib/fetchers/client";
import { fetchClientDashboardData, fetchClientProject } from "@/lib/fetchers/projects";
import { ClientHealthResponse, DashboardData, Node, NodeSession, SupernodeStartPayload } from "@/lib/fetchers/types";

const formatTimestamp = (value?: string | null) => {
  if (!value) return "—";
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true });
  } catch {
    return value;
  }
};

const getLatestSession = (sessions: NodeSession[], allowedNodeIds: Set<string>, preferredId?: string | null) => {
  if (!sessions.length) {
    return null;
  }

  if (preferredId) {
    const byId = sessions.find((session) => session.id === preferredId);
    if (byId) {
      return byId;
    }
  }

  return sessions
    .filter((session) => allowedNodeIds.has(session.node_id))
    .reduce<NodeSession | null>((latest, session) => {
      const currentTime = latest?.started_at ? new Date(latest.started_at).getTime() : 0;
      const candidateTime = session.started_at ? new Date(session.started_at).getTime() : 0;
      if (!latest || candidateTime > currentTime) {
        return session;
      }
      return latest;
    }, null);
};

export default function ClientProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();
  const { data: supabaseUser } = useUser();

  const {
    data: project,
    isError: projectError,
    isLoading: projectLoading,
  } = useQuery({
    queryKey: ["client", "projects", projectId, "detail"],
    queryFn: () => fetchClientProject(projectId),
    enabled: Boolean(projectId),
    staleTime: 60000,
  });

  const {
    data: health,
    isLoading: healthLoading,
    refetch: refetchHealth,
  } = useQuery<ClientHealthResponse>({
    queryKey: ["client", "health"],
    queryFn: fetchClientHealth,
    refetchInterval: 5000,
  });

  const {
    data: dashboard,
    isLoading: dashboardLoading,
    refetch: refetchDashboard,
  } = useQuery<DashboardData>({
    queryKey: ["client", "dashboard", projectId],
    queryFn: () => fetchClientDashboardData(projectId as string),
    enabled: Boolean(projectId),
    refetchInterval: 7000,
  });

  const participantNodes = useMemo(
    () => (dashboard?.nodes ?? []).filter((node: Node) => node.role === "participant"),
    [dashboard?.nodes],
  );

  const participantIds = useMemo(
    () => new Set(participantNodes.map((node) => node.id)),
    [participantNodes],
  );

  const activeSession = useMemo(
    () =>
      getLatestSession(
        dashboard?.nodeSessions ?? [],
        participantIds,
        health?.session_id ?? null,
      ),
    [dashboard?.nodeSessions, participantIds, health?.session_id],
  );

  const startSupernodeMutation = useMutation({
    mutationFn: startSupernode,
    onSuccess: async () => {
      toast.success("SuperNode started");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["client", "health"] }),
        refetchDashboard(),
        refetchHealth(),
      ]);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to start SuperNode";
      toast.error(message);
    },
  });

  const stopSupernodeMutation = useMutation({
    mutationFn: stopSupernode,
    onSuccess: async () => {
      toast.success("SuperNode stopped");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["client", "health"] }),
        refetchDashboard(),
        refetchHealth(),
      ]);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to stop SuperNode";
      toast.error(message);
    },
  });

  const projectName = project?.project.name ?? dashboard?.project?.name ?? "Project";
  const projectDescription = project?.project.description ?? dashboard?.project?.description;

  const supernodeRunning = health?.supernode_running ?? false;
  const sessionLog = activeSession?.log_stream ?? "";
  const run = dashboard?.activeRun ?? null;
  const metrics = run?.metrics ?? null;
  const startedAt = formatTimestamp(health?.started_at ?? null);
  const resolvedProjectId = projectId ?? null;

  const resolvedUserId = supabaseUser?.id ?? null;

  const resolvedNodeId = useMemo(() => {
    if (!resolvedUserId) {
      return null;
    }
    const byUser = participantNodes.find((node) => node.user_id === resolvedUserId);
    return byUser ? byUser.id : null;
  }, [participantNodes, resolvedUserId]);

  const handleStartSupernode = (payload: SupernodeStartPayload) => {
    if (!resolvedProjectId || !resolvedNodeId) {
      toast.error("Join this project to start the SuperNode.");
      return;
    }

    startSupernodeMutation.mutate({
      ...payload,
      project_id: resolvedProjectId,
      node_id: resolvedNodeId,
      user_id: resolvedUserId ?? undefined,
    });
  };

  if (!projectId) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTitle>Missing project reference</AlertTitle>
          <AlertDescription>
            The client dashboard requires a valid project identifier. Return to the project list and try again.
          </AlertDescription>
        </Alert>
        <Button asChild size="sm">
          <Link href="/client">Back to projects</Link>
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
            Something went wrong while fetching Supabase metadata for this federation.
          </AlertDescription>
        </Alert>
        <Button asChild size="sm">
          <Link href="/client">Back to projects</Link>
        </Button>
      </div>
    );
  }

  const sessionStatusBadge = supernodeRunning
    ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/20 dark:text-emerald-100"
    : "border border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300";

  return (
    <div className="space-y-8">
      <DashboardSurface variant="gradient" tone="emerald" className="p-8">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-100">
              <PlugZap className="h-3.5 w-3.5" />
              Client control
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {projectName}
              </h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                {projectDescription ?? "Launch your local workloads, monitor telemetry, and coordinate securely with the federation."}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <Badge
                className={cn(
                  "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide",
                  sessionStatusBadge,
                )}
              >
                {supernodeRunning ? "SuperNode online" : "SuperNode offline"}
              </Badge>
              <Badge
                variant="outline"
                className="rounded-full border-slate-300 text-[11px] uppercase tracking-wide text-muted-foreground dark:border-slate-700 dark:text-slate-200"
              >
                <span className="inline-flex items-center gap-1">
                  <Activity className="h-3.5 w-3.5" />
                  Run {run ? run.status : "idle"}
                </span>
              </Badge>
              <Badge
                variant="secondary"
                className="rounded-full bg-white/70 text-[11px] uppercase tracking-wide text-muted-foreground shadow-sm dark:bg-slate-900/60 dark:text-slate-200"
              >
                Started {startedAt}
              </Badge>
            </div>
          </div>
          <div className="flex flex-col gap-3 text-xs text-muted-foreground">
            <div className="inline-flex items-center gap-2 self-end rounded-full bg-white/70 px-3 py-1 uppercase tracking-wide text-muted-foreground shadow-sm dark:bg-slate-900/60 dark:text-slate-200">
              <Fingerprint className="h-3.5 w-3.5" />
              Project ID
            </div>
            <Card className="w-full max-w-sm border border-slate-200 bg-white/85 text-foreground shadow-lg backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70">
              <CardHeader>
                <CardTitle className="text-sm font-semibold uppercase tracking-wide">Supabase reference</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Useful for coordinating with the central operations team.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between text-foreground">
                  <span>Project slug</span>
                  <span className="font-medium">{project?.project.slug ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between text-foreground">
                  <span>Active session</span>
                  <span className="font-medium">{health?.session_id ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Log path</span>
                  <span className="truncate text-right text-[11px] text-muted-foreground" title={health?.log_path ?? ""}>
                    {health?.log_path ?? "—"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardSurface>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <SupernodeControls
            supernodeRunning={supernodeRunning}
            isStarting={startSupernodeMutation.isPending}
            isStopping={stopSupernodeMutation.isPending}
            onStart={handleStartSupernode}
            onStop={() => stopSupernodeMutation.mutate()}
            projectId={resolvedProjectId}
            nodeId={resolvedNodeId}
            userId={resolvedUserId}
          />
        </div>
        <div className="lg:col-span-2">
          <ParticipantRoster participants={participantNodes} />
        </div>
      </div>

      <SessionTelemetry
        sessionLog={sessionLog}
        run={run}
        metrics={metrics}
        isLoading={dashboardLoading || healthLoading || startSupernodeMutation.isPending}
      />

      <div className="flex flex-wrap justify-between gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href="/client">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to projects
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            await Promise.all([refetchDashboard(), refetchHealth()]);
            toast.info("Client view refreshed");
          }}
        >
          Refresh data
        </Button>
      </div>
    </div>
  );
}
