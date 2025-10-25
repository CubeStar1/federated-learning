"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ProjectsEmptyProps {
  message?: string;
}

export default function ProjectsEmpty({ message }: ProjectsEmptyProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-10 text-center">
        <div className="space-y-1">
          <p className="text-lg font-semibold">No projects found</p>
          <p className="text-sm text-muted-foreground">
            {message ?? "Create a project in Supabase or via the CLI to see it listed here."}
          </p>
        </div>
        <Button asChild variant="secondary" size="sm">
          <Link href="/admin">Back to control center</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
