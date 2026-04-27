import { ArrowLeftIcon } from "@phosphor-icons/react";
import { Area, AreaChart, XAxis, YAxis } from "recharts";

import { DecisionTrace } from "@/components/projects/DecisionTrace";
import { ProjectStepper } from "@/components/projects/ProjectStepper";
import { DocQueueDetail } from "@/components/projects/variants/DocQueueDetail";
import { VMIDetail } from "@/components/projects/variants/VMIDetail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProjectInstance } from "@/lib/project-types";
import { cn } from "@/lib/utils";

const trendConfig = {
  throughput: {
    label: "Throughput",
    color: "var(--chart-1)",
  },
  risk: {
    label: "Risk pressure",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

function toneForStatus(status: ProjectInstance["status"]) {
  if (status === "On track") return "border-primary/25 bg-primary/5 text-primary";
  if (status === "Blocked") return "border-support/40 bg-support/15 text-support-foreground";
  if (status === "Paused") return "border-border bg-secondary text-muted-foreground";
  return "border-amber-500/30 bg-amber-500/10 text-amber-700";
}

export function ProjectDetail({ project, onBack }: { project: ProjectInstance; onBack?: () => void }) {
  const logisticsTab = project.detailVariant === "vmi" ? "Forecast" : "Logistics";

  return (
    <section className="flex min-h-0 flex-col overflow-hidden border border-border/70 bg-card shadow-sm">
      <div className="border-b border-border/60 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="bg-background px-2.5 py-1 font-mono text-[11px]">
                {project.code}
              </Badge>
              <Badge variant="outline" className={cn("px-2.5 py-1 text-[11px]", toneForStatus(project.status))}>
                {project.status}
              </Badge>
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{project.progress}% progress</span>
            </div>
            <h2 className="mt-3 text-[24px] leading-tight text-foreground">{project.title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{project.summary}</p>
          </div>
          {onBack ? (
            <Button variant="ghost" size="sm" className="px-0 text-xs uppercase tracking-[0.12em]" onClick={onBack} type="button">
              <ArrowLeftIcon data-icon="inline-start" /> Back
            </Button>
          ) : null}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-5 py-5">
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full max-w-2xl grid-cols-5 rounded-none">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="emails">Emails</TabsTrigger>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
            <TabsTrigger value="logistics">{logisticsTab}</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-5 space-y-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {project.metrics.map((metric) => (
                <div key={metric.label} className="border border-border/70 bg-background px-4 py-4">
                  <p className="section-label">{metric.label}</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{metric.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{metric.detail}</p>
                </div>
              ))}
            </div>

            {project.detailVariant === "vmi" ? <VMIDetail project={project} /> : null}
            {project.detailVariant === "docqueue" ? <DocQueueDetail project={project} /> : null}
            {project.detailVariant === "default" ? (
              <>
                <ProjectStepper steps={project.steps} />
                <section className="grid gap-3 lg:grid-cols-3">
                  {project.cards.map((card) => (
                    <div key={card.title} className="border border-border/70 bg-background px-4 py-4">
                      <p className="section-label">{card.title}</p>
                      <p className="mt-3 text-sm leading-6 text-foreground">{card.body}</p>
                      <p className="mt-4 text-xs text-muted-foreground">{card.owner}</p>
                    </div>
                  ))}
                </section>
              </>
            ) : null}

            <DecisionTrace items={project.trace} />

            {project.detailVariant !== "vmi" ? (
              <section className="border border-border/70 bg-card px-4 py-4">
                <p className="section-label">Operational trend</p>
                <p className="mt-1 text-sm text-muted-foreground">Throughput versus risk pressure across the current operating week.</p>
                <ChartContainer className="mt-3 h-[220px] w-full" config={trendConfig} initialDimension={{ width: 760, height: 220 }}>
                  <AreaChart data={project.trend} margin={{ left: -18, right: 18, top: 12, bottom: 0 }}>
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tickMargin={8} />
                    <YAxis hide domain={[0, 100]} />
                    <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                    <Area dataKey="risk" type="monotone" fill="var(--color-risk)" fillOpacity={0.12} stroke="var(--color-risk)" strokeWidth={2} />
                    <Area dataKey="throughput" type="monotone" fill="var(--color-throughput)" fillOpacity={0.18} stroke="var(--color-throughput)" strokeWidth={2.5} />
                  </AreaChart>
                </ChartContainer>
              </section>
            ) : null}
          </TabsContent>

          {(["emails", "meetings", "logistics", "documents"] as const).map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-5">
              <div className="border border-border/70 bg-background px-4 py-4">
                <p className="section-label">{tab === "logistics" ? logisticsTab : tab}</p>
                <div className="mt-3 divide-y divide-border/60">
                  {project.tabs[tab].map((item) => (
                    <div key={item} className="py-3 text-sm text-foreground">{item}</div>
                  ))}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
