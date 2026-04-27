import { CheckCircleIcon, WarningCircleIcon } from "@phosphor-icons/react";

import type { ProjectInstance } from "@/lib/project-types";
import { cn } from "@/lib/utils";

export function DocQueueDetail({ project }: { project: ProjectInstance }) {
  return (
    <div className="space-y-4">
      <section className="grid gap-3 md:grid-cols-5">
        {project.steps.slice(0, 5).map((step) => (
          <div
            key={step.id}
            className={cn(
              "border px-3 py-3 text-center",
              step.status === "done" && "border-primary/25 bg-primary/5",
              step.status === "current" && "border-support/40 bg-support/10",
              step.status === "next" && "border-border/70 bg-background",
            )}
          >
            <div className="mx-auto flex size-8 items-center justify-center border border-border/70 bg-background">
              {step.status === "current" ? <WarningCircleIcon className="size-4 text-support-foreground" /> : <CheckCircleIcon className="size-4 text-primary" />}
            </div>
            <p className="mt-2 text-xs font-medium text-foreground">{step.label}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{step.owner ?? step.role}</p>
          </div>
        ))}
      </section>
      <section className="grid gap-3 lg:grid-cols-3">
        {project.cards.map((card) => (
          <div key={card.title} className="border border-border/70 bg-background px-4 py-4">
            <p className="section-label">{card.title}</p>
            <p className="mt-3 text-sm leading-6 text-foreground">{card.body}</p>
            <p className="mt-4 text-xs text-muted-foreground">{card.owner}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
