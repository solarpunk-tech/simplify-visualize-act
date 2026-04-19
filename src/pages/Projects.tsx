import { useEffect } from "react";
import { ArrowSquareOutIcon, PlusIcon, SidebarSimpleIcon, UsersThreeIcon } from "@phosphor-icons/react";
import { Bar, BarChart, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";

import { SectionHeading, SmallButton, StatusPill, Surface } from "@/components/ubik-primitives";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useShellState, useWorkbenchState } from "@/hooks/use-shell-state";
import { projects } from "@/lib/ubik-data";
import { cn, shouldIgnoreSurfaceHotkeys } from "@/lib/utils";

function ProjectProgressChart({
  progress,
  status,
}: {
  progress: number;
  status: "On track" | "At risk" | "Needs attention";
}) {
  const chartConfig = {
    complete: {
      label: "Complete",
      color: "var(--chart-1)",
    },
    remaining: {
      label: "Remaining",
      color: "var(--muted)",
    },
  } satisfies ChartConfig;

  const data = [
    {
      phase: "Plan",
      complete: Math.max(0, progress - 14),
      remaining: 100 - Math.max(0, progress - 14),
    },
    {
      phase: "Build",
      complete: progress,
      remaining: 100 - progress,
    },
    {
      phase: "Ship",
      complete: Math.min(100, progress + (status === "On track" ? 8 : status === "At risk" ? 2 : -4)),
      remaining: 100 - Math.min(100, progress + (status === "On track" ? 8 : status === "At risk" ? 2 : -4)),
    },
  ];

  return (
    <ChartContainer
      className="h-[4.5rem] min-h-[4.5rem] w-full aspect-auto"
      config={chartConfig}
      initialDimension={{ width: 260, height: 72 }}
    >
      <BarChart accessibilityLayer data={data} margin={{ left: -12, right: 0, top: 10, bottom: 0 }}>
        <XAxis axisLine={false} dataKey="phase" tickLine={false} tickMargin={10} />
        <YAxis axisLine={false} domain={[0, 100]} hide tickLine={false} />
        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
        <Bar barSize={18} dataKey="remaining" fill="var(--color-remaining)" radius={[6, 6, 0, 0]} stackId="progress" />
        <Bar barSize={18} dataKey="complete" fill="var(--color-complete)" radius={[6, 6, 0, 0]} stackId="progress">
          {data.map((entry) => (
            <Cell
              key={entry.phase}
              fill={
                status === "Needs attention"
                  ? "var(--chart-3)"
                  : status === "At risk"
                    ? "var(--chart-4)"
                    : "var(--chart-1)"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

function MilestoneSummaryChart({
  milestones,
}: {
  milestones: { label: string; state: "Done" | "Active" | "Upcoming" }[];
}) {
  const counts = milestones.reduce(
    (acc, milestone) => {
      if (milestone.state === "Done") acc.done += 1;
      if (milestone.state === "Active") acc.active += 1;
      if (milestone.state === "Upcoming") acc.upcoming += 1;
      return acc;
    },
    { done: 0, active: 0, upcoming: 0 },
  );

  const chartConfig = {
    done: {
      label: "Done",
      color: "var(--chart-1)",
    },
    active: {
      label: "Active",
      color: "var(--chart-3)",
    },
    upcoming: {
      label: "Upcoming",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  const data = [
    { key: "done", label: "Done", value: counts.done, fill: "var(--color-done)" },
    { key: "active", label: "Active", value: counts.active, fill: "var(--color-active)" },
    { key: "upcoming", label: "Upcoming", value: counts.upcoming, fill: "var(--color-upcoming)" },
  ];
  const total = counts.done + counts.active + counts.upcoming;

  return (
    <div className="relative mx-auto aspect-square max-h-[13rem]">
      <ChartContainer
        className="h-full w-full"
        config={chartConfig}
        initialDimension={{ width: 220, height: 220 }}
      >
        <PieChart accessibilityLayer>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel indicator="dot" nameKey="label" />}
          />
          <ChartLegend align="center" content={<ChartLegendContent />} verticalAlign="bottom" />
          <Pie
            data={data}
            dataKey="value"
            innerRadius={50}
            nameKey="label"
            outerRadius={82}
            paddingAngle={3}
            strokeWidth={4}
          >
            {data.map((entry) => (
              <Cell key={entry.key} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="section-label">Milestones</span>
        <span className="mt-1 text-3xl font-semibold tracking-tight text-foreground">{total}</span>
        <span className="mt-1 text-xs text-muted-foreground">done, active, upcoming</span>
      </div>
    </div>
  );
}

export default function Projects() {
  const { openDrawer } = useShellState();
  const [selectedProjectId, setSelectedProjectId] = useWorkbenchState<string>("project-id", projects[0].id);
  const [indexCollapsed, setIndexCollapsed] = useWorkbenchState<boolean>("projects-index-collapsed", false);
  const project = projects.find((item) => item.id === selectedProjectId) ?? projects[0];

  const commandRailClass =
    "flex w-full items-center gap-1 overflow-x-auto border border-border/70 bg-muted/30 px-1.5 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
  const commandRailGroupClass = "flex shrink-0 items-center gap-1";
  const commandRailDividerClass = "h-4 w-px shrink-0 bg-border/80";
  const commandRailButtonClass =
    "inline-flex h-7 shrink-0 items-center gap-1 border border-transparent px-1.5 text-[11px] font-medium text-foreground/80 transition-colors hover:bg-background hover:text-foreground motion-reduce:transition-none";
  const commandRailPrimaryButtonClass =
    "border-primary bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground";
  const commandRailShortcutClass =
    "inline-flex min-w-[1.3rem] items-center justify-center border border-border/70 bg-background px-1 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground";

  const openProjectDrawer = () =>
    openDrawer({
      title: project.name,
      eyebrow: "Linked context",
      description:
        "Projects should connect workflows, chats, approvals, and reports without hiding provenance.",
      metadata: [
        { label: "Owner", value: project.owner },
        { label: "Progress", value: `${project.progress}%` },
      ],
      actions: project.linked.map((item) => item.label),
    });

  const openProjectCreation = () =>
    openDrawer({
      title: "New project",
      eyebrow: "Workstream setup",
      description: "Create a new project workstream without jumping into another surface.",
      metadata: [
        { label: "Owner", value: "Assign next" },
        { label: "Scope", value: "Define milestones" },
      ],
      actions: ["Add owner", "Define milestones", "Link context"],
    });

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (shouldIgnoreSurfaceHotkeys(event.target)) return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

      const key = event.key.toLowerCase();
      if (key === "i") {
        event.preventDefault();
        openProjectDrawer();
        return;
      }

      if (key === "n") {
        event.preventDefault();
        openProjectCreation();
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [openDrawer, project]);

  const projectCommandBar = (
    <div className={commandRailClass}>
      <div className={commandRailGroupClass}>
        <button
          aria-label={indexCollapsed ? "Expand projects index" : "Collapse projects index"}
          className={commandRailButtonClass}
          onClick={() => setIndexCollapsed(!indexCollapsed)}
          type="button"
        >
          <SidebarSimpleIcon className="size-4" />
        </button>
        <button className={commandRailButtonClass} onClick={openProjectDrawer} type="button">
          <span>Inspect</span>
          <span className={commandRailShortcutClass}>I</span>
        </button>
      </div>

      <span className={commandRailDividerClass} aria-hidden="true" />

      <div className={cn(commandRailGroupClass, "min-w-0 flex-1 justify-center gap-1 pr-1")}>
        <button
          className={cn(commandRailButtonClass, commandRailPrimaryButtonClass)}
          onClick={openProjectCreation}
          type="button"
        >
          <PlusIcon className="size-4" />
          <span>New project</span>
          <span className={cn(commandRailShortcutClass, "border-primary-foreground/20 bg-primary-foreground/15 text-primary-foreground")}>N</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="px-4 py-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="shrink-0">{projectCommandBar}</div>
        <SectionHeading
          eyebrow="Operational Workstreams"
          title="Projects keep workstream, context, and next actions in one readable place."
        />

        <div className={cn("grid gap-4", indexCollapsed ? "xl:grid-cols-[minmax(0,1fr)]" : "xl:grid-cols-[320px_minmax(0,1fr)]")}>
          {!indexCollapsed ? (
          <Surface className="gap-0 overflow-hidden">
            <CardHeader className="border-b border-border/70">
              <p className="section-label">Project index</p>
              <CardTitle>Active workstreams</CardTitle>
              <CardDescription>Select a project to inspect progress, milestones, and linked context.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 py-3">
              {projects.map((item) => {
                const isActive = item.id === project.id;
                return (
                  <button
                    key={item.id}
                    className={`w-full rounded-xl border px-4 py-4 text-left transition-colors ${
                      isActive
                        ? "surface-active"
                        : "border-border/70 bg-background hover:bg-secondary/70"
                    }`}
                    onClick={() => setSelectedProjectId(item.id)}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="section-label">{item.code}</p>
                      <StatusPill tone={item.status === "On track" ? "default" : "alert"}>{item.status}</StatusPill>
                    </div>
                    <p className="mt-2 text-base font-semibold tracking-tight text-foreground">{item.name}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.summary}</p>
                    <div className="surface-well mt-4 rounded-xl px-3 py-3">
                      <ProjectProgressChart progress={item.progress} status={item.status} />
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Surface>
          ) : null}

          <div className="space-y-4">
            <Surface className="gap-0 overflow-hidden">
              <CardHeader className="border-b border-border/70">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="section-label">{project.code}</p>
                    <div className="space-y-1">
                      <CardTitle className="text-2xl font-semibold tracking-tight">{project.name}</CardTitle>
                      <CardDescription className="max-w-3xl text-sm leading-6">
                        {project.summary}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusPill>{project.owner}</StatusPill>
                    <StatusPill tone={project.status === "On track" ? "success" : "alert"}>{project.status}</StatusPill>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="grid gap-4 py-4 lg:grid-cols-2">
                <Surface size="sm" className="gap-0 overflow-hidden">
                  <CardHeader className="border-b border-border/70">
                    <p className="section-label">Milestones</p>
                  </CardHeader>
                  <CardContent className="space-y-4 py-3">
                    <div className="surface-well rounded-xl px-3 py-3">
                      <MilestoneSummaryChart milestones={project.milestones} />
                    </div>
                    <div className="space-y-3">
                      {project.milestones.map((milestone) => (
                        <div
                          key={milestone.label}
                          className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background px-3 py-3"
                        >
                          <p className="text-sm font-medium text-foreground">{milestone.label}</p>
                          <StatusPill
                            tone={
                              milestone.state === "Active"
                                ? "alert"
                                : milestone.state === "Done"
                                  ? "success"
                                  : "muted"
                            }
                          >
                            {milestone.state}
                          </StatusPill>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Surface>

                <Surface size="sm" className="gap-0 overflow-hidden">
                  <CardHeader className="border-b border-border/70">
                    <div className="flex items-center gap-2">
                      <UsersThreeIcon className="size-4 text-muted-foreground" />
                      <p className="section-label">Team and next actions</p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5 py-3">
                    <div className="flex flex-wrap gap-2">
                      {project.team.map((member) => (
                        <StatusPill key={member}>{member}</StatusPill>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <p className="section-label">Next actions</p>
                      <div className="space-y-2">
                        {project.nextActions.map((item) => (
                          <div key={item} className="surface-well rounded-xl p-3 text-sm leading-6 text-foreground">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Surface>
              </CardContent>
            </Surface>

            <Surface className="gap-0 overflow-hidden">
              <CardHeader className="border-b border-border/70">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="section-label">Linked context</p>
                    <CardTitle>Connected artifacts and workstreams</CardTitle>
                  </div>
                  <SmallButton onClick={openProjectDrawer}>
                    Inspect
                  </SmallButton>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 py-4 md:grid-cols-2">
                {project.linked.map((item) => (
                  <div key={item.label} className="rounded-xl border border-border/70 bg-background px-4 py-4">
                    <p className="section-label">{item.kind}</p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <ArrowSquareOutIcon className="size-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="justify-between">
                <span className="text-sm text-muted-foreground">
                  {project.linked.length} linked artifacts across this workstream
                </span>
                <span className="text-sm font-medium text-foreground">{project.progress}% complete</span>
              </CardFooter>
            </Surface>
          </div>
        </div>
      </div>
    </div>
  );
}
