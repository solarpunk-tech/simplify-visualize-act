import { useMemo, useState, type ComponentType, type SVGProps } from "react";
import { format, parseISO, startOfDay } from "date-fns";
import {
  BooksIcon,
  CaretDownIcon,
  CaretRightIcon,
  CheckCircleIcon,
  ChatsIcon,
  EnvelopeSimpleIcon,
  FilesIcon,
  FolderOpenIcon,
  MinusIcon,
  NotePencilIcon,
  RadioButtonIcon,
  SparkleIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

import { PageContainer } from "@/components/page-container";
import { CompactTaskActions, PriorityPill, TaskOwner, TaskStatusLabel } from "@/components/task-controls";
import { Drive } from "@/components/ui/svgs/drive";
import { Gmail } from "@/components/ui/svgs/gmail";
import { GoogleCalendar } from "@/components/ui/svgs/googleCalendar";
import { Salesforce } from "@/components/ui/svgs/salesforce";
import { Slack } from "@/components/ui/svgs/slack";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { useWorkbenchState } from "@/hooks/use-shell-state";
import {
  approvals,
  contactCards,
  homeActivityFeed,
  homeUsageOverview,
  inboxThreads,
  meetings,
  unifiedTasks,
  workflowRuns,
} from "@/lib/ubik-data";
import {
  formatScheduleLabel,
  formatTaskDate,
  getTaskDisplayStatus,
  type TaskPriorityOption,
  type TaskRecord,
  type TaskScheduleDraft,
} from "@/lib/task-helpers";
import type { HomeUsageTrend, UnifiedTask } from "@/lib/ubik-types";
import { cn } from "@/lib/utils";

type BriefSourceKey = "calendar" | "gmail" | "slack" | "drive" | "salesforce" | "workspace";

type BriefChip = {
  id: string;
  source: BriefSourceKey;
  label: string;
  href: string;
  meta?: string;
};

type BriefNarrative = {
  id: string;
  source: BriefSourceKey;
  title: string;
  body: string;
  owner: string;
  href: string;
  meta: string;
};

type MorningBriefViewModel = {
  todayLabel: string;
  headline: string;
  summary: string;
  metricsLabel: string;
  collapsedChips: BriefChip[];
  narratives: BriefNarrative[];
  tasks: UnifiedTask[];
  taskCount: number;
};

type BriefDocumentLink = {
  id: string;
  source: BriefSourceKey;
  label: string;
  href: string;
  meta?: string;
};

type BriefDocumentEntry = {
  id: string;
  source: BriefSourceKey;
  title: string;
  body: string;
  href: string;
  meta: string;
  owner?: string;
  tone?: "alert";
  links: BriefDocumentLink[];
};

type HomeTaskPreviewGroup = {
  id: string;
  title: string;
  tasks: TaskRecord[];
  totalCount: number;
  emptyLabel: string;
};

const contactCardByName = new Map(contactCards.map((contact) => [contact.name.toLowerCase(), contact]));

const sourceMeta: Record<
  BriefSourceKey,
  {
    label: string;
    Graphic: ComponentType<SVGProps<SVGSVGElement>>;
  }
> = {
  calendar: { label: "Google Calendar", Graphic: GoogleCalendar },
  gmail: { label: "Gmail", Graphic: Gmail },
  slack: { label: "Slack", Graphic: Slack },
  drive: { label: "Drive", Graphic: Drive },
  salesforce: { label: "Salesforce", Graphic: Salesforce },
  workspace: { label: "Ubik", Graphic: BooksIcon },
};

function getGreetingLabel() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatTimeLabel(value: string) {
  const [, time = value] = value.split("·");
  return time.replace("PST", "").trim();
}

function getSourceForFeedItem(item: (typeof homeActivityFeed)[number]): BriefSourceKey {
  if (item.type === "meeting") return "calendar";
  if (item.type === "approval") return "salesforce";
  if (item.type === "artifact") return "drive";
  return item.source === "Inbox" ? "slack" : "workspace";
}

function getSourceForThread(thread: (typeof inboxThreads)[number]): BriefSourceKey {
  if (thread.source === "Slack") return "slack";
  if (thread.source === "Email") return "gmail";
  return "workspace";
}

function getBriefSourceForTask(task: UnifiedTask): BriefSourceKey {
  if (task.source === "meetings") return "calendar";
  if (task.source === "approvals") return "salesforce";
  if (task.source === "inbox") return "gmail";
  if (task.source === "workflows") return "drive";
  return "workspace";
}

function getSourceForApproval(workflow: string) {
  return workflow.toLowerCase().includes("sales") ? ("salesforce" as const) : ("drive" as const);
}

function getContactCard(owner: string) {
  return (
    contactCardByName.get(owner.toLowerCase()) ??
    contactCards.find((contact) => owner.toLowerCase().includes(contact.name.toLowerCase().split(" ")[0]))
  );
}

function getInitials(value: string) {
  return value
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function truncateMeta(value: string) {
  return value.length > 42 ? `${value.slice(0, 39)}...` : value;
}

const briefShellClass =
  "rounded-none border border-border/80 bg-card shadow-[0_1px_0_hsl(var(--foreground)/0.04),0_24px_60px_hsl(var(--foreground)/0.08)]";

const briefPanelClass = "rounded-none border border-border/70 bg-card shadow-sm";

const briefInteractivePanelClass =
  "rounded-none border border-border/70 bg-card transition-colors duration-200 hover:border-primary/35 hover:bg-primary/[0.03] motion-reduce:transition-none";

const briefMetaClass = "text-xs text-muted-foreground";

function BriefSourcePill({
  source,
  label,
  meta,
  compact = false,
}: {
  source: BriefSourceKey;
  label?: string;
  meta?: string;
  compact?: boolean;
}) {
  const metaInfo = sourceMeta[source];
  const Graphic = metaInfo.Graphic;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-none border border-border bg-background px-2.5 py-1 text-xs text-foreground",
        compact && "px-2 py-0.5 text-[11px]",
      )}
    >
      <Graphic className={cn("size-4 shrink-0", compact && "size-3.5")} />
      <span className="truncate">{label ?? metaInfo.label}</span>
      {meta ? <span className="truncate text-muted-foreground">· {meta}</span> : null}
    </span>
  );
}

function ContactBadge({ owner }: { owner: string }) {
  const contact = getContactCard(owner);

  return (
    <div className="inline-flex items-center gap-2 rounded-none border border-border bg-secondary px-2 py-1 text-xs text-muted-foreground">
      <Avatar size="sm">
        {contact?.avatarSrc ? <AvatarImage alt={contact.name} src={contact.avatarSrc} /> : null}
        <AvatarFallback>{getInitials(contact?.name ?? owner)}</AvatarFallback>
      </Avatar>
      <span className="truncate">{owner}</span>
    </div>
  );
}

function TrendChip({ trend }: { trend?: HomeUsageTrend }) {
  if (!trend) return null;

  const tone = trend.tone ?? (trend.direction === "up" ? "positive" : trend.direction === "down" ? "negative" : "neutral");
  const Icon = trend.direction === "up" ? CaretDownIcon : trend.direction === "down" ? CaretDownIcon : MinusIcon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium",
        tone === "positive" && "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        tone === "negative" && "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
        tone === "neutral" && "border-border/70 bg-muted/60 text-muted-foreground",
      )}
    >
      <Icon className={cn("h-3 w-3", trend.direction === "up" && "rotate-180")} />
      <span>{trend.label}</span>
    </span>
  );
}

function UsageActivityGrid() {
  const rows = Array.from({ length: 4 }, (_, rowIndex) =>
    homeUsageOverview.activity.slice(rowIndex * 12, rowIndex * 12 + 12),
  );

  return (
    <div className="space-y-1">
      {rows.map((row, rowIndex) => (
        <div key={`usage-row-${rowIndex}`} className="grid grid-cols-12 gap-1">
          {row.map((day) => (
            <div
              key={day.id}
              aria-label={`${day.label}: level ${day.level}`}
              className={cn(
                "h-4 border border-border/55",
                day.level === 0 && "bg-muted/50",
                day.level === 1 && "bg-primary/16",
                day.level === 2 && "bg-primary/28",
                day.level === 3 && "bg-primary/48",
                day.level === 4 && "bg-primary",
              )}
              title={`${day.label}: level ${day.level}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function CompactUsageStatCard({
  label,
  value,
  detail,
  trend,
}: {
  label: string;
  value: string;
  detail: string;
  trend?: HomeUsageTrend;
}) {
  return (
    <div className="flex min-h-[7.25rem] flex-col justify-between border border-border/70 bg-card px-3 py-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] leading-5 text-muted-foreground">{label}</p>
        <TrendChip trend={trend} />
      </div>
      <div className="space-y-1.5">
        <p className="text-[1.65rem] font-semibold tracking-tight text-foreground">{value}</p>
        <p className="text-xs leading-5 text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}

function HomeUsageSecondaryStat({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend?: HomeUsageTrend;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border border-border/70 bg-background px-3 py-2">
      <div>
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
      </div>
      <TrendChip trend={trend} />
    </div>
  );
}

function CompactUsageCard() {
  const primaryStats = homeUsageOverview.stats.slice(0, 2).concat(homeUsageOverview.stats.slice(4, 6));
  const secondaryStats = homeUsageOverview.stats.slice(2, 4);

  return (
    <Card size="sm" className="surface-card overflow-hidden">
      <CardHeader className="border-b border-border/60 pb-3">
        <div className="space-y-0.5">
          <p className="section-label">Usage intelligence</p>
          <CardTitle className="text-lg">Operator leverage</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Compact operating outcomes from briefing, approvals, and execution coverage.
          </CardDescription>
        </div>
        <CardAction>
          <Badge variant="outline" className="rounded-none border-border bg-secondary px-2 py-1 text-foreground">
            Overview
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3 py-4">
        <div className="grid gap-2 sm:grid-cols-2">
          {primaryStats.map((stat) => (
            <CompactUsageStatCard key={stat.id} detail={stat.detail} label={stat.label} trend={stat.trend} value={stat.value} />
          ))}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {secondaryStats.map((stat) => (
            <HomeUsageSecondaryStat key={stat.id} label={stat.label} trend={stat.trend} value={stat.value} />
          ))}
        </div>
        <div className="border border-border/70 bg-card px-3 py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="section-label">Operational intensity</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Briefing, approvals, pricing escalation, and workflow intervention.
              </p>
            </div>
            <Badge variant="outline" className="rounded-none">
              Last 7 weeks
            </Badge>
          </div>
          <div className="mt-3">
            <UsageActivityGrid />
          </div>
          <div className="mt-3 border-t border-border/70 pt-2.5">
            <p className="text-xs leading-5 text-muted-foreground">{homeUsageOverview.footer}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BriefDocumentLinkChip({
  link,
  onOpen,
}: {
  link: BriefDocumentLink;
  onOpen: (href: string) => void;
}) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-none border border-border bg-background px-2.5 py-1 text-xs text-foreground transition-colors hover:border-primary/30 hover:bg-primary/[0.04]"
      onClick={() => onOpen(link.href)}
    >
      <BriefSourcePill compact source={link.source} label={link.label} meta={link.meta} />
    </button>
  );
}

function BriefDocumentEntryCard({
  entry,
  onOpen,
}: {
  entry: BriefDocumentEntry;
  onOpen: (href: string) => void;
}) {
  return (
    <article
      className={cn(
        "border-b border-border/60 py-3 last:border-b-0",
        entry.tone === "alert" && "border-primary/20",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <BriefSourcePill compact source={entry.source} />
            <span className={briefMetaClass}>{entry.meta}</span>
            {entry.tone === "alert" ? (
              <Badge variant="outline" className="rounded-none border-primary/25 bg-primary/[0.06] text-primary">
                Attention
              </Badge>
            ) : null}
          </div>
          <button
            type="button"
            className="mt-2 text-left"
            onClick={() => onOpen(entry.href)}
          >
            <p className="font-heading text-base font-medium text-foreground transition-colors hover:text-primary">
              {entry.title}
            </p>
          </button>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{entry.body}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {entry.owner ? <ContactBadge owner={entry.owner} /> : null}
            {entry.links.map((link) => (
              <BriefDocumentLinkChip key={link.id} link={link} onOpen={onOpen} />
            ))}
          </div>
        </div>
        <button
          type="button"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-none border border-border bg-background text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
          onClick={() => onOpen(entry.href)}
        >
          <CaretRightIcon className="size-4" />
        </button>
      </div>
    </article>
  );
}

function MorningBriefDocumentSection({
  label,
  title,
  summary,
  badge,
  children,
}: {
  label: string;
  title: string;
  summary: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 border-t border-border/70 pt-5 first:border-t-0 first:pt-0">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <p className="section-label">{label}</p>
          <p className="font-heading text-lg font-medium text-foreground">{title}</p>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{summary}</p>
        </div>
        {badge ? <div className="w-fit">{badge}</div> : null}
      </div>
      <div>{children}</div>
    </section>
  );
}

function HomeTaskActivityPanel({ task }: { task: TaskRecord }) {
  const scheduleLabel = formatScheduleLabel(task.schedule);

  return (
    <div className="grid gap-2 md:grid-cols-3">
      <div className="border border-border/70 bg-background px-3 py-2.5">
        <p className="section-label">Status</p>
        <div className="mt-1.5">
          <TaskStatusLabel status={task.displayStatus} />
        </div>
      </div>
      <div className="border border-border/70 bg-background px-3 py-2.5">
        <p className="section-label">Due window</p>
        <p className="mt-1.5 text-sm text-foreground">{scheduleLabel ?? formatTaskDate(task)}</p>
      </div>
      <div className="border border-border/70 bg-background px-3 py-2.5">
        <p className="section-label">Route</p>
        <p className="mt-1.5 text-sm text-foreground">{task.sourceLabel}</p>
      </div>
    </div>
  );
}

function HomeTaskSmartLinks({
  links,
  onOpen,
}: {
  links: BriefDocumentLink[];
  onOpen: (href: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => (
        <BriefDocumentLinkChip key={link.id} link={link} onOpen={onOpen} />
      ))}
    </div>
  );
}

function HomeTaskPreviewRow({
  task,
  isOpen,
  onOpenChange,
  onNavigate,
  ownerOptions,
  smartLinks,
  onPriorityChange,
  onProjectChange,
  onOwnerChange,
  onScheduleSave,
  onToggleChecked,
}: {
  task: TaskRecord;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (href: string) => void;
  ownerOptions: string[];
  smartLinks: BriefDocumentLink[];
  onPriorityChange: (value: TaskPriorityOption) => void;
  onProjectChange: (value: string) => void;
  onOwnerChange: (value: string) => void;
  onScheduleSave: (value: TaskScheduleDraft) => void;
  onToggleChecked: () => void;
}) {
  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <div className="border-b border-border/50 last:border-b-0">
        <div className="flex items-start gap-3 py-3">
          <Checkbox
            checked={task.isChecked}
            className="mt-0.5 rounded-[0.35rem]"
            onCheckedChange={onToggleChecked}
          />
          <CollapsibleTrigger asChild>
            <button type="button" className="group/task flex min-w-0 flex-1 items-start justify-between gap-3 text-left">
              <div className="min-w-0 flex-1">
                <p className={cn("truncate text-sm font-medium text-foreground transition-colors group-hover/task:text-primary", task.isChecked && "text-muted-foreground line-through")}>
                  {task.title}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>{task.displayProject}</span>
                  <span>{task.displayOwner}</span>
                  <span>{formatTaskDate(task)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <PriorityPill priority={task.displayPriority} className="px-2 py-0 text-[11px]" />
                <CaretDownIcon className={cn("size-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
              </div>
            </button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down motion-reduce:data-[state=closed]:animate-none motion-reduce:data-[state=open]:animate-none">
          <div className="space-y-4 border-t border-border/60 pb-4 pt-4">
            <div className="space-y-2">
              <p className="section-label">Description</p>
              <p className="text-sm leading-6 text-muted-foreground">{task.summary}</p>
            </div>

            <HomeTaskActivityPanel task={task} />

            <div className="space-y-2">
              <p className="section-label">Linked context</p>
              <HomeTaskSmartLinks links={smartLinks} onOpen={onNavigate} />
            </div>

            <div className="flex flex-col gap-3 border-t border-border/60 pt-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <TaskOwner owner={task.displayOwner} />
                <span>{task.displayProject}</span>
                <span>{task.sourceLabel}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <CompactTaskActions
                  ownerOptions={ownerOptions}
                  onOwnerChange={onOwnerChange}
                  onPriorityChange={onPriorityChange}
                  onProjectChange={onProjectChange}
                  onScheduleSave={onScheduleSave}
                  task={task}
                />
                <Button className="rounded-none" onClick={() => onNavigate(task.href)} size="sm" type="button" variant="outline">
                  Open in Tasks
                </Button>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

function HomeTaskPreviewSection({
  group,
  expandedTaskId,
  setExpandedTaskId,
  ownerOptions,
  getTaskLinks,
  onNavigate,
  onPriorityChange,
  onProjectChange,
  onOwnerChange,
  onScheduleSave,
  onToggleChecked,
}: {
  group: HomeTaskPreviewGroup;
  expandedTaskId: string | null;
  setExpandedTaskId: (taskId: string | null) => void;
  ownerOptions: string[];
  getTaskLinks: (task: TaskRecord) => BriefDocumentLink[];
  onNavigate: (href: string) => void;
  onPriorityChange: (taskId: string, value: TaskPriorityOption) => void;
  onProjectChange: (taskId: string, value: string) => void;
  onOwnerChange: (taskId: string, value: string) => void;
  onScheduleSave: (taskId: string, value: TaskScheduleDraft) => void;
  onToggleChecked: (taskId: string) => void;
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-2">
        <p className="text-sm font-medium text-foreground">{group.title}</p>
        <span className="text-xs text-muted-foreground">{group.totalCount}</span>
      </div>
      {group.tasks.length ? (
        <div>
          {group.tasks.map((task) => (
            <HomeTaskPreviewRow
              key={task.id}
              isOpen={expandedTaskId === task.id}
              onNavigate={onNavigate}
              onOpenChange={(open) => setExpandedTaskId(open ? task.id : null)}
              onOwnerChange={(value) => onOwnerChange(task.id, value)}
              onPriorityChange={(value) => onPriorityChange(task.id, value)}
              onProjectChange={(value) => onProjectChange(task.id, value)}
              onScheduleSave={(value) => onScheduleSave(task.id, value)}
              onToggleChecked={() => onToggleChecked(task.id)}
              ownerOptions={ownerOptions}
              smartLinks={getTaskLinks(task)}
              task={task}
            />
          ))}
        </div>
      ) : (
        <p className="py-4 text-sm text-muted-foreground">{group.emptyLabel}</p>
      )}
    </section>
  );
}

function HomeTaskPreviewCard({
  groups,
  totalCount,
  expandedTaskId,
  setExpandedTaskId,
  ownerOptions,
  getTaskLinks,
  onNavigate,
  onPriorityChange,
  onProjectChange,
  onOwnerChange,
  onScheduleSave,
  onToggleChecked,
}: {
  groups: HomeTaskPreviewGroup[];
  totalCount: number;
  expandedTaskId: string | null;
  setExpandedTaskId: (taskId: string | null) => void;
  ownerOptions: string[];
  getTaskLinks: (task: TaskRecord) => BriefDocumentLink[];
  onNavigate: (href: string) => void;
  onPriorityChange: (taskId: string, value: TaskPriorityOption) => void;
  onProjectChange: (taskId: string, value: string) => void;
  onOwnerChange: (taskId: string, value: string) => void;
  onScheduleSave: (taskId: string, value: TaskScheduleDraft) => void;
  onToggleChecked: (taskId: string) => void;
}) {
  return (
    <Card size="sm" className="surface-card overflow-hidden">
      <CardHeader className="border-b border-border/60 pb-3">
        <div className="space-y-0.5">
          <p className="section-label">Task list</p>
          <CardTitle className="text-lg">Execution queue</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Expand a routed task to inspect context, reassign, reprioritize, or schedule without leaving Home.
          </CardDescription>
        </div>
        <CardAction className="flex items-center gap-2">
          <Badge variant="outline" className="rounded-none border-border bg-secondary px-2 py-1 text-foreground">
            {totalCount} active
          </Badge>
          <Button className="rounded-none" onClick={() => onNavigate("/tasks")} size="sm" type="button" variant="outline">
            Open tasks
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-5 py-4">
        {groups.map((group) => (
          <HomeTaskPreviewSection
            key={group.id}
            expandedTaskId={expandedTaskId}
            getTaskLinks={getTaskLinks}
            group={group}
            onNavigate={onNavigate}
            onOwnerChange={onOwnerChange}
            onPriorityChange={onPriorityChange}
            onProjectChange={onProjectChange}
            onScheduleSave={onScheduleSave}
            onToggleChecked={onToggleChecked}
            ownerOptions={ownerOptions}
            setExpandedTaskId={setExpandedTaskId}
          />
        ))}
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [isMorningBriefOpen, setIsMorningBriefOpen] = useWorkbenchState<boolean>("home-morning-brief-open", false);
  const [checkedTaskIds, setCheckedTaskIds] = useState<string[]>([]);
  const [taskPriorityOverrides, setTaskPriorityOverrides] = useState<Record<string, TaskPriorityOption>>({});
  const [taskProjects, setTaskProjects] = useState<Record<string, string>>({});
  const [taskOwners, setTaskOwners] = useState<Record<string, string>>({});
  const [taskSchedules, setTaskSchedules] = useState<Record<string, TaskScheduleDraft>>({});
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const today = startOfDay(new Date());

  const urgentApprovals = approvals.filter((item) => item.status === "Urgent").length;

  const morningBriefViewModel = useMemo<MorningBriefViewModel>(() => {
    const todayLabel = new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    }).format(new Date());

    const upcomingMeetings = meetings.filter((meeting) => meeting.stage === "Upcoming");
    const completedBrief = meetings.find((meeting) => meeting.title === "Morning operator brief");
    const topFeedItems = homeActivityFeed.slice(0, 4);
    const topArtifact = topFeedItems.find((item) => item.type === "artifact");
    const topApproval = approvals[0];
    const surfacedTasks = unifiedTasks.slice(0, 5);

    const collapsedChips: BriefChip[] = [
      ...(upcomingMeetings[0]
        ? [
            {
              id: `chip-${upcomingMeetings[0].id}`,
              source: "calendar" as const,
              label: upcomingMeetings[0].title,
              meta: formatTimeLabel(upcomingMeetings[0].time),
              href: `/meetings/${upcomingMeetings[0].id}`,
            },
          ]
        : []),
      ...(urgentApprovals
        ? [
            {
              id: "chip-approvals",
              source: "salesforce" as const,
              label: `${urgentApprovals} urgent approval${urgentApprovals === 1 ? "" : "s"}`,
              href: "/approvals",
            },
          ]
        : []),
      ...(topArtifact
        ? [
            {
              id: `chip-${topArtifact.id}`,
              source: "drive" as const,
              label: topArtifact.title,
              href: "/workflows",
            },
          ]
        : []),
    ].slice(0, 3);

    const narratives: BriefNarrative[] = [
      ...(completedBrief
        ? [
            {
              id: completedBrief.id,
              source: "calendar" as const,
              title: completedBrief.title,
              body: completedBrief.summary,
              owner: completedBrief.owner,
              href: `/meetings/${completedBrief.id}`,
              meta: completedBrief.time,
            },
          ]
        : []),
      ...topFeedItems.map((item) => ({
        id: item.id,
        source: getSourceForFeedItem(item),
        title: item.title,
        body: item.insight,
        owner: item.owner,
        href:
          item.linkedMeetingId
            ? `/meetings/${item.linkedMeetingId}`
            : item.linkedThreadId
              ? `/inbox/${item.linkedThreadId}`
              : item.type === "artifact"
                ? "/workflows"
                : item.type === "approval"
                  ? "/approvals"
                  : "/inbox",
        meta: item.time,
      })),
    ].slice(0, 5);

    const headline = `${getGreetingLabel()}, Hemanth.`;
    const metricsLabel = `${upcomingMeetings.length} meeting${upcomingMeetings.length === 1 ? "" : "s"} before noon · ${urgentApprovals} urgent approval${urgentApprovals === 1 ? "" : "s"} · ${unifiedTasks.length} tasks detected`;
    const summary = [
      topApproval ? `${topApproval.title} should clear first.` : null,
      upcomingMeetings[0] ? `${upcomingMeetings[0].title} is next at ${formatTimeLabel(upcomingMeetings[0].time)}.` : null,
      `${unifiedTasks.length} follow-through items are already linked across inbox, meetings, approvals, and workflows.`,
    ]
      .filter(Boolean)
      .join(" ");

    return {
      todayLabel,
      headline,
      summary,
      metricsLabel,
      collapsedChips,
      narratives,
      tasks: surfacedTasks,
      taskCount: unifiedTasks.length,
    };
  }, [urgentApprovals]);

  const allHomeTasks = useMemo<TaskRecord[]>(
    () =>
      unifiedTasks.map((task) => ({
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
    [checkedTaskIds, taskOwners, taskPriorityOverrides, taskProjects, taskSchedules, today],
  );

  const ownerOptions = useMemo(
    () => Array.from(new Set(["You", ...allHomeTasks.map((task) => task.displayOwner)])).sort(),
    [allHomeTasks],
  );

  const getTaskLinks = (task: TaskRecord): BriefDocumentLink[] => {
    const source = getBriefSourceForTask(task);
    const baseLinks: BriefDocumentLink[] = [
      {
        id: `${task.id}-source`,
        source,
        label: task.sourceLabel,
        href: task.originHref,
        meta: task.category,
      },
      {
        id: `${task.id}-project`,
        source: "workspace",
        label: task.displayProject,
        href: "/projects",
        meta: "Project context",
      },
    ];

    if (task.source === "approvals") {
      baseLinks.push({
        id: `${task.id}-approval`,
        source: "salesforce",
        label: "Approval queue",
        href: "/approvals",
        meta: task.displayPriority,
      });
    } else if (task.source === "meetings") {
      baseLinks.push({
        id: `${task.id}-meeting`,
        source: "calendar",
        label: "Meeting brief",
        href: "/meetings",
        meta: formatTaskDate(task),
      });
    } else if (task.source === "inbox") {
      baseLinks.push({
        id: `${task.id}-thread`,
        source,
        label: "Active thread",
        href: "/inbox",
        meta: "Needs reply",
      });
    } else {
      baseLinks.push({
        id: `${task.id}-artifact`,
        source: "drive",
        label: "Linked artifact",
        href: task.originHref,
        meta: "Reference",
      });
    }

    return baseLinks.slice(0, 3);
  };

  const preReadEntries = useMemo<BriefDocumentEntry[]>(
    () =>
      meetings
        .filter((meeting) => meeting.stage === "Upcoming")
        .map((meeting) => ({
          id: `pre-read-${meeting.id}`,
          source: "calendar" as const,
          title: meeting.title,
          body: meeting.summary,
          href: `/meetings/${meeting.id}`,
          meta: meeting.time,
          owner: meeting.owner,
          links: [
            {
              id: `${meeting.id}-calendar`,
              source: "calendar" as const,
              label: "Calendar hold",
              href: `/meetings/${meeting.id}`,
              meta: formatTimeLabel(meeting.time),
            },
            {
              id: `${meeting.id}-participants`,
              source: "workspace" as const,
              label: meeting.participants[1] ?? "Meeting packet",
              href: "/projects",
              meta: `${meeting.agenda.length} agenda items`,
            },
          ],
        })),
    [],
  );

  const followUpEntries = useMemo<BriefDocumentEntry[]>(
    () =>
      inboxThreads
        .filter(
          (thread) =>
            thread.followUpStatus === "due_soon" ||
            thread.followUpStatus === "blocked_by_approval" ||
            thread.priorityBand === "needs_attention",
        )
        .slice(0, 4)
        .map((thread) => ({
          id: `followup-${thread.id}`,
          source: getSourceForThread(thread),
          title: thread.subject,
          body: thread.preview,
          href: `/inbox/${thread.id}`,
          meta: thread.time,
          owner: thread.owner,
          tone: thread.priority === "Critical" ? "alert" : undefined,
          links: [
            {
              id: `${thread.id}-source`,
              source: getSourceForThread(thread),
              label: thread.source,
              href: `/inbox/${thread.id}`,
              meta: thread.dueRisk,
            },
            {
              id: `${thread.id}-project`,
              source: "workspace" as const,
              label: truncateMeta(thread.project),
              href: "/projects",
              meta: "Linked workstream",
            },
          ],
        })),
    [],
  );

  const taskDocumentEntries = useMemo<BriefDocumentEntry[]>(
    () =>
      allHomeTasks.slice(0, 4).map((task) => ({
        id: `brief-task-${task.id}`,
        source: getBriefSourceForTask(task),
        title: task.title,
        body: `${task.displayOwner} owns the next move across ${task.sourceLabel.toLowerCase()} and linked work.`,
        href: task.href,
        meta: formatTaskDate(task),
        owner: task.displayOwner,
        tone: task.displayPriority === "Urgent" ? "alert" : undefined,
        links: getTaskLinks(task),
      })),
    [allHomeTasks],
  );

  const approvalEntries = useMemo<BriefDocumentEntry[]>(
    () => [
      ...approvals.slice(0, 3).map((approval) => ({
        id: `approval-card-${approval.id}`,
        source: getSourceForApproval(approval.workflow),
        title: approval.title,
        body: approval.recommendation,
        href: "/approvals",
        meta: `${approval.confidence}% confidence`,
        tone: approval.status === "Urgent" ? "alert" : undefined,
        links: [
          {
            id: `${approval.id}-workflow`,
            source: getSourceForApproval(approval.workflow),
            label: approval.workflow,
            href: "/approvals",
            meta: approval.status,
          },
          {
            id: `${approval.id}-trace`,
            source: "drive" as const,
            label: "Packet trace",
            href: "/approvals",
            meta: "Editable output",
          },
        ],
      })),
      ...workflowRuns
        .filter((run) => run.status === "Awaiting approval")
        .slice(0, 1)
        .map((run) => ({
          id: `approval-run-${run.id}`,
          source: "workspace" as const,
          title: run.name,
          body: run.summary,
          href: "/workflows",
          meta: run.startedAt,
          tone: "alert" as const,
          links: [
            {
              id: `${run.id}-workspace`,
              source: "workspace" as const,
              label: run.owner,
              href: "/workflows",
              meta: run.status,
            },
            {
              id: `${run.id}-artifact`,
              source: "drive" as const,
              label: "Generated artifact",
              href: "/workflows",
            },
          ],
        })),
    ],
    [],
  );

  const homeTaskPreviewGroups = useMemo<HomeTaskPreviewGroup[]>(
    () => {
      const todayTasks = allHomeTasks.filter((task) => task.section === "Today");
      const noDeadlineTasks = allHomeTasks.filter((task) => task.section === "No deadline");

      return [
        {
          id: "today",
          title: "Today",
          tasks: todayTasks.slice(0, 3),
          totalCount: todayTasks.length,
          emptyLabel: "No tasks due today.",
        },
        {
          id: "no-deadline",
          title: "No deadline",
          tasks: noDeadlineTasks.slice(0, 2),
          totalCount: noDeadlineTasks.length,
          emptyLabel: "No open backlog items right now.",
        },
      ];
    },
    [allHomeTasks],
  );

  const summaryLinks = useMemo<BriefDocumentLink[]>(
    () => [
      ...morningBriefViewModel.collapsedChips.map((chip) => ({
        id: `summary-${chip.id}`,
        source: chip.source,
        label: chip.label,
        href: chip.href,
        meta: chip.meta,
      })),
      {
        id: "summary-workflows",
        source: "drive" as const,
        label: "Workflow artifact",
        href: "/workflows",
        meta: `${workflowRuns.filter((run) => run.status !== "Completed").length} active`,
      },
    ].slice(0, 4),
    [morningBriefViewModel.collapsedChips],
  );

  const toggleTaskChecked = (taskId: string) => {
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

  return (
    <div className="px-4 py-6 lg:px-8">
      <PageContainer className="space-y-5">
        <Card className={cn(briefShellClass, "relative overflow-hidden rounded-none py-0 ring-0")}>
          <CardContent className="relative px-5 py-4 lg:px-6 lg:py-5">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-primary" />
            <Collapsible open={isMorningBriefOpen} onOpenChange={setIsMorningBriefOpen}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.6fr)] lg:items-start">
                  <div className="max-w-xl">
                    <p className="section-label">Operator home · {morningBriefViewModel.todayLabel}</p>
                    <h1 className="mt-1.5 max-w-[10ch] font-heading text-[3.2rem] font-medium tracking-tight text-foreground leading-[0.96] lg:text-[2.95rem] lg:leading-[0.94]">
                      {morningBriefViewModel.headline}
                    </h1>
                    <p className="mt-1.5 text-sm leading-6 text-foreground/80">{morningBriefViewModel.metricsLabel}</p>
                    <p className="mt-1.5 max-w-lg text-sm leading-6 text-muted-foreground">{morningBriefViewModel.summary}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:justify-end lg:pt-0.5">
                    <Badge variant="outline" className="rounded-none border-border bg-secondary px-2 py-0.75 text-[11px] text-foreground">
                      Morning brief
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-none px-3 text-[11px]"
                      onClick={() => navigate("/inbox")}
                    >
                      Open Inbox
                    </Button>
                    <CollapsibleTrigger asChild>
                      <Button variant="default" size="sm" className="h-8 rounded-none px-3 text-[11px]">
                        {isMorningBriefOpen ? "Collapse" : "Expand"}
                        <CaretDownIcon
                          data-icon="inline-end"
                          className={cn(
                            "transition-transform duration-200 motion-reduce:transition-none",
                            isMorningBriefOpen && "rotate-180",
                          )}
                        />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {morningBriefViewModel.collapsedChips.map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      className="transition-colors duration-200 hover:border-primary/35 motion-reduce:transition-none"
                      onClick={() => navigate(chip.href)}
                    >
                      <BriefSourcePill compact label={chip.label} meta={chip.meta} source={chip.source} />
                    </button>
                  ))}
                  {morningBriefViewModel.taskCount ? (
                    <Badge
                      variant="outline"
                      className="rounded-none border-primary/25 bg-primary/[0.06] px-2 py-0.75 text-[11px] text-primary"
                    >
                      <CheckCircleIcon data-icon="inline-start" />
                      {morningBriefViewModel.taskCount} tasks detected
                    </Badge>
                  ) : null}
                </div>

                <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down motion-reduce:data-[state=closed]:animate-none motion-reduce:data-[state=open]:animate-none">
                  <Separator className="bg-border/80" />

                  <section className={cn(briefPanelClass, "mt-3 p-4 lg:p-5")}>
                    <div className="space-y-5">
                      <MorningBriefDocumentSection
                        label="Morning brief"
                        title="Today’s operator summary"
                        summary="A cleaner operator note: linked context, routed tasks, and app-smart references presented as one working document instead of separate tabs."
                        badge={
                          <Badge variant="outline" className="rounded-none border-border bg-secondary px-2 py-1 text-foreground">
                            Document view
                          </Badge>
                        }
                      >
                        <div className="space-y-3">
                          <p className="text-sm leading-7 text-muted-foreground">
                            {morningBriefViewModel.summary} The goal is to keep this view editable-feeling and scannable while still carrying the same meeting, inbox, and approval context.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {summaryLinks.map((link) => (
                              <BriefDocumentLinkChip key={link.id} link={link} onOpen={navigate} />
                            ))}
                          </div>
                        </div>
                      </MorningBriefDocumentSection>

                      <MorningBriefDocumentSection
                        label="Pre-reads"
                        title="Meeting prep packets"
                        summary="Skim the linked packets before the next conversation starts. These surface the calendar hold, agenda, and the most relevant workstream context."
                        badge={
                          <Badge variant="outline" className="rounded-none border-border bg-secondary px-2 py-1 text-foreground">
                            {preReadEntries.length} ready
                          </Badge>
                        }
                      >
                        <div>
                          {preReadEntries.map((entry) => (
                            <BriefDocumentEntryCard key={entry.id} entry={entry} onOpen={navigate} />
                          ))}
                        </div>
                      </MorningBriefDocumentSection>

                      <MorningBriefDocumentSection
                        label="Follow-ups"
                        title="Threads that still need motion"
                        summary="These are the conversations most likely to slip without a human nudge, so the brief keeps them inline with the context that matters."
                        badge={
                          <Badge variant="outline" className="rounded-none border-border bg-secondary px-2 py-1 text-foreground">
                            {followUpEntries.length} surfaced
                          </Badge>
                        }
                      >
                        <div>
                          {followUpEntries.map((entry) => (
                            <BriefDocumentEntryCard key={entry.id} entry={entry} onOpen={navigate} />
                          ))}
                        </div>
                      </MorningBriefDocumentSection>

                      <MorningBriefDocumentSection
                        label="Linked tasks"
                        title="Routed follow-through"
                        summary="Task context now reads like a document note with logo-led smart links instead of another kanban-like card rail."
                        badge={
                          <Badge variant="outline" className="rounded-none border-border bg-secondary px-2 py-1 text-foreground">
                            {taskDocumentEntries.length} linked
                          </Badge>
                        }
                      >
                        <div>
                          {taskDocumentEntries.map((entry) => (
                            <BriefDocumentEntryCard key={entry.id} entry={entry} onOpen={navigate} />
                          ))}
                        </div>
                      </MorningBriefDocumentSection>

                      <MorningBriefDocumentSection
                        label="Approvals"
                        title="Human review gates"
                        summary="The review queue stays in the same document flow so packet risk, editable output, and workflow artifacts remain visible without another UI mode switch."
                        badge={
                          <Badge variant="outline" className="rounded-none border-border bg-secondary px-2 py-1 text-foreground">
                            {approvalEntries.length} awaiting review
                          </Badge>
                        }
                      >
                        <div>
                          {approvalEntries.map((entry) => (
                            <BriefDocumentEntryCard key={entry.id} entry={entry} onOpen={navigate} />
                          ))}
                        </div>
                      </MorningBriefDocumentSection>

                      <div className="border-t border-border/70 pt-4">
                        <div className="flex flex-wrap gap-2">
                          {morningBriefViewModel.narratives.slice(0, 4).map((item) => (
                            <BriefDocumentLinkChip
                              key={`narrative-link-${item.id}`}
                              link={{
                                id: `narrative-link-${item.id}`,
                                source: item.source,
                                label: item.title,
                                href: item.href,
                                meta: item.meta,
                              }}
                              onOpen={navigate}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </CardContent>
        </Card>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(24rem,0.78fr)]">
          <CompactUsageCard />
          <HomeTaskPreviewCard
            expandedTaskId={expandedTaskId}
            getTaskLinks={getTaskLinks}
            groups={homeTaskPreviewGroups}
            onNavigate={navigate}
            onOwnerChange={setTaskOwner}
            onPriorityChange={setTaskPriority}
            onProjectChange={setTaskProject}
            onScheduleSave={setTaskSchedule}
            onToggleChecked={toggleTaskChecked}
            ownerOptions={ownerOptions}
            setExpandedTaskId={setExpandedTaskId}
            totalCount={allHomeTasks.length}
          />
        </div>
      </PageContainer>
    </div>
  );
}
