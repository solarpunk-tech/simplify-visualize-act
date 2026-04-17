import { format, parseISO, startOfDay } from "date-fns";

import type { UnifiedTask, UnifiedTaskPriority } from "@/lib/ubik-types";

export type TaskCollectionView = "list" | "kanban";
export type TaskViewMode = TaskCollectionView | "detail";
export type TaskStatusOption = "Backlog" | "Todo" | "In Progress" | "Done";
export type TaskStatusFilter = "All" | TaskStatusOption;
export type TaskPriorityOption = UnifiedTaskPriority | "None";
export type TaskPriorityFilter = "All" | TaskPriorityOption;

export type TaskScheduleDraft = {
  cadence: "Once" | "Daily" | "Weekly";
  date: string;
  time: string;
};

export type TaskRecord = UnifiedTask & {
  displayOwner: string;
  displayPriority: TaskPriorityOption;
  displayStatus: TaskStatusOption;
  displayProject: string;
  isChecked: boolean;
  schedule: TaskScheduleDraft | null;
  startDate: Date;
  endDate: Date;
};

export const taskCollectionViews: TaskCollectionView[] = ["list", "kanban"];

export const priorityOptions: { value: TaskPriorityOption; label: string; shortcut: string }[] = [
  { value: "None", label: "No priority", shortcut: "0" },
  { value: "Urgent", label: "Urgent", shortcut: "1" },
  { value: "High", label: "High", shortcut: "2" },
  { value: "Medium", label: "Medium", shortcut: "3" },
  { value: "Low", label: "Low", shortcut: "4" },
];

export const priorityTone: Record<
  TaskPriorityOption,
  {
    pill: string;
    line: string;
    bar: string;
  }
> = {
  None: {
    pill: "border-border/80 bg-background text-muted-foreground",
    line: "bg-border",
    bar: "bg-border",
  },
  Urgent: {
    pill: "border-destructive/20 bg-destructive/10 text-destructive",
    line: "bg-destructive",
    bar: "bg-destructive",
  },
  High: {
    pill: "border-primary/20 bg-primary/10 text-primary",
    line: "bg-primary",
    bar: "bg-primary",
  },
  Medium: {
    pill: "border-support/25 bg-support/15 text-support-foreground",
    line: "bg-support",
    bar: "bg-support",
  },
  Low: {
    pill: "border-border bg-secondary text-secondary-foreground",
    line: "bg-muted-foreground/50",
    bar: "bg-muted-foreground/50",
  },
};

export const defaultScheduleDraft: TaskScheduleDraft = {
  cadence: "Weekly",
  date: new Date().toISOString().slice(0, 10),
  time: "09:00",
};

export const statusOptions: TaskStatusOption[] = ["Backlog", "Todo", "In Progress", "Done"];

export function isTaskCollectionView(value: string | null): value is TaskCollectionView {
  return value !== null && taskCollectionViews.includes(value as TaskCollectionView);
}

export function formatScheduleLabel(schedule: TaskScheduleDraft | null) {
  if (!schedule) return null;
  const date = new Date(`${schedule.date}T${schedule.time}`);
  return `${schedule.cadence} · ${format(date, "d MMM")} · ${schedule.time}`;
}

export function formatTaskDate(task: TaskRecord) {
  if (task.dueLabel && task.dueLabel !== "No deadline") return task.dueLabel;
  return format(task.endDate, "d MMM yyyy");
}

export function isScheduledTask(task: TaskRecord, today: Date) {
  return Boolean(task.schedule) || startOfDay(task.startDate) > today;
}

export function getTaskDisplayStatus(task: UnifiedTask, today: Date, isChecked: boolean, schedule: TaskScheduleDraft | null) {
  if (isChecked) return "Done" as const;
  if (schedule || startOfDay(parseISO(task.timelineStart)) > today) return "Todo" as const;
  if (task.section === "Today") return "In Progress" as const;
  return "Backlog" as const;
}

export function getTaskStatus(task: TaskRecord) {
  if (task.isChecked) return "success" as const;
  if (task.displayStatus === "In Progress") return "processing" as const;
  if (task.displayStatus === "Todo") return "pending" as const;
  return "shipped" as const;
}

export function formatTaskCode(task: TaskRecord, index: number) {
  const clean = task.id.replace(/[^a-z0-9]/gi, "").toUpperCase();
  return `TASK-${clean.slice(-4) || `${index + 1000}`}`;
}
