import { PlusIcon } from "@phosphor-icons/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProjectPreset, ProjectScope } from "@/lib/project-types";

export function PresetGallery({
  presets,
  scopes,
  onCreate,
}: {
  presets: ProjectPreset[];
  scopes: ProjectScope[];
  onCreate: (preset: ProjectPreset) => void;
}) {
  return (
    <section className="flex min-h-0 flex-col overflow-hidden border border-border/70 bg-card shadow-sm">
      <div className="border-b border-border/60 px-5 py-4">
        <p className="section-label">Preset library</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">Start from a simple project journey</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
          Each preset creates a small local project with one or two steps, enough to prove the journey without a workflow-builder.
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-5">
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {presets.map((preset) => {
            const scope = scopes.find((item) => item.id === preset.scope);
            return (
              <article key={preset.id} className="flex min-h-[220px] flex-col border border-border/70 bg-background px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="section-label">{scope?.title ?? preset.scope}</p>
                    <h3 className="mt-2 text-base font-semibold tracking-tight text-foreground">{preset.name}</h3>
                  </div>
                  <Badge variant="outline" className="bg-background text-[11px]">
                    {preset.detailVariant}
                  </Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{preset.summary}</p>
                <div className="mt-4 space-y-2">
                  {preset.journey.map((step) => (
                    <div key={step.id} className="flex items-center justify-between gap-3 border border-border/60 px-3 py-2">
                      <p className="truncate text-sm text-foreground">{step.label}</p>
                      <span className="shrink-0 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{step.role}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-auto pt-4">
                  <Button className="w-full" onClick={() => onCreate(preset)} type="button">
                    <PlusIcon data-icon="inline-start" /> New from preset
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
