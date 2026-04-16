import { Bot, CirclePause, ShieldCheck, Sparkles } from "lucide-react";

import { SectionHeading, StatusPill, Surface } from "@/components/ubik-primitives";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { agents } from "@/lib/ubik-data";

export default function Agents() {
  return (
    <div className="px-4 py-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <SectionHeading
          eyebrow="Specialists"
          title="Agents are specialist operators, not the primary product frame."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {agents.map((agent) => (
            <Surface key={agent.id} className="gap-0 overflow-hidden">
              <CardHeader className="border-b border-border/70">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="section-label">{agent.lastRun}</p>
                    <CardTitle className="mt-2 text-lg font-semibold tracking-tight">{agent.name}</CardTitle>
                  </div>
                  <StatusPill tone={agent.status === "Healthy" ? "success" : agent.status === "Paused" ? "muted" : "alert"}>
                    {agent.status}
                  </StatusPill>
                </div>
              </CardHeader>
              <CardContent className="py-4">
                <p className="text-sm leading-6 text-muted-foreground">{agent.summary}</p>
                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Linked workflow: {agent.linkedWorkflow}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {agent.status === "Paused" ? <CirclePause className="h-4 w-4 text-muted-foreground" /> : <ShieldCheck className="h-4 w-4 text-primary" />}
                    Approval mode remains inspectable from the linked run surface.
                  </div>
                </div>
              </CardContent>
            </Surface>
          ))}
        </div>

        <Surface className="gap-0 overflow-hidden">
          <CardHeader className="border-b border-border/70">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              <p className="section-label">Monitoring notes</p>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 py-4 md:grid-cols-3">
            <div className="surface-well rounded-xl p-4 text-sm leading-6 text-foreground">
              Agents stay secondary to business outcomes and never replace the main operator shell.
            </div>
            <div className="surface-well rounded-xl p-4 text-sm leading-6 text-foreground">
              Health, last run, linked workflow, and approval mode are the primary scan points.
            </div>
            <div className="surface-well rounded-xl p-4 text-sm leading-6 text-foreground">
              Execution detail belongs in workflow traces and approval surfaces, not decorative canvases.
            </div>
          </CardContent>
        </Surface>
      </div>
    </div>
  );
}
