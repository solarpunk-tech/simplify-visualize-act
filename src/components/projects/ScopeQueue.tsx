import { ArchiveIcon, LightningIcon, MagnifyingGlassIcon, PauseIcon, TagIcon, UserPlusIcon } from "@phosphor-icons/react";
import type { MouseEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import type { ProjectInstance, ProjectScope } from "@/lib/project-types";
import { cn } from "@/lib/utils";

const bulkActions = ["Assign", "Delegate", "Archive", "Pause", "Run", "Tag", "Reassign"] as const;

type BulkAction = (typeof bulkActions)[number];

export function ScopeQueue({
  scope,
  projects,
  selectedProjectId,
  selectedIds,
  query,
  onQueryChange,
  onOpenProject,
  onProjectClick,
  onToggleSelected,
  onRowAction,
  onBulkAction,
}: {
  scope: ProjectScope;
  projects: ProjectInstance[];
  selectedProjectId?: string;
  selectedIds: string[];
  query: string;
  onQueryChange: (value: string) => void;
  onOpenProject: (projectId: string) => void;
  onProjectClick: (projectId: string, event: MouseEvent<HTMLButtonElement>) => void;
  onToggleSelected: (projectId: string) => void;
  onRowAction: (action: BulkAction, projectId: string) => void;
  onBulkAction: (action: BulkAction) => void;
}) {
  return (
    <section className="relative flex min-h-0 flex-col overflow-hidden border border-border/70 bg-card shadow-sm">
      <div className="border-b border-border/60 px-4 py-4">
        <p className="section-label">{scope.railLabel}</p>
        <h2 className="mt-2 text-lg font-semibold tracking-tight text-foreground">{scope.title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{scope.description}</p>
        <InputGroup className="mt-4 h-10 bg-background">
          <InputGroupAddon>
            <InputGroupText>
              <MagnifyingGlassIcon />
            </InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            aria-label={`Filter ${scope.title}`}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Filter projects..."
            value={query}
          />
        </InputGroup>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <div className="space-y-2 px-3 py-3">
          {projects.length ? (
            projects.map((project) => {
              const selected = selectedIds.includes(project.id);
              const active = selectedProjectId === project.id;
              return (
                <div
                  key={project.id}
                  className={cn(
                    "group border bg-background transition-colors",
                    active ? "border-primary/35 ring-1 ring-primary/15" : "border-border/70 hover:border-border",
                    selected && "bg-primary/5",
                  )}
                >
                  <div className="flex items-start gap-3 px-3 py-3">
                    <Checkbox
                      aria-label={`Select ${project.title}`}
                      checked={selected}
                      className="mt-1"
                      onCheckedChange={() => onToggleSelected(project.id)}
                    />
                    <button
                      className="min-w-0 flex-1 text-left"
                      onClick={(event) => onProjectClick(project.id, event)}
                      onDoubleClick={() => onOpenProject(project.id)}
                      type="button"
                    >
                      <div className="flex min-w-0 items-center justify-between gap-3">
                        <p className="truncate text-sm font-medium text-foreground">{project.title}</p>
                        <Badge variant="outline" className="shrink-0 bg-background px-2 py-0.5 text-[11px]">
                          {project.status}
                        </Badge>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{project.summary}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{project.code}</span>
                        <span aria-hidden="true">/</span>
                        <span>{project.owner}</span>
                        <span aria-hidden="true">/</span>
                        <span>{project.dueLabel}</span>
                      </div>
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-2 border-t border-border/50 px-3 py-2">
                    <button className="text-xs text-primary hover:underline" onClick={() => onOpenProject(project.id)} type="button">
                      Open dashboard
                    </button>
                    <div className="flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                      <Button aria-label={`Run ${project.title}`} size="icon-sm" variant="ghost" onClick={() => onRowAction("Run", project.id)} type="button">
                        <LightningIcon />
                      </Button>
                      <Button aria-label={`Pause ${project.title}`} size="icon-sm" variant="ghost" onClick={() => onRowAction("Pause", project.id)} type="button">
                        <PauseIcon />
                      </Button>
                      <Button aria-label={`Archive ${project.title}`} size="icon-sm" variant="ghost" onClick={() => onRowAction("Archive", project.id)} type="button">
                        <ArchiveIcon />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="border border-dashed border-border/70 px-4 py-6 text-sm text-muted-foreground">
              No projects match this scope yet.
            </div>
          )}
        </div>
      </div>

      {selectedIds.length ? (
        <div className="absolute inset-x-3 bottom-3 border border-border/70 bg-background px-3 py-3 shadow-lg">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-auto text-xs font-medium text-foreground">{selectedIds.length} selected</span>
            {bulkActions.map((action) => (
              <Button key={action} size="sm" variant={action === "Archive" ? "default" : "outline"} onClick={() => onBulkAction(action)} type="button">
                {action === "Assign" ? <UserPlusIcon data-icon="inline-start" /> : null}
                {action === "Tag" ? <TagIcon data-icon="inline-start" /> : null}
                {action}
              </Button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
