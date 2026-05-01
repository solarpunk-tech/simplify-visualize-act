import { SectionHeading, SmallButton, StatusPill, Surface } from "@/components/ubik-primitives";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useShellState, useWorkbenchState } from "@/hooks/use-shell-state";
import { approvals } from "@/lib/ubik-data";
import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";

type ApprovalFilter = "All" | "Urgent" | "Review";

function ApprovalQueueSummary({
  total,
  urgent,
  review,
}: {
  total: number;
  urgent: number;
  review: number;
}) {
  const chartData = [
    { key: "all", label: "All", value: 100, fill: "var(--color-all)" },
    { key: "urgent", label: "Urgent", value: total ? (urgent / total) * 100 : 0, fill: "var(--color-urgent)" },
    { key: "review", label: "Review", value: total ? (review / total) * 100 : 0, fill: "var(--color-review)" },
  ];
  const chartConfig = {
    all: {
      label: "All",
      color: "var(--chart-2)",
    },
    urgent: {
      label: "Urgent",
      color: "var(--chart-3)",
    },
    review: {
      label: "Review",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-1">
        <p className="section-label">Queue summary</p>
        <p className="text-sm leading-6 text-muted-foreground">
          Current mix of all packets versus urgent and review-only slices.
        </p>
      </div>
      <div className="relative mx-auto aspect-square max-h-[10rem] w-full max-w-[10rem]">
        <ChartContainer className="h-full w-full" config={chartConfig} initialDimension={{ width: 160, height: 160 }}>
          <RadialBarChart
            accessibilityLayer
            cx="50%"
            cy="50%"
            data={chartData}
            endAngle={-270}
            innerRadius={28}
            outerRadius={76}
            startAngle={90}
          >
            <PolarAngleAxis domain={[0, 100]} tick={false} type="number" />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel indicator="line" nameKey="label" />}
            />
            <ChartLegend align="center" content={<ChartLegendContent />} verticalAlign="bottom" />
            <RadialBar background cornerRadius={999} dataKey="value" />
          </RadialBarChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="section-label">Packets</span>
          <span className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{total}</span>
        </div>
      </div>
    </div>
  );
}

export default function Approvals() {
  const { openDrawer, openRuntime } = useShellState();
  const [filter, setFilter] = useWorkbenchState<ApprovalFilter>("approval-filter", "All");
  const [selectedId, setSelectedId] = useWorkbenchState<string>("approval-id", approvals[0].id);
  const filtered = approvals.filter((item) => filter === "All" || item.status === filter);
  const approval = filtered.find((item) => item.id === selectedId) ?? filtered[0] ?? approvals[0];
  const urgentCount = approvals.filter((item) => item.status === "Urgent").length;
  const reviewCount = approvals.filter((item) => item.status === "Review").length;

  return (
    <div className="px-4 py-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <SectionHeading
          eyebrow="Human In The Loop"
          title="Approvals keep recommendations direct, auditable, and easy to inspect."
        />

        <Surface size="sm" className="gap-0 overflow-hidden">
          <CardHeader className="border-b border-border/70">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="section-label">Queue filter</p>
                <CardDescription>Review only the packets that need immediate human judgment.</CardDescription>
              </div>
              <ToggleGroup
                className="w-fit flex-wrap"
                onValueChange={(value) => {
                  if (value) setFilter(value as ApprovalFilter);
                }}
                spacing={1}
                type="single"
                value={filter}
                variant="outline"
              >
                {(["All", "Urgent", "Review"] as ApprovalFilter[]).map((item) => (
                  <ToggleGroupItem key={item} className="px-3 text-xs" value={item}>
                    {item}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </CardHeader>
          <CardContent className="py-4">
            <ApprovalQueueSummary
              review={reviewCount}
              total={approvals.length}
              urgent={urgentCount}
            />
          </CardContent>
        </Surface>

        <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
          <Surface className="gap-0 overflow-hidden">
            <CardHeader className="border-b border-border/70">
              <p className="section-label">Approval queue</p>
              <CardTitle>{filtered.length} packets in view</CardTitle>
              <CardDescription>Select a packet to review rationale, recommendation, and provenance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 py-3">
              {filtered.map((item) => {
                const isActive = item.id === approval.id;
                return (
                  <button
                    key={item.id}
                    className={`w-full rounded-xl border px-4 py-4 text-left transition-colors ${
                      isActive
                        ? "surface-active"
                        : "border-border/70 bg-background hover:bg-secondary/70"
                    }`}
                    onClick={() => setSelectedId(item.id)}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="section-label">{item.workflow}</p>
                      <StatusPill tone={item.status === "Urgent" ? "alert" : "default"}>{item.status}</StatusPill>
                    </div>
                    <p className="mt-2 text-base font-semibold tracking-tight text-foreground">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.inputSummary}</p>
                  </button>
                );
              })}
            </CardContent>
          </Surface>

          <div className="space-y-4">
            <Surface className="gap-0 overflow-hidden">
              <CardHeader className="border-b border-border/70">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="section-label">{approval.workflow}</p>
                    <CardTitle className="text-2xl font-semibold tracking-tight">{approval.title}</CardTitle>
                  </div>
                  <StatusPill tone={approval.status === "Urgent" ? "alert" : "default"}>
                    {approval.confidence}% confidence
                  </StatusPill>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 py-4 lg:grid-cols-2">
                <Surface size="sm" className="gap-0 overflow-hidden">
                  <CardHeader className="border-b border-border/70">
                    <p className="section-label">Recommendation</p>
                  </CardHeader>
                  <CardContent className="py-3">
                    <div className="surface-well rounded-xl p-4 text-sm leading-6 text-foreground">
                      {approval.recommendation}
                    </div>
                  </CardContent>
                </Surface>

                <Surface size="sm" className="gap-0 overflow-hidden">
                  <CardHeader className="border-b border-border/70">
                    <p className="section-label">Input summary</p>
                  </CardHeader>
                  <CardContent className="py-3">
                    <div className="surface-well rounded-xl p-4 text-sm leading-6 text-foreground">
                      {approval.inputSummary}
                    </div>
                  </CardContent>
                </Surface>
              </CardContent>
              <CardFooter className="flex flex-wrap gap-2">
                <SmallButton
                  active
                  onClick={() =>
                    openRuntime({
                      title: approval.title,
                      status: "Ready for review",
                      lines: [
                        `Workflow: ${approval.workflow}`,
                        `Confidence: ${approval.confidence}%`,
                        "",
                        approval.recommendation,
                      ],
                      artifactLabel: "Approval packet",
                    })
                  }
                >
                  Approve
                </SmallButton>
                <SmallButton>Reject</SmallButton>
                <SmallButton
                  onClick={() =>
                    openDrawer({
                      title: approval.title,
                      eyebrow: "Provenance",
                      description:
                        "Approvals should always explain why the system extracted, transformed, or recommended something.",
                      timeline: approval.provenance,
                      actions: approval.actions,
                    })
                  }
                >
                  Inspect
                </SmallButton>
              </CardFooter>
            </Surface>

            <Surface className="gap-0 overflow-hidden">
              <CardHeader className="border-b border-border/70">
                <p className="section-label">Available actions</p>
                <CardTitle>What the operator can do next</CardTitle>
              </CardHeader>
              <CardContent className="py-4">
                <div className="flex flex-wrap gap-2">
                  {approval.actions.map((item) => (
                    <StatusPill key={item}>{item}</StatusPill>
                  ))}
                </div>
              </CardContent>
            </Surface>
          </div>
        </div>
      </div>
    </div>
  );
}
