import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CircleCheck, Minus, Play, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  faqs,
  featureHighlights,
  marketingSectionInner,
  pricingTiers,
  trustLogos,
} from "@/lib/marketing-content";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

/* ─── Shared Swiss grid label ────────────────────────────────────── */
function GridLabel({ number, text, invert }: { number?: string; text: string; invert?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {number && <span className="font-mono text-xs text-primary">{number}</span>}
      <span
        className={cn(
          "font-mono text-xs font-bold uppercase tracking-[0.25em]",
          invert ? "text-white/55" : "text-muted-foreground"
        )}
      >
        {text}
      </span>
      <div className={cn("h-px flex-1", invert ? "bg-white/20" : "bg-border")} />
    </div>
  );
}

const SOLUTION_LOOP_MS = 4500;
const solutionSlides = [
  {
    step: "01",
    headline: "Gmail, Calendar, Drive connected",
    symbol: "hub",
    snippet: "connect" as const,
  },
  {
    step: "02",
    headline: "Emails → tasks → approvals, mapped",
    symbol: "account_tree",
    snippet: "flow" as const,
  },
  {
    step: "03",
    headline: "One screen. All context. Zero switching.",
    symbol: "dashboard",
    snippet: "screen" as const,
  },
];

function SolutionMaterialIcon({ name }: { name: string }) {
  return (
    <span
      className="material-symbols-outlined shrink-0 text-4xl text-white md:text-5xl"
      aria-hidden
      style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}
    >
      {name}
    </span>
  );
}

function SolutionSnippetConnect() {
  return (
    <div className="flex shrink-0 items-center gap-2 rounded-none border border-white/25 bg-black/15 px-3 py-2.5">
      {[
        { icon: "mail", label: "Mail" },
        { icon: "calendar_month", label: "Cal" },
        { icon: "add_to_drive", label: "Drive" },
      ].map((app) => (
        <div
          key={app.icon}
          className="flex size-10 flex-col items-center justify-center border border-white/20 bg-white/10"
          title={app.label}
        >
          <span
            className="material-symbols-outlined text-lg text-white"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'opsz' 20" }}
          >
            {app.icon}
          </span>
        </div>
      ))}
    </div>
  );
}

function SolutionSnippetFlow() {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-1 rounded-none border border-white/25 bg-black/15 px-2 py-2 font-mono text-[9px] text-white/90">
      <span className="rounded-sm border border-white/20 bg-white/10 px-1.5 py-1">Inbox</span>
      <span className="material-symbols-outlined text-white/70" style={{ fontSize: "14px" }}>
        arrow_forward
      </span>
      <span className="rounded-sm border border-white/20 bg-white/10 px-1.5 py-1">Task</span>
      <span className="material-symbols-outlined text-white/70" style={{ fontSize: "14px" }}>
        arrow_forward
      </span>
      <span className="rounded-sm border border-primary/60 bg-primary/25 px-1.5 py-1 text-white">Approve</span>
    </div>
  );
}

function SolutionSnippetScreen() {
  return (
    <div className="w-[140px] shrink-0 rounded-none border border-white/25 bg-black/15 p-2">
      <div className="mb-1.5 flex gap-1 border-b border-white/15 pb-1.5">
        <div className="h-1.5 w-1.5 rounded-full bg-white/40" />
        <div className="h-1.5 w-1.5 rounded-full bg-white/25" />
        <div className="h-1.5 w-1.5 rounded-full bg-white/25" />
      </div>
      <div className="grid grid-cols-2 gap-1">
        <div className="h-6 border border-white/15 bg-white/5" />
        <div className="h-6 border border-white/15 bg-white/5" />
        <div className="col-span-2 h-8 border border-primary/40 bg-primary/15" />
      </div>
    </div>
  );
}

function SolutionSnippet({ id }: { id: "connect" | "flow" | "screen" }) {
  if (id === "connect") return <SolutionSnippetConnect />;
  if (id === "flow") return <SolutionSnippetFlow />;
  return <SolutionSnippetScreen />;
}

function SolutionFeatureLoop() {
  const [loopIndex, setLoopIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLoopIndex((i) => (i + 1) % solutionSlides.length);
    }, SOLUTION_LOOP_MS);
    return () => window.clearInterval(timer);
  }, []);

  const slide = solutionSlides[loopIndex];

  return (
    <div className="relative overflow-hidden rounded-none border border-white/20 bg-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] backdrop-blur-sm">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={slide.step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between md:gap-8 md:p-6"
        >
          <div className="flex min-w-0 flex-1 items-start gap-4 md:items-center">
            <SolutionMaterialIcon name={slide.symbol} />
            <div className="min-w-0 space-y-1">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/55">
                {slide.step} — Ubik layer
              </p>
              <p className="text-sm font-normal leading-snug text-white md:text-base">{slide.headline}</p>
            </div>
          </div>
          <SolutionSnippet id={slide.snippet} />
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-center gap-2 border-t border-white/15 py-3">
        {solutionSlides.map((s, i) => (
          <button
            key={s.step}
            type="button"
            aria-label={`Show step ${s.step}`}
            onClick={() => setLoopIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === loopIndex ? "w-6 bg-white" : "w-1.5 bg-white/35 hover:bg-white/55"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── 1. HERO ─────────────────────────────────────────────────────── */
export function SiteHero() {
  return (
    <section className="w-full pb-0 pt-16 md:pt-24">
      <div className={marketingSectionInner}>
        <GridLabel number="01" text="Operations platform" />

        <div className="mt-10 grid gap-10 md:grid-cols-12">
        <div className="md:col-span-8">
          <Badge
            variant="outline"
            className="mb-6 rounded-none border-primary/40 font-mono text-xs font-bold uppercase tracking-widest text-primary"
          >
            Early Access · Curated Teams Only
          </Badge>
          <h1 className="font-heading text-5xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-7xl lg:text-[5.5rem]">
            Run your entire
            <br />
            operations stack
            <br />
            <span className="text-primary">from one screen.</span>
          </h1>
        </div>

        <div className="flex flex-col justify-end gap-6 md:col-span-4">
          <p className="text-base leading-relaxed text-muted-foreground">
            Ubik replaces inbox chaos, scattered approvals, and endless meetings with a single AI-powered workspace —
            so your team can execute faster, without switching tabs.
          </p>
          <div className="flex flex-col gap-3 lg:flex-row">
            <Button
              asChild
              size="lg"
              className="w-full rounded-none bg-primary px-8 text-xs font-bold uppercase tracking-widest text-white hover:bg-primary/90 lg:w-auto"
            >
              <Link to="/site/contact">
                Get early access <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full rounded-none border-2 border-foreground px-8 text-xs font-bold uppercase tracking-widest hover:bg-foreground hover:text-background lg:w-auto"
            >
              <Link to="/site/features">
                <Play className="mr-2 size-3.5 fill-current" />
                Watch 2-min demo
              </Link>
            </Button>
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            Limited onboarding · Built for high-output teams
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-14 grid grid-cols-2 border-t-2 border-foreground md:grid-cols-4">
        {[
          { num: "40%", label: "Fewer follow-ups" },
          { num: "10×", label: "Faster approvals" },
          { num: "200+", label: "Ops teams onboarded" },
          { num: "0", label: "Missed tasks" },
        ].map((stat) => (
          <div key={stat.label} className="border-r-2 border-foreground px-6 py-6 last:border-r-0">
            <p className="font-mono text-4xl font-bold text-primary md:text-5xl">{stat.num}</p>
            <p className="mt-1 font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}

/* ─── 2. TRUST BAR ────────────────────────────────────────────────── */
export function SiteTrustBar() {
  return (
    <section className="w-full py-12">
      <div className={marketingSectionInner}>
        <GridLabel text="Used by ops teams across manufacturing, supply chain, and revenue orgs" />
        <div className="mt-6 grid grid-cols-2 border-t border-l border-border md:grid-cols-5">
          {trustLogos.map((name) => (
            <div
              key={name}
              className="border-b border-r border-border px-6 py-5 font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 3. PROBLEM ──────────────────────────────────────────────────── */
export function SiteProblem() {
  const problems = [
    "Emails hide decisions",
    "Meetings create work, not clarity",
    "Approvals slow everything down",
    "Projects live in 5 different tools",
  ];

  return (
    <section className="w-full border-t-2 border-foreground py-20 md:py-28">
      <div className={cn(marketingSectionInner)}>
        <div className="grid gap-12 md:grid-cols-2">
        <div className="space-y-6">
          <GridLabel number="02" text="The problem" />
          <h2 className="font-heading text-4xl font-normal leading-tight tracking-tight md:text-5xl">
            Your operations are not broken —<br />
            <span className="text-primary">they're fragmented.</span>
          </h2>
          <p className="font-mono text-sm text-muted-foreground leading-relaxed">
            You're not managing operations.
            <br />
            You're managing chaos.
          </p>
        </div>

        <div className="space-y-0 border-t-2 border-foreground md:border-t-0 md:border-l-2 md:pl-12 pt-8 md:pt-0">
          {problems.map((p, i) => (
            <div
              key={p}
              className="flex items-center gap-5 border-b-2 border-foreground py-5 last:border-b-0"
            >
              <span className="font-mono text-xs font-bold text-primary/60">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-base text-foreground">{p}</span>
            </div>
          ))}
        </div>
      </div>
      </div>
    </section>
  );
}

/* ─── 4. SOLUTION ─────────────────────────────────────────────────── */
export function SiteSolution() {
  return (
    <section className="w-full border-t-2 border-foreground bg-primary py-20 md:py-28">
      <div className={cn(marketingSectionInner)}>
        <div className="grid gap-12 md:grid-cols-12">
        <div className="space-y-6 md:col-span-7">
          <GridLabel number="03" text="The solution" />
          <h2 className="font-heading text-4xl font-normal leading-tight tracking-tight text-white md:text-5xl">
            Ubik brings everything
            <br />
            into one operational layer.
          </h2>
          <p className="text-base leading-relaxed text-white/80">
            Connect your tools once. Ubik reads, organizes, and surfaces what actually needs action — across inbox,
            meetings, approvals, and workflows.
          </p>
          <div className="flex flex-col gap-3 lg:flex-row">
            <Button
              asChild
              size="lg"
              className="w-full rounded-none bg-white px-8 text-xs font-bold uppercase tracking-widest text-primary hover:bg-white/90 lg:w-auto"
            >
              <Link to="/site/contact">
                Get early access <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full rounded-none border-2 border-white/40 px-8 text-xs font-bold uppercase tracking-widest text-white hover:bg-white hover:text-primary lg:w-auto"
            >
              <Link to="/site/features">See features</Link>
            </Button>
          </div>
        </div>

        <div className="md:col-span-5">
          <SolutionFeatureLoop />
        </div>
      </div>
      </div>
    </section>
  );
}

/* ─── 5. CORE FEATURES ────────────────────────────────────────────── */
const coreFeatures = [
  {
    tag: "Operator Inbox",
    heading: "See exactly what needs action today — not just messages.",
    bullets: ["Priority-based queue", "Revenue + ops impact sorting", "Follow-ups auto-tracked"],
  },
  {
    tag: "Meetings → Action",
    heading: "Meetings that actually move work forward.",
    bullets: ["Pre-read briefs", "Auto notes", "Instant task creation"],
  },
  {
    tag: "Approvals, Without Bottlenecks",
    heading: "Every approval, one place.",
    bullets: ["Finance, compliance, purchase", "Full context included", "Faster decisions"],
  },
  {
    tag: "Workflows & Execution",
    heading: "Turn repeat work into systems.",
    bullets: ["RFQs", "Order tracking", "Audits & renewals"],
  },
  {
    tag: "Intelligence Layer",
    heading: "Ubik doesn't just organize work. It thinks with you.",
    bullets: [
      "Highlights risks before they escalate",
      "Nudges decisions that are pending",
      "Surfaces hidden blockers",
    ],
  },
];

export function SiteFeatures() {
  return (
    <section className="w-full border-t-2 border-foreground py-20 md:py-28">
      <div className={marketingSectionInner}>
        <GridLabel number="04" text="Core features" />
      <div className="mt-8 mb-14">
        <h2 className="font-heading text-4xl font-normal leading-tight tracking-tight md:text-5xl">
          Everything your ops team
          <br />
          actually needs.
        </h2>
      </div>

      <div className="grid gap-0 border-t-2 border-l-2 border-foreground md:grid-cols-2 lg:grid-cols-3">
        {coreFeatures.map((f, i) => (
          <div
            key={f.tag}
            className={`border-b-2 border-r-2 border-foreground p-8 ${
              i === coreFeatures.length - 1 && coreFeatures.length % 3 !== 0
                ? "lg:col-span-2"
                : ""
            }`}
          >
            <p className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-primary">
              {f.tag}
            </p>
            <h3 className="mb-5 font-heading text-xl font-normal leading-snug text-foreground">
              {f.heading}
            </h3>
            <ul className="space-y-2">
              {f.bullets.map((b) => (
                <li key={b} className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                  <CircleCheck className="size-3.5 flex-shrink-0 text-primary" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}

/* ─── 6. HOW IT WORKS ─────────────────────────────────────────────── */
export function SiteHowItWorks() {
  const steps = [
    {
      num: "01",
      heading: "Connect your tools",
      sub: "Gmail, Calendar, Drive, and more",
      detail:
        "One-click integrations. Ubik reads your existing tools without disrupting your current setup.",
    },
    {
      num: "02",
      heading: "Ubik maps your workflows",
      sub: "Emails → tasks → approvals",
      detail:
        "Ubik automatically identifies what's a decision, what's a task, and what needs approval — then organizes it all.",
    },
    {
      num: "03",
      heading: "Run operations from one place",
      sub: "One screen. Full control.",
      detail:
        "Your entire ops stack, surfaced in priority order. No tab switching. No missed context. Just execution.",
    },
  ];

  return (
    <section className="w-full border-t-2 border-foreground py-20 md:py-28">
      <div className={marketingSectionInner}>
        <GridLabel number="05" text="How it works" />
      <div className="mt-8 mb-14">
        <h2 className="font-heading text-4xl font-normal leading-tight tracking-tight md:text-5xl">
          Three steps to operational clarity.
        </h2>
      </div>

      <div className="grid gap-0 border-t-2 border-l-2 border-foreground md:grid-cols-3">
        {steps.map((step) => (
          <div key={step.num} className="border-b-2 border-r-2 border-foreground p-8">
            <p className="font-mono text-5xl font-bold text-primary/20">{step.num}</p>
            <h3 className="mt-6 font-heading text-2xl font-normal tracking-tight">{step.heading}</h3>
            <p className="mt-1 font-mono text-xs font-bold uppercase tracking-widest text-primary">
              {step.sub}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{step.detail}</p>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}

/* ─── 7. VISUAL PROOF (UI Mockups) ───────────────────────────────── */
function MockupInbox() {
  const items = [
    { priority: "HIGH", color: "bg-red-500", label: "RFQ #1847 — needs sign-off", meta: "Procurement · 2m ago" },
    { priority: "MED", color: "bg-yellow-500", label: "Q3 Audit docs pending", meta: "Finance · 1h ago" },
    { priority: "LOW", color: "bg-green-500", label: "Weekly sync follow-up", meta: "Team · 3h ago" },
  ];
  return (
    <div className="rounded-none border-2 border-foreground bg-background shadow-sm">
      <div className="flex items-center justify-between border-b-2 border-foreground px-4 py-3">
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest">Operator Inbox</span>
        <span className="font-mono text-[9px] text-muted-foreground">Today ↓</span>
      </div>
      {items.map((item) => (
        <div key={item.label} className="flex items-start gap-3 border-b border-border px-4 py-3 last:border-b-0">
          <div className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${item.color}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`font-mono text-[8px] font-bold px-1 py-0.5 rounded-sm ${item.color} text-white`}>
                {item.priority}
              </span>
              <span className="font-mono text-[10px] font-medium truncate">{item.label}</span>
            </div>
            <span className="font-mono text-[9px] text-muted-foreground">{item.meta}</span>
          </div>
        </div>
      ))}
      <div className="flex gap-2 border-t-2 border-foreground px-4 py-3">
        {["Mark done", "Assign", "Defer"].map((a) => (
          <div
            key={a}
            className={`flex-1 py-1.5 text-center font-mono text-[9px] font-bold uppercase tracking-wide ${
              a === "Mark done" ? "bg-primary text-white" : "border border-border text-muted-foreground"
            }`}
          >
            {a}
          </div>
        ))}
      </div>
    </div>
  );
}

function MockupApprovals() {
  return (
    <div className="rounded-none border-2 border-foreground bg-background shadow-sm">
      <div className="flex items-center justify-between border-b-2 border-foreground px-4 py-3">
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest">Approval Flow</span>
        <span className="font-mono text-[9px] text-yellow-500 font-bold">PENDING</span>
      </div>
      <div className="px-4 py-3 border-b border-border">
        <p className="font-mono text-xs font-bold">Purchase Order #4492</p>
        <p className="font-mono text-[10px] text-muted-foreground">Amount: $24,500 · Vendor: Apex Supply</p>
      </div>
      <div className="px-4 py-3 space-y-3">
        {[
          { label: "Submitted", status: "done", time: "9:00am" },
          { label: "Finance Review", status: "active", time: "Pending" },
          { label: "Manager Approval", status: "waiting", time: "Waiting" },
        ].map((step) => (
          <div key={step.label} className="flex items-center gap-3">
            <div
              className={`h-3 w-3 rounded-full flex-shrink-0 ${
                step.status === "done"
                  ? "bg-primary"
                  : step.status === "active"
                  ? "border-2 border-primary bg-primary/20"
                  : "border-2 border-border bg-background"
              }`}
            />
            <span className="font-mono text-[10px] flex-1">{step.label}</span>
            <span
              className={`font-mono text-[9px] font-bold ${
                step.status === "done"
                  ? "text-primary"
                  : step.status === "active"
                  ? "text-yellow-500"
                  : "text-muted-foreground"
              }`}
            >
              {step.time}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-2 border-t-2 border-foreground px-4 py-3">
        <div className="flex-1 bg-primary py-1.5 text-center font-mono text-[9px] font-bold uppercase tracking-wide text-white">
          Approve
        </div>
        <div className="flex-1 border border-border py-1.5 text-center font-mono text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
          Request Info
        </div>
      </div>
    </div>
  );
}

function MockupMeeting() {
  return (
    <div className="rounded-none border-2 border-foreground bg-background shadow-sm">
      <div className="flex items-center justify-between border-b-2 border-foreground px-4 py-3">
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest">Meeting Summary</span>
        <span className="font-mono text-[9px] text-primary font-bold">AUTO-GENERATED</span>
      </div>
      <div className="border-b border-border px-4 py-3">
        <p className="font-mono text-xs font-bold">Q3 Operations Review</p>
        <p className="font-mono text-[9px] text-muted-foreground">45 min · 6 attendees · Yesterday 2pm</p>
      </div>
      <div className="px-4 py-3">
        <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
          Action items
        </p>
        {[
          { task: "Update RFQ template", owner: "@Sarah" },
          { task: "Review vendor list", owner: "@Mark" },
          { task: "Send audit docs", owner: "@You" },
        ].map((item) => (
          <div key={item.task} className="flex items-center gap-2 py-1.5">
            <div className="h-3 w-3 flex-shrink-0 rounded-sm border-2 border-border" />
            <span className="font-mono text-[10px] flex-1">{item.task}</span>
            <span className="font-mono text-[9px] font-bold text-primary">{item.owner}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockupWorkflow() {
  const orders = [
    { id: "PO-4492", pct: 80, status: "On Track", color: "bg-primary" },
    { id: "PO-4491", pct: 40, status: "Blocked", color: "bg-red-500" },
    { id: "PO-4490", pct: 100, status: "Done", color: "bg-green-500" },
  ];
  return (
    <div className="rounded-none border-2 border-foreground bg-background shadow-sm">
      <div className="flex items-center justify-between border-b-2 border-foreground px-4 py-3">
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest">Workflow Dashboard</span>
        <span className="font-mono text-[9px] text-muted-foreground">Order Tracking</span>
      </div>
      <div className="px-4 py-3 space-y-4">
        {orders.map((o) => (
          <div key={o.id}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[10px] font-bold">{o.id}</span>
              <span
                className={`font-mono text-[9px] font-bold ${
                  o.status === "Done"
                    ? "text-green-500"
                    : o.status === "Blocked"
                    ? "text-red-500"
                    : "text-primary"
                }`}
              >
                {o.status}
              </span>
            </div>
            <div className="h-2 w-full rounded-none bg-muted">
              <div
                className={`h-2 rounded-none ${o.color} transition-all`}
                style={{ width: `${o.pct}%` }}
              />
            </div>
            <p className="font-mono text-[9px] text-muted-foreground mt-1">{o.pct}% complete</p>
          </div>
        ))}
      </div>
      <div className="border-t-2 border-foreground px-4 py-3">
        <p className="font-mono text-[9px] text-muted-foreground">
          <span className="text-primary font-bold">3</span> active ·{" "}
          <span className="text-red-500 font-bold">1</span> blocked ·{" "}
          <span className="text-green-500 font-bold">12</span> complete
        </p>
      </div>
    </div>
  );
}

export function SiteVisualProof() {
  const mockups = [
    { label: "Operator Inbox", sub: "Priority-based action queue", component: <MockupInbox /> },
    { label: "Approval Flow", sub: "Finance & compliance, one place", component: <MockupApprovals /> },
    { label: "Meeting Summary", sub: "Auto-generated actions", component: <MockupMeeting /> },
    { label: "Workflow Dashboard", sub: "Order tracking & execution", component: <MockupWorkflow /> },
  ];

  return (
    <section className="w-full border-t-2 border-foreground py-20 md:py-28">
      <div className={marketingSectionInner}>
        <GridLabel number="06" text="See Ubik in action" />
      <div className="mt-8 mb-14">
        <h2 className="font-heading text-4xl font-normal leading-tight tracking-tight md:text-5xl">
          No UI = no trust.
          <br />
          <span className="text-primary">Here's exactly what you get.</span>
        </h2>
        <p className="mt-4 text-muted-foreground max-w-xl">
          Every screen below is a real part of Ubik — inbox, approvals, meeting summaries, and workflow tracking, all
          in one place.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {mockups.map((m) => (
          <div key={m.label}>
            <p className="mb-2 font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {m.label}
            </p>
            <p className="mb-4 text-sm text-muted-foreground">{m.sub}</p>
            {m.component}
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}

/* ─── 8. USE CASES ────────────────────────────────────────────────── */
export function SiteUseCases() {
  const useCases = [
    {
      label: "For Ops Teams",
      heading: "Stop chasing updates. Start executing.",
      detail:
        "One unified view of every decision, task, and workflow — prioritized by impact. No more digging through email threads to find where something got stuck.",
      stat: "40%",
      statLabel: "fewer follow-up emails",
    },
    {
      label: "For Revenue Teams",
      heading: "Close faster with zero follow-up leakage.",
      detail:
        "Ubik tracks every open item across deals, approvals, and stakeholder responses — so nothing slips through the cracks at the worst possible moment.",
      stat: "3×",
      statLabel: "faster deal progression",
    },
    {
      label: "For Plant / Manufacturing",
      heading: "Keep production moving without delays.",
      detail:
        "RFQs, purchase orders, audits, and renewals — mapped and tracked automatically. Ubik knows when something is at risk before you have to ask.",
      stat: "0",
      statLabel: "missed production deadlines",
    },
  ];

  return (
    <section className="w-full border-t-2 border-foreground py-20 md:py-28">
      <div className={marketingSectionInner}>
        <GridLabel number="07" text="Who it's for" />
      <div className="mt-8 mb-14">
        <h2 className="font-heading text-4xl font-normal leading-tight tracking-tight md:text-5xl">
          Built for teams that run things.
        </h2>
      </div>

      <div className="grid gap-0 border-t-2 border-l-2 border-foreground md:grid-cols-3">
        {useCases.map((uc) => (
          <div key={uc.label} className="border-b-2 border-r-2 border-foreground p-8">
            <p className="mb-4 font-mono text-xs font-bold uppercase tracking-widest text-primary">{uc.label}</p>
            <h3 className="mb-3 font-heading text-2xl font-normal leading-snug tracking-tight">
              {uc.heading}
            </h3>
            <p className="mb-8 text-sm leading-relaxed text-muted-foreground">{uc.detail}</p>
            <div className="border-t-2 border-foreground pt-5">
              <p className="font-mono text-4xl font-bold text-primary">{uc.stat}</p>
              <p className="mt-1 font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {uc.statLabel}
              </p>
            </div>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}

/* ─── 9. OUTCOMES ─────────────────────────────────────────────────── */
export function SiteOutcomes() {
  const outcomes = [
    { num: "40%", label: "Fewer follow-ups", detail: "Stop wasting hours chasing status updates." },
    { num: "10×", label: "Faster approvals", detail: "Full context in every approval request." },
    { num: "0", label: "Missed tasks", detail: "Ubik surfaces what needs action before it slips." },
    { num: "1", label: "Clear daily execution", detail: "One prioritized view to start every day." },
  ];

  return (
    <section className="w-full border-t-2 border-foreground bg-zinc-950 py-20 dark:bg-zinc-900 md:py-28">
      <div className={marketingSectionInner}>
        <GridLabel number="08" text="outcomes" invert />
        <div className="mt-8 mb-14">
          <h2 className="font-heading text-4xl font-normal leading-tight tracking-tight text-white md:text-5xl">
            What changes with Ubik?
          </h2>
          <p className="mt-4 text-white/60">Real results. No fluff.</p>
        </div>

        <div className="grid grid-cols-2 border-t-2 border-white/20 md:grid-cols-4">
          {outcomes.map((o) => (
            <div key={o.label} className="border-b-2 border-r-2 border-white/20 p-8 last:border-r-0">
              <p className="font-mono text-5xl font-bold text-primary">{o.num}</p>
              <p className="mt-2 font-mono text-xs font-bold uppercase tracking-widest text-white/80">
                {o.label}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/50">{o.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 10. SOCIAL PROOF ────────────────────────────────────────────── */
export function SiteSocialProof() {
  const testimonials = [
    {
      quote:
        "Ubik replaced 5 tools for us. We finally have operational clarity — every approval, task, and follow-up in one place.",
      name: "Sarah K.",
      role: "VP Operations, Northline Capital",
    },
    {
      quote:
        "The inbox alone saved our ops team 3 hours a day. I can see what needs action without reading a single full email thread.",
      name: "James T.",
      role: "Supply Chain Director, Aster Labs",
    },
    {
      quote:
        "We ran our entire Q3 audit through Ubik. Every doc, approval, and follow-up tracked automatically. First time we hit the deadline early.",
      name: "Priya M.",
      role: "Head of Compliance, Cobalt Group",
    },
  ];

  return (
    <section className="w-full border-t-2 border-foreground py-20 md:py-28">
      <div className={marketingSectionInner}>
        <GridLabel number="09" text="Social proof" />
      <div className="mt-8 mb-14">
        <h2 className="font-heading text-4xl font-normal leading-tight tracking-tight md:text-5xl">
          Teams that switched to Ubik
          <br />
          don't go back.
        </h2>
      </div>

      <div className="grid gap-0 border-t-2 border-l-2 border-foreground md:grid-cols-3">
        {testimonials.map((t) => (
          <div key={t.name} className="flex flex-col border-b-2 border-r-2 border-foreground p-8">
            <p className="font-mono text-4xl font-bold text-primary/20 leading-none mb-5">"</p>
            <p className="flex-1 text-base leading-relaxed text-foreground">{t.quote}</p>
            <div className="mt-8 border-t-2 border-foreground pt-5">
              <p className="font-mono text-xs font-bold">{t.name}</p>
              <p className="font-mono text-xs text-muted-foreground">{t.role}</p>
            </div>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}

/* ─── 11. FINAL CTA ───────────────────────────────────────────────── */
export function SiteCtaBand() {
  return (
    <section className="w-full border-t-2 border-foreground">
      <div className="grid md:grid-cols-12">
        <div
          className="flex flex-col justify-center gap-8 bg-zinc-950 px-6 py-10 dark:bg-zinc-900 md:col-span-8 md:px-10 md:py-20 lg:pl-[max(1.5rem,calc((100vw-80rem)/2+2.5rem))]"
        >
          <GridLabel number="10" text="get started" invert />
          <h2 className="font-heading text-4xl font-normal leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
            Stop managing tools.
            <br />
            Start running operations.
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-white/60">
            Limited onboarding · Built for high-output teams. Join the early access program and get hands-on setup
            support from our team.
          </p>
          <div className="flex flex-col gap-3 lg:flex-row">
            <Button
              asChild
              size="lg"
              className="w-full rounded-none bg-primary px-10 text-xs font-bold uppercase tracking-widest text-white hover:bg-primary/90 lg:w-auto"
            >
              <Link to="/site/contact">
                Get early access <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full rounded-none border-2 border-white/20 px-10 text-xs font-bold uppercase tracking-widest text-white hover:bg-white hover:text-foreground lg:w-auto"
            >
              <Link to="/site/pricing">View pricing</Link>
            </Button>
          </div>
          <p className="font-mono text-xs text-white/30">
            Early access · Curated teams only · No credit card required
          </p>
        </div>

        {/* Accent block */}
        <div className="hidden flex-col items-center justify-center gap-6 bg-primary p-10 text-center md:col-span-4 md:flex">
          <div className="font-mono text-sm font-bold uppercase tracking-widest text-white/70">
            Free trial
          </div>
          <p className="font-mono text-7xl font-bold text-white leading-none">14</p>
          <p className="font-mono text-sm font-bold uppercase tracking-widest text-white/70">days</p>
          <div className="h-px w-16 bg-white/30" />
          <p className="font-mono text-xs text-white/50">No credit card required</p>
        </div>
      </div>
    </section>
  );
}

/* ─── KEPT FOR INNER PAGES ────────────────────────────────────────── */
export function SiteFeatureGrid() {
  return (
    <section className="w-full py-16 md:py-24">
      <div className={marketingSectionInner}>
        <GridLabel number="02" text="Features" />
      <div className="mt-6 mb-8">
        <h2 className="font-heading text-4xl font-normal leading-tight tracking-tight md:text-5xl">
          Everything your team needs to execute.
        </h2>
      </div>
      <div className="grid gap-0 border-t-2 border-l-2 border-foreground md:grid-cols-2 lg:grid-cols-3">
        {featureHighlights.map((feature) => (
          <div key={feature.title} className="border-b-2 border-r-2 border-foreground p-8">
            <h3 className="mb-3 font-heading text-xl font-normal">{feature.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}

export function SitePricingGrid() {
  return (
    <section className="w-full py-16 md:py-24">
      <div className={marketingSectionInner}>
        <GridLabel number="02" text="Pricing" />
      <div className="mt-6 mb-12">
        <h2 className="font-heading text-4xl font-normal leading-tight tracking-tight md:text-5xl">
          Choose a plan that scales with your team.
        </h2>
      </div>
      <div className="grid border-t-2 border-l-2 border-foreground md:grid-cols-3">
        {pricingTiers.map((tier) => (
          <div
            key={tier.name}
            className={`flex flex-col border-b-2 border-r-2 border-foreground p-8 ${
              tier.featured ? "bg-primary text-white" : "bg-background"
            }`}
          >
            <div className="mb-4 flex items-center justify-between gap-[4px]">
              <p className={`font-mono text-xs font-bold uppercase tracking-widest ${tier.featured ? "text-white/70" : "text-muted-foreground"}`}>
                {tier.name}
              </p>
              {tier.featured && (
                <Badge className="shrink-0 rounded-none bg-white text-xs font-bold uppercase tracking-widest text-primary">
                  Most popular
                </Badge>
              )}
            </div>
            <p className={`mt-3 font-mono text-5xl font-bold ${tier.featured ? "text-white" : "text-foreground"}`}>
              {tier.price}
            </p>
            <p className={`font-mono text-xs ${tier.featured ? "text-white/60" : "text-muted-foreground"}`}>
              {tier.cadence}
            </p>
            <p className={`mt-4 text-sm leading-relaxed ${tier.featured ? "text-white/80" : "text-muted-foreground"}`}>
              {tier.description}
            </p>
            <ul className="mt-6 flex-1 space-y-2">
              {tier.features.map((f) => (
                <li key={f} className={`flex items-center gap-2 text-sm ${tier.featured ? "text-white/90" : ""}`}>
                  <CircleCheck className={`size-3.5 flex-shrink-0 ${tier.featured ? "text-white" : "text-primary"}`} />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              className={`mt-8 w-full rounded-none text-xs font-bold uppercase tracking-widest ${
                tier.featured
                  ? "bg-white text-primary hover:bg-white/90"
                  : "border-2 border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background"
              }`}
              variant={tier.featured ? "default" : "outline"}
            >
              {tier.cta}
            </Button>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}

export function SiteFaq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="w-full py-16 md:py-24">
      <div className={marketingSectionInner}>
        <GridLabel number="03" text="FAQ" />
      <div className="mt-6 mb-12 grid gap-6 md:grid-cols-2">
        <h2 className="font-heading text-4xl font-normal leading-tight tracking-tight md:text-5xl">
          Have questions? We have answers.
        </h2>
        <p className="self-end text-muted-foreground">
          Everything you need to know before rolling out Ubik to your team.
        </p>
      </div>
      <div className="border-t-2 border-foreground">
        {faqs.map((faq, i) => (
          <div key={faq.question} className="border-b-2 border-foreground">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-2 py-5 text-left"
            >
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs font-bold text-primary">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-sm font-bold md:text-base">{faq.question}</span>
              </div>
              {open === i ? (
                <Minus className="size-4 flex-shrink-0 text-primary" />
              ) : (
                <Plus className="size-4 flex-shrink-0 text-muted-foreground" />
              )}
            </button>
            {open === i && (
              <p className="pb-6 pl-10 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}
