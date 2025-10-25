"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FederatedRun } from "@/lib/fetchers/types";

interface RunsTableProps {
  runs: FederatedRun[];
  projectId: string;
}

const formatTimestamp = (value?: string | null) => {
  if (!value) return "—";
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true });
  } catch {
    return value;
  }
};

const statusVariant = (status: string) => {
  switch (status) {
    case "running":
      return "default" as const;
    case "completed":
      return "outline" as const;
    case "failed":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
};

export default function RunsTable({ runs, projectId }: RunsTableProps) {
  if (runs.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex h-40 flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm font-medium">No runs found</p>
          <p className="text-sm text-muted-foreground">
            Launch a federated run and it will appear in this list.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-40">Run</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Started</TableHead>
            <TableHead>Ended</TableHead>
            <TableHead>Coordinator Session</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {runs.map((run) => (
            <TableRow key={run.id}>
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span>{run.label ?? run.id}</span>
                  <span className="text-xs text-muted-foreground">{run.id}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant(run.status)} className="capitalize">
                  {run.status}
                </Badge>
              </TableCell>
              <TableCell>{formatTimestamp(run.started_at)}</TableCell>
              <TableCell>{formatTimestamp(run.ended_at)}</TableCell>
              <TableCell>{run.coordinator_session_id ?? "—"}</TableCell>
              <TableCell className="text-right">
                <Link
                  className="text-sm font-medium text-primary hover:underline"
                  href={`/admin/projects/${projectId}/runs/${run.id}`}
                >
                  View
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
