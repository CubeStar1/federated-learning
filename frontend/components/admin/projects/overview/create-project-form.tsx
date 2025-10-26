"use client";

import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createProject } from "@/lib/fetchers/projects";
import type { CreateProjectPayload, Project } from "@/lib/fetchers/types";

const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Project name is required")
    .max(120, "Project name must be 120 characters or fewer"),
  slug: z
    .string()
    .trim()
    .max(80, "Slug must be 80 characters or fewer")
    .optional(),
  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or fewer")
    .optional(),
  coordinator_display_name: z
    .string()
    .trim()
    .max(120, "Display name must be 120 characters or fewer")
    .optional(),
  coordinator_external_id: z
    .string()
    .trim()
    .max(120, "External ID must be 120 characters or fewer")
    .optional(),
});

export type CreateProjectFormValues = z.infer<typeof createProjectSchema>;

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

interface CreateProjectFormProps {
  onSuccess?: (project: Project) => void;
}

export default function CreateProjectForm({ onSuccess }: CreateProjectFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      coordinator_display_name: "",
      coordinator_external_id: "",
    },
  });

  const watchedName = form.watch("name");
  const watchedSlug = form.watch("slug");

  const derivedSlug = useMemo(() => toSlug(watchedName ?? ""), [watchedName]);
  const showSlugHint = !watchedSlug?.length && derivedSlug.length > 0;

  const createProjectMutation = useMutation({
    mutationFn: (payload: CreateProjectPayload) => createProject(payload),
    onSuccess: async ({ project }) => {
      toast.success(`Registered ${project.name}`);
      form.reset({
        name: "",
        slug: "",
        description: "",
        coordinator_display_name: "",
        coordinator_external_id: "",
      });
      await queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
      onSuccess?.(project);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to register project";
      toast.error(message);
    },
  });

  const isSubmitting = createProjectMutation.isPending;

  const onSubmit = (values: CreateProjectFormValues) => {
    const payload: CreateProjectPayload = {
      name: values.name.trim(),
    };

    const slug = values.slug?.trim();
    if (slug) {
      payload.slug = slug;
    }

    const description = values.description?.trim();
    if (description) {
      payload.description = description;
    }

    const coordinatorDisplayName = values.coordinator_display_name?.trim();
    if (coordinatorDisplayName) {
      payload.coordinator_display_name = coordinatorDisplayName;
    }

    const coordinatorExternalId = values.coordinator_external_id?.trim();
    if (coordinatorExternalId) {
      payload.coordinator_external_id = coordinatorExternalId;
    }

    createProjectMutation.mutate(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project name</FormLabel>
              <FormControl>
                <Input
                  placeholder="St. Benedict radiology federation"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Use a name that clinicians will recognize when coordinating runs.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug (optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="st-benedict-radiology"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {showSlugHint
                  ? `Suggested slug: ${derivedSlug}`
                  : "If left blank we will generate one for you."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Briefly describe the study protocol or participating hospitals."
                  rows={4}
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            control={form.control}
            name="coordinator_display_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Coordinator display name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Metro Health Coordinator"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Defaults to your project name with a coordinator suffix.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="coordinator_external_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Coordinator external ID</FormLabel>
                <FormControl>
                  <Input
                    placeholder="metro-health-coordinator"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Used by the supervisor service to reference this node.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Registering…" : "Register coordinator"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => form.reset()}
            disabled={isSubmitting}
          >
            Reset form
          </Button>
        </div>
      </form>
    </Form>
  );
}
