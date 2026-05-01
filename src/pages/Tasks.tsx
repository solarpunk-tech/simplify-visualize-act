import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  ArrowSquareOutIcon,
  CalendarBlankIcon,
  CaretDownIcon,
  ClockCountdownIcon,
  FolderOpenIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  NotePencilIcon,
  PlusIcon,
  TagIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import { addDays, parseISO, startOfDay } from "date-fns";

import { PageContainer } from "@/components/page-container";
import {
  PriorityPill,
  TaskPriorityLabel,
  TaskOwner,
  TaskPriorityMenu,
  TaskStatusLabel,
} from "@/components/task-controls";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { projects, unifiedTasks } from "@/lib/ubik-data";
import type { UnifiedTask } from "@/lib/ubik-types";
import {
  formatScheduleLabel,
  formatTaskDate,
  getTaskDisplayStatus,
  isScheduledTask,
  isTaskCollectionView,
  priorityOptions,
  statusOptions,
  type TaskCollectionView,
  type TaskPriorityFilter,
  type TaskPriorityOption,
  type TaskRecord,
  type TaskScheduleDraft,
  type TaskStatusFilter,
  type TaskViewMode,
} from "@/lib/task-helpers";
import { cn, shouldIgnoreSurfaceHotkeys } from "@/lib/utils";

type TaskDetailPanel = "details" | "updates";

type TaskUpdateEntry = {
  id: string;
  label: string;
  detail: string;
  meta: string;
};

function getTaskDetailPanel(value: string | null): TaskDetailPanel {
  if (value === "updates") return "updates";
  return "details";
}

function buildTaskMetaLabels(task: TaskRecord) {
  return Array.from(
    new Set(
      [
        task.displayProject,
        task.sourceLabel,
        task.schedule ? formatScheduleLabel(task.schedule) : formatTaskDate(task),
      ].filter(Boolean),
    ),
  );
}

function buildTaskUpdates(task: TaskRecord): TaskUpdateEntry[] {
  return [
    {
      id: `${task.id}-update-1`,
      label: "Source linked",
      detail: `Task is currently routed from ${task.sourceLabel.toLowerCase()}.`,
      meta: "Linked source",
    },
    {
      id: `${task.id}-update-2`,
      label: "Current owner",
      detail: `${task.displayOwner} is carrying the current follow-through.`,
      meta: "Assignee",
    },
    {
      id: `${task.id}-update-3`,
      label: "Current window",
      detail: task.schedule ? formatScheduleLabel(task.schedule) ?? formatTaskDate(task) : formatTaskDate(task),
      meta: "Due window",
    },
  ];
}

function buildTaskDocumentDraft(task: TaskRecord) {
  return `${task.summary}

Next move
- Confirm the operating decision in ${task.sourceLabel}.
- Keep ${task.displayProject} aligned before closing the loop.
- Leave the audit trail in Activity instead of inside the task body.`;
}

export default function Tasks() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [draftTitle, setDraftTitle] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>("All");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriorityFilter>("All");
  const [customTasks, setCustomTasks] = useState<UnifiedTask[]>([]);
  const [checkedTaskIds, setCheckedTaskIds] = useState<string[]>([]);
  const [taskPriorityOverrides, setTaskPriorityOverrides] = useState<Record<string, TaskPriorityOption>>({});
  const [taskProjects, setTaskProjects] = useState<Record<string, string>>({});
  const [taskOwners, setTaskOwners] = useState<Record<string, string>>({});
  const [taskStatusOverrides, setTaskStatusOverrides] = useState<Record<string, TaskStatusFilter>>({});
  const [taskCategoryOverrides, setTaskCategoryOverrides] = useState<Record<string, string>>({});
  const [taskSchedules, setTaskSchedules] = useState<Record<string, TaskScheduleDraft>>({});
  const [taskDocumentDrafts, setTaskDocumentDrafts] = useState<Record<string, string>>({});
  const [taskUpdateDrafts, setTaskUpdateDrafts] = useState<Record<string, string>>({});
  const [taskManualUpdates, setTaskManualUpdates] = useState<Record<string, TaskUpdateEntry[]>>({});
  const [sectionOpen, setSectionOpen] = useState<Record<string, boolean>>({
    today: true,
    "no-deadline": true,
    done: false,
  });
  const queryInputRef = useRef<HTMLInputElement | null>(null);
  const addTaskTriggerRef = useRef<HTMLButtonElement | null>(null);
  const assigneeTriggerRef = useRef<HTMLButtonElement | null>(null);
  const projectTriggerRef = useRef<HTMLButtonElement | null>(null);
  const labelTriggerRef = useRef<HTMLButtonElement | null>(null);
  const statusTriggerRef = useRef<HTMLButtonElement | null>(null);
  const scheduleTriggerRef = useRef<HTMLButtonElement | null>(null);
  const priorityTriggerRef = useRef<HTMLButtonElement | null>(null);
  const updateComposerRef = useRef<HTMLTextAreaElement | null>(null);
  const today = startOfDay(new Date());

  const routeView = searchParams.get("view");
  const routeTaskId = searchParams.get("task");
  const routePanel = searchParams.get("panel");
  const visibleView: TaskCollectionView = isTaskCollectionView(routeView) ? routeView : "list";
  const viewMode: TaskViewMode = routeTaskId ? "detail" : visibleView;
  const detailPanel: TaskDetailPanel = getTaskDetailPanel(routePanel);

  const updateSearchParams = useCallback((updates: {
    view?: TaskCollectionView | null;
    task?: string | null;
    panel?: TaskDetailPanel | null;
  }) => {
    const nextParams = new URLSearchParams(searchParams);

    if ("view" in updates) {
      if (updates.view && updates.view !== "list") nextParams.set("view", updates.view);
      else nextParams.delete("view");
    }

    if ("task" in updates) {
      if (updates.task) nextParams.set("task", updates.task);
      else nextParams.delete("task");
    }

    if ("panel" in updates) {
      const nextTaskId = "task" in updates ? updates.task : nextParams.get("task");
      if (updates.panel && nextTaskId) nextParams.set("panel", updates.panel);
      else nextParams.delete("panel");
    }

    setSearchParams(nextParams);
  }, [searchParams, setSearchParams]);

  const createTask = () => {
    if (!draftTitle.trim()) return;
    const nextTaskId = `workspace-task-${Date.now()}`;
    const start = new Date();
    const end = addDays(start, 1);

    const nextTask: UnifiedTask = {
      id: nextTaskId,
      title: draftTitle.trim(),
      summary: "Captured from the operator surface and ready for follow-through.",
      project: "Workspace",
      owner: "You",
      priority: "Medium",
      source: "workspace",
      sourceLabel: "Workspace",
      href: `/tasks?task=${nextTaskId}`,
      originHref: "/tasks",
      section: "Today",
      dueLabel: "Tomorrow",
      category: "Operator follow-through",
      timelineStart: start.toISOString(),
      timelineEnd: end.toISOString(),
    };

    setCustomTasks((existing) => [nextTask, ...existing]);
    setDraftTitle("");
    updateSearchParams({ task: nextTaskId, view: visibleView, panel: "details" });
  };

  const allTasks = useMemo<TaskRecord[]>(
    () =>
      [...customTasks, ...unifiedTasks].map((task) => ({
        ...task,
        displayOwner: taskOwners[task.id] ?? task.owner,
        displayPriority: taskPriorityOverrides[task.id] ?? task.priority,
        displayStatus:
          taskStatusOverrides[task.id] ??
          getTaskDisplayStatus(
            task,
            today,
            checkedTaskIds.includes(task.id),
            taskSchedules[task.id] ?? null,
          ),
        displayProject: taskProjects[task.id] ?? task.project,
        category: taskCategoryOverrides[task.id] ?? task.category,
        isChecked: checkedTaskIds.includes(task.id),
        schedule: taskSchedules[task.id] ?? null,
        startDate: parseISO(task.timelineStart),
        endDate: parseISO(task.timelineEnd),
      })),
    [checkedTaskIds, customTasks, taskCategoryOverrides, taskOwners, taskPriorityOverrides, taskProjects, taskSchedules, taskStatusOverrides, today],
  );

  const ownerOptions = useMemo(
    () => Array.from(new Set(["You", ...allTasks.map((task) => task.displayOwner)])).sort(),
    [allTasks],
  );
  const projectOptions = useMemo(
    () => Array.from(new Set([...projects.map((project) => project.name), ...allTasks.map((task) => task.displayProject)])).sort(),
    [allTasks],
  );
  const categoryOptions = useMemo(
    () => Array.from(new Set(allTasks.map((task) => task.category))).sort(),
    [allTasks],
  );

  const filteredTasks = useMemo(
    () =>
      allTasks.filter((task) => {
        const matchesQuery =
          !query ||
          [
            task.title,
            task.summary,
            task.displayOwner,
            task.displayProject,
            task.sourceLabel,
            task.category,
            task.displayPriority,
          ]
            .join(" ")
            .toLowerCase()
            .includes(query.toLowerCase());

        const matchesPriority = priorityFilter === "All" ? true : task.displayPriority === priorityFilter;
        const matchesStatus = statusFilter === "All" ? true : task.displayStatus === statusFilter;
        return matchesQuery && matchesPriority && matchesStatus;
      }),
    [allTasks, priorityFilter, query, statusFilter],
  );

  const selectedTask =
    filteredTasks.find((task) => task.id === routeTaskId) ??
    allTasks.find((task) => task.id === routeTaskId) ??
    filteredTasks[0] ??
    allTasks[0] ??
    null;

  const completedTasks = useMemo(
    () => filteredTasks.filter((task) => task.isChecked),
    [filteredTasks],
  );
  const listSections = useMemo(
    () => [
      {
        id: "today",
        title: "Today",
        tasks: filteredTasks.filter((task) => task.section === "Today" && !task.isChecked),
      },
      {
        id: "no-deadline",
        title: "No deadline",
        tasks: filteredTasks.filter((task) => task.section === "No deadline" && !task.isChecked),
      },
      {
        id: "done",
        title: "Done",
        tasks: completedTasks,
      },
    ].filter((section) => section.tasks.length),
    [completedTasks, filteredTasks],
  );

  const kanbanColumns = useMemo(
    () => [
      {
        key: "today" as const,
        label: "Today",
        description: "Active follow-through that should move now.",
        tasks: filteredTasks.filter((task) => task.section === "Today" && !task.isChecked && !isScheduledTask(task, today)),
      },
      {
        key: "scheduled" as const,
        label: "Scheduled",
        description: "Future work windows or explicitly scheduled follow-ups.",
        tasks: filteredTasks.filter((task) => !task.isChecked && isScheduledTask(task, today)),
      },
      {
        key: "no-deadline" as const,
        label: "No deadline",
        description: "Backlog that stays visible without a hard time box.",
        tasks: filteredTasks.filter((task) => task.section === "No deadline" && !task.isChecked && !isScheduledTask(task, today)),
      },
      {
        key: "done" as const,
        label: "Done",
        description: "Recently cleared work.",
        tasks: completedTasks,
      },
    ],
    [completedTasks, filteredTasks, today],
  );

  const setTaskChecked = (taskId: string) => {
    setCheckedTaskIds((existing) =>
      existing.includes(taskId) ? existing.filter((id) => id !== taskId) : [...existing, taskId],
    );
  };

  const setTaskPriority = (taskId: string, priority: TaskPriorityOption) => {
    setTaskPriorityOverrides((existing) => ({ ...existing, [taskId]: priority }));
  };

  const setTaskProject = (taskId: string, project: string) => {
    setTaskProjects((existing) => ({ ...existing, [taskId]: project }));
  };

  const setTaskOwner = (taskId: string, owner: string) => {
    setTaskOwners((existing) => ({ ...existing, [taskId]: owner }));
  };

  const setTaskStatus = (taskId: string, status: TaskStatusFilter) => {
    setTaskStatusOverrides((existing) => ({ ...existing, [taskId]: status }));
  };

  const setTaskCategory = (taskId: string, category: string) => {
    setTaskCategoryOverrides((existing) => ({ ...existing, [taskId]: category }));
  };

  const setTaskSchedule = (taskId: string, schedule: TaskScheduleDraft) => {
    setTaskSchedules((existing) => ({ ...existing, [taskId]: schedule }));
  };

  const setTaskDocumentDraft = (taskId: string, value: string) => {
    setTaskDocumentDrafts((existing) => ({ ...existing, [taskId]: value }));
  };

  const setTaskUpdateDraft = (taskId: string, value: string) => {
    setTaskUpdateDrafts((existing) => ({ ...existing, [taskId]: value }));
  };

  const addTaskUpdate = (task: TaskRecord) => {
    const draft = taskUpdateDrafts[task.id]?.trim();
    if (!draft) return;

    setTaskManualUpdates((existing) => ({
      ...existing,
      [task.id]: [
        {
          id: `${task.id}-manual-${Date.now()}`,
          label: "Update added",
          detail: draft,
          meta: "Just now",
        },
        ...(existing[task.id] ?? []),
      ],
    }));
    setTaskUpdateDraft(task.id, "");
  };

  const setVisibleTasksChecked = () => {
    const allVisibleChecked = filteredTasks.length > 0 && filteredTasks.every((task) => task.isChecked);

    setCheckedTaskIds((existing) => {
      if (allVisibleChecked) {
        return existing.filter((taskId) => !filteredTasks.some((task) => task.id === taskId));
      }

      return Array.from(new Set([...existing, ...filteredTasks.map((task) => task.id)]));
    });
  };
  const openTaskDetail = (taskId: string, panel: TaskDetailPanel = "details") => {
    updateSearchParams({ task: taskId, view: visibleView, panel });
  };
  const selectedTaskDocument = selectedTask
    ? taskDocumentDrafts[selectedTask.id] ?? buildTaskDocumentDraft(selectedTask)
    : "";
  const selectedTaskUpdates = selectedTask
    ? [...(taskManualUpdates[selectedTask.id] ?? []), ...buildTaskUpdates(selectedTask)]
    : [];
  const focusTaskFilter = useCallback(() => {
    if (viewMode !== "list") {
      updateSearchParams({ view: "list", task: null, panel: null });
    }
    setTimeout(() => queryInputRef.current?.focus(), 40);
  }, [updateSearchParams, viewMode]);
  const openTaskCreator = useCallback(() => {
    if (viewMode !== "list") {
      updateSearchParams({ view: "list", task: null });
    }
    setTimeout(() => {
      addTaskTriggerRef.current?.click();
    }, 40);
  }, [updateSearchParams, viewMode]);

  const commandRailClass =
    "flex w-full items-center gap-1 overflow-x-auto border border-border/70 bg-muted/30 px-1.5 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
  const commandRailGroupClass = "flex shrink-0 items-center gap-1";
  const commandRailButtonClass =
    "inline-flex h-7 shrink-0 items-center gap-1 border border-transparent px-1.5 text-[11px] font-medium text-foreground/80 transition-colors hover:bg-background hover:text-foreground motion-reduce:transition-none";
  const commandRailActiveButtonClass =
    "border-border/70 bg-background text-foreground shadow-sm hover:bg-background hover:text-foreground";
  const commandRailPrimaryButtonClass =
    "border-primary bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground";
  const commandRailShortcutClass =
    "inline-flex min-w-[1.3rem] items-center justify-center border border-border/70 bg-background px-1 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground";
  const taskCommandButtonClass =
    "inline-flex h-7 shrink-0 items-center gap-1 border border-transparent px-1.5 text-[11px] font-medium text-foreground/80 transition-colors hover:bg-background hover:text-foreground motion-reduce:transition-none";

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (shouldIgnoreSurfaceHotkeys(event.target)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const key = event.key.toLowerCase();

      if (key === "escape" && viewMode === "detail") {
        event.preventDefault();
        updateSearchParams({ task: null, view: visibleView, panel: null });
        return;
      }

      if (viewMode === "detail" && selectedTask) {
        if (key === "a") {
          event.preventDefault();
          assigneeTriggerRef.current?.click();
          return;
        }
        if (key === "p") {
          event.preventDefault();
          projectTriggerRef.current?.click();
          return;
        }
        if (key === "l") {
          event.preventDefault();
          labelTriggerRef.current?.click();
          return;
        }
        if (key === "s") {
          event.preventDefault();
          statusTriggerRef.current?.click();
          return;
        }
        if (key === "u") {
          event.preventDefault();
          updateSearchParams({ task: selectedTask.id, view: visibleView, panel: "updates" });
          setTimeout(() => updateComposerRef.current?.focus(), 40);
          return;
        }
        if (["0", "1", "2", "3", "4"].includes(key)) {
          event.preventDefault();
          priorityTriggerRef.current?.click();
        }
        return;
      }

      if (key === "f") {
        event.preventDefault();
        focusTaskFilter();
        return;
      }

      if (key === "v") {
        event.preventDefault();
        updateSearchParams({ view: visibleView === "list" ? "kanban" : "list", task: null, panel: null });
        return;
      }

      if (key === "n") {
        event.preventDefault();
        openTaskCreator();
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [focusTaskFilter, openTaskCreator, selectedTask, updateSearchParams, viewMode, visibleView]);

  useEffect(() => {
    if (viewMode === "detail" && detailPanel === "updates") {
      const timeout = window.setTimeout(() => updateComposerRef.current?.focus(), 40);
      return () => window.clearTimeout(timeout);
    }
  }, [detailPanel, viewMode, selectedTask?.id]);

  const taskCommandBar = viewMode === "detail" ? (
    <div className={commandRailClass}>
      <div className={commandRailGroupClass}>
        <button className={commandRailButtonClass} onClick={() => updateSearchParams({ task: null, view: visibleView, panel: null })} type="button">
          <ArrowLeftIcon className="size-4" />
          <span>Back to list</span>
          <span className={commandRailShortcutClass}>Esc</span>
        </button>
      </div>
      <span className="h-4 w-px shrink-0 bg-border/80" aria-hidden="true" />
      <div className="flex-1" />
      <div className={commandRailGroupClass}>
        {selectedTask ? (
          <button
            className={taskCommandButtonClass}
            onClick={() => {
              updateSearchParams({ task: selectedTask.id, view: visibleView, panel: "updates" });
              setTimeout(() => updateComposerRef.current?.focus(), 40);
            }}
            type="button"
          >
            <PlusIcon className="size-4" />
            <span>Add update</span>
            <span className={commandRailShortcutClass}>U</span>
          </button>
        ) : null}
      </div>
      <span className="h-4 w-px shrink-0 bg-border/80" aria-hidden="true" />
      <div className={commandRailGroupClass}>
        {selectedTask ? (
          <button className={commandRailButtonClass} onClick={() => navigate(selectedTask.originHref)} type="button">
            <ArrowSquareOutIcon className="size-4" />
            <span>Open source</span>
          </button>
        ) : null}
      </div>
    </div>
  ) : (
    <div className={commandRailClass}>
      <div className={commandRailGroupClass}>
        <button className={commandRailButtonClass} onClick={focusTaskFilter} type="button">
          <FunnelIcon className="size-4" />
          <span>Filter</span>
          <span className={commandRailShortcutClass}>F</span>
        </button>
      </div>
      <div className="flex-1" />
      <div className={commandRailGroupClass}>
        <Popover>
          <PopoverTrigger asChild>
            <button
              ref={addTaskTriggerRef}
              className={cn(commandRailButtonClass, commandRailPrimaryButtonClass)}
              data-task-create-trigger="true"
              type="button"
            >
              <PlusIcon className="size-4" />
              <span>Add task</span>
              <span className={cn(commandRailShortcutClass, "border-primary-foreground/20 bg-primary-foreground/15 text-primary-foreground")}>N</span>
            </button>
          </PopoverTrigger>
          <PopoverContent align="center" className="w-80">
            <PopoverHeader className="px-0">
              <PopoverTitle>Add task</PopoverTitle>
              <PopoverDescription>Capture a new operator task without leaving the queue.</PopoverDescription>
            </PopoverHeader>
            <div className="mt-4 flex flex-col gap-3">
              <Input
                autoFocus
                onChange={(event) => setDraftTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    createTask();
                  }
                }}
                placeholder="Capture a new task"
                value={draftTitle}
              />
              <Button className="w-full" onClick={createTask} type="button">
                Create task
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex-1" />
      <div className={cn(commandRailGroupClass, "min-w-0 justify-end gap-1 px-2")}>
        <button
          className={cn(commandRailButtonClass, visibleView === "list" && commandRailActiveButtonClass)}
          onClick={() => updateSearchParams({ view: "list", task: null, panel: null })}
          type="button"
        >
          <span>List</span>
        </button>
        <button
          className={cn(commandRailButtonClass, visibleView === "kanban" && commandRailActiveButtonClass)}
          onClick={() => updateSearchParams({ view: "kanban", task: null, panel: null })}
          type="button"
        >
          <span>Kanban</span>
          <span className={commandRailShortcutClass}>V</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="px-4 py-6 lg:px-8">
      <PageContainer className="flex flex-col gap-5">
        <div className="shrink-0">{taskCommandBar}</div>
        {viewMode === "list" ? (
          <section className="surface-card overflow-hidden">
            <div className="border-b border-border/70 px-5 py-5">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
                  <div className="relative w-full md:max-w-xs">
                    <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      ref={queryInputRef}
                      className="pl-9"
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Filter tasks..."
                      value={query}
                    />
                  </div>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        aria-label="Filter by status"
                        className="justify-start"
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <PlusIcon data-icon="inline-start" />
                        {statusFilter === "All" ? "Status" : statusFilter}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-56 p-0">
                      <div className="border-b border-border/70 px-3 py-2 text-sm font-medium text-foreground">Status</div>
                      <div className="p-1">
                        {(["All", ...statusOptions] as const).map((option) => (
                          <Button
                            key={option}
                            className="w-full justify-between"
                            onClick={() => setStatusFilter(option)}
                            size="sm"
                            type="button"
                            variant={statusFilter === option ? "secondary" : "ghost"}
                          >
                            <span>{option}</span>
                            <span className="text-xs text-muted-foreground">
                              {option === "All" ? allTasks.length : allTasks.filter((task) => task.displayStatus === option).length}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        aria-label="Filter by priority"
                        className="justify-start"
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <PlusIcon data-icon="inline-start" />
                        {priorityFilter === "All" ? "Priority" : priorityFilter === "None" ? "No priority" : priorityFilter}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-56 p-1">
                      {(["All", ...priorityOptions.map((option) => option.value)] as const).map((option) => (
                        <Button
                          key={option}
                          className="w-full justify-start"
                          onClick={() => setPriorityFilter(option)}
                          size="sm"
                          type="button"
                          variant={priorityFilter === option ? "secondary" : "ghost"}
                        >
                          {option === "None" ? "No priority" : option}
                        </Button>
                      ))}
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {filteredTasks.length ? (
              <div>
                <div className="flex items-center gap-3 border-b border-border/60 px-5 py-3 text-xs text-muted-foreground">
                  <Checkbox
                    checked={filteredTasks.length > 0 && filteredTasks.every((task) => task.isChecked)}
                    className="rounded-none"
                    onCheckedChange={setVisibleTasksChecked}
                  />
                  <span>Select visible</span>
                </div>
                {listSections.map((section) => (
                  <Collapsible
                    key={section.id}
                    className="border-b border-border/60 last:border-b-0"
                    onOpenChange={(open) => setSectionOpen((current) => ({ ...current, [section.id]: open }))}
                    open={sectionOpen[section.id] ?? true}
                  >
                    <CollapsibleTrigger asChild>
                      <button className="flex w-full items-center justify-between px-5 py-4 text-left" type="button">
                        <div className="flex items-center gap-2">
                          <CaretDownIcon className={cn("size-4 text-muted-foreground transition-transform", !(sectionOpen[section.id] ?? true) && "-rotate-90")} />
                          <h3 className="text-[1.05rem] font-medium text-foreground">{section.title}</h3>
                        </div>
                        <span className="text-xs text-muted-foreground">{section.tasks.length}</span>
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="border-t border-border/60 overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down motion-reduce:data-[state=closed]:animate-none motion-reduce:data-[state=open]:animate-none">
                      {section.tasks.map((task) => {
                        const metaItems = buildTaskMetaLabels(task);
                        return (
                          <div key={task.id} className="flex items-start gap-3 border-b border-border/50 px-5 py-3 last:border-b-0">
                            <Checkbox
                              checked={task.isChecked}
                              className="mt-1 rounded-none"
                              onCheckedChange={() => setTaskChecked(task.id)}
                            />
                            <TaskOwner
                              owner={task.displayOwner}
                              showName={false}
                              className="mt-0.5 shrink-0"
                              avatarClassName="size-7"
                            />
                            <button
                              className="min-w-0 flex-1 text-left"
                              onClick={() => openTaskDetail(task.id)}
                              type="button"
                            >
                              <p
                                className={cn(
                                  "truncate text-[1.05rem] leading-6 text-foreground transition-colors hover:text-primary",
                                  task.isChecked && "text-muted-foreground line-through",
                                )}
                              >
                                {task.title}
                              </p>
                              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                {metaItems.map((item) => (
                                  <span key={`${task.id}-${item}`}>{item}</span>
                                ))}
                              </div>
                            </button>
                            <div className="flex items-center gap-2 pl-2">
                              {task.displayPriority !== "None" ? <PriorityPill priority={task.displayPriority} /> : null}
                              <Button
                                aria-label={`Edit ${task.title}`}
                                className="rounded-none"
                                onClick={() => openTaskDetail(task.id)}
                                size="icon-sm"
                                type="button"
                                variant="ghost"
                              >
                                <NotePencilIcon />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            ) : (
              <div className="px-5 py-10 text-sm text-muted-foreground">No tasks match the current filters.</div>
            )}
          </section>
        ) : null}

        {viewMode === "detail" && selectedTask ? (
          <section className="surface-card overflow-hidden">
            <div className="border-b border-border/70 bg-background px-6 py-6">
              <div className="min-w-0 space-y-1">
                <p className="section-label">Task document</p>
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedTask.isChecked}
                    className="mt-1 rounded-none"
                    onCheckedChange={() => setTaskChecked(selectedTask.id)}
                  />
                  <div className="min-w-0">
                    <h2
                      className={cn(
                        "text-[2rem] font-medium leading-tight text-foreground",
                        selectedTask.isChecked && "text-muted-foreground line-through",
                      )}
                    >
                      {selectedTask.title}
                    </h2>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">{selectedTask.summary}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-6">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(19rem,0.85fr)]">
                <div className="space-y-4">
                  <section className="border border-border/70 bg-card px-6 py-6">
                    <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-4">
                      <div>
                        <p className="section-label">Details</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Keep the task body simple. Decisions stay here and the activity trail now sits in the main work column.
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">{selectedTask.sourceLabel}</span>
                    </div>
                    <Textarea
                      key={selectedTask.id}
                      className="mt-5 min-h-[28rem] resize-none rounded-none border-0 bg-transparent p-0 text-[15px] leading-8 text-foreground shadow-none focus-visible:border-transparent focus-visible:ring-0"
                      onChange={(event) => setTaskDocumentDraft(selectedTask.id, event.target.value)}
                      value={selectedTaskDocument}
                    />
                  </section>

                  <section className={cn("border border-border/70 bg-card px-6 py-5", detailPanel === "updates" && "surface-active")}>
                    <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-4">
                      <div>
                        <p className="section-label">Activity</p>
                        <p className="mt-2 text-sm text-muted-foreground">Keep updates in the working column so they span the full task width.</p>
                      </div>
                      <span className={commandRailShortcutClass}>U</span>
                    </div>

                    <div className="mt-4 space-y-4">
                      <div className="flex flex-col gap-3">
                        <Textarea
                          ref={updateComposerRef}
                          className="min-h-24 rounded-none border-border/70 bg-background text-sm leading-6 shadow-none focus-visible:ring-0"
                          onChange={(event) => setTaskUpdateDraft(selectedTask.id, event.target.value)}
                          placeholder="Add an update, follow-through note, or handoff detail..."
                          value={taskUpdateDrafts[selectedTask.id] ?? ""}
                        />
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs text-muted-foreground">Use the command bar or press U to jump here.</p>
                          <Button className="rounded-none" onClick={() => addTaskUpdate(selectedTask)} size="sm" type="button">
                            Add update
                          </Button>
                        </div>
                      </div>

                      <div className="border-t border-border/60 pt-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <p className="section-label">Suggestions</p>
                          <span className="text-xs text-muted-foreground">Lightweight operator nudges</span>
                        </div>
                        <div className="grid gap-3 lg:grid-cols-3">
                          {selectedTaskUpdates.map((update) => (
                            <div key={update.id} className="flex h-full flex-col gap-2 border border-dashed border-border/70 bg-secondary/20 px-3 py-3">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <ClockCountdownIcon className="size-4 text-foreground/68" />
                                  <p className="text-sm font-medium text-foreground">{update.label}</p>
                                </div>
                                <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{update.meta}</span>
                              </div>
                              <p className="text-sm leading-6 text-muted-foreground">{update.detail}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                <aside className="space-y-4">
                  <section className="border border-border/70 bg-card px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="section-label">Properties</p>
                        <p className="mt-2 text-sm text-muted-foreground">Edit task attributes from the same rail.</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button ref={assigneeTriggerRef} className="flex w-full items-center gap-3 border border-border/70 bg-background px-3 py-3 text-left transition-colors hover:bg-secondary/30" type="button">
                            <UsersThreeIcon className="size-4 shrink-0 text-muted-foreground" />
                            <div className="min-w-0 flex-1">
                              <p className="section-label">Assignee</p>
                              <p className="mt-1 truncate text-sm text-foreground">{selectedTask.displayOwner}</p>
                            </div>
                            <span className={commandRailShortcutClass}>A</span>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Assign task</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {ownerOptions.map((owner) => (
                            <DropdownMenuItem key={owner} onSelect={() => setTaskOwner(selectedTask.id, owner)}>
                              {owner}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button ref={projectTriggerRef} className="flex w-full items-center gap-3 border border-border/70 bg-background px-3 py-3 text-left transition-colors hover:bg-secondary/30" type="button">
                            <FolderOpenIcon className="size-4 shrink-0 text-muted-foreground" />
                            <div className="min-w-0 flex-1">
                              <p className="section-label">Project</p>
                              <p className="mt-1 truncate text-sm text-foreground">{selectedTask.displayProject}</p>
                            </div>
                            <span className={commandRailShortcutClass}>P</span>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Move to project</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {projectOptions.map((project) => (
                            <DropdownMenuItem key={project} onSelect={() => setTaskProject(selectedTask.id, project)}>
                              {project}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button ref={labelTriggerRef} className="flex w-full items-center gap-3 border border-border/70 bg-background px-3 py-3 text-left transition-colors hover:bg-secondary/30" type="button">
                            <TagIcon className="size-4 shrink-0 text-muted-foreground" />
                            <div className="min-w-0 flex-1">
                              <p className="section-label">Label</p>
                              <p className="mt-1 truncate text-sm text-foreground">{selectedTask.category}</p>
                            </div>
                            <span className={commandRailShortcutClass}>L</span>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Set label</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {categoryOptions.map((category) => (
                            <DropdownMenuItem key={category} onSelect={() => setTaskCategory(selectedTask.id, category)}>
                              {category}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button ref={statusTriggerRef} className="flex w-full items-center gap-3 border border-border/70 bg-background px-3 py-3 text-left transition-colors hover:bg-secondary/30" type="button">
                            <div className="min-w-0 flex-1">
                              <p className="section-label">Status</p>
                              <div className="mt-1">
                                <TaskStatusLabel status={selectedTask.displayStatus} />
                              </div>
                            </div>
                            <span className={commandRailShortcutClass}>S</span>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Set status</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {statusOptions.map((status) => (
                            <DropdownMenuItem key={status} onSelect={() => setTaskStatus(selectedTask.id, status)}>
                              <TaskStatusLabel status={status} />
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <TaskPriorityMenu
                        align="end"
                        onSelect={(value) => setTaskPriority(selectedTask.id, value)}
                        priority={selectedTask.displayPriority}
                        trigger={
                          <button ref={priorityTriggerRef} className="flex w-full items-center gap-3 border border-border/70 bg-background px-3 py-3 text-left transition-colors hover:bg-secondary/30" type="button">
                            <div className="min-w-0 flex-1">
                              <p className="section-label">Priority</p>
                              <div className="mt-1">
                                <TaskPriorityLabel priority={selectedTask.displayPriority} />
                              </div>
                            </div>
                            <span className={commandRailShortcutClass}>0-4</span>
                          </button>
                        }
                      />

                      <Popover>
                        <PopoverTrigger asChild>
                          <button ref={scheduleTriggerRef} className="flex w-full items-center gap-3 border border-border/70 bg-background px-3 py-3 text-left transition-colors hover:bg-secondary/30" type="button">
                            <CalendarBlankIcon className="size-4 shrink-0 text-muted-foreground" />
                            <div className="min-w-0 flex-1">
                              <p className="section-label">Due window</p>
                              <p className="mt-1 truncate text-sm text-foreground">
                                {selectedTask.schedule ? formatScheduleLabel(selectedTask.schedule) : formatTaskDate(selectedTask)}
                              </p>
                            </div>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-72">
                          <PopoverHeader className="px-0">
                            <PopoverTitle>Schedule task</PopoverTitle>
                            <PopoverDescription>Adjust the next follow-through window without leaving the task document.</PopoverDescription>
                          </PopoverHeader>
                          <div className="mt-4 space-y-3">
                            <Input
                              type="date"
                              value={selectedTask.schedule?.date ?? ""}
                              onChange={(event) =>
                                setTaskSchedule(selectedTask.id, {
                                  cadence: selectedTask.schedule?.cadence ?? "Once",
                                  date: event.target.value,
                                  time: selectedTask.schedule?.time ?? "09:00",
                                })
                              }
                            />
                            <Input
                              type="time"
                              value={selectedTask.schedule?.time ?? "09:00"}
                              onChange={(event) =>
                                setTaskSchedule(selectedTask.id, {
                                  cadence: selectedTask.schedule?.cadence ?? "Once",
                                  date: selectedTask.schedule?.date ?? parseISO(selectedTask.timelineEnd).toISOString().slice(0, 10),
                                  time: event.target.value,
                                })
                              }
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </section>
                </aside>
              </div>
            </div>
          </section>
        ) : null}

        {viewMode === "kanban" ? (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Kanban view</p>
              <p className="text-xs text-muted-foreground">Operational buckets for active follow-through.</p>
            </div>

            <div className="overflow-x-auto">
            <div className="grid min-w-[72rem] grid-cols-4 gap-4">
              {kanbanColumns.map((column) => (
                <section key={column.key} className="surface-card flex min-h-[28rem] flex-col overflow-hidden">
                  <div className="border-b border-border/70 px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className={cn("h-2.5 w-2.5", column.key === "done" ? "bg-foreground/35" : "bg-primary")} />
                          <h2 className="text-sm font-semibold text-foreground">{column.label}</h2>
                        </div>
                        <p className="text-xs leading-5 text-muted-foreground">{column.description}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{column.tasks.length}</span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col gap-3 p-3">
                    {column.tasks.length ? (
                      column.tasks.map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            "border border-border/70 bg-background px-3 py-3 shadow-sm",
                            task.isChecked && "opacity-60",
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={task.isChecked}
                              className="mt-1 rounded-none"
                              onCheckedChange={() => setTaskChecked(task.id)}
                            />
                            <TaskOwner
                              owner={task.displayOwner}
                              showName={false}
                              className="mt-0.5 shrink-0"
                              avatarClassName="size-7"
                            />
                            <div className="min-w-0 flex-1">
                              <button
                                className="w-full text-left"
                                onClick={() => openTaskDetail(task.id)}
                                type="button"
                              >
                                <h3 className="truncate text-sm font-medium text-foreground transition-colors hover:text-primary">
                                  {task.title}
                                </h3>
                                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                  {buildTaskMetaLabels(task)
                                    .slice(0, 2)
                                    .map((item) => (
                                      <span key={`${task.id}-${item}`}>{item}</span>
                                    ))}
                                </div>
                              </button>

                              <div className="mt-3 flex items-center justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  {column.key !== "done" && task.displayPriority !== "None" ? (
                                    <PriorityPill priority={task.displayPriority} />
                                  ) : null}
                                  <span className="text-xs text-muted-foreground">{formatTaskDate(task)}</span>
                                </div>
                                <Button
                                  aria-label={`Edit ${task.title}`}
                                  className="rounded-none"
                                  onClick={() => openTaskDetail(task.id)}
                                  size="icon-sm"
                                  type="button"
                                  variant="ghost"
                                >
                                  <NotePencilIcon />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-1 items-center justify-center border border-dashed border-border bg-muted/20 px-4 py-10 text-sm text-muted-foreground">
                        No tasks in {column.label.toLowerCase()}.
                      </div>
                    )}
                  </div>
                </section>
              ))}
            </div>
          </div>
          </div>
        ) : null}
      </PageContainer>
    </div>
  );
}
