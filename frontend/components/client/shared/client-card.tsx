import type { ComponentProps } from "react";

import { GlassCard } from "@/components/admin/projects/shared/glass-card";

export type ClientCardProps = ComponentProps<typeof GlassCard>;

export function ClientCard(props: ClientCardProps) {
  return <GlassCard {...props} />;
}
