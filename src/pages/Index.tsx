import { useState } from "react";
import {
  feedCards,
  recentChats,
  quickActions,
  tasks,
  projects,
  contextIntelligence,
  shipmentVolume,
  complianceScores,
  portActivity,
} from "@/lib/mock-data";
import {
  Mail,
  BarChart3,
  Search,
  Activity,
  Clock,
  ArrowRight,
  CheckCircle2,
  Circle,
  Loader2,
  GitMerge,
  Zap,
  Bell,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Minus,
  Anchor,
  Ship,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from "recharts";

const iconMap: Record<string, React.ReactNode> = {
  Mail: <Mail className="h-4 w-4" />,
  BarChart3: <BarChart3 className="h-4 w-4" />,
  Search: <Search className="h-4 w-4" />,
  Activity: <Activity className="h-4 w-4" />,
};

const statusIcon: Record<string, React.ReactNode> = {
  TODO: <Circle className="h-3.5 w-3.5" />,
  IN_PROGRESS: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
  DONE: <CheckCircle2 className="h-3.5 w-3.5 text-primary" />,
};

const trendIcon: Record<string, React.ReactNode> = {
  up: <TrendingUp className="h-3 w-3 text-primary" />,
  down: <TrendingDown className="h-3 w-3 text-primary" />,
  stable: <Minus className="h-3 w-3 text-muted-foreground" />,
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "GOOD MORNING";
  if (h < 17) return "GOOD AFTERNOON";
  return "GOOD EVENING";
}

export default function Index() {
  const [activeFeedCard, setActiveFeedCard] = useState(0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr_0.8fr] gap-0 h-full">
      {/* ─── LEFT: FEED ─── */}
      <div className="border-r border-border p-6 overflow-auto">
        <div className="mb-6">
          <h1 className="font-mono text-2xl font-bold tracking-tight">
            {getGreeting()}
            <span className="text-primary">.</span>
          </h1>
          <p className="font-mono text-[11px] tracking-wider text-muted-foreground mt-1">
            {new Date()
              .toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })
              .toUpperCase()}
          </p>
        </div>

        {/* ── DATA VIZ WIDGETS ── */}
        {/* Shipment Volume Chart */}
        <div className="border border-border p-4 mb-3">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] tracking-widest font-semibold">SHIPMENT_VOLUME</span>
            <span className="font-mono text-[9px] text-muted-foreground">6MO TREND</span>
          </div>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={shipmentVolume} barCategoryGap="20%">
              <XAxis
                dataKey="month"
                tick={{ fontSize: 9, fontFamily: "JetBrains Mono", fill: "hsl(var(--foreground))" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis hide />
              <Bar dataKey="volume" radius={0}>
                {shipmentVolume.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={
                      i === shipmentVolume.length - 1
                        ? "hsl(8, 87%, 36%)"
                        : "hsl(var(--foreground) / 0.15)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Port Activity */}
        <div className="border border-border p-4 mb-3">
          <span className="font-mono text-[10px] tracking-widest font-semibold block mb-3">PORT_ACTIVITY</span>
          <div className="space-y-2">
            {portActivity.map((port) => (
              <div key={port.port} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Anchor className="h-3 w-3 text-muted-foreground" />
                  <span className="font-mono text-[10px]">{port.port.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Ship className="h-3 w-3" />
                    <span className="font-mono text-[10px] font-bold">{port.active}</span>
                  </div>
                  {port.delayed > 0 && (
                    <span className="font-mono text-[9px] text-primary border border-primary px-1 py-0.5">
                      {port.delayed} DELAYED
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Scores */}
        <div className="border border-border p-4 mb-6">
          <span className="font-mono text-[10px] tracking-widest font-semibold block mb-3">SUPPLIER_COMPLIANCE</span>
          <div className="space-y-2">
            {complianceScores.map((s) => (
              <div key={s.supplier} className="flex items-center justify-between">
                <span className="text-[11px]">{s.supplier}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-border">
                    <div
                      className={`h-full ${s.score < 80 ? "bg-primary" : "bg-foreground"}`}
                      style={{ width: `${s.score}%` }}
                    />
                  </div>
                  <span className={`font-mono text-[10px] font-bold ${s.score < 80 ? "text-primary" : ""}`}>
                    {s.score}
                  </span>
                  {trendIcon[s.trend]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Feed Cards */}
        <h3 className="font-mono text-[11px] tracking-widest font-semibold mb-3">LIVE_FEED</h3>
        <div className="space-y-3 mb-8">
          {feedCards.map((card, i) => (
            <button
              key={card.id}
              onClick={() => setActiveFeedCard(i)}
              className={`w-full text-left border transition-all animate-fade-slide-up group ${
                activeFeedCard === i
                  ? "border-primary"
                  : "border-border hover:border-foreground/30"
              }`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="relative overflow-hidden h-28">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-2 left-2">
                  <span className="font-mono text-[9px] tracking-wider bg-background/90 px-2 py-0.5 border border-border">
                    {card.tag}
                  </span>
                </div>
              </div>
              <div className="p-3">
                <p className="font-mono text-xs font-semibold">{card.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{card.subtitle}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ─── CENTER: QUICK ACTIONS + TASKS + PROJECTS ─── */}
      <div className="border-r border-border p-6 overflow-auto">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="font-mono text-lg font-bold tracking-tight mb-1">
            ASK ANYTHING<span className="text-primary">.</span>
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Context assembled from your email, meetings, documents & workflows
          </p>

          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => (
              <button
                key={action.id}
                className="p-3 border border-border hover:border-primary transition-all text-left group"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-primary">{iconMap[action.icon]}</span>
                  <span className="font-mono text-[10px] tracking-wider font-semibold">
                    {action.label}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Task Tracker */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-mono text-[11px] tracking-widest font-semibold">TASK_TRACKER</h3>
            <span className="font-mono text-[10px] text-muted-foreground">
              {tasks.filter((t) => t.status === "DONE").length}/{tasks.length} COMPLETE
            </span>
          </div>

          <div className="space-y-1.5">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-3 border transition-colors ${
                  task.priority === "high"
                    ? "border-l-2 border-l-primary border-t border-r border-b border-border"
                    : "border-border"
                } ${task.status === "DONE" ? "opacity-60" : ""}`}
              >
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0">{statusIcon[task.status]}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium ${task.status === "DONE" ? "line-through" : ""}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-[9px] tracking-wider text-muted-foreground">
                        {task.project}
                      </span>
                      {task.duplicatesMerged > 0 && (
                        <span className="flex items-center gap-0.5 font-mono text-[9px] text-primary">
                          <GitMerge className="h-2.5 w-2.5" />
                          {task.duplicatesMerged} merged
                        </span>
                      )}
                      <span className="font-mono text-[9px] text-muted-foreground">
                        via {task.source}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`font-mono text-[9px] tracking-wider px-1.5 py-0.5 border shrink-0 ${
                      task.status === "IN_PROGRESS"
                        ? "border-primary text-primary"
                        : task.status === "DONE"
                        ? "border-border text-muted-foreground"
                        : "border-border"
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div>
          <h3 className="font-mono text-[11px] tracking-widest font-semibold mb-3">ACTIVE_PROJECTS</h3>
          <div className="space-y-2">
            {projects.map((project) => (
              <button
                key={project.id}
                className="w-full text-left p-4 border border-border hover:border-foreground/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-semibold">{project.name}</span>
                  <span
                    className={`font-mono text-[9px] tracking-wider px-1.5 py-0.5 border ${
                      project.status === "AT_RISK"
                        ? "border-primary text-primary"
                        : "border-border"
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
                <div className="w-full h-1 bg-border mb-2">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground truncate">
                    {project.lastActivity}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                    {project.tasks.done}/{project.tasks.total}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── RIGHT: CONTEXT INTELLIGENCE ─── */}
      <div className="p-6 overflow-auto">
        <h3 className="font-mono text-[11px] tracking-widest font-semibold mb-4">CONTEXT_INTELLIGENCE</h3>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <div className="p-3 border border-border">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap className="h-3 w-3 text-primary" />
              <span className="font-mono text-[10px] tracking-wider">WORKFLOWS</span>
            </div>
            <p className="font-mono text-lg font-bold">{contextIntelligence.activeWorkflows}</p>
            <p className="text-[10px] text-muted-foreground">
              {contextIntelligence.runningWorkflows} running
            </p>
          </div>
          <div className="p-3 border border-border">
            <div className="flex items-center gap-1.5 mb-1">
              <Bell className="h-3 w-3 text-primary" />
              <span className="font-mono text-[10px] tracking-wider">APPROVALS</span>
            </div>
            <p className="font-mono text-lg font-bold">{contextIntelligence.pendingApprovals}</p>
            <p className="text-[10px] text-primary">
              {contextIntelligence.urgentApprovals} urgent
            </p>
          </div>
          <div className="p-3 border border-border">
            <div className="flex items-center gap-1.5 mb-1">
              <Mail className="h-3 w-3" />
              <span className="font-mono text-[10px] tracking-wider">INBOX</span>
            </div>
            <p className="font-mono text-lg font-bold">{contextIntelligence.unreadInbox}</p>
            <p className="text-[10px] text-muted-foreground">unread</p>
          </div>
          <div className="p-3 border border-border">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="h-3 w-3" />
              <span className="font-mono text-[10px] tracking-wider">TASKS</span>
            </div>
            <p className="font-mono text-lg font-bold">{tasks.filter((t) => t.status !== "DONE").length}</p>
            <p className="text-[10px] text-muted-foreground">pending</p>
          </div>
        </div>

        {/* Calendar */}
        <div className="mb-6">
          <div className="flex items-center gap-1.5 mb-3">
            <CalendarDays className="h-3 w-3" />
            <span className="font-mono text-[10px] tracking-widest font-semibold">NEXT_MEETINGS</span>
          </div>
          <div className="space-y-1.5">
            {contextIntelligence.nextMeetings.map((meeting) => (
              <div key={meeting.id} className="p-2.5 border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium truncate">{meeting.title}</span>
                  <span className="font-mono text-[10px] text-primary shrink-0">{meeting.time}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">{meeting.attendees} attendees</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Chats */}
        <div className="mb-6">
          <h3 className="font-mono text-[10px] tracking-widest font-semibold mb-3">RECENT_CHATS</h3>
          <div className="space-y-1.5">
            {recentChats.map((chat) => (
              <button
                key={chat.id}
                className="w-full text-left p-2.5 border border-border hover:border-foreground/30 transition-colors"
              >
                <p className="text-xs font-medium truncate">{chat.title}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-muted-foreground truncate">{chat.participants}</span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 shrink-0">
                    <Clock className="h-2.5 w-2.5" />
                    {chat.time}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <Zap className="h-3 w-3 text-primary" />
            <span className="font-mono text-[10px] tracking-widest font-semibold">AI_INSIGHTS</span>
          </div>
          <div className="space-y-1.5">
            {contextIntelligence.insights.map((insight, i) => (
              <div
                key={i}
                className="p-2.5 border-l-2 border-l-primary border border-border flex items-start gap-2"
              >
                <ArrowRight className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                <span className="text-[11px]">{insight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
