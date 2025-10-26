"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import RunDetailSkeleton from "@/components/admin/projects/run-detail/run-detail-skeleton";
import RunHeader from "@/components/admin/projects/run-detail/run-header";
import RunLogPanel from "@/components/admin/projects/run-detail/run-log-panel";
import RunMetricsCard from "@/components/admin/projects/run-detail/run-metrics-card";
import RunMetricsChart from "@/components/admin/projects/run-detail/run-metrics-chart";
import RunParticipants from "@/components/admin/projects/run-detail/run-participants";
import RunTimeline from "@/components/admin/projects/run-detail/run-timeline";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { fetchProject, fetchRunDetail } from "@/lib/fetchers/projects";

export default function RunDetailPage() {
  const { projectId, runId } = useParams<{ projectId: string; runId: string }>();

  const {
    data: projectDetail,
    isLoading: projectLoading,
    isError: projectError,
  } = useQuery({
    queryKey: ["admin", "projects", projectId, "detail"],
    queryFn: () => fetchProject(projectId),
    enabled: Boolean(projectId),
    staleTime: 60000,
  });

  const {
    data: runDetail,
    isLoading: runLoading,
    isError: runError,
    refetch: refetchRun,
  } = useQuery({
    queryKey: ["admin", "projects", projectId, "runs", runId],
    queryFn: () => fetchRunDetail(projectId, runId),
    enabled: Boolean(projectId && runId),
    refetchInterval: 30000,
  });

  const isLoading = projectLoading || runLoading;
  const hasError = projectError || runError;

  const run = runDetail?.run ?? null;
  const projectName = projectDetail?.project.name;
  const coordinatorSession = runDetail?.coordinatorSession ?? null;
  const participantSessions = runDetail?.participantSessions ?? [];

  const logContent = useMemo(() => run?.log_stream ?? "", [run?.log_stream]);

  if (isLoading) {
    return <RunDetailSkeleton />;
  }

  if (hasError || !run || !projectId || !runId) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTitle>Unable to load run</AlertTitle>
          <AlertDescription>
            Something went wrong while fetching the run detail. Try refreshing the page.
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetchRun()} size="sm">
          Retry
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={`/admin/projects/${projectId}/runs`}>Back to runs</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="secondary" size="sm">
          <Link href={`/admin/projects/${projectId}/runs`}>
            Back to {projectName ?? "project"} runs
          </Link>
        </Button>
      </div>
      <RunHeader run={run} projectId={projectId} projectName={projectName ?? null} />

      <RunTimeline run={run} />

      <RunMetricsChart metrics={(run.metrics as Record<string, unknown> | null) ?? null} />

      <RunParticipants coordinator={coordinatorSession} participants={participantSessions} />

      <RunMetricsCard metrics={(run.metrics as Record<string, unknown> | null) ?? null} />

      <RunLogPanel label="Coordinator Log" content={logContent} />

      
    </div>
  );
}
