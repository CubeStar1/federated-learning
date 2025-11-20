"use client";

import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2, Play, Square } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { GlassCard } from "@/components/admin/projects/shared/glass-card";
import { fetchModelCatalog, uploadDataset } from "@/lib/fetchers/admin";
import type { CatalogResponse, RunStartPayload } from "@/lib/fetchers/types";

interface ProjectQuickActionsProps {
  projectId: string;
  projectName: string;
  canStart: boolean;
  runActive: boolean;
  isStarting: boolean;
  isStopping: boolean;
  onStart: (payload: RunStartPayload) => void;
  onStop: () => void;
}

const numberOrZero = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function ProjectQuickActions({
  projectId,
  projectName,
  canStart,
  runActive,
  isStarting,
  isStopping,
  onStart,
  onStop,
}: ProjectQuickActionsProps) {
  const [label, setLabel] = useState(`${projectName} federation`);
  const [stream, setStream] = useState(true);
  const [taskKey, setTaskKey] = useState<string>();
  const [modelKey, setModelKey] = useState<string>();
  const [datasetPath, setDatasetPath] = useState("");
  const [inputHeight, setInputHeight] = useState("0");
  const [inputWidth, setInputWidth] = useState("0");
  const [inputChannels, setInputChannels] = useState("0");
  const [numClasses, setNumClasses] = useState("0");

  const catalogQuery = useQuery<CatalogResponse>({
    queryKey: ["admin", "model-catalog"],
    queryFn: () => fetchModelCatalog(),
    staleTime: 5 * 60 * 1000,
  });

  const tasks = catalogQuery.data?.tasks ?? [];
  const currentTask = useMemo(() => tasks.find((task) => task.key === taskKey), [taskKey, tasks]);
  const availableModels = currentTask?.models ?? [];

  useEffect(() => {
    if (!tasks.length || taskKey) return;
    const firstTask = tasks[0];
    setTaskKey(firstTask.key);
    if (firstTask.models.length) {
      setModelKey(firstTask.models[0].value);
    }
    setInputHeight(String(firstTask.defaults.input_height));
    setInputWidth(String(firstTask.defaults.input_width));
    setInputChannels(String(firstTask.defaults.input_channels));
    setNumClasses(String(firstTask.defaults.num_classes));
  }, [tasks, taskKey]);

  const uploadDatasetMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      if (projectId) {
        formData.append("project_id", projectId);
      }
      if (taskKey) {
        formData.append("task_name", taskKey);
      }
      return uploadDataset(formData);
    },
    onSuccess: (response) => {
      setDatasetPath(response.dataset_path);
      toast.success("Dataset uploaded", {
        description: response.dataset_path,
      });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Unable to upload dataset";
      toast.error(message);
    },
  });

  const handleTaskChange = (value: string) => {
    setTaskKey(value);
    const nextTask = tasks.find((task) => task.key === value);
    if (nextTask) {
      setInputHeight(String(nextTask.defaults.input_height));
      setInputWidth(String(nextTask.defaults.input_width));
      setInputChannels(String(nextTask.defaults.input_channels));
      setNumClasses(String(nextTask.defaults.num_classes));
      setModelKey(nextTask.models[0]?.value);
    }
  };

  const handleModelChange = (value: string) => {
    setModelKey(value);
  };

  const handleDatasetFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    uploadDatasetMutation.mutate(file);
    event.target.value = "";
  };

  const numericHeight = numberOrZero(inputHeight);
  const numericWidth = numberOrZero(inputWidth);
  const numericChannels = numberOrZero(inputChannels);
  const numericClasses = numberOrZero(numClasses);
  const numFeatures = numericHeight * numericWidth * numericChannels;

  const buildConfigArgs = () => {
    const config: Record<string, string | number | undefined> = {
      "task-name": taskKey,
      "model-name": modelKey,
      "dataset-path": datasetPath || undefined,
      "input-height": numericHeight || undefined,
      "input-width": numericWidth || undefined,
      "input-channels": numericChannels || undefined,
      "num-classes": numericClasses || undefined,
      "num-features": numFeatures || undefined,
    };

    return Object.entries(config)
      .filter(([, value]) => value !== undefined && value !== null && `${value}`.length > 0)
      .flatMap(([key, value]) => ["--config", `${key}=${value}`]);
  };

  const configReady = Boolean(taskKey && modelKey);

  const handleStart = () => {
    const payload: RunStartPayload = {
      federation_name: label.trim() || undefined,
      stream,
      extra_args: buildConfigArgs(),
    };
    onStart(payload);
  };

  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick actions</CardTitle>
        <CardDescription>Launch or stop runs with your preferred model and dataset.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="runLabel" className="text-sm font-medium text-foreground">
            Run label
          </Label>
          <Input
            id="runLabel"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="Federation label"
            className="border-primary/20 bg-white/70 focus-visible:ring-primary"
          />
        </div>

        <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4 shadow-inner dark:bg-primary/15">
          <div className="space-y-4">
            <div className="grid gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">Learning task</Label>
                <Select
                  value={taskKey}
                  onValueChange={handleTaskChange}
                  disabled={catalogQuery.isLoading || !tasks.length}
                >
                  <SelectTrigger className="border-primary/30 bg-white/80 focus:ring-primary">
                    <SelectValue placeholder="Select task" />
                  </SelectTrigger>
                  <SelectContent>
                    {tasks.map((task) => (
                      <SelectItem key={task.key} value={task.key}>
                        {task.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {currentTask?.description ?? "Choose which healthcare workload to train."}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">Model architecture</Label>
                <Select
                  value={modelKey}
                  onValueChange={handleModelChange}
                  disabled={!availableModels.length}
                >
                  <SelectTrigger className="border-primary/30 bg-white/80 focus:ring-primary">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {availableModels.find((model) => model.value === modelKey)?.description ??
                    "Pick a baseline or ensemble to start federated training."}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="inputHeight">Input height (px)</Label>
                <Input
                  id="inputHeight"
                  type="number"
                  min={1}
                  value={inputHeight}
                  onChange={(event) => setInputHeight(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inputWidth">Input width (px)</Label>
                <Input
                  id="inputWidth"
                  type="number"
                  min={1}
                  value={inputWidth}
                  onChange={(event) => setInputWidth(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inputChannels">Channels</Label>
                <Input
                  id="inputChannels"
                  type="number"
                  min={1}
                  value={inputChannels}
                  onChange={(event) => setInputChannels(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="numClasses">Classes</Label>
                <Input
                  id="numClasses"
                  type="number"
                  min={2}
                  value={numClasses}
                  onChange={(event) => setNumClasses(event.target.value)}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Flattened feature size: <span className="font-semibold text-foreground">{numFeatures || "n/a"}</span>
            </p>

            <div className="space-y-2">
              <Label>Dataset upload</Label>
              <Input
                type="file"
                accept=".zip"
                onChange={handleDatasetFileChange}
                disabled={uploadDatasetMutation.isPending}
                className="cursor-pointer border-dashed text-sm file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-primary/10 file:px-4 file:py-1 file:text-sm file:font-medium file:text-primary"
              />
              <p className="text-xs text-muted-foreground">
                Provide a .zip where each class lives in its own folder. We extract it to the Flower runtime.
              </p>
              <div className="space-y-1">
                <Label htmlFor="datasetPath">Dataset path</Label>
                <Input
                  id="datasetPath"
                  value={datasetPath}
                  placeholder="e.g. /app/flower-app/datasets/shared/tb-20240101"
                  onChange={(event) => setDatasetPath(event.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Use the uploaded path above or paste an existing directory accessible to the coordinator.
                </p>
                {datasetPath ? (
                  <div className="inline-flex items-center gap-1 text-xs text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Ready: {datasetPath}
                  </div>
                ) : null}
              </div>
              {uploadDatasetMutation.isPending ? (
                <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Uploading dataset…
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-2xl border border-primary/10 bg-primary/5 p-4 text-sm shadow-inner dark:bg-primary/20">
          <div className="space-y-1">
            <Label htmlFor="streamToggle" className="text-sm font-semibold text-foreground">
              Stream logs to dashboard
            </Label>
            <p className="text-xs text-muted-foreground">
              When enabled we keep the log stream open in the active run panel.
            </p>
          </div>
          <Switch id="streamToggle" checked={stream} onCheckedChange={setStream} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleStart}
            disabled={!canStart || isStarting || !configReady}
            className="inline-flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {isStarting ? "Starting…" : "Start run"}
          </Button>
          <Button
            variant="outline"
            onClick={onStop}
            disabled={!runActive || isStopping}
            className="inline-flex items-center gap-2"
          >
            <Square className="h-4 w-4" />
            {isStopping ? "Stopping…" : "Stop run"}
          </Button>
        </div>
      </CardContent>
    </GlassCard>
  );
}
