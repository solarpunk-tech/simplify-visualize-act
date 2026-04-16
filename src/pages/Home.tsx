import { useId, useMemo, type ComponentType, type SVGProps } from "react";
import {
  BooksIcon,
  CaretDownIcon,
  CaretRightIcon,
  ChatsIcon,
  CheckCircleIcon,
  DotsThreeIcon,
  EnvelopeSimpleIcon,
  FilesIcon,
  FolderOpenIcon,
  PlusIcon,
  RadioButtonIcon,
  SparkleIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

import { PageContainer } from "@/components/page-container";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusPill } from "@/components/ubik-primitives";
import { useShellState, useWorkbenchState } from "@/hooks/use-shell-state";
import {
  activeOrders,
  approvals,
  cargoMovements,
  contactCards,
  homeActivityFeed,
  homeModelUsage,
  homeUsageOverview,
  inboxThreads,
  meetings,
  unifiedTasks,
  workflowRuns,
} from "@/lib/ubik-data";
import type { UnifiedTask } from "@/lib/ubik-types";
import { cn } from "@/lib/utils";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  Rectangle,
  XAxis,
  YAxis,
} from "recharts";

type WidgetAction = "chat" | "hide" | "delete";

type WidgetKind = "spark" | "progress" | "bars" | "radial";

type Widget = {
  id: string;
  label: string;
  domain: string;
  value: string;
  delta: string;
  detailA: string;
  detailB: string;
  tone?: "alert";
  chartKind: WidgetKind;
  chartData: number[];
};

function Sparkline({ data }: { data: number[] }) {
  const gradientId = useId().replace(/:/g, "");
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  const chartData = data.map((value, index) => ({
    period: labels[index] ?? `P${index + 1}`,
    revenue: value,
  }));
  const chartConfig = {
    revenue: {
      label: "Revenue pulse",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer
      config={chartConfig}
      className="h-[7.25rem] min-h-[7.25rem] w-full aspect-auto"
      initialDimension={{ width: 300, height: 116 }}
    >
      <AreaChart accessibilityLayer data={chartData} margin={{ left: -10, right: 12, top: 10, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.04} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          axisLine={false}
          dataKey="period"
          minTickGap={18}
          tickLine={false}
          tickMargin={10}
        />
        <YAxis axisLine={false} domain={["dataMin - 4", "dataMax + 4"]} hide tickLine={false} />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" labelKey="revenue" nameKey="period" />}
        />
        <Area
          activeDot={{ fill: "var(--color-revenue)", r: 4, stroke: "var(--background)", strokeWidth: 2 }}
          dataKey="revenue"
          fill={`url(#${gradientId})`}
          fillOpacity={1}
          stroke="var(--color-revenue)"
          strokeWidth={2.5}
          type="monotone"
        />
      </AreaChart>
    </ChartContainer>
  );
}

function ProgressRows({ data }: { data: number[] }) {
  const labels = ["Ops desk", "Top accounts", "Risk watch"];
  const chartData = data.slice(0, 3).map((value, index) => ({
    lane: labels[index] ?? `Signal ${index + 1}`,
    reliability: value,
    benchmark: Math.min(100, value + (index === 2 ? 8 : 5)),
  }));
  const chartConfig = {
    reliability: {
      label: "Current",
      color: "var(--chart-1)",
    },
    benchmark: {
      label: "Target",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer
      config={chartConfig}
      className="h-[8.75rem] min-h-[8.75rem] w-full aspect-auto"
      initialDimension={{ width: 300, height: 140 }}
    >
      <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 2, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis domain={[0, 100]} hide type="number" />
        <YAxis axisLine={false} dataKey="lane" tickLine={false} type="category" width={74} />
        <ChartTooltip content={<ChartTooltipContent indicator="dashed" labelKey="lane" />} />
        <ChartLegend
          align="right"
          content={<ChartLegendContent />}
          height={24}
          verticalAlign="top"
        />
        <Bar barSize={8} dataKey="benchmark" fill="var(--color-benchmark)" radius={999} />
        <Bar barSize={8} dataKey="reliability" fill="var(--color-reliability)" radius={999} />
      </BarChart>
    </ChartContainer>
  );
}

function MiniBars({ data }: { data: number[] }) {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const chartData = data.map((value, index) => ({
    slot: labels[index] ?? `W${index + 1}`,
    healthy: value,
    delayed: Math.max(0, 100 - value),
  }));
  const chartConfig = {
    healthy: {
      label: "Healthy",
      color: "var(--chart-1)",
    },
    delayed: {
      label: "Delayed",
      color: "var(--chart-3)",
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer
      config={chartConfig}
      className="h-[7.5rem] min-h-[7.5rem] w-full aspect-auto"
      initialDimension={{ width: 300, height: 120 }}
    >
      <BarChart accessibilityLayer data={chartData} margin={{ left: -8, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis axisLine={false} dataKey="slot" tickLine={false} tickMargin={10} />
        <YAxis axisLine={false} hide tickLine={false} />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <ChartLegend
          align="right"
          content={<ChartLegendContent />}
          height={24}
          verticalAlign="top"
        />
        <Bar barSize={18} dataKey="healthy" fill="var(--color-healthy)" radius={[8, 8, 0, 0]} />
        <Bar barSize={18} dataKey="delayed" fill="var(--color-delayed)" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}

function RadialFinanceStatus({ data }: { data: number[] }) {
  const chartData = [
    { key: "scope", label: "Scope", value: Math.min(100, (data[0] ?? 0) * 10), fill: "var(--color-scope)" },
    { key: "risk", label: "Risk", value: Math.min(100, (data[2] ?? 0) * 10), fill: "var(--color-risk)" },
    { key: "due", label: "Due", value: Math.min(100, (data[5] ?? 0) * 10), fill: "var(--color-due)" },
  ];
  const chartConfig = {
    scope: {
      label: "Scope",
      color: "var(--chart-3)",
    },
    risk: {
      label: "Risk",
      color: "var(--chart-4)",
    },
    due: {
      label: "Due",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;
  const total = Math.round(chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length);

  return (
    <div className="relative mx-auto aspect-square max-h-[12rem]">
      <ChartContainer
        config={chartConfig}
        className="h-full w-full"
        initialDimension={{ width: 220, height: 220 }}
      >
        <RadialBarChart
          accessibilityLayer
          cx="50%"
          cy="50%"
          data={chartData}
          endAngle={-270}
          innerRadius={34}
          outerRadius={100}
          startAngle={90}
        >
          <PolarAngleAxis domain={[0, 100]} tick={false} type="number" />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel indicator="line" nameKey="label" />}
          />
          <RadialBar background cornerRadius={999} dataKey="value" />
        </RadialBarChart>
      </ChartContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="section-label">Coverage</span>
        <span className="mt-1 text-3xl font-semibold tracking-tight text-foreground">{total}%</span>
        <span className="mt-1 text-xs text-muted-foreground">scope, risk, and due posture</span>
      </div>
    </div>
  );
}

function WidgetChart({ kind, data }: { kind: WidgetKind; data: number[] }) {
  if (kind === "spark") return <Sparkline data={data} />;
  if (kind === "progress") return <ProgressRows data={data} />;
  if (kind === "bars") return <MiniBars data={data} />;
  return <RadialFinanceStatus data={data} />;
}

type MorningBriefTab = "overview" | "pre-reads" | "follow-ups" | "tasks" | "approvals";

type BriefSourceKey = "calendar" | "gmail" | "slack" | "drive" | "workspace";

type BriefChip = {
  id: string;
  source: BriefSourceKey;
  label: string;
  href: string;
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
  greeting: string;
  headline: string;
  summary: string;
  metricsLabel: string;
  collapsedChips: BriefChip[];
  narratives: BriefNarrative[];
  tasks: UnifiedTask[];
  taskCount: number;
  viewAllHref: string;
  viewAllLabel: string;
};

type BriefRailCard = {
  id: string;
  title: string;
  summary: string;
  source: BriefSourceKey;
  href: string;
  meta: string;
  project: string;
  detail: string;
  tone?: "alert";
};

const contactCardByName = new Map(contactCards.map((contact) => [contact.name.toLowerCase(), contact]));

const sourceMeta: Record<
  BriefSourceKey,
  {
    label: string;
    Icon: ComponentType<SVGProps<SVGSVGElement>>;
  }
> = {
  calendar: { label: "Calendar", Icon: RadioButtonIcon },
  gmail: { label: "Gmail", Icon: EnvelopeSimpleIcon },
  slack: { label: "Slack", Icon: ChatsIcon },
  drive: { label: "Drive", Icon: FolderOpenIcon },
  workspace: { label: "Ubik", Icon: BooksIcon },
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
  if (item.type === "approval") return "gmail";
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
  if (task.source === "approvals") return "drive";
  if (task.source === "inbox") return "gmail";
  return "workspace";
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

function BriefSourcePill({
  source,
  label,
  compact = false,
}: {
  source: BriefSourceKey;
  label?: string;
  compact?: boolean;
}) {
  const meta = sourceMeta[source];
  const Icon = meta.Icon;

  return (
    <span
      className={cn(
        "home-brief-pill inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs leading-none",
        compact && "px-2 py-0.5 text-[11px]",
      )}
    >
      <Icon className={cn("size-3.5 shrink-0", compact && "size-3")} />
      <span className="truncate">{label ?? meta.label}</span>
    </span>
  );
}

function ContactBadge({ owner }: { owner: string }) {
  const contact = getContactCard(owner);

  return (
    <div className="home-brief-copy-soft inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-2 py-1 text-xs">
      <Avatar size="sm">
        {contact?.avatarSrc ? <AvatarImage alt={contact.name} src={contact.avatarSrc} /> : null}
        <AvatarFallback>{getInitials(contact?.name ?? owner)}</AvatarFallback>
      </Avatar>
      <span className="truncate">{owner}</span>
    </div>
  );
}

function UsageActivityGrid() {
  return (
    <div className="grid grid-cols-12 gap-1 sm:grid-cols-16 lg:grid-cols-24">
      {homeUsageOverview.activity.map((day) => (
        <div
          key={day.id}
          aria-label={`${day.label}: level ${day.level}`}
          className={cn(
            "h-4 rounded-[0.4rem] border border-border/60",
            day.level === 0 && "bg-muted/55",
            day.level === 1 && "bg-primary/20",
            day.level === 2 && "bg-primary/35",
            day.level === 3 && "bg-primary/55",
            day.level === 4 && "bg-primary",
          )}
          title={`${day.label}: level ${day.level}`}
        />
      ))}
    </div>
  );
}

function UsageModelsChart() {
  const chartData = homeModelUsage.map((item) => ({
    model: item.name.replace(" 2.5 Pro", " 2.5").replace(" Sonnet 4.6", " Sonnet").replace("GPT-5.2", "GPT-5"),
    input: item.inputTokens,
    output: item.outputTokens,
  }));
  const chartConfig = {
    input: {
      label: "Input tokens",
      color: "var(--chart-2)",
    },
    output: {
      label: "Output tokens",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer
      config={chartConfig}
      className="h-[14rem] min-h-[14rem] w-full aspect-auto"
      initialDimension={{ width: 760, height: 224 }}
    >
      <BarChart accessibilityLayer data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis axisLine={false} dataKey="model" tickLine={false} tickMargin={10} />
        <YAxis
          axisLine={false}
          tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
          tickLine={false}
          width={42}
        />
        <ChartTooltip
          cursor={{ fill: "hsl(var(--muted) / 0.45)" }}
          content={<ChartTooltipContent indicator="dashed" />}
        />
        <ChartLegend align="right" content={<ChartLegendContent />} height={24} verticalAlign="top" />
        <Bar dataKey="input" fill="var(--color-input)" radius={[8, 8, 0, 0]} stackId="tokens" />
        <Bar dataKey="output" fill="var(--color-output)" radius={[8, 8, 0, 0]} stackId="tokens" />
      </BarChart>
    </ChartContainer>
  );
}

function HeroOverviewCard({
  title,
  description,
  source,
  tone,
}: {
  title: string;
  description: string;
  source: string;
  tone?: "alert";
}) {
  return (
    <div
      className={cn(
        "home-brief-panel rounded-[1.25rem] p-4",
        tone === "alert" && "bg-white/14 ring-1 ring-white/10",
      )}
    >
      <p className="section-label home-brief-copy-faint">{source}</p>
      <p className="home-brief-copy mt-2 text-base font-medium">{title}</p>
      <p className="home-brief-copy-soft mt-2 text-sm leading-6">{description}</p>
    </div>
  );
}

function HeroRailCard({
  item,
  onOpen,
  kind,
}: {
  item: BriefRailCard;
  onOpen: (href: string) => void;
  kind: "pre-reads" | "follow-ups" | "tasks" | "approvals";
}) {
  const icon =
    kind === "pre-reads"
      ? <FilesIcon className="h-4 w-4" />
      : kind === "follow-ups"
        ? <ChatsIcon className="h-4 w-4" />
        : kind === "tasks"
          ? <CheckCircleIcon className="h-4 w-4" />
          : <WarningIcon className="h-4 w-4" />;

  return (
    <button
      type="button"
      className="home-brief-panel flex h-full min-h-[15.5rem] w-full flex-col rounded-[1.35rem] p-4 text-left transition-colors duration-200 hover:bg-white/10 motion-reduce:transition-none"
      onClick={() => onOpen(item.href)}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex size-9 items-center justify-center rounded-full border border-white/12 bg-white/10 text-white">
          {icon}
        </span>
        <BriefSourcePill compact source={item.source} />
      </div>
      <div className="mt-4 flex-1">
        <p className="home-brief-copy text-base font-medium leading-6">{item.title}</p>
        <p className="home-brief-copy-soft mt-2 text-sm leading-6">{item.summary}</p>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/6 px-2 py-1 text-xs text-white/80">
          <FilesIcon className="h-3.5 w-3.5" />
          {item.project}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs",
            item.tone === "alert"
              ? "border-white/20 bg-white/14 text-white"
              : "border-white/12 bg-white/6 text-white/80",
          )}
        >
          {item.detail}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="home-brief-copy-faint text-xs">{item.meta}</span>
        <CaretRightIcon className="home-brief-copy-faint h-4 w-4" />
      </div>
    </button>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { createTab, setPageState } = useShellState();
  const [hiddenWidgets, setHiddenWidgets] = useWorkbenchState<string[]>("home-hidden-widgets", []);
  const [deletedWidgets, setDeletedWidgets] = useWorkbenchState<string[]>("home-deleted-widgets", []);
  const [isMorningBriefOpen, setIsMorningBriefOpen] = useWorkbenchState<boolean>("home-morning-brief-open", false);
  const [morningBriefTab, setMorningBriefTab] = useWorkbenchState<MorningBriefTab>(
    "home-morning-brief-tab",
    "overview",
  );

  const delayedFleet = cargoMovements.filter((cargo) => cargo.delayDays > 3).length;
  const urgentApprovals = approvals.filter((item) => item.status === "Urgent").length;
  const actionRequiredCount = inboxThreads.filter(
    (thread) =>
      thread.priorityBand === "needs_attention" ||
      thread.priorityBand === "waiting_on_you" ||
      thread.followUpStatus === "due_soon" ||
      thread.followUpStatus === "overdue" ||
      thread.followUpStatus === "blocked_by_approval",
  ).length;

  const widgets = useMemo<Widget[]>(
    () => [
      {
        id: "revenue-pulse",
        label: "Revenue Pulse",
        domain: "Sales",
        value: `$${(activeOrders.reduce((sum, order) => sum + order.value, 0) / 1000).toFixed(1)}K`,
        delta: "+12%",
        detailA: `${activeOrders.length} active orders`,
        detailB: "Weekly trend",
        chartKind: "spark",
        chartData: [18, 24, 22, 29, 31, 35, 39],
      },
      {
        id: "account-health",
        label: "Account Reliability",
        domain: "Account Mgmt",
        value: "91%",
        delta: "+4 pts",
        detailA: "Renewal readiness",
        detailB: "Top 3 accounts",
        chartKind: "progress",
        chartData: [91, 84, 76],
      },
      {
        id: "fleet-health",
        label: "Fleet Continuity",
        domain: "Plant Ops",
        value: `${cargoMovements.length - delayedFleet}/${cargoMovements.length}`,
        delta: delayedFleet ? `${delayedFleet} delayed` : "On track",
        detailA: "Container movements",
        detailB: "Last 7 checks",
        tone: delayedFleet ? "alert" : undefined,
        chartKind: "bars",
        chartData: [72, 78, 74, 83, 88, 84, 86],
      },
      {
        id: "compliance-risk",
        label: "Packaging & Finance",
        domain: "Sustainability / Finance",
        value: `${urgentApprovals}`,
        delta: urgentApprovals ? "Needs action" : "Stable",
        detailA: "Expiring certs + approvals",
        detailB: `${actionRequiredCount} follow-ups`,
        tone: urgentApprovals ? "alert" : undefined,
        chartKind: "radial",
        chartData: [9, 8, 7, 6, 7, 8, 9],
      },
    ],
    [actionRequiredCount, delayedFleet, urgentApprovals],
  );

  const visibleWidgets = widgets.filter(
    (widget) => !hiddenWidgets.includes(widget.id) && !deletedWidgets.includes(widget.id),
  );

  const morningBriefViewModel = useMemo<MorningBriefViewModel>(() => {
    const todayLabel = new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    }).format(new Date());

    const greeting = getGreetingLabel();
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
              label: `${upcomingMeetings[0].title} · ${formatTimeLabel(upcomingMeetings[0].time)}`,
              href: `/meetings/${upcomingMeetings[0].id}`,
            },
          ]
        : []),
      ...(urgentApprovals
        ? [
            {
              id: "chip-approvals",
              source: "gmail" as const,
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

    const headline = `${greeting}, Hemanth.`;
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
      greeting,
      headline,
      summary,
      metricsLabel,
      collapsedChips,
      narratives,
      tasks: surfacedTasks,
      taskCount: unifiedTasks.length,
      viewAllHref: "/tasks",
      viewAllLabel: "View all in Tasks",
    };
  }, [urgentApprovals, actionRequiredCount]);

  const launchWidgetCreator = (widget: Widget) => {
    const tabId = createTab("/");
    if (!tabId) return;

    const prompt = `/widget creator ${widget.label} for ${widget.domain}. Build a clean operator card with chart, key risk, and one action.`;
    setPageState(`${tabId}:chat-composer`, prompt);
    setPageState(`${tabId}:chat-mode`, "plan");
    setPageState(`${tabId}:chat-sources`, ["org_knowledge", "files"]);
    setPageState(`${tabId}:chat-widget-context`, {
      widgetId: widget.id,
      metric: widget.value,
      domain: widget.domain,
      window: "7d",
    });
  };

  const onWidgetAction = (widgetId: string, action: WidgetAction) => {
    const widget = widgets.find((item) => item.id === widgetId);
    if (!widget) return;

    if (action === "chat") {
      launchWidgetCreator(widget);
      return;
    }
    if (action === "hide") {
      if (!hiddenWidgets.includes(widgetId)) setHiddenWidgets([...hiddenWidgets, widgetId]);
      return;
    }
    if (!deletedWidgets.includes(widgetId)) setDeletedWidgets([...deletedWidgets, widgetId]);
  };
  const timelineNarratives = morningBriefViewModel.narratives.filter((item) => item.source === "calendar");
  const headsUpNarratives = morningBriefViewModel.narratives.filter((item) => item.source !== "calendar");
  const preReadCards: BriefRailCard[] = useMemo(
    () =>
      meetings
        .filter((meeting) => meeting.stage === "Upcoming")
        .map((meeting) => ({
          id: `pre-read-${meeting.id}`,
          title: meeting.title,
          summary: meeting.summary,
          source: "calendar" as const,
          href: `/meetings/${meeting.id}`,
          meta: meeting.time,
          project: meeting.participants[1] ?? "Meeting prep",
          detail: `${meeting.agenda.length} agenda items`,
        })),
    [],
  );
  const followUpCards: BriefRailCard[] = useMemo(
    () =>
      inboxThreads
        .filter(
          (thread) =>
            thread.followUpStatus === "due_soon" ||
            thread.followUpStatus === "blocked_by_approval" ||
            thread.priorityBand === "needs_attention",
        )
        .slice(0, 5)
        .map((thread) => ({
          id: `followup-${thread.id}`,
          title: thread.subject,
          summary: thread.preview,
          source: getSourceForThread(thread),
          href: `/inbox/${thread.id}`,
        meta: thread.time,
        project: thread.project,
        detail: thread.dueRisk,
        tone: thread.priority === "Critical" ? "alert" : undefined,
      })),
    [],
  );
  const taskCards: BriefRailCard[] = useMemo(
    () =>
      morningBriefViewModel.tasks.map((task) => ({
        id: `task-card-${task.id}`,
        title: task.title,
        summary: `${task.owner} owns the next move across ${task.sourceLabel.toLowerCase()} and linked work.`,
        source: getBriefSourceForTask(task),
        href: task.href,
        meta: task.priority,
        project: task.project,
        detail: task.sourceLabel,
        tone: task.priority === "Urgent" ? "alert" : undefined,
      })),
    [morningBriefViewModel.tasks],
  );
  const approvalCards: BriefRailCard[] = useMemo(
    () => [
      ...approvals.slice(0, 3).map((approval) => ({
        id: `approval-card-${approval.id}`,
        title: approval.title,
        summary: approval.recommendation,
        source: "drive" as const,
        href: "/approvals",
        meta: `${approval.confidence}% confidence`,
        project: approval.workflow,
        detail: approval.status,
        tone: approval.status === "Urgent" ? "alert" : undefined,
      })),
      ...workflowRuns
        .filter((run) => run.status === "Awaiting approval")
        .slice(0, 2)
        .map((run) => ({
          id: `approval-run-${run.id}`,
          title: run.name,
          summary: run.summary,
          source: "workspace" as const,
          href: "/workflows",
          meta: run.startedAt,
          project: run.owner,
          detail: run.status,
          tone: "alert" as const,
        })),
    ].slice(0, 5),
    [],
  );

  return (
    <div className="px-4 py-6 lg:px-8">
      <PageContainer className="space-y-6">
        <Card
          className="home-brief-hero relative overflow-hidden rounded-[1.75rem] border border-primary/30 shadow-2xl shadow-primary/20"
          style={{
            backgroundColor: "hsl(var(--primary))",
            backgroundImage:
              "radial-gradient(circle at 88% 14%, rgba(255,255,255,0.16) 0%, transparent 24%), radial-gradient(circle at 78% 82%, rgba(255,255,255,0.08) 0%, transparent 28%)",
          }}
        >
          <CardContent className="relative p-5 lg:p-6">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -right-14 top-0 size-72 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute bottom-0 right-20 size-80 rounded-full bg-white/6 blur-[120px]" />
            </div>
            <Collapsible open={isMorningBriefOpen} onOpenChange={setIsMorningBriefOpen}>
              <div className="flex flex-col gap-5">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.65fr)] lg:items-start">
                  <div className="max-w-xl">
                    <p className="section-label home-brief-copy-faint">Operator home · {morningBriefViewModel.todayLabel}</p>
                    <h1 className="home-brief-copy mt-2 max-w-[9ch] text-4xl font-semibold tracking-tight lg:text-[3.25rem] lg:leading-[1.02]">
                      {morningBriefViewModel.headline}
                    </h1>
                    <p className="home-brief-copy-muted mt-2 text-base leading-7">
                      {morningBriefViewModel.metricsLabel}
                    </p>
                    <p className="home-brief-copy-soft mt-2 max-w-xl text-sm leading-6">
                      {morningBriefViewModel.summary}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <Badge variant="outline" className="home-brief-pill px-2.5 py-1">
                      Morning brief
                    </Badge>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="home-brief-copy bg-white/12 hover:bg-white/18"
                      onClick={() => navigate("/inbox")}
                    >
                      Open Inbox
                    </Button>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="home-brief-copy bg-white/12 hover:bg-white/18"
                      >
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

                <div className="flex flex-wrap items-center gap-2">
                  {morningBriefViewModel.collapsedChips.map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      className="transition-opacity duration-200 hover:opacity-85 motion-reduce:transition-none"
                      onClick={() => navigate(chip.href)}
                    >
                      <BriefSourcePill label={chip.label} source={chip.source} />
                    </button>
                  ))}
                  {morningBriefViewModel.taskCount ? (
                    <Badge variant="outline" className="home-brief-pulse rounded-full px-2.5 py-1 text-xs">
                      <CheckCircleIcon data-icon="inline-start" />
                      {morningBriefViewModel.taskCount} tasks detected
                    </Badge>
                  ) : null}
                </div>

                <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down motion-reduce:data-[state=closed]:animate-none motion-reduce:data-[state=open]:animate-none">
                  <Separator className="bg-white/14" />

                  <Tabs
                    className="mt-4 gap-0"
                    value={morningBriefTab}
                    onValueChange={(value) => setMorningBriefTab(value as MorningBriefTab)}
                  >
                    <section className="home-brief-panel rounded-[1.45rem] p-4 lg:p-5">
                      <div className="flex flex-col gap-3 border-b border-white/14 pb-3 lg:flex-row lg:items-center lg:justify-between">
                        <TabsList variant="line" className="home-brief-copy-soft border-white/14">
                            <TabsTrigger
                              value="overview"
                              className="home-brief-copy-faint data-active:border-b-white data-active:bg-white/6 data-active:font-semibold data-active:text-white"
                            >
                              Overview
                            </TabsTrigger>
                            <TabsTrigger
                              value="pre-reads"
                              className="home-brief-copy-faint data-active:border-b-white data-active:bg-white/6 data-active:font-semibold data-active:text-white"
                            >
                              Pre-reads
                            </TabsTrigger>
                            <TabsTrigger
                              value="follow-ups"
                              className="home-brief-copy-faint data-active:border-b-white data-active:bg-white/6 data-active:font-semibold data-active:text-white"
                            >
                              Follow-ups
                            </TabsTrigger>
                            <TabsTrigger
                              value="tasks"
                              className="home-brief-copy-faint data-active:border-b-white data-active:bg-white/6 data-active:font-semibold data-active:text-white"
                            >
                              Tasks
                            </TabsTrigger>
                            <TabsTrigger
                              value="approvals"
                              className="home-brief-copy-faint data-active:border-b-white data-active:bg-white/6 data-active:font-semibold data-active:text-white"
                            >
                              Approvals
                            </TabsTrigger>
                        </TabsList>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="home-brief-copy-muted justify-start px-0 hover:bg-transparent hover:text-white"
                          onClick={() => navigate(morningBriefViewModel.viewAllHref)}
                        >
                          {morningBriefViewModel.viewAllLabel}
                          <CaretRightIcon data-icon="inline-end" />
                        </Button>
                      </div>

                      <TabsContent value="overview" className="mt-4">
                        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                          <section className="home-brief-panel rounded-[1.3rem] p-4">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="section-label home-brief-copy-faint">Morning brief</p>
                                <p className="home-brief-copy mt-2 text-base font-medium">
                                  Keep the day anchored around approvals first, then carry them into meetings and follow-through.
                                </p>
                              </div>
                              <BriefSourcePill compact source="workspace" label="Operator sync" />
                            </div>

                            <div className="mt-4 space-y-3">
                              {(timelineNarratives.length ? timelineNarratives : morningBriefViewModel.narratives.slice(0, 2)).map((item) => (
                                <button
                                  key={item.id}
                                  type="button"
                                  className="home-brief-panel flex w-full items-start gap-3 rounded-2xl p-3 text-left transition-colors duration-200 hover:bg-white/10 motion-reduce:transition-none"
                                  onClick={() => navigate(item.href)}
                                >
                                  <ContactBadge owner={item.owner} />
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <BriefSourcePill compact source={item.source} />
                                      <span className="home-brief-copy-faint text-xs">{item.meta}</span>
                                    </div>
                                    <p className="home-brief-copy mt-2 text-sm font-medium">{item.title}</p>
                                    <p className="home-brief-copy-soft mt-1 text-sm leading-6">{item.body}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </section>

                          <section className="grid gap-4">
                            <div className="home-brief-panel rounded-[1.3rem] p-4">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="section-label home-brief-copy-faint">Heads up</p>
                                  <p className="home-brief-copy-soft mt-2 text-sm leading-6">
                                    Signals from inbox, approvals, and generated artifacts that should stay in view while you work the morning.
                                  </p>
                                </div>
                                <Badge variant="outline" className="home-brief-pill px-2 py-1">
                                  Focus
                                </Badge>
                              </div>

                              <div className="mt-4 space-y-3">
                                {(headsUpNarratives.length ? headsUpNarratives : morningBriefViewModel.narratives.slice(2)).map((item) => (
                                  <button
                                    key={item.id}
                                    type="button"
                                    className="home-brief-panel flex w-full items-start gap-3 rounded-2xl p-3 text-left transition-colors duration-200 hover:bg-white/10 motion-reduce:transition-none"
                                    onClick={() => navigate(item.href)}
                                  >
                                    <div className="mt-0.5">
                                      <BriefSourcePill compact source={item.source} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="home-brief-copy text-sm font-medium">{item.title}</p>
                                      <p className="home-brief-copy-soft mt-1 text-sm leading-6">{item.body}</p>
                                      <div className="mt-2 flex flex-wrap items-center gap-2">
                                        <ContactBadge owner={item.owner} />
                                        <span className="home-brief-copy-faint text-xs">{item.meta}</span>
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
                              <HeroOverviewCard
                                source="Approvals queue"
                                title={`${urgentApprovals} approvals are gating outbound work`}
                                description="Clear the legal and compliance packets first so the rest of the operating day stays unblocked."
                                tone="alert"
                              />
                              <HeroOverviewCard
                                source="Meetings carry-forward"
                                title={`${preReadCards.length} live prep packets are ready`}
                                description="Meeting pre-reads already have the inbox, approval, and project trail attached for handoff continuity."
                              />
                              <HeroOverviewCard
                                source="Workflow coverage"
                                title={`${workflowRuns.filter((run) => run.status !== "Completed").length} runs still in motion`}
                                description="Automations are covering the routine trace, so the operator surface can stay focused on human judgment."
                              />
                            </div>
                          </section>
                        </div>
                      </TabsContent>

                      <TabsContent value="pre-reads" className="mt-4">
                        <section>
                          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                              <p className="section-label home-brief-copy-faint">Pre-reads</p>
                              <p className="home-brief-copy-soft mt-2 text-sm leading-6">
                                Meeting prep, linked files, and carry-forward packets that should be skimmed before the next conversation starts.
                              </p>
                            </div>
                            <Badge variant="outline" className="home-brief-pill w-fit px-2.5 py-1">
                              {preReadCards.length} packets ready
                            </Badge>
                          </div>
                          <Carousel className="mt-4 px-10" opts={{ align: "start", dragFree: true }}>
                            <CarouselContent className="-ml-3">
                              {preReadCards.map((item) => (
                                <CarouselItem key={item.id} className="basis-full pl-3 md:basis-1/2 xl:basis-1/3">
                                  <HeroRailCard item={item} kind="pre-reads" onOpen={navigate} />
                                </CarouselItem>
                              ))}
                            </CarouselContent>
                            <CarouselPrevious className="left-0 border-white/15 bg-white/10 text-white hover:bg-white/16" />
                            <CarouselNext className="right-0 border-white/15 bg-white/10 text-white hover:bg-white/16" />
                          </Carousel>
                        </section>
                      </TabsContent>

                      <TabsContent value="follow-ups" className="mt-4">
                        <section>
                          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                              <p className="section-label home-brief-copy-faint">Follow-ups</p>
                              <p className="home-brief-copy-soft mt-2 text-sm leading-6">
                                Email, inbox, and customer threads that still need a human response or escalation today.
                              </p>
                            </div>
                            <Badge variant="outline" className="home-brief-pill w-fit px-2.5 py-1">
                              {followUpCards.length} follow-ups surfaced
                            </Badge>
                          </div>
                          <Carousel className="mt-4 px-10" opts={{ align: "start", dragFree: true }}>
                            <CarouselContent className="-ml-3">
                              {followUpCards.map((item) => (
                                <CarouselItem key={item.id} className="basis-full pl-3 md:basis-1/2 xl:basis-1/3">
                                  <HeroRailCard item={item} kind="follow-ups" onOpen={navigate} />
                                </CarouselItem>
                              ))}
                            </CarouselContent>
                            <CarouselPrevious className="left-0 border-white/15 bg-white/10 text-white hover:bg-white/16" />
                            <CarouselNext className="right-0 border-white/15 bg-white/10 text-white hover:bg-white/16" />
                          </Carousel>
                        </section>
                      </TabsContent>

                      <TabsContent value="tasks" className="mt-4">
                        <section>
                          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                              <p className="section-label home-brief-copy-faint">Tasks</p>
                              <p className="home-brief-copy-soft mt-2 text-sm leading-6">
                                Follow-through items already linked to meetings, inbox threads, and human approval surfaces.
                              </p>
                            </div>
                            <Badge variant="outline" className="home-brief-pill w-fit px-2.5 py-1">
                              {taskCards.length} routed tasks
                            </Badge>
                          </div>
                          <Carousel className="mt-4 px-10" opts={{ align: "start", dragFree: true }}>
                            <CarouselContent className="-ml-3">
                              {taskCards.map((item) => (
                                <CarouselItem key={item.id} className="basis-full pl-3 md:basis-1/2 xl:basis-1/3">
                                  <HeroRailCard item={item} kind="tasks" onOpen={navigate} />
                                </CarouselItem>
                              ))}
                            </CarouselContent>
                            <CarouselPrevious className="left-0 border-white/15 bg-white/10 text-white hover:bg-white/16" />
                            <CarouselNext className="right-0 border-white/15 bg-white/10 text-white hover:bg-white/16" />
                          </Carousel>
                        </section>
                      </TabsContent>

                      <TabsContent value="approvals" className="mt-4">
                        <section>
                          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                              <p className="section-label home-brief-copy-faint">Approvals</p>
                              <p className="home-brief-copy-soft mt-2 text-sm leading-6">
                                Approval packets and workflow reviews that are still holding back execution on active work.
                              </p>
                            </div>
                            <Badge variant="outline" className="home-brief-pill w-fit px-2.5 py-1">
                              {approvalCards.length} items awaiting review
                            </Badge>
                          </div>
                          <Carousel className="mt-4 px-10" opts={{ align: "start", dragFree: true }}>
                            <CarouselContent className="-ml-3">
                              {approvalCards.map((item) => (
                                <CarouselItem key={item.id} className="basis-full pl-3 md:basis-1/2 xl:basis-1/3">
                                  <HeroRailCard item={item} kind="approvals" onOpen={navigate} />
                                </CarouselItem>
                              ))}
                            </CarouselContent>
                            <CarouselPrevious className="left-0 border-white/15 bg-white/10 text-white hover:bg-white/16" />
                            <CarouselNext className="right-0 border-white/15 bg-white/10 text-white hover:bg-white/16" />
                          </Carousel>
                        </section>
                      </TabsContent>
                    </section>
                  </Tabs>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </CardContent>
        </Card>

        <div className="grid gap-4 xl:grid-cols-4">
          {visibleWidgets.map((widget) => (
              <Card
                key={widget.id}
                size="sm"
                className="surface-card"
                role="button"
                tabIndex={0}
              >
                <CardHeader className="border-b border-border/60 pb-3">
                  <CardDescription className="section-label text-[10px]">
                    {widget.domain}
                  </CardDescription>
                  <CardTitle className="text-[15px]">{widget.label}</CardTitle>
                  <CardAction>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon-xs" type="button">
                          <DotsThreeIcon />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuGroup>
                          <DropdownMenuItem onSelect={() => onWidgetAction(widget.id, "chat")}>
                            <ChatsIcon /> Ask UBIK
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => onWidgetAction(widget.id, "hide")}>
                            Hide widget
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => onWidgetAction(widget.id, "delete")}>
                            Remove widget
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardAction>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4 pt-0">
                  <div className="flex items-end justify-between gap-2">
                    <p className="text-4xl font-medium tracking-tight text-foreground">{widget.value}</p>
                    <StatusPill tone={widget.tone === "alert" ? "alert" : "muted"}>{widget.delta}</StatusPill>
                  </div>
                  <div className="surface-well rounded-xl px-3 py-3">
                    <WidgetChart kind={widget.chartKind} data={widget.chartData} />
                  </div>
                </CardContent>
                <CardFooter className="justify-between gap-3 text-[12px] text-muted-foreground">
                  <span>{widget.detailA}</span>
                  <span>{widget.detailB}</span>
                </CardFooter>
            </Card>
          ))}
        </div>
        <Card size="sm" className="surface-card overflow-hidden">
          <Tabs defaultValue="overview" className="gap-0">
            <CardHeader className="border-b border-border/60 pb-3">
              <div className="space-y-1">
                <p className="section-label">Usage intelligence</p>
                <CardTitle className="text-xl">Operator leverage across UBIK</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Workflow automation, model usage, and follow-through density in one compact operator view.
                </CardDescription>
              </div>
              <CardAction>
                <TabsList variant="line" className="w-auto border-border/70">
                  <TabsTrigger value="overview" className="data-active:bg-card data-active:font-semibold">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="models" className="data-active:bg-card data-active:font-semibold">
                    Models
                  </TabsTrigger>
                </TabsList>
              </CardAction>
            </CardHeader>

            <TabsContent value="overview" className="mt-0 w-full">
              <CardContent className="space-y-4 py-4">
                <div className="grid w-full gap-3 sm:grid-cols-2 xl:grid-cols-6">
                  {homeUsageOverview.stats.map((stat) => (
                    <div key={stat.id} className="border border-border/70 bg-background px-3 py-3">
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{stat.value}</p>
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">{stat.detail}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.8fr)]">
                  <div className="border border-border/70 bg-muted/35 px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="section-label">Operational intensity</p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          Recent operator load across briefs, approvals, and workflow interventions.
                        </p>
                      </div>
                      <Badge variant="outline">Last 7 weeks</Badge>
                    </div>
                    <div className="mt-4">
                      <UsageActivityGrid />
                    </div>
                    <p className="mt-4 text-sm leading-6 text-muted-foreground">{homeUsageOverview.footer}</p>
                  </div>

                  <div className="grid gap-3">
                    <div className="border border-border/70 bg-background px-4 py-3">
                      <p className="text-sm text-muted-foreground">Workflow review completion</p>
                      <p className="mt-2 text-base font-medium text-foreground">+22% faster than last week</p>
                    </div>
                    <div className="border border-border/70 bg-background px-4 py-3">
                      <p className="text-sm text-muted-foreground">Morning brief carry-through</p>
                      <p className="mt-2 text-base font-medium text-foreground">5 linked actions routed before noon</p>
                    </div>
                    <div className="border border-border/70 bg-background px-4 py-3">
                      <p className="text-sm text-muted-foreground">Automation contribution</p>
                      <p className="mt-2 text-base font-medium text-foreground">3 workflow handoffs avoided manual trace work</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="models" className="mt-0 w-full">
              <CardContent className="grid w-full gap-4 py-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.8fr)]">
                <div className="border border-border/70 bg-background px-4 py-4">
                  <UsageModelsChart />
                </div>
                <div className="space-y-3">
                  {homeModelUsage.map((model) => (
                    <div key={model.id} className="border border-border/70 bg-background px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{model.name}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {model.inputTokens.toLocaleString()} in · {model.outputTokens.toLocaleString()} out
                          </p>
                        </div>
                        <Badge variant="secondary">{model.share}%</Badge>
                      </div>
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            model.color === "chart-1" && "bg-[var(--chart-1)]",
                            model.color === "chart-2" && "bg-[var(--chart-2)]",
                            model.color === "chart-3" && "bg-[var(--chart-3)]",
                          )}
                          style={{ width: `${model.share}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
          {visibleWidgets.length ? (
            <div className="flex justify-start">
              <Button
                variant="outline"
                size="sm"
                className="mr-2"
                onClick={() =>
                  launchWidgetCreator({
                    id: "new-widget",
                    label: "Custom Widget",
                    domain: "Operator",
                    value: "",
                    delta: "",
                    detailA: "",
                    detailB: "",
                    chartKind: "spark",
                    chartData: [1, 2, 3],
                  })
                }
              >
                <PlusIcon data-icon="inline-start" /> New
              </Button>
            </div>
          ) : null}
      </PageContainer>
    </div>
  );
}
