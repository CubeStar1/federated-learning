"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type RunStatusFilter = "all" | "running" | "completed" | "failed" | "cancelled";

interface RunsFiltersProps {
  status: RunStatusFilter;
  onStatusChange: (status: RunStatusFilter) => void;
  search: string;
  onSearchChange: (value: string) => void;
  totalCount: number;
  filteredCount: number;
}

export default function RunsFilters({
  status,
  onStatusChange,
  search,
  onSearchChange,
  totalCount,
  filteredCount,
}: RunsFiltersProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-background p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1 sm:w-48">
          <span className="text-xs font-medium uppercase text-muted-foreground">Status</span>
          <Select value={status} onValueChange={(value) => onStatusChange(value as RunStatusFilter)}>
            <SelectTrigger>
              <SelectValue placeholder="All runs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <span className="text-xs font-medium uppercase text-muted-foreground">Search</span>
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by label or run ID"
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <Badge variant="outline" className="text-xs">
          Showing {filteredCount} of {totalCount}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onSearchChange("");
            onStatusChange("all");
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
