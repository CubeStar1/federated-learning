"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import RunsFilters, {
  RunStatusFilter,
} from "@/components/admin/projects/runs/runs-filters";
import RunsHeader from "@/components/admin/projects/runs/runs-header";
import RunsSkeleton from "@/components/admin/projects/runs/runs-skeleton";
import RunsTable from "@/components/admin/projects/runs/runs-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { fetchProject, fetchProjectRuns } from "@/lib/fetchers/projects";

export default function ProjectRunsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [status, setStatus] = useState<RunStatusFilter>("all");
  const [search, setSearch] = useState("");

  const {
    data: projectDetail,
    isLoading: projectLoading,
    isError: projectError,
  } = useQuery({
    queryKey: ["admin", "projects", projectId, "detail"],
    queryFn: () => fetchProject(projectId),
    enabled: Boolean(projectId),
    staleTime: 30000,
  });

  const {
    data: runsResponse,
    isLoading: runsLoading,
    isError: runsError,
    refetch: refetchRuns,
    isFetching: runsFetching,
  } = useQuery({
    queryKey: ["admin", "projects", projectId, "runs"],
    queryFn: () => fetchProjectRuns(projectId),
    enabled: Boolean(projectId),
    refetchInterval: 45000,
  });

  const runs = runsResponse?.runs ?? [];
  const filteredRuns = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return runs.filter((run) => {
      const matchesStatus =
        status === "all" || run.status.toLowerCase() === status.toLowerCase();
      const matchesSearch = normalizedSearch
        ? (run.label ?? "").toLowerCase().includes(normalizedSearch) ||
          run.id.toLowerCase().includes(normalizedSearch)
        : true;
      return matchesStatus && matchesSearch;
    });
  }, [runs, status, search]);

  if (projectLoading || runsLoading) {
    return <RunsSkeleton />;
  }

  if (projectError || runsError || !projectId) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTitle>Unable to load run history</AlertTitle>
          <AlertDescription>
            Something went wrong while fetching data for this project. Try refreshing.
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetchRuns()} size="sm">
          Retry
        </Button>
      </div>
    );
  }

  const projectName = projectDetail?.project.name;

  return (
    <div className="space-y-6">
      <RunsHeader projectName={projectName} projectId={projectId} />

      <div className="flex items-center justify-end">
        <Button onClick={() => refetchRuns()} size="sm" disabled={runsFetching}>
          Refresh
        </Button>
      </div>

      <RunsFilters
        status={status}
        onStatusChange={setStatus}
        search={search}
        onSearchChange={setSearch}
        totalCount={runs.length}
        filteredCount={filteredRuns.length}
      />

      <RunsTable runs={filteredRuns} projectId={projectId} />
    </div>
  );
}
