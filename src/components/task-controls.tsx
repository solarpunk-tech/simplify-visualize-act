import { useState, type ComponentProps, type ReactNode } from "react";
import {
  ArrowUpIcon,
  CalendarBlankIcon,
  CaretDownIcon,
  CaretRightIcon,
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
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        priorityTone[priority].pill,
        className,
      )}
    >
      {priority === "None" ? "No priority" : priority}
    </span>
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
      {priority === "Urgent" || priority === "High" ? <ArrowUpIcon className="size-4 text-foreground" /> : null}
      {priority === "Medium" ? <CaretRightIcon className="size-4 text-muted-foreground" /> : null}
      {priority === "Low" ? <CaretDownIcon className="size-4 text-muted-foreground" /> : null}
      {priority === "None" ? <MinusIcon className="size-4 text-muted-foreground" /> : null}
      <span>{priority === "None" ? "None" : priority}</span>
    </span>
  );
}

function TaskOwner({ owner }: { owner: string }) {
  const contact = findContactCard(owner);

  return (
    <span className="inline-flex items-center gap-2">
      <Avatar className="size-8 border-border/70" size="sm">
        {contact?.avatarSrc ? <AvatarImage alt={owner} src={contact.avatarSrc} /> : null}
        <AvatarFallback>{getInitials(owner)}</AvatarFallback>
      </Avatar>
      <span className="truncate">{owner}</span>
    </span>
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
              <span className="inline-flex items-center gap-2">
                <span className={cn("h-3 w-3 rounded-[3px]", priorityTone[option.value].line)} />
                {option.label}
              </span>
              <DropdownMenuShortcut>{option.shortcut}</DropdownMenuShortcut>
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
              <ArrowUpIcon />
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
  TaskPriorityLabel,
  TaskPriorityMenu,
  TaskStatusLabel,
};
