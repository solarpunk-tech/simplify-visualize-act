import { Metric, SectionHeading, SmallButton, StatusPill, Surface } from "@/components/ubik-primitives";
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useShellState, useWorkbenchState } from "@/hooks/use-shell-state";
import { workflowDefinitions, workflowRuns } from "@/lib/ubik-data";
import { Cell, Pie, PieChart } from "recharts";

function WorkflowRunSummary({ runs }: { runs: typeof workflowRuns }) {
  const running = runs.filter((item) => item.status === "Running").length;
  const awaitingApproval = runs.filter((item) => item.status === "Awaiting approval").length;
  const completed = runs.filter((item) => item.status === "Completed").length;
  const chartData = [
    { key: "running", label: "Running", value: running, fill: "var(--color-running)" },
    { key: "awaitingApproval", label: "Awaiting approval", value: awaitingApproval, fill: "var(--color-awaitingApproval)" },
    { key: "completed", label: "Completed", value: completed, fill: "var(--color-completed)" },
  ];
  const chartConfig = {
    running: {
      label: "Running",
      color: "var(--chart-4)",
    },
    awaitingApproval: {
      label: "Awaiting approval",
      color: "var(--chart-3)",
    },
    completed: {
      label: "Completed",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  return (
    <div className="relative mx-auto aspect-square max-h-[11rem]">
      <ChartContainer className="h-full w-full" config={chartConfig} initialDimension={{ width: 180, height: 180 }}>
        <PieChart accessibilityLayer>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel indicator="dot" nameKey="label" />}
          />
          <ChartLegend align="center" content={<ChartLegendContent />} verticalAlign="bottom" />
          <Pie
            data={chartData}
            dataKey="value"
            innerRadius={42}
            nameKey="label"
            outerRadius={72}
            paddingAngle={3}
            strokeWidth={4}
          >
            {chartData.map((entry) => (
              <Cell key={entry.key} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="section-label">Runs</span>
        <span className="mt-1 text-3xl font-semibold tracking-tight text-foreground">{runs.length}</span>
      </div>
    </div>
  );
}

export default function Workflows() {
  const { openRuntime, openDrawer } = useShellState();
  const [selectedRunId, setSelectedRunId] = useWorkbenchState<string>("workflow-run", workflowRuns[0].id);
  const run = workflowRuns.find((item) => item.id === selectedRunId) ?? workflowRuns[0];

  return (
    <div className="px-4 py-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <SectionHeading
          eyebrow="Playbooks"
          title="Workflows are reusable operating playbooks with visible execution."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <Metric label="Library" value={`${workflowDefinitions.length}`} />
          <Metric
            label="Runs live"
            tone="alert"
            value={`${workflowRuns.filter((item) => item.status !== "Completed").length}`}
          />
          <Metric
            label="Awaiting approval"
            tone="alert"
            value={`${workflowRuns.filter((item) => item.status === "Awaiting approval").length}`}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-4">
            <Surface className="gap-0 overflow-hidden">
              <CardHeader className="border-b border-border/70">
                <p className="section-label">Workflow library</p>
                <CardTitle>Reusable operating systems</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 py-3">
                {workflowDefinitions.map((workflow) => (
                  <div key={workflow.id} className="rounded-xl border border-border/70 bg-background px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold tracking-tight text-foreground">{workflow.name}</p>
                      <StatusPill tone={workflow.approvalMode === "Required" ? "alert" : "default"}>
                        {workflow.approvalMode}
                      </StatusPill>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{workflow.outcomes}</p>
                    <p className="section-label mt-3">{workflow.cadence}</p>
                  </div>
                ))}
              </CardContent>
            </Surface>

            <Surface className="gap-0 overflow-hidden">
              <CardHeader className="border-b border-border/70">
                <p className="section-label">Run state mix</p>
                <CardTitle>Current run composition</CardTitle>
              </CardHeader>
              <CardContent className="py-4">
                <WorkflowRunSummary runs={workflowRuns} />
              </CardContent>
            </Surface>

            <Surface className="gap-0 overflow-hidden">
              <CardHeader className="border-b border-border/70">
                <p className="section-label">Run queue</p>
                <CardTitle>Active and recent executions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 py-3">
                {workflowRuns.map((item) => {
                  const isActive = item.id === run.id;
                  return (
                    <button
                      key={item.id}
                      className={`w-full rounded-xl border px-4 py-4 text-left transition-colors ${
                        isActive
                          ? "surface-active"
                          : "border-border/70 bg-background hover:bg-secondary/70"
                      }`}
                      onClick={() => setSelectedRunId(item.id)}
                      type="button"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold tracking-tight text-foreground">{item.name}</p>
                        <StatusPill tone={item.status === "Completed" ? "success" : "alert"}>
                          {item.status}
                        </StatusPill>
                      </div>
                      <p className="section-label mt-3">{item.startedAt}</p>
                    </button>
                  );
                })}
              </CardContent>
            </Surface>
          </div>

          <Surface className="gap-0 overflow-hidden">
            <CardHeader className="border-b border-border/70">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="section-label">{run.owner}</p>
                  <CardTitle className="text-2xl font-semibold tracking-tight">{run.name}</CardTitle>
                  <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{run.summary}</p>
                </div>
                <StatusPill tone={run.status === "Completed" ? "success" : "alert"}>{run.status}</StatusPill>
              </div>
            </CardHeader>

            <CardContent className="grid gap-4 py-4 lg:grid-cols-[minmax(0,1fr)_300px]">
              <Surface size="sm" className="gap-0 overflow-hidden">
                <CardHeader className="border-b border-border/70">
                  <p className="section-label">Execution trace</p>
                </CardHeader>
                <CardContent className="space-y-3 py-3">
                  {run.steps.map((step) => (
                    <div
                      key={step.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background px-3 py-3"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">{step.label}</p>
                        <p className="section-label">Step {step.id}</p>
                      </div>
                      <StatusPill
                        tone={
                          step.status === "running"
                            ? "alert"
                            : step.status === "done"
                              ? "success"
                              : "muted"
                        }
                      >
                        {step.status}
                      </StatusPill>
                    </div>
                  ))}
                </CardContent>
              </Surface>

              <div className="space-y-4">
                <Surface size="sm" className="gap-0 overflow-hidden">
                  <CardHeader className="border-b border-border/70">
                    <p className="section-label">Artifacts</p>
                  </CardHeader>
                  <CardContent className="space-y-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      {run.artifacts.map((item) => (
                        <StatusPill key={item}>{item}</StatusPill>
                      ))}
                    </div>
                    <div className="surface-well rounded-xl p-4 text-sm leading-6 text-foreground">
                      Outputs remain tied to the run so approvals, briefs, and notes can be inspected without
                      leaving the workflow context.
                    </div>
                  </CardContent>
                </Surface>

                <Surface size="sm" className="gap-0 overflow-hidden">
                  <CardHeader className="border-b border-border/70">
                    <p className="section-label">Actions</p>
                  </CardHeader>
                  <CardContent className="space-y-2 py-3">
                    <SmallButton
                      active
                      onClick={() =>
                        openRuntime({
                          title: run.name,
                          status: run.status,
                          lines: run.steps.map((step) => `> ${step.label} [${step.status}]`),
                          artifactLabel: run.artifacts[0],
                        })
                      }
                    >
                      Open runtime
                    </SmallButton>
                    <SmallButton
                      onClick={() =>
                        openDrawer({
                          title: run.name,
                          eyebrow: "Queue detail",
                          description:
                            "Task queue and multi-run management live inside Workflows without adding a new top-level route.",
                          metadata: [
                            { label: "Started", value: run.startedAt },
                            { label: "Owner", value: run.owner },
                          ],
                          actions: run.artifacts,
                        })
                      }
                    >
                      Inspect queue
                    </SmallButton>
                  </CardContent>
                </Surface>
              </div>
            </CardContent>

            <CardFooter className="justify-between">
              <span className="text-sm text-muted-foreground">
                {run.steps.filter((step) => step.status === "done").length}/{run.steps.length} steps complete
              </span>
              <span className="text-sm font-medium text-foreground">{run.startedAt}</span>
            </CardFooter>
          </Surface>
        </div>
      </div>
    </div>
  );
}
