import { CheckIcon } from "@phosphor-icons/react";

import type { ProjectJourneyStep } from "@/lib/project-types";
import { cn } from "@/lib/utils";

export function ProjectStepper({ steps }: { steps: ProjectJourneyStep[] }) {
  return (
    <div className="border border-border/70 bg-background px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        {steps.map((step, index) => {
          const isDone = step.status === "done";
          const isCurrent = step.status === "current";
          return (
            <div key={step.id} className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex min-w-0 flex-1 flex-col items-center text-center">
                <span
                  className={cn(
                    "flex size-8 items-center justify-center border text-xs font-semibold",
                    isDone && "border-primary bg-primary text-primary-foreground",
                    isCurrent && "border-primary bg-background text-primary ring-2 ring-primary/15",
                    !isDone && !isCurrent && "border-border bg-background text-muted-foreground",
                  )}
                >
                  {isDone ? <CheckIcon className="size-4" /> : index + 1}
                </span>
                <p className="mt-2 w-full truncate text-xs font-medium text-foreground">{step.label}</p>
                <p className="mt-1 w-full truncate text-[11px] text-muted-foreground">{step.owner ?? step.role}</p>
                {isCurrent ? <span className="mt-2 size-2 bg-primary" aria-label="Current stage" /> : null}
              </div>
              {index < steps.length - 1 ? (
                <span className={cn("hidden h-px flex-1 bg-border md:block", isDone && "bg-primary/45")} aria-hidden="true" />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
