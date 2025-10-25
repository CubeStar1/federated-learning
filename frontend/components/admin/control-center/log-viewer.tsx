"use client";

import { useMemo } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface LogViewerProps {
  content: string;
  isLoading: boolean;
  emptyLabel?: string;
}

export default function LogViewer({ content, isLoading, emptyLabel }: LogViewerProps) {
  const reversedContent = useMemo(() => {
    if (!content) {
      return "";
    }

    return content
      .split(/\r?\n/)
      .filter((line, index, arr) => !(line === "" && index === arr.length - 1))
      .reverse()
      .join("\n");
  }, [content]);

  if (isLoading) {
    return (
      <div
        className="flex h-80 items-center justify-center rounded-2xl border border-violet-200/60 bg-white/70 text-sm text-muted-foreground shadow-inner dark:border-violet-400/30 dark:bg-white/10"
      >
        <p className="text-sm text-muted-foreground">Refreshing log stream…</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div
        className="flex h-80 items-center justify-center rounded-2xl border border-violet-200/60 bg-white/70 px-6 text-center text-sm text-muted-foreground shadow-inner dark:border-violet-400/30 dark:bg-white/10"
      >
        {emptyLabel ?? "No log data available yet."}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "max-h-80 overflow-hidden rounded-2xl border border-violet-200/60 bg-white/80 shadow-inner dark:border-violet-400/30 dark:bg-white/10",
      )}
    >
      <ScrollArea className="h-80 w-full rounded-2xl">
        <pre className="whitespace-pre-wrap bg-transparent p-5 text-xs leading-relaxed text-slate-800 dark:text-slate-100">
          {reversedContent}
        </pre>
      </ScrollArea>
    </div>
  );
}
