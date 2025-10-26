"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { Cpu, ShieldAlert } from "lucide-react";

import { ClientCard } from "@/components/client/shared/client-card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { SupernodeStartPayload } from "@/lib/fetchers/types";

interface SupernodeControlsProps {
  supernodeRunning: boolean;
  isStarting: boolean;
  isStopping: boolean;
  onStart: (payload: SupernodeStartPayload) => void;
  onStop: () => void;
  projectId?: string | null;
  nodeId?: string | null;
  userId?: string | null;
}

type SupernodeFormValues = {
  superlink_address: string;
  partition_id: number;
  num_partitions: number;
  clientappio_api_address: string;
  insecure: boolean;
  certificates_path: string;
  extra_args: string;
};

const parseArgs = (value: string): string[] | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed
    .split(/\r?\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean);
};

export default function SupernodeControls({
  supernodeRunning,
  isStarting,
  isStopping,
  onStart,
  onStop,
  projectId,
  nodeId,
  userId,
}: SupernodeControlsProps) {
  const form = useForm<SupernodeFormValues>({
    defaultValues: {
      superlink_address: "",
      partition_id: 0,
      num_partitions: 1,
      clientappio_api_address: "0.0.0.0:9094",
      insecure: true,
      certificates_path: "",
      extra_args: "",
    },
  });

  const disabled = useMemo(() => supernodeRunning || isStarting, [isStarting, supernodeRunning]);

  const handleSubmit = (values: SupernodeFormValues) => {
    onStart({
      project_id: projectId ?? undefined,
      node_id: nodeId ?? undefined,
      user_id: userId ?? undefined,
      superlink_address: values.superlink_address.trim(),
      partition_id: Number(values.partition_id),
      num_partitions: Number(values.num_partitions),
      clientappio_api_address: values.clientappio_api_address.trim() || undefined,
      insecure: values.insecure,
      certificates_path: values.certificates_path.trim() || undefined,
      extra_args: parseArgs(values.extra_args),
    });
  };

  return (
    <ClientCard accent="emerald" className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-100">
            <Cpu className="h-3.5 w-3.5" />
            Participant node
          </div>
          <p className="text-sm text-muted-foreground">
            Configure the SuperNode process before opening a secure tunnel to the SuperLink coordinator.
          </p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
            supernodeRunning
              ? "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-100"
              : isStarting
              ? "bg-sky-500/15 text-sky-700 dark:bg-sky-500/20 dark:text-sky-100"
              : isStopping
              ? "bg-rose-500/15 text-rose-700 dark:bg-rose-500/20 dark:text-rose-100"
              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200",
          )}
        >
          <ShieldAlert className="h-3.5 w-3.5" />
          {isStarting ? "Starting…" : isStopping ? "Stopping…" : supernodeRunning ? "Running" : "Awaiting start"}
        </span>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="mt-6 space-y-5 text-sm">
          <div className="grid gap-4 lg:grid-cols-2">
            <FormField
              control={form.control}
              name="superlink_address"
              rules={{ required: "Provide the SuperLink address" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SuperLink address</FormLabel>
                  <FormControl>
                    <Input placeholder="127.0.0.1:9091" {...field} disabled={disabled} />
                  </FormControl>
                  <FormDescription>Host and port for the coordinator the node should reach.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clientappio_api_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client API address</FormLabel>
                  <FormControl>
                    <Input placeholder="0.0.0.0:9094" {...field} disabled={disabled} />
                  </FormControl>
                  <FormDescription>Override only if the exposed interface changes.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <FormField
              control={form.control}
              name="partition_id"
              rules={{
                required: "Required",
                validate: (value) => value >= 0 || "Partition ID must be zero or greater",
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Partition ID</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(event) => {
                        const next = event.target.valueAsNumber;
                        field.onChange(Number.isNaN(next) ? NaN : next);
                      }}
                      disabled={disabled}
                    />
                  </FormControl>
                  <FormDescription>Unique dataset slice assigned to this site.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="num_partitions"
              rules={{
                required: "Required",
                validate: (value) => value > 0 || "Provide the total number of partitions",
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of partitions</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(event) => {
                        const next = event.target.valueAsNumber;
                        field.onChange(Number.isNaN(next) ? NaN : next);
                      }}
                      disabled={disabled}
                    />
                  </FormControl>
                  <FormDescription>Total sites taking part in this federation.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <FormField
              control={form.control}
              name="insecure"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/90 p-4 dark:border-slate-200/40 dark:bg-slate-200/20">
                  <div className="space-y-1">
                    <FormLabel>Allow insecure transport</FormLabel>
                    <FormDescription>Keep enabled for local networks without TLS.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} disabled={disabled} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="certificates_path"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certificates path</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="/path/to/root.crt"
                      {...field}
                      disabled={disabled || form.watch("insecure")}
                    />
                  </FormControl>
                  <FormDescription>Provide a PEM bundle when TLS is required.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="extra_args"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Extra CLI arguments</FormLabel>
                <FormControl>
                  <Textarea placeholder="--arg value\n--another" {...field} disabled={disabled} className="min-h-[120px]" />
                </FormControl>
                <FormDescription>One argument per line; omit to use defaults.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-wrap gap-2">
            <Button type="submit" className="flex-1" disabled={disabled}>
              {isStarting ? "Starting…" : "Start SuperNode"}
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="flex-1"
              disabled={!supernodeRunning || isStopping}
              onClick={onStop}
            >
              {isStopping ? "Stopping…" : "Stop"}
            </Button>
          </div>
        </form>
      </Form>
    </ClientCard>
  );
}
