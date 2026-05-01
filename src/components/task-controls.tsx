import { useState, type ComponentProps, type ReactNode } from "react";
import {
  CalendarBlankIcon,
  CaretRightIcon,
  CheckIcon,
  CheckCircleIcon,
  CircleIcon,
  FolderOpenIcon,
  MinusIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import { format } from "date-fns";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { projects } from "@/lib/ubik-data";
import { findContactCard, getInitials } from "@/lib/contact-helpers";
import {
  defaultScheduleDraft,
  priorityOptions,
  priorityTone,
  type TaskPriorityOption,
  type TaskRecord,
  type TaskScheduleDraft,
  type TaskStatusOption,
} from "@/lib/task-helpers";
import { cn } from "@/lib/utils";

function PriorityPill({
  priority,
  className,
}: {
  priority: TaskPriorityOption;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2 py-0.5 text-[11px] font-medium leading-none",
        priorityTone[priority].pill,
        className,
      )}
    >
      <TaskPriorityIcon className={cn("size-3.5 shrink-0", priorityTone[priority].icon)} priority={priority} />
      <span className={priorityTone[priority].label}>{priority === "None" ? "No priority" : priority}</span>
    </span>
  );
}

function TaskPriorityIcon({
  priority,
  className,
}: {
  priority: TaskPriorityOption;
  className?: string;
}) {
  if (priority === "Urgent") {
    return (
      <svg
        aria-hidden="true"
        className={className}
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path d="M3 1c-1.09 0-2 .91-2 2v10c0 1.09.91 2 2 2h10c1.09 0 2-.91 2-2V3c0-1.09-.91-2-2-2H3Zm4 3h2l-.246 4.998H7.25L7 4Zm2 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
      </svg>
    );
  }

  if (priority === "None") {
    return (
      <svg
        aria-hidden="true"
        className={className}
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <rect height={1.5} opacity={0.9} rx={0.5} width={3} x={1.5} y={7.25} />
        <rect height={1.5} opacity={0.9} rx={0.5} width={3} x={6.5} y={7.25} />
        <rect height={1.5} opacity={0.9} rx={0.5} width={3} x={11.5} y={7.25} />
      </svg>
    );
  }

  const opacityMap =
    priority === "High"
      ? [1, 1, 1]
      : priority === "Medium"
        ? [1, 1, 0.4]
        : [1, 0.4, 0.4];

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <rect fillOpacity={opacityMap[0]} height={6} rx={1} width={3} x={1.5} y={8} />
      <rect fillOpacity={opacityMap[1]} height={9} rx={1} width={3} x={6.5} y={5} />
      <rect fillOpacity={opacityMap[2]} height={12} rx={1} width={3} x={11.5} y={2} />
    </svg>
  );
}

function TaskStatusLabel({ status }: { status: TaskStatusOption }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-foreground">
      {status === "Done" ? <CheckCircleIcon className="size-4 text-primary" weight="regular" /> : null}
      {status === "In Progress" ? <MinusIcon className="size-4 text-support" /> : null}
      {status === "Todo" ? <CircleIcon className="size-4 text-muted-foreground" weight="regular" /> : null}
      {status === "Backlog" ? <CaretRightIcon className="size-4 text-muted-foreground" /> : null}
      <span>{status}</span>
    </span>
  );
}

function TaskPriorityLabel({ priority }: { priority: TaskPriorityOption }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-foreground">
      <TaskPriorityIcon className={cn("size-4 shrink-0", priorityTone[priority].icon)} priority={priority} />
      <span className={priorityTone[priority].label}>{priority === "None" ? "No priority" : priority}</span>
    </span>
  );
}

function TaskOwner({
  owner,
  showName = true,
  className,
  avatarClassName,
}: {
  owner: string;
  showName?: boolean;
  className?: string;
  avatarClassName?: string;
}) {
  const contact = findContactCard(owner);
  const secondaryLabel = contact ? `${contact.role} · ${contact.company}` : "Assignee";

  return (
    <HoverCard openDelay={120}>
      <HoverCardTrigger asChild>
        <button
          aria-label={`Assignee ${owner}`}
          className={cn("inline-flex min-w-0 items-center gap-2 text-left", className)}
          type="button"
        >
          <Avatar className={cn("size-8 border border-border/70 bg-background", avatarClassName)} size="sm">
            {contact?.avatarSrc ? <AvatarImage alt={owner} src={contact.avatarSrc} /> : null}
            <AvatarFallback>{getInitials(owner)}</AvatarFallback>
          </Avatar>
          {showName ? <span className="truncate">{owner}</span> : null}
        </button>
      </HoverCardTrigger>
      <HoverCardContent align="start" className="w-64 rounded-none border border-border/70 bg-background p-3">
        <div className="flex items-start gap-3">
          <Avatar className="size-10 border border-border/70 bg-background" size="default">
            {contact?.avatarSrc ? <AvatarImage alt={owner} src={contact.avatarSrc} /> : null}
            <AvatarFallback>{getInitials(owner)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{owner}</p>
            <p className="mt-1 text-xs text-muted-foreground">{secondaryLabel}</p>
            <p className="mt-3 section-label">Assigned to</p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

function TaskIconButton({
  label,
  children,
  className,
  ...props
}: ComponentProps<typeof Button> & { label: string; children: ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={label}
          className={cn("text-muted-foreground", className)}
          size="icon-sm"
          type="button"
          variant="ghost"
          {...props}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function TaskPriorityMenu({
  priority,
  onSelect,
  trigger,
  align = "end",
}: {
  priority: TaskPriorityOption;
  onSelect: (priority: TaskPriorityOption) => void;
  trigger: ReactNode;
  align?: "start" | "end" | "center";
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-56 p-1">
        <DropdownMenuLabel>Set priority</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {priorityOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              className={cn("justify-between", priority === option.value && "font-semibold text-primary")}
              onSelect={() => onSelect(option.value)}
            >
              <span className="inline-flex items-center gap-2 text-foreground">
                <TaskPriorityIcon className={cn("size-4 shrink-0", priorityTone[option.value].icon)} priority={option.value} />
                {option.label}
              </span>
              <span className="ml-auto inline-flex items-center gap-2 pl-3 text-xs text-muted-foreground">
                {priority === option.value ? <CheckIcon className="size-3.5 text-foreground" /> : null}
                <DropdownMenuShortcut>{option.shortcut}</DropdownMenuShortcut>
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CompactTaskActions({
  task,
  ownerOptions,
  onPriorityChange,
  onProjectChange,
  onOwnerChange,
  onScheduleSave,
}: {
  task: TaskRecord;
  ownerOptions: string[];
  onPriorityChange: (value: TaskPriorityOption) => void;
  onProjectChange: (value: string) => void;
  onOwnerChange: (value: string) => void;
  onScheduleSave: (value: TaskScheduleDraft) => void;
}) {
  const [draft, setDraft] = useState<TaskScheduleDraft>(
    task.schedule ?? {
      ...defaultScheduleDraft,
      date: format(task.endDate, "yyyy-MM-dd"),
    },
  );

  return (
    <div className="flex items-center gap-0.5">
      <TaskPriorityMenu
        priority={task.displayPriority}
        onSelect={onPriorityChange}
        trigger={
          <span>
            <TaskIconButton label="Set priority">
              <TaskPriorityIcon className="size-4" priority={task.displayPriority} />
            </TaskIconButton>
          </span>
        }
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <span>
            <TaskIconButton label="Add to project">
              <FolderOpenIcon />
            </TaskIconButton>
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Move to project</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {projects.slice(0, 6).map((project) => (
              <DropdownMenuItem key={project.id} onSelect={() => onProjectChange(project.name)}>
                {project.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <span>
            <TaskIconButton label="Assign">
              <UsersThreeIcon />
            </TaskIconButton>
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Assign task</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {ownerOptions.map((owner) => (
              <DropdownMenuItem key={owner} onSelect={() => onOwnerChange(owner)}>
                {owner}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Popover>
        <PopoverTrigger asChild>
          <span>
            <TaskIconButton label="Schedule">
              <CalendarBlankIcon />
            </TaskIconButton>
          </span>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72">
          <PopoverHeader className="px-0">
            <PopoverTitle>Schedule task</PopoverTitle>
            <PopoverDescription>Keep follow-through visible without creating a full workflow.</PopoverDescription>
          </PopoverHeader>
          <div className="mt-4 flex flex-col gap-3">
            <Tabs
              value={draft.cadence.toLowerCase()}
              onValueChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  cadence: value === "daily" ? "Daily" : value === "weekly" ? "Weekly" : "Once",
                }))
              }
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="once">Once</TabsTrigger>
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid grid-cols-2 gap-3">
              <Input
                type="date"
                value={draft.date}
                onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))}
              />
              <Input
                type="time"
                value={draft.time}
                onChange={(event) => setDraft((current) => ({ ...current, time: event.target.value }))}
              />
            </div>

            <Button className="w-full" onClick={() => onScheduleSave(draft)} type="button">
              Save schedule
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export {
  CompactTaskActions,
  PriorityPill,
  TaskIconButton,
  TaskOwner,
  TaskPriorityIcon,
  TaskPriorityLabel,
  TaskPriorityMenu,
  TaskStatusLabel,
};
