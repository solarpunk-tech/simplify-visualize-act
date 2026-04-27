import { useEffect, useState, useMemo } from "react";
import {
  BrainIcon,
  CalendarBlankIcon,
  ChartBarIcon,
  CheckSquareIcon,
  EnvelopeSimpleIcon,
  MagnifyingGlassIcon,
  RobotIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useShellState } from "@/hooks/use-shell-state";
import { approvals, meetings } from "@/lib/ubik-data";
import { useLocation } from "react-router-dom";

const iconMap: Record<string, React.ReactNode> = {
  Search: <MagnifyingGlassIcon className="h-3.5 w-3.5" />,
  Brain: <BrainIcon className="h-3.5 w-3.5" />,
  Mail: <EnvelopeSimpleIcon className="h-3.5 w-3.5" />,
  BarChart3: <ChartBarIcon className="h-3.5 w-3.5" />,
  Bot: <RobotIcon className="h-3.5 w-3.5" />,
  Calendar: <CalendarBlankIcon className="h-3.5 w-3.5" />,
  CheckSquare: <CheckSquareIcon className="h-3.5 w-3.5" />,
};

type CommandItem = {
  id: string;
  label: string;
  shortcut?: string;
  icon: keyof typeof iconMap;
};

type CommandSection = {
  id: string;
  label: string;
  layout: "vertical" | "horizontal";
  items: CommandItem[];
};

function loadIdList(key: string, fallback: string[]) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallback;
    const unique = Array.from(new Set(parsed.filter((value) => typeof value === "string")));
    return unique;
  } catch {
    return fallback;
  }
}

export function CommandPalette() {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    createTab,
    navigateCurrentTab,
    openDrawer,
    openRuntime,
    setPageState,
  } = useShellState();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState(0);
  const [selectedItem, setSelectedItem] = useState(0);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === "Escape") setCommandPaletteOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    if (!commandPaletteOpen) return;
    setQuery("");
    setSelectedSection(0);
    setSelectedItem(0);
  }, [commandPaletteOpen]);

  const displayedSections = useMemo<CommandSection[]>(() => {
    const suggested: CommandSection = {
      id: "suggested",
      label: "SUGGESTED",
      layout: "vertical",
      items: [
        { id: "compose_message", label: "Compose message", icon: "Mail", shortcut: "" },
        { id: "setup_new_project", label: "Setup new project", icon: "BarChart3", shortcut: "" },
        { id: "prepare_for_meeting", label: "Prepare for meeting", icon: "Calendar", shortcut: "" },
        { id: "learn_with_ubik", label: "Learn with UBIK", icon: "Brain", shortcut: "" },
      ],
    };

    const allQuick = [
      { id: "priorities_summarize", label: "Summarize today's priorities", icon: "Brain" as const, shortcut: "" },
      { id: "delay_notice_draft", label: "Draft delay notice", icon: "Mail" as const, shortcut: "" },
      { id: "compliance_check_run", label: "Run compliance check across all shipments", icon: "CheckSquare" as const, shortcut: "" },
      { id: "market_digest_weekly", label: "Generate weekly market digest", icon: "BarChart3" as const, shortcut: "" },
    ];

    const allAgents = [
      { id: "agent_market_rate_scan", label: "Market rate scan", icon: "Search" as const, shortcut: "" },
      { id: "agent_competitor_analysis", label: "Competitor analysis", icon: "Brain" as const, shortcut: "" },
      { id: "agent_revenue_estimates", label: "Update revenue estimates", icon: "BarChart3" as const, shortcut: "" },
      { id: "agent_scrape_exim", label: "Scrape EXIM data", icon: "Search" as const, shortcut: "" },
    ];

    const data: CommandSection = {
      id: "data",
      label: "DATA",
      layout: "vertical",
      items: [
        { id: "approvals_fetch_pending", label: "Fetch pending approvals from agents", icon: "Bot", shortcut: "" },
        { id: "schedule_pull_today", label: "Pull today's schedule from Gmail", icon: "Calendar", shortcut: "" },
      ],
    };

    const quickIds = loadIdList(
      "ubik:quick_actions",
      allQuick.map((item) => item.id),
    ).slice(0, 4);
    const agentIds = loadIdList(
      "ubik:agent_workflows",
      allAgents.map((item) => item.id),
    ).slice(0, 4);

    const quickMap = new Map(allQuick.map((item) => [item.id, item] as const));
    const agentMap = new Map(allAgents.map((item) => [item.id, item] as const));

    const quick: CommandSection = {
      id: "quick",
      label: "QUICK ACTIONS",
      layout: "vertical",
      items: quickIds.map((id) => quickMap.get(id)).filter(Boolean) as CommandItem[],
    };

    const agents: CommandSection = {
      id: "agents",
      label: "AGENT WORKFLOWS",
      layout: "vertical",
      items: agentIds.map((id) => agentMap.get(id)).filter(Boolean) as CommandItem[],
    };

    return [suggested, quick, agents, data].filter((section) => section.items.length);
  }, []);

  const currentSurface = useMemo(() => {
    const pathname = location.pathname;
    if (pathname.startsWith("/inbox")) return "Inbox";
    if (pathname.startsWith("/meetings")) return "Meetings";
    if (pathname.startsWith("/projects")) return "Projects";
    if (pathname.startsWith("/approvals")) return "Approvals";
    if (pathname.startsWith("/intelligence")) return "Intelligence";
    return "Know Anything";
  }, [location.pathname]);

  const defaultNewChatPrompt = (seed: string) => {
    const trimmed = seed.trim();
    const base = trimmed ? trimmed : "Start a new operator task.";
    return `${base}\n\nCurrent surface: ${currentSurface}\nConnectors available: Gmail, Slack, WhatsApp, ERP`;
  };

  const runCommand = (commandId: string) => {
    setCommandPaletteOpen(false);

    if (commandId === "compose_message") {
      const nextTabId = createTab("/");
      if (nextTabId) {
        setPageState(
          `${nextTabId}:chat-composer`,
          defaultNewChatPrompt(
            "Compose an email message. Include: To, Subject, and a concise body. Ask me for missing details.",
          ),
        );
      }
      openDrawer({
        title: "Email compose",
        eyebrow: "Compose",
        description: "Seeded email compose surface. Draft in Know Anything, then copy into your mail client.",
        metadata: [
          { label: "To", value: "Select recipient" },
          { label: "Subject", value: "Add subject" },
        ],
        actions: ["Draft delay notice", "Draft approval request", "Draft meeting recap"],
      });
      return;
    }

    if (commandId === "setup_new_project") {
      navigateCurrentTab("/projects");
      openDrawer({
        title: "New project",
        eyebrow: "Projects",
        description: "Seeded project creation. Define goal, owner, timeline, and the first three actions.",
        metadata: [
          { label: "Owner", value: "Assign owner" },
          { label: "Timeline", value: "Set ETA" },
          { label: "Status", value: "On track" },
        ],
        actions: ["Add milestones", "Attach inbox threads", "Attach approvals"],
      });
      return;
    }

    if (commandId === "prepare_for_meeting") {
      navigateCurrentTab("/meetings");
      const upcoming = meetings.filter((item) => item.stage === "Upcoming");
      const nextMeeting = upcoming[0];
      openDrawer({
        title: "Meeting prep",
        eyebrow: "Meetings",
        description: "Seeded prep checklist for the next meeting.",
        metadata: nextMeeting
          ? [
              { label: "Next", value: nextMeeting.title },
              { label: "Time", value: nextMeeting.time },
            ]
          : [{ label: "Next", value: "No upcoming meetings" }],
        timeline: nextMeeting ? nextMeeting.agenda : ["Pull agenda", "Attach inbox items", "List decisions needed"],
        actions: ["Open Meetings", "Attach context", "Draft briefing"],
      });
      return;
    }

    if (commandId === "learn_with_ubik") {
      navigateCurrentTab("/help");
      openDrawer({
        title: "Learn with UBIK",
        eyebrow: "Training",
        description: "Training and guidance surface for questions, workflows, and operator patterns.",
        actions: ["Operator basics", "Inbox to approvals flow", "Meeting prep patterns", "Project follow through"],
      });
      return;
    }

    if (commandId === "priorities_summarize") {
      const nextTabId = createTab("/");
      if (nextTabId) {
        setPageState(
          `${nextTabId}:chat-composer`,
          "Summarize today's priorities using Inbox, Approvals, and Meetings. Output top 5 priorities with next action, owner, and ETA.",
        );
      }
      return;
    }

    if (commandId === "delay_notice_draft") {
      const nextTabId = createTab("/");
      if (nextTabId) {
        setPageState(
          `${nextTabId}:chat-composer`,
          "Draft a delay notice for a shipment. Include reason, updated ETA, mitigation steps, and next update time. Keep tone concise and professional.",
        );
      }
      return;
    }

    if (commandId === "market_digest_weekly") {
      const nextTabId = createTab("/");
      if (nextTabId) {
        setPageState(
          `${nextTabId}:chat-composer`,
          "Generate a weekly market digest. Include rate changes, risks, anomalies, and recommended actions. Keep it 10 bullets max.",
        );
      }
      return;
    }

    if (commandId === "compliance_check_run") {
      openRuntime({
        title: "Compliance check",
        status: "Running",
        lines: ["> Scanning shipments", "> Checking documents", "> Flagging exceptions", "> Ready"],
        artifactLabel: "Compliance summary",
      });

      openDrawer({
        title: "Compliance check summary",
        eyebrow: "Compliance",
        description: "Seeded scan across shipments, highlighting missing documents and exceptions.",
        metadata: [
          { label: "Shipments scanned", value: "28" },
          { label: "Exceptions", value: "4" },
          { label: "Ready for review", value: "Yes" },
        ],
        timeline: [
          "Thai Union: HACCP certificate missing",
          "Container YB-7221: inspection note pending",
          "Atlantic Fresh: temperature log incomplete",
          "Mumbai port: customs hold requires update",
        ],
        actions: ["Open Approvals queue", "Draft customer delay notice", "Request missing documents"],
      });
      return;
    }

    if (commandId === "approvals_fetch_pending") {
      const urgentCount = approvals.filter((item) => item.status === "Urgent").length;
      const reviewCount = approvals.filter((item) => item.status === "Review").length;
      const topItems = [...approvals]
        .sort((a, b) => {
          if (a.status !== b.status) return a.status === "Urgent" ? -1 : 1;
          return b.confidence - a.confidence;
        })
        .slice(0, 3);

      openRuntime({
        title: "Approvals fetch",
        status: "Ready",
        lines: ["> Pulling approvals", "> De-duplicating", "> Ready"],
        artifactLabel: "Approval snapshot",
      });

      openDrawer({
        title: "Pending approvals",
        eyebrow: "Agents",
        description: "Seeded pull of approval items awaiting human review.",
        metadata: [
          { label: "Urgent", value: String(urgentCount) },
          { label: "Review", value: String(reviewCount) },
        ],
        timeline: topItems.map((item) => `${item.status}: ${item.title}`),
        actions: ["Open Approvals", "Inspect provenance", "Approve or reject"],
      });

      navigateCurrentTab("/approvals");
      return;
    }

    if (commandId === "schedule_pull_today") {
      const upcoming = meetings.filter((item) => item.stage === "Upcoming");
      const nextMeeting = upcoming[0];

      openRuntime({
        title: "Schedule pull",
        status: "Ready",
        lines: ["> Connecting to Gmail", "> Reading calendar", "> Ready"],
        artifactLabel: "Today's agenda",
      });

      openDrawer({
        title: "Today's schedule",
        eyebrow: "Gmail",
        description: "Seeded schedule view with the next meeting and prep checklist.",
        metadata: nextMeeting
          ? [
              { label: "Next meeting", value: nextMeeting.title },
              { label: "Time", value: nextMeeting.time },
            ]
          : [{ label: "Next meeting", value: "No upcoming meetings" }],
        timeline: nextMeeting ? nextMeeting.agenda.map((item) => `Prep: ${item}`) : [],
        actions: ["Open Meetings", "Prepare meeting brief", "Attach inbox threads"],
      });

      navigateCurrentTab("/meetings");
      return;
    }

    if (commandId === "agent_market_rate_scan") {
      openRuntime({
        title: "Market rate scan",
        status: "Ready",
        lines: ["> Scanning lanes", "> Comparing week over week", "> Flagging anomalies", "> Ready"],
        artifactLabel: "Rate scan brief",
      });
      openDrawer({
        title: "Market rate scan",
        eyebrow: "Agent workflow",
        description: "Seeded scan across lanes. Replace with real data source later.",
        metadata: [
          { label: "Lanes", value: "8" },
          { label: "Anomalies", value: "2" },
        ],
        timeline: ["Mumbai to Rotterdam: +3.2%", "Atlantic Fresh lane: margin anomaly flagged"],
        actions: ["Open Intelligence", "Generate digest", "Notify ops desk"],
      });
      navigateCurrentTab("/intelligence");
      return;
    }

    if (commandId === "agent_competitor_analysis") {
      openRuntime({
        title: "Competitor analysis",
        status: "Ready",
        lines: ["> Pulling sources", "> Extracting key claims", "> Summarizing", "> Ready"],
        artifactLabel: "Competitor brief",
      });
      openDrawer({
        title: "Competitor analysis",
        eyebrow: "Agent workflow",
        description: "Seeded competitor brief. Replace with real monitors later.",
        timeline: ["New capacity in APAC lanes", "Pricing pressure in Q3", "Service level shifts"],
        actions: ["Open Intelligence", "Create monitor", "Share summary"],
      });
      navigateCurrentTab("/intelligence");
      return;
    }

    if (commandId === "agent_revenue_estimates") {
      openRuntime({
        title: "Revenue estimates update",
        status: "Ready",
        lines: ["> Pulling shipments", "> Estimating margin", "> Writing summary", "> Ready"],
        artifactLabel: "Revenue estimate delta",
      });
      openDrawer({
        title: "Revenue estimate update",
        eyebrow: "Agent workflow",
        description: "Seeded revenue delta. Replace with real ERP integration later.",
        metadata: [
          { label: "Accounts", value: "6" },
          { label: "Delta", value: "+1.8%" },
        ],
        actions: ["Open Intelligence", "Generate report", "Notify finance"],
      });
      navigateCurrentTab("/intelligence");
      return;
    }

    if (commandId === "agent_scrape_exim") {
      openRuntime({
        title: "EXIM scrape",
        status: "Ready",
        lines: ["> Fetching records", "> Normalizing", "> Storing", "> Ready"],
        artifactLabel: "EXIM extract",
      });
      openDrawer({
        title: "EXIM data scrape",
        eyebrow: "Agent workflow",
        description: "Seeded extract. Replace with real connector later.",
        metadata: [
          { label: "Records", value: "1,248" },
          { label: "Status", value: "Stored" },
        ],
        actions: ["Open Intelligence", "Create monitor", "Generate digest"],
      });
      navigateCurrentTab("/intelligence");
      return;
    }
  };

  const filteredSections = useMemo(() => {
    if (!query) return displayedSections;
    return displayedSections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.label.toLowerCase().includes(query.toLowerCase()) ||
            section.label.toLowerCase().includes(query.toLowerCase())
        ),
      }))
      .filter((s) => s.items.length > 0);
  }, [displayedSections, query]);

  // Flat list for keyboard navigation
  const flatItems = useMemo(() => {
    return filteredSections.flatMap((s, si) =>
      s.items.map((item, ii) => ({ ...item, sectionIndex: si, itemIndex: ii, sectionLabel: s.label }))
    );
  }, [filteredSections]);

  const globalIndex = useMemo(() => {
    let idx = 0;
    for (let s = 0; s < selectedSection; s++) {
      idx += (filteredSections[s]?.items.length || 0);
    }
    return idx + selectedItem;
  }, [selectedSection, selectedItem, filteredSections]);

  useEffect(() => {
    setSelectedSection(0);
    setSelectedItem(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const newGlobal = Math.min(globalIndex + 1, flatItems.length - 1);
      const item = flatItems[newGlobal];
      if (item) {
        setSelectedSection(item.sectionIndex);
        setSelectedItem(item.itemIndex);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const newGlobal = Math.max(globalIndex - 1, 0);
      const item = flatItems[newGlobal];
      if (item) {
        setSelectedSection(item.sectionIndex);
        setSelectedItem(item.itemIndex);
      }
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      const section = filteredSections[selectedSection];
      if (section?.layout === "horizontal") {
        setSelectedItem((i) => Math.min(i + 1, section.items.length - 1));
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const section = filteredSections[selectedSection];
      if (section?.layout === "horizontal") {
        setSelectedItem((i) => Math.max(i - 1, 0));
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = flatItems[globalIndex];
      if (item) runCommand(item.id);
    }
  };

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]" onClick={() => setCommandPaletteOpen(false)}>
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

      <div
        className="relative mx-auto mt-[12vh] w-full max-w-[600px] overflow-hidden rounded-xl border border-border/70 bg-card shadow-[0_24px_80px_-12px_hsl(var(--foreground)/0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center border-b border-border px-4">
          <MagnifyingGlassIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="h-12 flex-1 rounded-none border-0 bg-transparent px-3 py-3.5 font-mono text-sm shadow-none focus-visible:ring-0"
          />
          <kbd className="font-mono text-[10px] tracking-wider text-muted-foreground border border-border px-1.5 py-0.5">
            ESC
          </kbd>
        </div>

        {/* Sections */}
        <div className="max-h-[420px] overflow-y-auto">
          {filteredSections.map((section, sIdx) => (
            <div key={section.id} className="border-b border-border/70 last:border-b-0">
              <div className="px-4 py-2 text-[10px] font-medium tracking-widest text-muted-foreground">
                {section.label}
              </div>

              {section.layout === "horizontal" ? (
                /* Horizontal scrollable cards */
                <div className="px-4 pb-3 flex gap-2 overflow-x-auto">
                  {section.items.map((item, iIdx) => {
                    const isSelected = selectedSection === sIdx && selectedItem === iIdx;
                    return (
                      <Button
                        key={item.id}
                        onClick={() => runCommand(item.id)}
                        variant={isSelected ? "default" : "outline"}
                        className="h-auto min-w-[136px] shrink-0 flex-col items-start gap-2 px-3 py-3 text-left shadow-none"
                      >
                        <span className={isSelected ? "text-primary-foreground" : "text-muted-foreground"}>
                          {iconMap[item.icon] || <MagnifyingGlassIcon className="h-3.5 w-3.5" />}
                        </span>
                        <span className="text-xs font-medium">{item.label}</span>
                        {item.shortcut && (
                          <kbd className={`font-mono text-[9px] ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                            {item.shortcut}
                          </kbd>
                        )}
                      </Button>
                    );
                  })}
                </div>
              ) : (
                /* Vertical list */
                <div>
                  {section.items.map((item, iIdx) => {
                    const isSelected = selectedSection === sIdx && selectedItem === iIdx;
                    return (
                      <Button
                        key={item.id}
                        onClick={() => runCommand(item.id)}
                        variant={isSelected ? "secondary" : "ghost"}
                        className="h-auto w-full items-center justify-between rounded-none px-4 py-3 text-left transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className={isSelected ? "text-foreground" : "text-muted-foreground"}>
                            {iconMap[item.icon] || <MagnifyingGlassIcon className="h-3.5 w-3.5" />}
                          </span>
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                        {item.shortcut && (
                          <kbd
                            className={`font-mono text-[10px] px-1.5 py-0.5 ${
                              isSelected
                                ? "text-foreground/60"
                                : "text-muted-foreground border border-border"
                            }`}
                          >
                            {item.shortcut}
                          </kbd>
                        )}
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
          {filteredSections.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="font-mono text-xs text-muted-foreground">NO_RESULTS</p>
              <div className="mx-auto mt-5 max-w-[520px] text-left">
                <Button
                  variant="outline"
                  className="h-auto w-full justify-start rounded-none px-4 py-3 text-left transition-colors hover:bg-muted"
                  onClick={() => {
                    const nextTabId = createTab("/");
                    setCommandPaletteOpen(false);
                    if (nextTabId) setPageState(`${nextTabId}:chat-composer`, defaultNewChatPrompt(query));
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-xs uppercase tracking-[0.14em]">New chat</span>
                    <kbd className="border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">↵</kbd>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground truncate">{query ? query : "Start a new task"}</p>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border/70 px-4 py-2 flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[9px] text-muted-foreground">↑↓ NAVIGATE</span>
            <span className="font-mono text-[9px] text-muted-foreground">←→ SCROLL</span>
            <span className="font-mono text-[9px] text-muted-foreground">↵ SELECT</span>
          </div>
          <span className="font-mono text-[9px] text-muted-foreground">⌘K TO TOGGLE</span>
        </div>
      </div>
    </div>
  );
}
