import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  DotsThreeVerticalIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  MinusIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { addDays, parseISO, startOfDay } from "date-fns";

import { PageContainer } from "@/components/page-container";
import {
  CompactTaskActions,
  PriorityPill,
  TaskOwner,
  TaskPriorityLabel,
  TaskPriorityMenu,
  TaskStatusLabel,
} from "@/components/task-controls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { unifiedTasks } from "@/lib/ubik-data";
import type { UnifiedTask } from "@/lib/ubik-types";
import {
  formatScheduleLabel,
  formatTaskCode,
  formatTaskDate,
  getTaskDisplayStatus,
  getTaskStatus,
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
import { cn } from "@/lib/utils";

export default function Tasks() {
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
  const [taskSchedules, setTaskSchedules] = useState<Record<string, TaskScheduleDraft>>({});
  const today = startOfDay(new Date());

  const routeView = searchParams.get("view");
  const routeTaskId = searchParams.get("task");
  const visibleView: TaskCollectionView = isTaskCollectionView(routeView) ? routeView : "list";
  const viewMode: TaskViewMode = routeTaskId ? "detail" : visibleView;

  const updateSearchParams = (updates: { view?: TaskCollectionView | null; task?: string | null }) => {
    const nextParams = new URLSearchParams(searchParams);

    if ("view" in updates) {
      if (updates.view && updates.view !== "list") nextParams.set("view", updates.view);
      else nextParams.delete("view");
    }

    if ("task" in updates) {
      if (updates.task) nextParams.set("task", updates.task);
      else nextParams.delete("task");
    }

    setSearchParams(nextParams);
  };

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
    updateSearchParams({ task: nextTaskId, view: visibleView });
  };

  const allTasks = useMemo<TaskRecord[]>(
    () =>
      [...customTasks, ...unifiedTasks].map((task) => ({
        ...task,
        displayOwner: taskOwners[task.id] ?? task.owner,
        displayPriority: taskPriorityOverrides[task.id] ?? task.priority,
        displayStatus: getTaskDisplayStatus(
          task,
          today,
          checkedTaskIds.includes(task.id),
          taskSchedules[task.id] ?? null,
        ),
        displayProject: taskProjects[task.id] ?? task.project,
        isChecked: checkedTaskIds.includes(task.id),
        schedule: taskSchedules[task.id] ?? null,
        startDate: parseISO(task.timelineStart),
        endDate: parseISO(task.timelineEnd),
      })),
    [checkedTaskIds, customTasks, taskOwners, taskPriorityOverrides, taskProjects, taskSchedules, today],
  );

  const ownerOptions = useMemo(
    () => Array.from(new Set(["You", ...allTasks.map((task) => task.displayOwner)])).sort(),
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

  const setTaskSchedule = (taskId: string, schedule: TaskScheduleDraft) => {
    setTaskSchedules((existing) => ({ ...existing, [taskId]: schedule }));
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

  return (
    <div className="px-4 py-6 lg:px-8">
      <PageContainer className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <p className="section-label">Tasks</p>
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Keep follow-through clean</h1>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              A compact execution table for routed work, with kanban only when you actually need another lens.
            </p>
          </div>
        </div>

        {viewMode === "list" ? (
          <section className="surface-card overflow-hidden">
            <div className="border-b border-border/70 px-5 py-5">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex flex-col gap-1">
                  <h2 className="text-[2rem] font-semibold tracking-tight text-foreground">Execution list</h2>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Compact routed tasks across meetings, inbox, approvals, and workflows.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" type="button" variant="outline">
                        <FunnelIcon data-icon="inline-start" />
                        View
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onSelect={() => updateSearchParams({ view: "list", task: null })}>
                        List
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => updateSearchParams({ view: "kanban", task: null })}>
                        Kanban
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button size="sm" type="button">
                        <PlusIcon data-icon="inline-start" />
                        Add task
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-80">
                      <PopoverHeader className="px-0">
                        <PopoverTitle>Add task</PopoverTitle>
                        <PopoverDescription>Capture a new operator task without leaving the table.</PopoverDescription>
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
              </div>

              <div className="mt-5 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
                  <div className="relative w-full md:max-w-xs">
                    <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
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

            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={filteredTasks.length > 0 && filteredTasks.every((task) => task.isChecked)}
                      onCheckedChange={setVisibleTasksChecked}
                    />
                  </TableHead>
                  <TableHead className="w-32 text-muted-foreground">Task</TableHead>
                  <TableHead className="text-muted-foreground">Title</TableHead>
                  <TableHead className="w-44 text-muted-foreground">Status</TableHead>
                  <TableHead className="w-36 text-muted-foreground">Priority</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length ? (
                  filteredTasks.map((task, index) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <Checkbox
                          checked={task.isChecked}
                          className="rounded-[0.35rem]"
                          onCheckedChange={() => setTaskChecked(task.id)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-muted-foreground">
                        {formatTaskCode(task, index)}
                      </TableCell>
                      <TableCell className="max-w-0">
                        <button
                          className="w-full text-left"
                          onClick={() => updateSearchParams({ task: task.id, view: visibleView })}
                          type="button"
                        >
                          <div className="flex items-center gap-2">
                            <Badge className="px-2 py-0 text-[11px] font-medium" variant="outline">
                              {task.category}
                            </Badge>
                            <span className={cn("truncate text-sm text-foreground", task.isChecked && "text-muted-foreground line-through")}>
                              {task.title}
                            </span>
                          </div>
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {task.summary}
                          </p>
                        </button>
                      </TableCell>
                      <TableCell>
                        <TaskStatusLabel status={task.displayStatus} />
                      </TableCell>
                      <TableCell>
                        <TaskPriorityLabel priority={task.displayPriority} />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon-sm" type="button" variant="ghost">
                              <DotsThreeVerticalIcon />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Task actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                              <DropdownMenuItem onSelect={() => updateSearchParams({ task: task.id, view: visibleView })}>
                                Open detail
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => setTaskChecked(task.id)}>
                                {task.isChecked ? "Mark as active" : "Mark as complete"}
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => setTaskPriority(task.id, "High")}>
                                Raise priority
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell className="px-5 py-10 text-sm text-muted-foreground" colSpan={6}>
                      No tasks match the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </section>
        ) : null}

        {viewMode === "detail" ? (
          <div className="flex flex-col gap-4">
            {filteredTasks.map((task) => (
              <article
                key={task.id}
                className={cn(
                  "surface-card px-5 py-5",
                  task.id === selectedTask?.id && "border-primary/30 ring-1 ring-primary/10",
                  task.isChecked && "opacity-60",
                )}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={task.isChecked}
                    className="mt-1 rounded-[0.35rem]"
                    onCheckedChange={() => setTaskChecked(task.id)}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <button
                        className="min-w-0 flex-1 text-left"
                        onClick={() => updateSearchParams({ task: task.id, view: visibleView })}
                        type="button"
                      >
                        <h3 className={cn("text-[1.1rem] font-medium leading-tight text-foreground", task.isChecked && "line-through text-muted-foreground")}>
                          {task.title}
                        </h3>
                        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">{task.summary}</p>
                      </button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="size-8" size="icon-sm" type="button" variant="ghost">
                            <DotsThreeVerticalIcon />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Task actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuGroup>
                            <DropdownMenuItem onSelect={() => updateSearchParams({ task: task.id, view: visibleView })}>
                              Open detail
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setTaskChecked(task.id)}>
                              {task.isChecked ? "Mark as active" : "Mark as complete"}
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <TaskPriorityMenu
                        align="start"
                        onSelect={(value) => setTaskPriority(task.id, value)}
                        priority={task.displayPriority}
                        trigger={
                          <Button size="sm" type="button" variant="secondary">
                            <MinusIcon data-icon="inline-start" />
                            Set priority
                          </Button>
                        }
                      />
                      <span>{formatTaskDate(task)}</span>
                      <PriorityPill priority={task.displayPriority} />
                      <StatusBadge appearance={{ size: "sm", showIcon: true }} data={{ status: getTaskStatus(task) }} />
                    </div>

                    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
                      <div className="flex flex-wrap items-center gap-3">
                        <TaskOwner owner={task.displayOwner} />
                        <span>{task.displayProject}</span>
                        <span>{task.sourceLabel}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {task.schedule ? <span>{formatScheduleLabel(task.schedule)}</span> : null}
                        <CompactTaskActions
                          ownerOptions={ownerOptions}
                          onOwnerChange={(value) => setTaskOwner(task.id, value)}
                          onPriorityChange={(value) => setTaskPriority(task.id, value)}
                          onProjectChange={(value) => setTaskProject(task.id, value)}
                          onScheduleSave={(value) => setTaskSchedule(task.id, value)}
                          task={task}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {viewMode === "kanban" ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">Kanban view</p>
                <p className="text-xs text-muted-foreground">Operational buckets for active follow-through.</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" type="button" variant="outline">
                    <FunnelIcon data-icon="inline-start" />
                    View
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onSelect={() => updateSearchParams({ view: "list", task: null })}>
                    List
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => updateSearchParams({ view: "kanban", task: null })}>
                    Kanban
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                            "border border-border/70 bg-background p-3 shadow-sm",
                            task.isChecked && "opacity-60",
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={task.isChecked}
                              className="mt-1 rounded-[0.35rem]"
                              onCheckedChange={() => setTaskChecked(task.id)}
                            />
                            <div className="min-w-0 flex-1">
                              <button
                                className="w-full text-left"
                                onClick={() => updateSearchParams({ task: task.id, view: "kanban" })}
                                type="button"
                              >
                                <h3 className="text-sm font-medium text-foreground">{task.title}</h3>
                                <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{task.summary}</p>
                              </button>

                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                {column.key !== "done" ? <PriorityPill priority={task.displayPriority} className="px-2 py-0 text-[11px]" /> : null}
                                <span className="text-xs text-muted-foreground">{formatTaskDate(task)}</span>
                              </div>

                              <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                                <span className="truncate">{task.displayOwner}</span>
                                <span className="truncate">{task.displayProject}</span>
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
