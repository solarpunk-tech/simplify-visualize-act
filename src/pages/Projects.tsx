import { useEffect, useMemo, useState, type MouseEvent } from "react";
import {
  ArchiveIcon,
  LightningIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  SidebarSimpleIcon,
} from "@phosphor-icons/react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";

import { PresetGallery } from "@/components/projects/PresetGallery";
import { ProjectDetail } from "@/components/projects/ProjectDetail";
import { ScopeQueue } from "@/components/projects/ScopeQueue";
import { PageContainer } from "@/components/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/sonner";
import { useWorkbenchState } from "@/hooks/use-shell-state";
import { projectPresets, projectScopes, seededProjectInstances } from "@/lib/project-presets";
import type { ProjectInstance, ProjectPreset, ProjectScopeId, ProjectStatus } from "@/lib/project-types";
import { cn, shouldIgnoreSurfaceHotkeys } from "@/lib/utils";

const defaultScopeId: ProjectScopeId = "po-queue";

function isProjectScopeId(value: string | undefined): value is ProjectScopeId {
  return Boolean(value && projectScopes.some((scope) => scope.id === value));
}

function buildProjectFromPreset(preset: ProjectPreset): ProjectInstance {
  const timestamp = Date.now();
  const primarySource = preset.sources[0] ?? "New account";
  const code = preset.name
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 6);

  return {
    id: `project-${preset.id}-${timestamp}`,
    scope: preset.scope,
    title: preset.name,
    code,
    status: "On track",
    progress: 18,
    owner: "Hemanth",
    customer: primarySource,
    dueLabel: "New",
    priority: "Medium",
    summary: preset.summary,
    detailVariant: preset.detailVariant,
    metrics: [
      { label: "Budget", value: "New", detail: "Set after first review" },
      { label: "Team", value: "1", detail: "Owner assigned" },
      { label: "Days Left", value: "TBD", detail: "Waiting on schedule" },
      { label: "Tasks", value: `${preset.journey.length}`, detail: "Seeded journey steps" },
    ],
    steps: preset.journey,
    trace: [
      { id: "trace-created", source: "Template", copy: `${preset.name} created from preset.`, timestamp: "Now" },
      { id: "trace-trigger", source: "Trigger", copy: preset.trigger, timestamp: "Next" },
    ],
    cards: [
      { title: "Human Tasks", body: preset.journey.find((step) => step.role === "human")?.label ?? "Confirm owner and first action.", owner: "Hemanth" },
      { title: "UBIK AI Analysis", body: preset.journey.find((step) => step.role === "ai")?.label ?? "Prepare context packet.", owner: "UBIK" },
      { title: "Operating Lane", body: `Seeded from ${primarySource}.`, owner: preset.scope },
    ],
    trend: [
      { label: "Now", throughput: 18, risk: 42 },
      { label: "Next", throughput: 32, risk: 38 },
      { label: "Review", throughput: 48, risk: 28 },
    ],
    tabs: {
      emails: [`${primarySource} source thread`],
      meetings: ["Kickoff checkpoint"],
      logistics: ["Operating handoff"],
      documents: ["Preset brief"],
    },
  };
}

export default function Projects() {
  const { scope: scopeParam, projectId } = useParams<{ scope?: string; projectId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [customProjects, setCustomProjects] = useWorkbenchState<ProjectInstance[]>("projects-custom-instances", []);
  const [archivedProjectIds, setArchivedProjectIds] = useWorkbenchState<string[]>("projects-archived-ids", []);
  const [statusOverrides, setStatusOverrides] = useWorkbenchState<Record<string, ProjectStatus>>("projects-status-overrides", {});
  const [scopeQueries, setScopeQueries] = useWorkbenchState<Record<string, string>>("projects-scope-queries", {});
  const [scopeSearch, setScopeSearch] = useWorkbenchState<string>("projects-scope-search", "");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  const scope = isProjectScopeId(scopeParam)
    ? projectScopes.find((item) => item.id === scopeParam)
    : null;

  const allProjects = useMemo(
    () =>
      [...seededProjectInstances, ...customProjects].map((project) => ({
        ...project,
        status: statusOverrides[project.id] ?? project.status,
      })),
    [customProjects, statusOverrides],
  );

  const activeProjects = useMemo(
    () => allProjects.filter((project) => !archivedProjectIds.includes(project.id)),
    [allProjects, archivedProjectIds],
  );

  const scopeCounts = useMemo(
    () =>
      projectScopes.reduce<Record<string, number>>((acc, item) => {
        acc[item.id] =
          item.id === "templates"
            ? projectPresets.length
            : activeProjects.filter((project) => project.scope === item.id).length;
        return acc;
      }, {}),
    [activeProjects],
  );

  const visibleScopes = useMemo(() => {
    const query = scopeSearch.trim().toLowerCase();
    if (!query) return projectScopes;
    return projectScopes.filter((item) => `${item.title} ${item.description}`.toLowerCase().includes(query));
  }, [scopeSearch]);

  const scopedProjects = useMemo(() => {
    if (!scope || scope.id === "templates") return [];
    return activeProjects.filter((project) => project.scope === scope.id);
  }, [activeProjects, scope]);

  const query = scope ? scopeQueries[scope.id] ?? "" : "";
  const filteredProjects = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return scopedProjects;
    return scopedProjects.filter((project) =>
      `${project.title} ${project.code} ${project.customer} ${project.owner} ${project.summary}`.toLowerCase().includes(normalized),
    );
  }, [query, scopedProjects]);

  const selectedProject = useMemo(
    () =>
      (projectId ? activeProjects.find((project) => project.id === projectId) : null) ??
      filteredProjects[0] ??
      scopedProjects[0] ??
      null,
    [activeProjects, filteredProjects, projectId, scopedProjects],
  );

  useEffect(() => {
    setSelectedIds([]);
    setLastSelectedId(null);
  }, [scope?.id]);

  useEffect(() => {
    if (!scope || scope.id === "templates" || !projectId) return;
    if (activeProjects.some((project) => project.id === projectId && project.scope === scope.id)) return;
    navigate(`/projects/${scope.id}${location.search}`, { replace: true });
  }, [activeProjects, location.search, navigate, projectId, scope]);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (shouldIgnoreSurfaceHotkeys(event.target)) return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

      if (event.key.toLowerCase() === "n") {
        event.preventDefault();
        navigate(`/projects/templates${location.search}`);
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [location.search, navigate]);

  if (!scope) {
    return <Navigate replace to={`/projects/${defaultScopeId}${location.search}`} />;
  }

  const updateScopeQuery = (value: string) => {
    setScopeQueries({ ...scopeQueries, [scope.id]: value });
  };

  const openProject = (nextProjectId: string) => {
    navigate(`/projects/${scope.id}/${nextProjectId}${location.search}`);
  };

  const toggleSelected = (nextProjectId: string) => {
    setSelectedIds((current) =>
      current.includes(nextProjectId)
        ? current.filter((id) => id !== nextProjectId)
        : [...current, nextProjectId],
    );
    setLastSelectedId(nextProjectId);
  };

  const selectRange = (nextProjectId: string) => {
    if (!lastSelectedId) {
      setSelectedIds([nextProjectId]);
      setLastSelectedId(nextProjectId);
      return;
    }

    const start = filteredProjects.findIndex((project) => project.id === lastSelectedId);
    const end = filteredProjects.findIndex((project) => project.id === nextProjectId);
    if (start === -1 || end === -1) {
      setSelectedIds([nextProjectId]);
      setLastSelectedId(nextProjectId);
      return;
    }

    const [from, to] = start < end ? [start, end] : [end, start];
    setSelectedIds(filteredProjects.slice(from, to + 1).map((project) => project.id));
    setLastSelectedId(nextProjectId);
  };

  const handleProjectClick = (nextProjectId: string, event: MouseEvent<HTMLButtonElement>) => {
    if (event.shiftKey) {
      selectRange(nextProjectId);
      return;
    }

    if (event.metaKey || event.ctrlKey) {
      toggleSelected(nextProjectId);
      return;
    }

    openProject(nextProjectId);
    setLastSelectedId(nextProjectId);
  };

  const archiveProjects = (ids: string[]) => {
    setArchivedProjectIds([...new Set([...archivedProjectIds, ...ids])]);
    setSelectedIds([]);
    toast("Projects archived", {
      description: `${ids.length} project${ids.length === 1 ? "" : "s"} removed from this queue.`,
    });
  };

  const handleRowAction = (action: string, targetProjectId: string) => {
    if (action === "Archive") {
      archiveProjects([targetProjectId]);
      return;
    }
    if (action === "Pause") {
      setStatusOverrides({ ...statusOverrides, [targetProjectId]: "Paused" });
    }
    if (action === "Run") {
      setStatusOverrides({ ...statusOverrides, [targetProjectId]: "On track" });
    }
    if (action === "Tag") {
      toggleSelected(targetProjectId);
      return;
    }
    toast(`${action} queued`, {
      description: activeProjects.find((project) => project.id === targetProjectId)?.title ?? "Project",
    });
  };

  const handleBulkAction = (action: string) => {
    if (!selectedIds.length) return;
    if (action === "Archive") {
      archiveProjects(selectedIds);
      return;
    }
    if (action === "Pause") {
      setStatusOverrides({
        ...statusOverrides,
        ...Object.fromEntries(selectedIds.map((id) => [id, "Paused" as ProjectStatus])),
      });
    }
    if (action === "Run") {
      setStatusOverrides({
        ...statusOverrides,
        ...Object.fromEntries(selectedIds.map((id) => [id, "On track" as ProjectStatus])),
      });
    }
    toast(`${action} queued`, {
      description: `${selectedIds.length} selected project${selectedIds.length === 1 ? "" : "s"}.`,
    });
  };

  const createFromPreset = (preset: ProjectPreset) => {
    const project = buildProjectFromPreset(preset);
    setCustomProjects([project, ...customProjects]);
    toast("Project created", {
      description: `${project.title} is ready in ${projectScopes.find((item) => item.id === project.scope)?.title ?? "Projects"}.`,
    });
    navigate(`/projects/${project.scope}/${project.id}${location.search}`);
  };

  const commandRail = (
    <div className="flex w-full items-center gap-1 overflow-x-auto border border-border/70 bg-muted/30 px-1.5 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex shrink-0 items-center gap-1">
        <button
          aria-label="Projects scope rail"
          className="inline-flex size-7 shrink-0 items-center justify-center border border-transparent text-foreground/75"
          type="button"
        >
          <SidebarSimpleIcon className="size-4" />
        </button>
        <button
          className="inline-flex h-7 shrink-0 items-center gap-1 border border-transparent px-1.5 text-[11px] font-medium text-foreground/80 transition-colors hover:bg-background hover:text-foreground"
          onClick={() => navigate(`/projects/templates${location.search}`)}
          type="button"
        >
          <PlusIcon className="size-4" />
          <span>New from preset</span>
          <span className="inline-flex min-w-[1.3rem] items-center justify-center border border-border/70 bg-background px-1 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">N</span>
        </button>
      </div>
      <span className="h-4 w-px shrink-0 bg-border/80" aria-hidden="true" />
      <div className="flex min-w-0 flex-1 items-center justify-center gap-2 px-2">
        <span className="truncate text-xs text-muted-foreground">{scope.title}</span>
        <Badge variant="outline" className="bg-background font-mono text-[10px]">{scopeCounts[scope.id] ?? 0}</Badge>
      </div>
      <span className="h-4 w-px shrink-0 bg-border/80" aria-hidden="true" />
      <div className="flex shrink-0 items-center gap-1">
        <button
          className="inline-flex h-7 shrink-0 items-center gap-1 border border-transparent px-1.5 text-[11px] font-medium text-foreground/80 transition-colors hover:bg-background hover:text-foreground"
          onClick={() => selectedProject && handleRowAction("Run", selectedProject.id)}
          type="button"
        >
          <LightningIcon className="size-4" />
          <span>Run</span>
        </button>
        <button
          className="inline-flex h-7 shrink-0 items-center gap-1 border border-transparent px-1.5 text-[11px] font-medium text-foreground/80 transition-colors hover:bg-background hover:text-foreground"
          onClick={() => selectedProject && handleRowAction("Archive", selectedProject.id)}
          type="button"
        >
          <ArchiveIcon className="size-4" />
          <span>Archive</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-3.5rem)] min-h-0 overflow-hidden px-3 py-4 lg:px-6 lg:py-5">
      <PageContainer className="h-full min-h-0">
        <div className="flex h-full min-h-0 flex-col gap-4">
          <div className="shrink-0">{commandRail}</div>
          <div
            className={cn(
              "grid min-h-0 flex-1 gap-4",
              scope.id === "templates"
                ? "xl:grid-cols-[260px_minmax(0,1fr)]"
                : "xl:grid-cols-[260px_360px_minmax(0,1fr)]",
            )}
          >
            <aside className="flex min-h-0 flex-col overflow-hidden border border-border/70 bg-card shadow-sm">
              <div className="border-b border-border/60 px-4 py-4">
                <InputGroup className="h-10 bg-background">
                  <InputGroupAddon>
                    <InputGroupText>
                      <MagnifyingGlassIcon />
                    </InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    aria-label="Search project scopes"
                    onChange={(event) => setScopeSearch(event.target.value)}
                    placeholder="Search project scopes..."
                    value={scopeSearch}
                  />
                </InputGroup>
              </div>
              <ScrollArea className="min-h-0 flex-1">
                <div className="space-y-2 px-3 py-3">
                  <div className="flex items-center justify-between px-1">
                    <p className="section-label">Project scopes</p>
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-foreground/48">{visibleScopes.length}</span>
                  </div>
                  {visibleScopes.map((item) => {
                    const active = item.id === scope.id;
                    return (
                      <button
                        key={item.id}
                        className={cn(
                          "flex w-full items-start justify-between gap-3 border bg-background px-3 py-3 text-left transition-colors",
                          active
                            ? "border-primary/35 shadow-sm ring-1 ring-primary/15"
                            : "border-border/70 hover:border-border",
                        )}
                        onClick={() => navigate(`/projects/${item.id}${location.search}`)}
                        type="button"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-foreground">{item.title}</span>
                          <span className="mt-1 block line-clamp-2 text-xs leading-5 text-muted-foreground">{item.sidebarHint}</span>
                        </span>
                        <span
                          className={cn(
                            "border bg-background px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em]",
                            active ? "border-primary/30 bg-primary/5 text-primary" : "border-border text-foreground/60",
                          )}
                        >
                          {scopeCounts[item.id] ?? 0}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </aside>

            {scope.id === "templates" ? (
              <div className="min-h-0">
                <PresetGallery presets={projectPresets} scopes={projectScopes} onCreate={createFromPreset} />
              </div>
            ) : (
              <>
                <ScopeQueue
                  scope={scope}
                  projects={filteredProjects}
                  selectedProjectId={selectedProject?.id}
                  selectedIds={selectedIds}
                  query={query}
                  onQueryChange={updateScopeQuery}
                  onOpenProject={openProject}
                  onProjectClick={handleProjectClick}
                  onToggleSelected={toggleSelected}
                  onRowAction={handleRowAction}
                  onBulkAction={handleBulkAction}
                />
                {selectedProject ? (
                  <ProjectDetail
                    project={selectedProject}
                    onBack={projectId ? () => navigate(`/projects/${scope.id}${location.search}`) : undefined}
                  />
                ) : (
                  <section className="flex min-h-0 items-center justify-center border border-dashed border-border/70 bg-card px-6 py-8 text-center text-sm text-muted-foreground">
                    Select a scope or create a project from a preset.
                  </section>
                )}
              </>
            )}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
