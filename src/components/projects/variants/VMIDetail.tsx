import { Line, LineChart, XAxis, YAxis } from "recharts";

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { ProjectInstance } from "@/lib/project-types";

const vmiChartConfig = {
  throughput: {
    label: "Pull rate",
    color: "var(--chart-1)",
  },
  risk: {
    label: "Risk pressure",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export function VMIDetail({ project }: { project: ProjectInstance }) {
  const meters = [
    { label: "Fill rate", value: project.metrics[0]?.value ?? "96%", width: "96%" },
    { label: "OTIF", value: project.metrics[1]?.value ?? "92%", width: "92%" },
    { label: "Weeks cover", value: project.metrics[2]?.value ?? "5.8", width: "68%" },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
      <section className="border border-border/70 bg-background px-4 py-4">
        <p className="section-label">VMI meters</p>
        <div className="mt-4 space-y-4">
          {meters.map((meter) => (
            <div key={meter.label}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">{meter.label}</p>
                <span className="font-mono text-xs text-muted-foreground">{meter.value}</span>
              </div>
              <div className="mt-2 h-2 border border-border bg-background">
                <div className="h-full bg-primary" style={{ width: meter.width }} />
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="border border-border/70 bg-background px-4 py-4">
        <p className="section-label">Pull rate sparkline</p>
        <ChartContainer className="mt-3 h-[160px] w-full" config={vmiChartConfig} initialDimension={{ width: 520, height: 160 }}>
          <LineChart data={project.trend} margin={{ left: -18, right: 12, top: 12, bottom: 0 }}>
            <XAxis dataKey="label" axisLine={false} tickLine={false} tickMargin={8} />
            <YAxis hide domain={[0, 100]} />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            <Line type="monotone" dataKey="throughput" stroke="var(--color-throughput)" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="risk" stroke="var(--color-risk)" strokeWidth={2} dot={false} />
          </LineChart>
        </ChartContainer>
      </section>
    </div>
  );
}
