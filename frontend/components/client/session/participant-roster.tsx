import { Users } from "lucide-react";

import { ClientCard } from "@/components/client/shared/client-card";
import { Badge } from "@/components/ui/badge";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Node } from "@/lib/fetchers/types";

interface ParticipantRosterProps {
  participants: Node[];
}

export default function ParticipantRoster({ participants }: ParticipantRosterProps) {
  const hasParticipants = participants.length > 0;

  return (
    <ClientCard accent="emerald" className="h-full">
      <CardHeader className="space-y-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
          <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
          Participant roster
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Nodes taking part in this federation from your organization.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        {hasParticipants ? (
          participants.map((participant) => {
            const displayName = participant.display_name ?? participant.external_id;

            return (
              <div
                key={participant.id}
                className="rounded-2xl border border-emerald-100/70 bg-emerald-50/50 px-4 py-3 text-sm text-foreground shadow-sm transition hover:border-emerald-200 dark:border-emerald-500/20 dark:bg-emerald-500/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{displayName}</p>
                    <p className="text-xs text-muted-foreground" title={participant.external_id}>
                      External ID: {participant.external_id}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="rounded-full border-emerald-300 bg-white/70 text-[11px] uppercase tracking-wide text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-100"
                  >
                    {participant.role}
                  </Badge>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 px-4 py-8 text-center text-sm text-muted-foreground dark:border-emerald-500/30 dark:bg-emerald-500/5">
            No participant nodes registered yet.
          </div>
        )}
      </CardContent>
    </ClientCard>
  );
}
