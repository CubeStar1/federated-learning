"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Settings2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/admin/projects/shared/glass-card";
import { Project } from "@/lib/fetchers/types";

interface ProjectHeaderProps {
  project: Project;
}

const formatDate = (value: string) => {
  try {
    return format(new Date(value), "PPpp");
  } catch {
    return value;
  }
};

export default function ProjectHeader({ project }: ProjectHeaderProps) {
  const [showConfig, setShowConfig] = useState(false);

  return (
    <GlassCard className="bg-linear-to-br from-primary/10 via-background to-background px-6 py-6" accent="primary">
      <CardHeader className="gap-4">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary shadow-sm dark:bg-white/10 dark:text-primary-foreground">
            <Settings2 className="h-3.5 w-3.5" />
            Project blueprint
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-semibold leading-tight">{project.name}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {project.description ?? "No description provided for this project."}
            </CardDescription>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="rounded-full border-primary/30 bg-white/70 text-[11px] font-medium uppercase tracking-wide text-primary dark:bg-primary/20">
            Project ID • {project.id}
          </Badge>
          <Badge variant="secondary" className="rounded-full bg-primary/15 text-[11px] font-medium uppercase tracking-wide text-primary dark:bg-primary/25">
            Slug • {project.slug}
          </Badge>
          <span className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-medium tracking-wide text-muted-foreground shadow-sm dark:bg-white/10">
            Created {formatDate(project.created_at)}
          </span>
          <span className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-medium tracking-wide text-muted-foreground shadow-sm dark:bg-white/10">
            Updated {formatDate(project.updated_at)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {project.config ? (
          <div className="space-y-3 rounded-2xl border border-primary/15 bg-white/80 p-4 shadow-inner backdrop-blur-sm dark:bg-slate-200/10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">Configuration JSON</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowConfig((prev) => !prev)}
              >
                {showConfig ? "Hide JSON" : "Show JSON"}
              </Button>
            </div>
            {showConfig ? (
              <pre className="max-h-60 overflow-auto rounded-xl border border-primary/10 bg-background/70 p-4 text-xs leading-relaxed shadow-sm">
                {JSON.stringify(project.config, null, 2)}
              </pre>
            ) : (
              <p className="text-xs text-muted-foreground">
                Toggle to inspect the stored configuration JSON captured for this federation.
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            No configuration object is stored for this project yet.
          </p>
        )}
      </CardContent>
    </GlassCard>
  );
}
