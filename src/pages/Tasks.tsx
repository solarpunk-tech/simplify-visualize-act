import { useEffect, useMemo, useState } from "react";
import {
  CalendarBlankIcon,
  ChecksIcon,
  FunnelSimpleIcon,
  LinkSimpleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  SparkleIcon,
} from "@phosphor-icons/react";
import { format } from "date-fns";
import { useSearchParams } from "react-router-dom";

import { PageContainer } from "@/components/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useWorkbenchState } from "@/hooks/use-shell-state";
import { contactCards, projects, unifiedTasks } from "@/lib/ubik-data";
import type { UnifiedTask, UnifiedTaskPriority } from "@/lib/ubik-types";
import { cn } from "@/lib/utils";

type TaskFilterState = {
  status: "open" | "done" | "all";
  scope: "all" | "today" | "no_deadline";
  priority: "all" | UnifiedTaskPriority;
  scheduled: "all" | "scheduled" | "unscheduled";
};

type ScheduledTaskDraft = {
  title: string;
  cadence: "daily" | "weekly" | "monthly";
  date: string;
  time: string;
  mode: "listening" | "plan" | "research" | "model_council";
};

type TaskOverride = {
  done?: boolean;
  priority?: UnifiedTaskPriority;
  project?: string;
  assignee?: string;
  assignNote?: string;
  includeOriginLink?: boolean;
  scheduled?: ScheduledTaskDraft | null;
};

const defaultFilters: TaskFilterState = {
  status: "open",
  scope: "all",
  priority: "all",
  scheduled: "all",
};

const defaultSchedule: ScheduledTaskDraft = {
  title: "Background follow-through",
  cadence: "weekly",
  date: new Date().toISOString(),
  time: "09:00",
  mode: "plan",
};

function getPriorityTone(priority: UnifiedTaskPriority) {
  if (priority === "Urgent") return "bg-primary" as const;
  if (priority === "High") return "bg-primary/70" as const;
  if (priority === "Medium") return "bg-foreground/35" as const;
  return "bg-border" as const;
}

function getSourceBadge(task: UnifiedTask) {
  if (task.source === "meetings") return "Meeting";
  if (task.source === "approvals") return "Approval";
  if (task.source === "workflows") return "Workflow";
  if (task.source === "workspace") return "Operator";
  return "Inbox";
}

function buildCreatedTask(id: number, title: string): UnifiedTask {
  return {
    id: `task-local-${id}`,
    title,
    summary: "Created from the task surface for operator follow-through.",
    project: "General",
    owner: "Hemanth",
    priority: "Medium",
    source: "workspace",
    sourceLabel: "Operator capture",
    href: `/tasks?task=task-local-${id}`,
    originHref: "/tasks",
    section: "Today",
    dueLabel: "Today",
    category: "Quick capture",
  };
}

function formatSchedule(schedule: ScheduledTaskDraft | null | undefined) {
  if (!schedule) return null;
  const dateLabel = format(new Date(schedule.date), "dd MMM");
  return `${schedule.cadence} · ${dateLabel} · ${schedule.time}`;
}

export default function Tasks() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedFromQuery = searchParams.get("task");
  const [search, setSearch] = useWorkbenchState("tasks-search", "");
  const [quickCreate, setQuickCreate] = useWorkbenchState("tasks-quick-create", "");
  const [filters, setFilters] = useWorkbenchState<TaskFilterState>("tasks-filters", defaultFilters);
  const [overrides, setOverrides] = useWorkbenchState<Record<string, TaskOverride>>("tasks-overrides", {});
  const [createdTasks, setCreatedTasks] = useWorkbenchState<UnifiedTask[]>("tasks-created", []);
  const [activeTaskId, setActiveTaskId] = useWorkbenchState<string | null>("tasks-active", selectedFromQuery);
  const [assigningTaskId, setAssigningTaskId] = useState<string | null>(null);
  const [assignDraft, setAssignDraft] = useState({ assignee: "Hemanth", note: "", includeOriginLink: true });
  const [scheduleDrafts, setScheduleDrafts] = useState<Record<string, ScheduledTaskDraft>>({});

  useEffect(() => {
    if (selectedFromQuery) {
      setActiveTaskId(selectedFromQuery);
    }
  }, [selectedFromQuery, setActiveTaskId]);

  const allTasks = useMemo(() => [...createdTasks, ...unifiedTasks], [createdTasks]);

  const enrichedTasks = useMemo(
    () =>
      allTasks.map((task) => {
        const override = overrides[task.id] ?? {};
        const priority = override.priority ?? task.priority;
        const project = override.project ?? task.project;
        const scheduled = override.scheduled ?? null;

        return {
          ...task,
          priority,
          project,
          done: override.done ?? false,
          assignee: override.assignee ?? task.owner,
          assignNote: override.assignNote ?? "",
          includeOriginLink: override.includeOriginLink ?? false,
          scheduled,
        };
      }),
    [allTasks, overrides],
  );

  const filteredTasks = useMemo(
    () =>
      enrichedTasks.filter((task) => {
        const matchesSearch =
          !search.trim() ||
          [task.title, task.summary, task.project, task.assignee]
            .join(" ")
            .toLowerCase()
            .includes(search.trim().toLowerCase());

        const matchesStatus =
          filters.status === "all" ||
          (filters.status === "done" ? task.done : !task.done);

        const matchesScope =
          filters.scope === "all" ||
          (filters.scope === "today" ? task.section === "Today" : task.section === "No deadline");

        const matchesPriority = filters.priority === "all" || task.priority === filters.priority;

        const matchesScheduled =
          filters.scheduled === "all" ||
          (filters.scheduled === "scheduled" ? Boolean(task.scheduled) : !task.scheduled);

        return matchesSearch && matchesStatus && matchesScope && matchesPriority && matchesScheduled;
      }),
    [enrichedTasks, filters, search],
  );

  const groupedTasks = useMemo(
    () => ({
      Today: filteredTasks.filter((task) => task.section === "Today"),
      "No deadline": filteredTasks.filter((task) => task.section === "No deadline"),
    }),
    [filteredTasks],
  );

  const openTask = (taskId: string) => {
    setActiveTaskId(taskId);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("task", taskId);
      return next;
    });
  };

  const updateTaskOverride = (taskId: string, next: Partial<TaskOverride>) => {
    setOverrides({
      ...overrides,
      [taskId]: {
        ...(overrides[taskId] ?? {}),
        ...next,
      },
    });
  };

  const submitQuickCreate = () => {
    const title = quickCreate.trim();
    if (!title) return;

    const created = buildCreatedTask(Date.now(), title);
    setCreatedTasks([created, ...createdTasks]);
    setQuickCreate("");
    openTask(created.id);
  };

  return (
    <div className="px-4 py-6 lg:px-8">
      <PageContainer className="space-y-5">
        <Card size="sm" className="surface-card">
          <CardHeader className="border-b border-border/60 pb-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="section-label">Task workspace</p>
                <CardTitle className="mt-1 text-2xl">AI-routed tasks across UBIK</CardTitle>
                <CardDescription className="mt-2 max-w-2xl text-sm leading-6">
                  Follow-through from meetings, inbox, approvals, and workflows lands here before it turns into handoff, scheduling, or assignment.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="px-2.5 py-1">
                  {filteredTasks.length} active
                </Badge>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" type="button">
                      <FunnelSimpleIcon data-icon="inline-start" />
                      Filter
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-[20rem] gap-4 p-4">
                    <PopoverHeader>
                      <PopoverTitle>Filter tasks</PopoverTitle>
                      <PopoverDescription>Focus the queue by status, scope, and scheduling.</PopoverDescription>
                    </PopoverHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="section-label">Status</p>
                        <ToggleGroup
                          type="single"
                          value={filters.status}
                          onValueChange={(value) => value && setFilters({ ...filters, status: value as TaskFilterState["status"] })}
                          className="flex w-full justify-start border border-border/70 bg-muted/60 p-1"
                        >
                          <ToggleGroupItem value="open" variant="outline">Open</ToggleGroupItem>
                          <ToggleGroupItem value="done" variant="outline">Done</ToggleGroupItem>
                          <ToggleGroupItem value="all" variant="outline">All</ToggleGroupItem>
                        </ToggleGroup>
                      </div>
                      <div className="space-y-2">
                        <p className="section-label">Scope</p>
                        <ToggleGroup
                          type="single"
                          value={filters.scope}
                          onValueChange={(value) => value && setFilters({ ...filters, scope: value as TaskFilterState["scope"] })}
                          className="flex w-full justify-start border border-border/70 bg-muted/60 p-1"
                        >
                          <ToggleGroupItem value="all" variant="outline">All</ToggleGroupItem>
                          <ToggleGroupItem value="today" variant="outline">Today</ToggleGroupItem>
                          <ToggleGroupItem value="no_deadline" variant="outline">No deadline</ToggleGroupItem>
                        </ToggleGroup>
                      </div>
                      <div className="space-y-2">
                        <p className="section-label">Priority</p>
                        <ToggleGroup
                          type="single"
                          value={filters.priority}
                          onValueChange={(value) => value && setFilters({ ...filters, priority: value as TaskFilterState["priority"] })}
                          className="flex w-full justify-start border border-border/70 bg-muted/60 p-1"
                        >
                          <ToggleGroupItem value="all" variant="outline">All</ToggleGroupItem>
                          <ToggleGroupItem value="Urgent" variant="outline">Urgent</ToggleGroupItem>
                          <ToggleGroupItem value="High" variant="outline">High</ToggleGroupItem>
                          <ToggleGroupItem value="Medium" variant="outline">Medium</ToggleGroupItem>
                          <ToggleGroupItem value="Backlog" variant="outline">Backlog</ToggleGroupItem>
                        </ToggleGroup>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 py-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,28rem)]">
              <div className="relative">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-10"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search tasks, linked work, or assignees"
                  value={search}
                />
              </div>
              <div className="flex gap-2">
                <Input
                  onChange={(event) => setQuickCreate(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      submitQuickCreate();
                    }
                  }}
                  placeholder="Create a task quickly..."
                  value={quickCreate}
                />
                <Button type="button" onClick={submitQuickCreate}>
                  <PlusIcon data-icon="inline-start" />
                  Create
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          {(["Today", "No deadline"] as const).map((section) => {
            const tasks = groupedTasks[section];
            if (!tasks.length) return null;

            return (
              <Card key={section} size="sm" className="surface-card overflow-hidden">
                <CardHeader className="border-b border-border/60 pb-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <ChecksIcon className="size-4 text-muted-foreground" />
                      <CardTitle className="text-xl">{section}</CardTitle>
                    </div>
                    <Badge variant="secondary">{tasks.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 py-4">
                  {tasks.map((task) => {
                    const active = activeTaskId === task.id;
                    const scheduleLabel = formatSchedule(task.scheduled);

                    return (
                      <div
                        key={task.id}
                        className={cn(
                          "relative overflow-hidden border border-border/70 bg-background pl-5 pr-4 py-4 transition-colors",
                          active && "surface-active border-primary/35",
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn("absolute inset-y-0 left-0 w-1.5", getPriorityTone(task.priority))}
                        />
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                          <button
                            type="button"
                            className="flex min-w-0 flex-1 items-start gap-3 text-left"
                            onClick={() => openTask(task.id)}
                          >
                            <Checkbox
                              checked={task.done}
                              className="mt-0.5"
                              onCheckedChange={(checked) => updateTaskOverride(task.id, { done: Boolean(checked) })}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className={cn("text-base font-medium text-foreground", task.done && "line-through opacity-60")}>
                                  {task.title}
                                </p>
                                <Badge variant="outline" className="px-2 py-0.5 text-[11px]">
                                  {getSourceBadge(task)}
                                </Badge>
                                <Badge variant="secondary" className="px-2 py-0.5 text-[11px]">
                                  {task.project}
                                </Badge>
                              </div>
                              <p className="mt-1 text-sm leading-6 text-muted-foreground">{task.summary}</p>
                              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span className="inline-flex items-center gap-2 rounded-none border border-border/70 bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-foreground">
                                  <span className={cn("h-2 w-2 rounded-none", getPriorityTone(task.priority))} />
                                  {task.priority}
                                </span>
                                <span>{task.dueLabel}</span>
                                <span>{task.assignee}</span>
                                {scheduleLabel ? (
                                  <Badge variant="secondary" className="gap-1 px-2 py-0.5 text-[11px]">
                                    <CalendarBlankIcon className="size-3" />
                                    {scheduleLabel}
                                  </Badge>
                                ) : null}
                              </div>
                            </div>
                          </button>

                          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" type="button">Priority</Button>
                              </PopoverTrigger>
                              <PopoverContent align="end" className="w-44 gap-2 p-3">
                                <PopoverTitle className="text-sm font-medium">Priority</PopoverTitle>
                                <div className="mt-2 flex flex-col gap-2">
                                  {(["Urgent", "High", "Medium", "Backlog"] as const).map((priority) => (
                                    <Button
                                      key={priority}
                                      onClick={() => updateTaskOverride(task.id, { priority })}
                                      size="sm"
                                      type="button"
                                      variant={task.priority === priority ? "default" : "outline"}
                                    >
                                      {priority}
                                    </Button>
                                  ))}
                                </div>
                              </PopoverContent>
                            </Popover>

                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" type="button">Add to project</Button>
                              </PopoverTrigger>
                              <PopoverContent align="end" className="w-56 gap-2 p-3">
                                <PopoverTitle className="text-sm font-medium">Assign project</PopoverTitle>
                                <div className="mt-2 flex flex-col gap-2">
                                  {projects.map((project) => (
                                    <Button
                                      key={project.id}
                                      onClick={() => updateTaskOverride(task.id, { project: project.name })}
                                      size="sm"
                                      type="button"
                                      variant={task.project === project.name ? "default" : "outline"}
                                    >
                                      {project.name}
                                    </Button>
                                  ))}
                                </div>
                              </PopoverContent>
                            </Popover>

                            <Button
                              variant="outline"
                              size="sm"
                              type="button"
                              onClick={() => {
                                setAssigningTaskId(assigningTaskId === task.id ? null : task.id);
                                setAssignDraft({
                                  assignee: task.assignee,
                                  note: task.assignNote,
                                  includeOriginLink: task.includeOriginLink,
                                });
                              }}
                            >
                              Assign
                            </Button>

                            <Popover
                              onOpenChange={(open) => {
                                if (open) {
                                  setScheduleDrafts({
                                    ...scheduleDrafts,
                                    [task.id]: task.scheduled ?? {
                                      ...defaultSchedule,
                                      title: task.title,
                                    },
                                  });
                                }
                              }}
                            >
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" type="button">Schedule</Button>
                              </PopoverTrigger>
                              <PopoverContent align="end" className="w-[22rem] gap-4 p-4">
                                <PopoverHeader>
                                  <PopoverTitle>Background agent</PopoverTitle>
                                  <PopoverDescription>Turn this task into a recurring follow-through agent.</PopoverDescription>
                                </PopoverHeader>
                                <div className="space-y-4">
                                  <Input
                                    value={scheduleDrafts[task.id]?.title ?? task.title}
                                    onChange={(event) =>
                                      setScheduleDrafts({
                                        ...scheduleDrafts,
                                        [task.id]: {
                                          ...(scheduleDrafts[task.id] ?? { ...defaultSchedule, title: task.title }),
                                          title: event.target.value,
                                        },
                                      })
                                    }
                                  />
                                  <ToggleGroup
                                    type="single"
                                    value={scheduleDrafts[task.id]?.cadence ?? "weekly"}
                                    onValueChange={(value) =>
                                      value &&
                                      setScheduleDrafts({
                                        ...scheduleDrafts,
                                        [task.id]: {
                                          ...(scheduleDrafts[task.id] ?? { ...defaultSchedule, title: task.title }),
                                          cadence: value as ScheduledTaskDraft["cadence"],
                                        },
                                      })
                                    }
                                    className="flex w-full justify-start border border-border/70 bg-muted/60 p-1"
                                  >
                                    <ToggleGroupItem value="daily" variant="outline">Daily</ToggleGroupItem>
                                    <ToggleGroupItem value="weekly" variant="outline">Weekly</ToggleGroupItem>
                                    <ToggleGroupItem value="monthly" variant="outline">Monthly</ToggleGroupItem>
                                  </ToggleGroup>
                                  <div className="border border-border/70 bg-background p-2">
                                    <Calendar
                                      mode="single"
                                      selected={new Date(scheduleDrafts[task.id]?.date ?? defaultSchedule.date)}
                                      onSelect={(date) =>
                                        date &&
                                        setScheduleDrafts({
                                          ...scheduleDrafts,
                                          [task.id]: {
                                            ...(scheduleDrafts[task.id] ?? { ...defaultSchedule, title: task.title }),
                                            date: date.toISOString(),
                                          },
                                        })
                                      }
                                    />
                                  </div>
                                  <div className="grid gap-3 sm:grid-cols-2">
                                    <Input
                                      type="time"
                                      value={scheduleDrafts[task.id]?.time ?? defaultSchedule.time}
                                      onChange={(event) =>
                                        setScheduleDrafts({
                                          ...scheduleDrafts,
                                          [task.id]: {
                                            ...(scheduleDrafts[task.id] ?? { ...defaultSchedule, title: task.title }),
                                            time: event.target.value,
                                          },
                                        })
                                      }
                                    />
                                    <div className="border border-border/70 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                                      Runs in <span className="font-medium text-foreground">Plan</span> mode.
                                    </div>
                                  </div>
                                  <Button
                                    className="w-full"
                                    type="button"
                                    onClick={() =>
                                      updateTaskOverride(task.id, {
                                        scheduled: {
                                          ...(scheduleDrafts[task.id] ?? { ...defaultSchedule, title: task.title }),
                                          mode: "plan",
                                        },
                                      })
                                    }
                                  >
                                    <SparkleIcon data-icon="inline-start" />
                                    Confirm schedule
                                  </Button>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>

                        {assigningTaskId === task.id ? (
                          <div className="mt-4 border-t border-border/60 pt-4">
                            <div className="flex flex-col gap-3 lg:flex-row">
                              <div className="grid gap-2 sm:grid-cols-2 lg:w-[24rem]">
                                {contactCards.slice(0, 4).map((contact) => (
                                  <Button
                                    key={contact.id}
                                    onClick={() => setAssignDraft({ ...assignDraft, assignee: contact.name })}
                                    size="sm"
                                    type="button"
                                    variant={assignDraft.assignee === contact.name ? "default" : "outline"}
                                  >
                                    {contact.name}
                                  </Button>
                                ))}
                              </div>
                              <div className="flex min-w-0 flex-1 items-center gap-2">
                                <Input
                                  className="min-w-0"
                                  placeholder="Add an assignment remark or paste a chat/artifact link..."
                                  value={assignDraft.note}
                                  onChange={(event) => setAssignDraft({ ...assignDraft, note: event.target.value })}
                                />
                                <Button
                                  type="button"
                                  variant={assignDraft.includeOriginLink ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setAssignDraft({ ...assignDraft, includeOriginLink: !assignDraft.includeOriginLink })}
                                >
                                  <LinkSimpleIcon data-icon="inline-start" />
                                  Link source
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => {
                                    updateTaskOverride(task.id, {
                                      assignee: assignDraft.assignee,
                                      assignNote: assignDraft.note,
                                      includeOriginLink: assignDraft.includeOriginLink,
                                    });
                                    setAssigningTaskId(null);
                                  }}
                                >
                                  Save
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </PageContainer>
    </div>
  );
}
