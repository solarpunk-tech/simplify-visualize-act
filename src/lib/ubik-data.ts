import type {
  ActivityFeedItem,
  AgentRecord,
  ApprovalItem,
  ArchiveRecord,
  ContactCard,
  HelpResource,
  InboxThread,
  IntelligenceRecord,
  MeetingRecord,
  NavigationItem,
  PinnedItem,
  ProjectRecord,
  QuickConnection,
  RecentItem,
  RouteMeta,
  SettingsSection,
  SignalItem,
  StarterAction,
  ProjectPreset,
  WorkbenchTab,
  WorkflowDefinition,
  WorkflowRun,
} from "@/lib/ubik-types";

export const routeMetas: RouteMeta[] = [
  {
    key: "home",
    title: "Home",
    path: "/home",
    description: "Daily operating brief with widgets, actions, and execution signals.",
    actions: [{ label: "Refresh", kind: "secondary" }],
  },
  {
    key: "chat",
    title: "Know Anything",
    path: "/chat",
    description: "Ask across organization, inbox, meetings, projects or internet, when you need them.",
    actions: [{ label: "New Thread", kind: "primary" }, { label: "Share", kind: "secondary" }],
  },
  {
    key: "inbox",
    title: "Inbox",
    path: "/inbox",
    description: "Unified thread intelligence across inbound channels and extracted tasks.",
    actions: [{ label: "Sort", kind: "secondary" }, { label: "Filter", kind: "secondary" }],
  },
  {
    key: "meetings",
    title: "Meetings",
    path: "/meetings",
    description: "Meeting continuity, decisions, and follow-through.",
    actions: [{ label: "Schedule", kind: "primary" }, { label: "Prep", kind: "secondary" }],
  },
  {
    key: "projects",
    title: "Projects",
    path: "/projects",
    description: "Operational workstreams connected to people, files, and approvals.",
    actions: [{ label: "New Project", kind: "primary" }, { label: "Review", kind: "secondary" }],
  },
  {
    key: "intelligence",
    title: "Intelligence",
    path: "/intelligence",
    description: "Research, monitoring, policy watch, and saved briefings.",
    actions: [{ label: "Research", kind: "primary" }, { label: "Monitor", kind: "secondary" }],
  },
  {
    key: "approvals",
    title: "Approvals",
    path: "/approvals",
    description: "Human-in-the-loop review queue with auditable recommendations.",
    actions: [{ label: "Review", kind: "primary" }, { label: "Filter", kind: "secondary" }],
  },
  {
    key: "workflows",
    title: "Workflows",
    path: "/workflows",
    description: "Deployable playbooks with runs, schedules, and queue visibility.",
    actions: [{ label: "New Workflow", kind: "primary" }, { label: "Queue", kind: "secondary" }],
  },
  {
    key: "agents",
    title: "Agents",
    path: "/agents",
    description: "Specialist agents monitored for health, outcomes, and approval mode.",
    actions: [{ label: "New Agent", kind: "primary" }, { label: "Inspect", kind: "secondary" }],
  },
  {
    key: "archive",
    title: "Archive",
    path: "/archive",
    description: "Historical records, completed runs, and prior conversations.",
    actions: [{ label: "Browse", kind: "secondary" }],
  },
  {
    key: "settings",
    title: "Settings",
    path: "/settings",
    description: "Workspace preferences, connectors, and environment details.",
    actions: [{ label: "Preferences", kind: "secondary" }],
  },
  {
    key: "help",
    title: "Help",
    path: "/help",
    description: "Operator guides, escalation paths, and implementation notes.",
    actions: [{ label: "Support", kind: "secondary" }],
  },
];

export const navigationItems: NavigationItem[] = [
  { key: "home", title: "Home", path: "/home", section: "navigate" },
  { key: "chat", title: "Know Anything", path: "/chat", section: "navigate" },
  { key: "inbox", title: "Inbox", path: "/inbox", section: "navigate", badge: "12" },
  { key: "meetings", title: "Meetings", path: "/meetings", section: "navigate" },
  { key: "projects", title: "Projects", path: "/projects", section: "navigate" },
  { key: "intelligence", title: "Intelligence", path: "/intelligence", section: "navigate", status: "watching" },
  { key: "approvals", title: "Approvals", path: "/approvals", section: "navigate", badge: "4", status: "urgent" },
  { key: "workflows", title: "Workflows", path: "/workflows", section: "playbooks", status: "live" },
  { key: "agents", title: "Agents", path: "/agents", section: "playbooks", status: "healthy" },
  { key: "archive", title: "Archive", path: "/archive", section: "support" },
  { key: "settings", title: "Settings", path: "/settings", section: "support" },
  { key: "help", title: "Help", path: "/help", section: "support" },
];

export const initialWorkbenchTabs: WorkbenchTab[] = [
  { id: "home-main", routeKey: "home", title: "Home", path: "/home", pinned: true, closable: false },
  { id: "chat-main", routeKey: "chat", title: "Know Anything", path: "/chat", pinned: true, closable: true },
  { id: "inbox-main", routeKey: "inbox", title: "Inbox", path: "/inbox", pinned: true, closable: true },
  { id: "meetings-main", routeKey: "meetings", title: "Meetings", path: "/meetings", pinned: true, closable: true },
  { id: "projects-main", routeKey: "projects", title: "Projects", path: "/projects", pinned: true, closable: true },
];

export const workbenchLauncherRoutes = routeMetas.filter((route) =>
  ["/home", "/chat", "/inbox", "/meetings", "/projects", "/intelligence", "/approvals"].includes(route.path),
);

export const pinnedItems: PinnedItem[] = [
  { id: "pin-1", title: "Rate confirmation response", type: "chat", subtitle: "Awaiting legal sign-off" },
  { id: "pin-2", title: "Mumbai-Rotterdam Q2", type: "project", subtitle: "18 days remaining" },
  { id: "pin-3", title: "Daily pricing workflow", type: "workflow", subtitle: "Runs at 06:00 UTC" },
  { id: "pin-4", title: "Thai Union exception", type: "approval", subtitle: "Urgent review" },
  { id: "pin-5", title: "Supplier review sync", type: "meeting", subtitle: "Today · 10:30 AM" },
];

export const recentItems: RecentItem[] = [
  { id: "recent-1", title: "Thai Union response draft", type: "chat", time: "12 min ago" },
  { id: "recent-2", title: "Supplier review sync", type: "meeting", time: "34 min ago" },
  { id: "recent-3", title: "Pricing monitor run 842", type: "workflow", time: "1 hr ago" },
  { id: "recent-4", title: "Atlantic Fresh Q3", type: "project", time: "2 hrs ago" },
  { id: "recent-5", title: "Container handoff note", type: "file", time: "Today" },
  { id: "recent-6", title: "Morning operator brief", type: "chat", time: "Yesterday" },
];

export const quickConnections: QuickConnection[] = [
  { id: "gmail", label: "Gmail", state: "connected" },
  { id: "slack", label: "Slack", state: "connected" },
  { id: "whatsapp", label: "WhatsApp", state: "connected" },
  { id: "erp", label: "ERP", state: "watching" },
  { id: "crm", label: "CRM", state: "connected" },
  { id: "drive", label: "Drive", state: "connected" },
  { id: "calendar", label: "Calendar", state: "connected" },
];

export const starterActions: StarterAction[] = [
  { id: "start-1", title: "Analyze recent emails", description: "Assemble context and flag what needs a response now." },
  { id: "start-2", title: "Continue project thread", description: "Reopen the last project conversation with linked files and approvals." },
  { id: "start-3", title: "Review pending approvals", description: "Open the human review queue with recommendations and provenance." },
  { id: "start-4", title: "Start market research", description: "Create a fresh research thread with saved monitors attached." },
];

export const askAnythingPrompts = [
  "Draft a customer update using Inbox + cargo ETA shifts + latest meeting decisions.",
  "Build a supplier follow-up plan from compliance expiry items, then prepare approval-ready drafts.",
  "Compare last pricing bids by SKU, summarize margin impact, and propose next negotiation steps.",
  "Turn today's meetings + inbox into a prioritized execution checklist with owners and due dates.",
];

export const chatSignals: SignalItem[] = [
  { id: "signal-1", label: "Inbox requiring response", value: "12 items", tone: "alert" },
  { id: "signal-2", label: "Approvals waiting", value: "4 reviews", tone: "alert" },
  { id: "signal-3", label: "Meetings today", value: "3 sessions" },
  { id: "signal-4", label: "Workflow runs live", value: "2 executing" },
];

export const chatRecentWork = [
  {
    id: "work-1",
    title: "Thai Union compliance thread",
    summary: "Context assembled from email, WhatsApp, and prior meeting notes.",
  },
  {
    id: "work-2",
    title: "Pricing monitor daily brief",
    summary: "Watchlist refreshed with margin anomalies across three suppliers.",
  },
  {
    id: "work-3",
    title: "Rotterdam inspection prep",
    summary: "Meeting prep packet and approval checklist generated for operator review.",
  },
];

export const inboxThreads: InboxThread[] = [
  {
    id: "thread-1",
    source: "Email",
    sender: "Sarah Kim",
    subject: "Q2 rate confirmation requires executive response",
    preview: "The forwarder accepted the revised rate, but legal language on detention still needs your approval before we release the reply.",
    priority: "Critical",
    owner: "Hemanth",
    status: "Action required",
    time: "08:42",
    extractedTasks: [
      "Approve the reply draft",
      "Confirm detention clause language with legal",
      "Update the project thread after send",
    ],
    recommendedReply: "Approve with clause 4.2 preserved and copy legal on the outbound note.",
    provenance: [
      "Email thread: Sarah Kim -> You (today 08:42)",
      "Linked workflow: Sales PI to PO",
      "Reference: Contract MR-Q2 rev 3",
    ],
    attachments: ["Contract redline.pdf", "Rate summary.xlsx"],
    domainTag: "Commercial",
    intentTag: "Approval",
    branchGroupId: "q2-rate-confirmation",
    branchCount: 3,
    approvalRequired: true,
    isUnread: true,
  },
  {
    id: "thread-2",
    source: "Slack",
    sender: "Raj Mehta",
    subject: "Cold-chain delay at Mumbai port",
    preview: "Customs hold has shifted the handoff window by six hours. Ops wants a decision on whether we inform the buyer now or wait for the inspection note.",
    priority: "High",
    owner: "Ops desk",
    status: "Action required",
    time: "09:15",
    extractedTasks: ["Decide if buyer is notified now", "Link the delay to the project timeline"],
    recommendedReply: "Notify the buyer now with a provisional ETA and append inspection details once cleared.",
    provenance: [
      "Slack channel: logistics-ops",
      "System alert: container YB-7221",
      "Meeting note: Logistics sync from yesterday",
    ],
    attachments: ["Port status note"],
    domainTag: "Logistics",
    intentTag: "Follow-up",
    branchGroupId: "rotterdam-delay",
    branchCount: 2,
    isUnread: true,
  },
  {
    id: "thread-3",
    source: "WhatsApp",
    sender: "Thai Union Ops",
    subject: "Compliance documents uploaded late",
    preview: "Supplier asks for a 24-hour extension to upload the remaining HACCP certificates and wants confirmation that the workflow will not block the PO.",
    priority: "High",
    owner: "Compliance",
    status: "Waiting",
    time: "10:07",
    extractedTasks: ["Review extension request", "Decide whether to unblock PO"],
    recommendedReply: "Allow the extension but keep the workflow in manual approval mode until files are validated.",
    provenance: [
      "WhatsApp contact: Thai Union Ops",
      "Approval queue item: supplier exception",
      "Linked project: Supplier Compliance Audit",
    ],
    attachments: ["HACCP renewal screenshot"],
    domainTag: "Compliance",
    intentTag: "Follow-up",
    branchGroupId: "supplier-haccp",
    branchCount: 1,
    approvalRequired: true,
    isUnread: false,
  },
  {
    id: "thread-4",
    source: "System",
    sender: "Workflow monitor",
    subject: "Daily pricing workflow completed",
    preview: "The monitor finished normally and flagged two margin anomalies in the Atlantic Fresh lane. Review is optional unless action is required.",
    priority: "Medium",
    owner: "Automations",
    status: "Reviewed",
    time: "06:00",
    extractedTasks: ["Review anomalies if margin dips continue"],
    recommendedReply: "No outbound response required.",
    provenance: [
      "Workflow run 842",
      "Artifact: Daily pricing brief",
      "Source systems: ERP, supplier feeds",
    ],
    attachments: ["pricing-brief.html"],
    domainTag: "Finance",
    intentTag: "Review",
    branchGroupId: "pricing-digest",
    branchCount: 1,
    isUnread: false,
  },
];

export const meetings: MeetingRecord[] = [
  {
    id: "meeting-1",
    title: "Supplier review - Thai Union",
    time: "Today · 10:30 AM PST",
    dayGroup: "Today",
    stage: "Upcoming",
    domain: "Compliance",
    platform: "Google Meet",
    platformDomain: "meet.google.com",
    owner: "Hemanth",
    participants: ["Raj Mehta", "Thai Union Ops", "Compliance Bot"],
    summary: "Prep review for delayed documentation and exception handling before PO release.",
    agenda: [
      "Confirm missing compliance documents",
      "Decide extension terms",
      "Set follow-up owner and deadline",
    ],
    decisions: ["Pending live meeting"],
    actionItems: ["Carry forward current approval recommendation into the meeting"],
    summaryLines: [
      "Missing compliance docs still block PO release while extension terms remain under review.",
      "Supplier requested a conditional extension with owner/date explicitly tracked.",
    ],
    preReadNudges: [
      "Bring latest compliance expiry sheet before joining.",
      "Confirm who sends the customer update if ETA changes.",
    ],
    preReadContext: {
      whyThisMatters: "Supplier extension terms will directly impact PO release timing for this lane.",
      whatChanged: "Missing compliance docs are now tied to a hard customer handoff window this week.",
      whatIsBlocked: "Outbound customer commitment cannot be finalized until legal wording and docs are verified.",
      recommendedNextStep: "Align owner/date for extension terms, then send one clear customer update draft.",
    },
    schedulingSuggestions: {
      timezoneLabel: "Pacific Time (UTC-08:00)",
      seedDate: "Wed, 15 Apr",
      suggestedSlots: ["9:30 - 10:00 AM", "11:15 - 11:45 AM", "2:30 - 3:00 PM"],
      defaultDurationMinutes: 30,
    },
    landingHelper: {
      relatedMeetings: ["Compliance docs late follow-up", "Supplier exception sign-off"],
      folderHighlights: ["Compliance folder has 2 open risk threads", "Awaiting legal wording update"],
      decisionCarryovers: ["Confirm who owns supplier update before EOD"],
    },
    attendeeBriefs: [
      {
        name: "Raj Mehta",
        role: "Plant Ops Lead",
        whatsOnMind:
          "He wants exception handling to stay practical so operations can release goods without repeated legal loops.",
        worthBringingUp:
          "Offer him ownership of the extension communication timeline since he already coordinates supplier updates.",
        headsUp:
          "He tends to escalate quickly when blockers persist across two cycles. Keep next steps explicit and dated.",
      },
      {
        name: "Thai Union Ops",
        role: "Supplier Team",
        whatsOnMind:
          "They need clarity on exactly which files unlock PO progression and who signs off the exception.",
        worthBringingUp:
          "Propose a mini checklist they can send before each review to avoid repeated back-and-forth.",
        headsUp:
          "If wording stays vague, they may assume conditional approval and act early.",
      },
    ],
    generatedNotes:
      "## Pre-read\n- Missing compliance docs: HACCP + BL copy.\n- Goal: decide extension terms and owner.\n\n## Risks\n- PO release blocked if legal wording is not approved.\n- Customer communication delay could escalate.\n",
    linkedProject: "Supplier Compliance Audit · SCA-26",
    linkedClient: "Thai Union Ops",
    clientDomain: "thaiunion.com",
    vendor: "Thai Union Ops",
    vendorDomain: "thaiunion.com",
    folder: "Compliance",
  },
  {
    id: "meeting-2",
    title: "Logistics sync - Maersk",
    time: "Today · 2:00 PM PST",
    dayGroup: "Today",
    stage: "Upcoming",
    domain: "Logistics",
    platform: "Microsoft Teams",
    platformDomain: "teams.microsoft.com",
    owner: "Ops desk",
    participants: ["Sarah Kim", "Port ops", "Logistics Bot"],
    summary: "Review container delays, revised arrival windows, and customer notification cadence.",
    agenda: ["Validate revised ETA", "Confirm customer comms", "Check inspection timing"],
    decisions: ["Pending live meeting"],
    actionItems: ["Bring open inbox threads related to YB-7221"],
    summaryLines: [
      "Container ETA drift requires same-day customer message alignment.",
      "Inspection timing and revised arrival window need confirmation.",
    ],
    preReadNudges: [
      "Open thread thread-2 and thread-1 before call.",
      "Check transshipment update from Colombo run.",
    ],
    preReadContext: {
      whyThisMatters: "Buyer trust is at risk if ETA messaging drifts again before afternoon.",
      whatChanged: "Inspection timing shifted and the revised container ETA is no longer aligned with yesterday’s note.",
      whatIsBlocked: "Customer communication and project timeline update are blocked on final ops confirmation.",
      recommendedNextStep: "Decide one external message owner and publish the updated ETA path in-call.",
    },
    schedulingSuggestions: {
      timezoneLabel: "Pacific Time (UTC-08:00)",
      seedDate: "Wed, 15 Apr",
      suggestedSlots: ["1:00 - 1:30 PM", "3:30 - 4:00 PM", "5:00 - 5:30 PM"],
      defaultDurationMinutes: 30,
    },
    landingHelper: {
      relatedMeetings: ["Mumbai port handoff review", "Atlantic Fresh weekly logistics check"],
      folderHighlights: ["Customer Calls folder has 3 ETA-sensitive meetings"],
      decisionCarryovers: ["Lock customer-facing ETA owner in meeting"],
    },
    attendeeBriefs: [
      {
        name: "Sarah Kim",
        role: "Logistics Manager",
        whatsOnMind:
          "She wants to avoid another reactive customer update and prefers one definitive timeline statement.",
        worthBringingUp:
          "Ask if she wants pricing monitor alerts wired into logistics updates so drift warnings are earlier.",
        headsUp:
          "She is sensitive to late handoffs from port ops when inspection notes arrive after promised time.",
      },
    ],
    linkedProject: "Mumbai-Rotterdam Q2 · MR-Q2",
    linkedClient: "Atlantic Fresh",
    clientDomain: "atlanticfreshseafood.com",
    vendor: "Maersk",
    vendorDomain: "maersk.com",
    folder: "Customer Calls",
  },
  {
    id: "meeting-3",
    title: "Morning operator brief",
    time: "Today · 8:15 AM PST",
    dayGroup: "Yesterday",
    stage: "Completed",
    domain: "Standup",
    platform: "Google Meet",
    platformDomain: "meet.google.com",
    owner: "Ubik",
    participants: ["Hemanth", "Pricing monitor", "Inbox triage agent"],
    summary: "Reviewed top risk items, upcoming meetings, and overnight workflow outcomes.",
    agenda: ["Inbox risk", "Approvals", "Pricing monitor"],
    decisions: [
      "Escalate Thai Union exception to approval queue",
      "Keep pricing monitor in daily cadence",
    ],
    actionItems: ["Reply to Sarah on rate confirmation", "Prepare supplier review packet"],
    summaryLines: [
      "Morning brief completed with two urgent decisions routed to approvals.",
      "Pricing monitor remains in daily cadence.",
    ],
    preReadContext: {
      whyThisMatters: "This brief sets operator priority order for the next 6-8 hours.",
      whatChanged: "Two urgent items moved from watchlist to active approvals.",
      whatIsBlocked: "Supplier response and pricing escalation remain blocked until owner assignments are confirmed.",
      recommendedNextStep: "Lock owner + ETA on top two actions before opening new threads.",
    },
    schedulingSuggestions: {
      timezoneLabel: "Pacific Time (UTC-08:00)",
      seedDate: "Thu, 16 Apr",
      suggestedSlots: ["8:00 - 8:20 AM", "9:45 - 10:05 AM", "4:30 - 4:50 PM"],
      defaultDurationMinutes: 20,
    },
    landingHelper: {
      relatedMeetings: ["Operator brief handoff", "Pricing anomaly review standup"],
      folderHighlights: ["Standups folder has 1 carryover action from yesterday"],
      decisionCarryovers: ["Reconfirm owner for Sarah response draft"],
    },
    attendeeBriefs: [
      {
        name: "Hemanth",
        role: "Operator",
        whatsOnMind:
          "Needs a compact execution order and fewer context switches before noon.",
        worthBringingUp:
          "Bundle related approvals into one review block to reduce thrash.",
        headsUp:
          "If thread priorities change mid-morning, downstream workflows can drift without a quick recalibration.",
      },
    ],
    generatedNotes:
      "## Summary\n- Reviewed inbox risk, approvals queue, and pricing run outcomes.\n\n## Decisions\n- Escalate Thai Union exception to approval queue.\n- Keep pricing monitor cadence daily.\n\n## Actions\n- Reply to Sarah on rate confirmation.\n- Prepare supplier review packet.\n",
    linkedProject: "Atlantic Fresh Q3 · AF-Q3",
    linkedClient: "Atlantic Fresh",
    clientDomain: "atlanticfreshseafood.com",
    vendor: "Internal Ops",
    vendorDomain: "ubik.ai",
    folder: "Standups",
  },
];

export const contactCards: ContactCard[] = [
  {
    id: "contact-hemanth",
    name: "Hemanth Rao",
    role: "Operator",
    company: "UBIK",
    domain: "ubik.ai",
    avatarSrc: "/avatars/hemanth.svg",
    avatarFallback: "HR",
  },
  {
    id: "contact-sarah",
    name: "Sarah Kim",
    role: "Logistics Manager",
    company: "Maersk",
    domain: "maersk.com",
    avatarSrc: "/avatars/sarah.svg",
    avatarFallback: "SK",
  },
  {
    id: "contact-raj",
    name: "Raj Mehta",
    role: "Plant Ops Lead",
    company: "Thai Union Ops",
    domain: "thaiunion.com",
    avatarSrc: "/avatars/raj.svg",
    avatarFallback: "RM",
  },
  {
    id: "contact-ana",
    name: "Ana Volkova",
    role: "Finance Controller",
    company: "Atlantic Fresh",
    domain: "atlanticfreshseafood.com",
    avatarSrc: "/avatars/ana.svg",
    avatarFallback: "AV",
  },
  {
    id: "contact-maya",
    name: "Maya Chen",
    role: "Packaging & Sustainability",
    company: "Wanaka Seafood",
    domain: "wanakaseafood.com",
    avatarSrc: "/avatars/maya.svg",
    avatarFallback: "MC",
  },
];

export const homeActivityFeed: ActivityFeedItem[] = [
  {
    id: "activity-1",
    type: "meeting",
    dayGroup: "Today",
    displayMode: "hero",
    title: "Logistics sync - Maersk starts in 24 min",
    insight: "ETA drift +6 days requires customer notification decision before noon.",
    owner: "Ops desk",
    time: "Today · 1:36 PM",
    priority: "High",
    source: "Meetings",
    sourceDomain: "teams.microsoft.com",
    linkedMeetingId: "meeting-2",
    ctaLabel: "Join now",
  },
  {
    id: "activity-2",
    type: "artifact",
    dayGroup: "Today",
    displayMode: "hero",
    title: "Agent artifact: pricing variance digest generated",
    insight: "Two suppliers outside threshold. Suggested mitigation ready for review.",
    owner: "Pricing monitor",
    time: "Today · 06:01 AM",
    priority: "Medium",
    source: "Agents",
    sourceDomain: "ubik.ai",
    ctaLabel: "Open artifact",
  },
  {
    id: "activity-3",
    type: "approval",
    dayGroup: "Today",
    displayMode: "row",
    title: "Approval required: detention clause response",
    insight: "Draft prepared with clause 4.2 preserved; legal sign-off needed now.",
    owner: "Sarah Kim",
    time: "Today · 08:42 AM",
    priority: "Critical",
    source: "Approvals",
    sourceDomain: "gmail.com",
    linkedThreadId: "thread-1",
    ctaLabel: "Review approval",
  },
  {
    id: "activity-4",
    type: "followup",
    dayGroup: "Yesterday",
    displayMode: "row",
    title: "Inbox follow-up: BL copy still pending",
    insight: "Supplier expects reminder before cargo release window closes.",
    owner: "Thai Union Ops",
    time: "Today · 10:07 AM",
    priority: "High",
    source: "Inbox",
    sourceDomain: "thaiunion.com",
    linkedThreadId: "thread-3",
    ctaLabel: "Open thread",
  },
];

export const projectPresetMeta: Record<
  ProjectPreset,
  {
    label: string;
    blurb: string;
    spotlightMetricLabel: string;
    spotlightMetricValue: string;
    riskLabel: string;
    riskValue: string;
    trend: number[];
  }
> = {
  sales: {
    label: "Sales",
    blurb: "Lead conversion, deal pace, and quote win-rate in one lens.",
    spotlightMetricLabel: "Pipeline coverage",
    spotlightMetricValue: "3.4x",
    riskLabel: "Escalation risk",
    riskValue: "2 accounts",
    trend: [42, 50, 48, 57, 62, 66, 71],
  },
  account_management: {
    label: "Account Management",
    blurb: "Retention commitments, follow-ups, and renewals by owner.",
    spotlightMetricLabel: "Renewal readiness",
    spotlightMetricValue: "82%",
    riskLabel: "Customer escalations",
    riskValue: "3 active",
    trend: [68, 64, 69, 71, 73, 75, 77],
  },
  plant_ops: {
    label: "Plant Ops",
    blurb: "Production continuity, handoff timing, and cold-chain events.",
    spotlightMetricLabel: "On-time lots",
    spotlightMetricValue: "91%",
    riskLabel: "Quality holds",
    riskValue: "1 lot",
    trend: [88, 90, 92, 91, 93, 95, 94],
  },
  packaging_sustainability: {
    label: "Packaging & Sustainability",
    blurb: "Material compliance, audits, and sustainability thresholds.",
    spotlightMetricLabel: "Compliant SKUs",
    spotlightMetricValue: "74%",
    riskLabel: "Cert expiries",
    riskValue: "4 pending",
    trend: [57, 60, 58, 61, 63, 65, 67],
  },
  finance: {
    label: "Finance",
    blurb: "Margin pressure, cash cycle, and exception exposure.",
    spotlightMetricLabel: "Gross margin",
    spotlightMetricValue: "18.6%",
    riskLabel: "At-risk receivables",
    riskValue: "$184K",
    trend: [17, 17.4, 17.2, 17.9, 18.1, 18.4, 18.6],
  },
  custom: {
    label: "Custom",
    blurb: "Compose your own lens while keeping the same execution skeleton.",
    spotlightMetricLabel: "Custom KPI",
    spotlightMetricValue: "Set target",
    riskLabel: "Open blockers",
    riskValue: "0",
    trend: [20, 21, 22, 23, 22, 23, 24],
  },
};

export const clients = [
  { id: "atlantic-fresh", name: "Atlantic Fresh", code: "AF-Q3", status: "needs-attention" },
  { id: "tastematic", name: "Tastematic Foods", code: "TS-Q2", status: "on-track" },
  { id: "wanaka", name: "Wanaka Seafood", code: "WK-Q2", status: "on-track" },
] as const;

export const activeOrders = [
  {
    id: "PO-2847",
    clientId: "atlantic-fresh",
    sku: "26/30 PD Tail",
    weight: "3.2 MT",
    status: "proforma-sent",
    value: 18240,
  },
  {
    id: "PO-2851",
    clientId: "atlantic-fresh",
    sku: "Atlantic Salmon Fillet",
    weight: "1.8 MT",
    status: "awaiting-bl",
    value: 14600,
  },
  {
    id: "PO-2839",
    clientId: "tastematic",
    sku: "Squid Rings IQF",
    weight: "5.0 MT",
    status: "in-transit",
    value: 22100,
  },
];

export const cargoMovements = [
  {
    containerId: "MSCU-4421099",
    clientId: "atlantic-fresh",
    destination: "Rotterdam",
    vessel: "MSC Eloise",
    etaDays: 16,
    etaDate: "Apr 28",
    lastEvent: "Departed Kochi",
    delayDays: 0,
  },
  {
    containerId: "MAEU-7712034",
    clientId: "atlantic-fresh",
    destination: "Seattle",
    vessel: "Maersk Nitra",
    etaDays: 21,
    etaDate: "May 3",
    lastEvent: "Transshipment at Colombo",
    delayDays: 6,
  },
  {
    containerId: "CMAU-8834122",
    clientId: "tastematic",
    destination: "New Jersey",
    vessel: "CMA CGM Titan",
    etaDays: 34,
    etaDate: "May 16",
    lastEvent: "Loaded at Shanghai",
    delayDays: 0,
  },
];

export const pricingHistory = [
  { sku: "26/30 PD Tail", vendor: "Penma Products", lastBid: 5.4, currency: "USD", unit: "kg", date: "Apr 8" },
  { sku: "26/30 PD Tail", vendor: "Thai Union Ops", lastBid: 5.2, currency: "USD", unit: "kg", date: "Apr 9" },
  { sku: "26/30 PD Tail", vendor: "Nordic Catch", lastBid: 5.55, currency: "USD", unit: "kg", date: "Apr 6" },
];

export const openItems = [
  { type: "compliance", label: "HACCP cert expires May 1", entity: "Thai Union Ops", urgency: "high", daysLeft: 8 },
  { type: "document", label: "BL copy awaited", entity: "PO-2847", urgency: "medium", daysLeft: null },
  { type: "action", label: "Customer update due today", entity: "Atlantic Fresh", urgency: "high", daysLeft: 0 },
];

export const humanTasks = [
  {
    id: "t1",
    title: "Review Wanaka BL discrepancy",
    priority: "high",
    dueDate: "today",
    status: "pending",
    linkedEntity: "Wanaka Seafood",
    source: "manual",
  },
  {
    id: "t2",
    title: "Send pre-shipment update to Atlantic Fresh",
    priority: "high",
    dueDate: "today",
    status: "pending",
    linkedEntity: "Atlantic Fresh",
    source: "agent-suggested",
  },
  {
    id: "t3",
    title: "Confirm detention clause with legal",
    priority: "high",
    dueDate: "today",
    status: "done",
    linkedEntity: "MR-Q2",
    source: "manual",
  },
  {
    id: "t4",
    title: "Prepare Q2 margin review for Tastematic",
    priority: "medium",
    dueDate: "Apr 15",
    status: "pending",
    linkedEntity: "Tastematic Foods",
    source: "manual",
  },
  {
    id: "t5",
    title: "Follow up Thai Union on HACCP renewal",
    priority: "high",
    dueDate: "Apr 14",
    status: "pending",
    linkedEntity: "Thai Union Ops",
    source: "agent-suggested",
  },
];

export const suggestedTasks = [
  {
    id: "s1",
    title: "Schedule Linux Foundation membership discussion with Candy",
    linkedEntity: "Solarpunk",
    source: "meeting",
  },
  { id: "s2", title: "Follow up on letter at Foundingbird office", linkedEntity: "Solarpunk", source: "inbox" },
  {
    id: "s3",
    title: "Connect mid-week to plan Wanaka implementation roadmap",
    linkedEntity: "Wanaka Seafood",
    source: "meeting",
  },
];

export const agentTasks = [
  {
    id: "a1",
    title: "Container ETA polling",
    status: "running",
    targets: ["MSCU-4421099", "MAEU-7712034"],
    lastRun: "2 min ago",
    nextRun: null,
  },
  {
    id: "a2",
    title: "Compliance cert expiry scan",
    status: "running",
    targets: ["all active suppliers"],
    lastRun: null,
    nextRun: "06:00 UTC",
  },
  {
    id: "a3",
    title: "Draft customer update for Atlantic Fresh ETA delay",
    status: "pending-approval",
    preview: "Hi Alex, wanted to flag that your MAEU-7712034 shipment has shifted ETA by 6 days to May 3...",
  },
  {
    id: "a4",
    title: "Supplier follow-up: Thai Union HACCP renewal draft",
    status: "pending-approval",
    preview: "Hi Thai Union team, our records show your HACCP certificate expires May 1...",
  },
  { id: "a5", title: "Morning pricing brief assembled", status: "completed", completedAt: "06:01 UTC" },
  { id: "a6", title: "Inbox triage run — 4 threads prioritized", status: "completed", completedAt: "07:45 UTC" },
];

export const recentChats = [
  {
    id: "rc1",
    title: "Thai Union response draft",
    timestamp: "12 min ago",
    preview: "Approve with clause 4.2 preserved and copy legal on the outbound note.",
  },
  {
    id: "rc2",
    title: "Supplier review sync",
    timestamp: "34 min ago",
    preview: "HACCP cert expires in 8 days. Recommend escalating to compliance bot before the Thursday call.",
  },
  {
    id: "rc3",
    title: "Atlantic Fresh Q3 status check",
    timestamp: "2 hrs ago",
    preview: "ETA shifted by 6 days to May 3. Container MAEU-7712034 had transshipment delay at Colombo.",
  },
  {
    id: "rc4",
    title: "Pricing monitor run 842",
    timestamp: "1 hr ago",
    preview: "Margin pressure concentrated in frozen whitefish lots. Two suppliers remain outside threshold.",
  },
  {
    id: "rc5",
    title: "Morning operator brief",
    timestamp: "Yesterday",
    preview: "4 inbox threads requiring action. 2 urgent approvals. Container MSCU-4421099 on track.",
  },
];

export const projects: ProjectRecord[] = [
  {
    id: "project-1",
    name: "Mumbai-Rotterdam Q2",
    code: "MR-Q2",
    status: "On track",
    owner: "Hemanth",
    progress: 68,
    summary: "Main shipping lane workstream covering rate confirmation, container release, and buyer updates.",
    milestones: [
      { label: "Contract revision approved", state: "Done" },
      { label: "Rate confirmation sent", state: "Active" },
      { label: "Cargo loaded", state: "Upcoming" },
    ],
    linked: [
      { label: "Sales PI to PO workflow", kind: "workflow" },
      { label: "Rate confirmation thread", kind: "chat" },
      { label: "Detention exception approval", kind: "approval" },
    ],
    team: ["Sarah Kim", "Raj Mehta", "Logistics Bot"],
    nextActions: ["Approve legal wording", "Confirm customer note", "Update project timeline"],
  },
  {
    id: "project-2",
    name: "Supplier Compliance Audit",
    code: "SCA-26",
    status: "At risk",
    owner: "Compliance",
    progress: 41,
    summary: "Audit workstream focused on supplier certificate freshness and exception handling.",
    milestones: [
      { label: "Document collection", state: "Active" },
      { label: "Risk review", state: "Upcoming" },
      { label: "Audit closure", state: "Upcoming" },
    ],
    linked: [
      { label: "Thai Union exception", kind: "approval" },
      { label: "Policy watch brief", kind: "report" },
      { label: "Supplier review sync", kind: "meeting" },
    ],
    team: ["Raj Mehta", "Compliance Bot"],
    nextActions: ["Confirm extension window", "Validate new uploads", "Decide PO release posture"],
  },
  {
    id: "project-3",
    name: "Atlantic Fresh Q3",
    code: "AF-Q3",
    status: "Needs attention",
    owner: "Finance",
    progress: 84,
    summary: "Margin-sensitive lane where pricing watch signals have started trending below threshold.",
    milestones: [
      { label: "Inventory allocation", state: "Done" },
      { label: "Margin review", state: "Active" },
      { label: "Commercial approval", state: "Upcoming" },
    ],
    linked: [
      { label: "Daily pricing workflow", kind: "workflow" },
      { label: "Pricing anomaly brief", kind: "report" },
    ],
    team: ["Finance Agent", "Sales ops"],
    nextActions: ["Review pricing brief", "Decide escalation path"],
  },
];

export const approvals: ApprovalItem[] = [
  {
    id: "approval-1",
    title: "Approve rate confirmation reply",
    workflow: "Sales PI to PO",
    status: "Urgent",
    confidence: 94,
    recommendation: "Approve the reply draft with the detention clause preserved and send today.",
    inputSummary: "The system aligned the latest forwarder reply, contract revision, and prior negotiation thread.",
    provenance: [
      "Email thread with Sarah Kim",
      "Contract MR-Q2 rev 3",
      "Legal note from March 28",
    ],
    actions: ["Approve and send", "Edit response", "Reject recommendation"],
  },
  {
    id: "approval-2",
    title: "Supplier extension exception",
    workflow: "Compliance monitoring",
    status: "Urgent",
    confidence: 89,
    recommendation: "Allow the extension but keep PO release behind manual review until the HACCP files are verified.",
    inputSummary: "The system traced the request to the supplier audit, PO timing, and prior exceptions for the same vendor.",
    provenance: [
      "WhatsApp note from Thai Union Ops",
      "Supplier Compliance Audit project",
      "Policy watch brief on document freshness",
    ],
    actions: ["Approve exception", "Hold PO", "Request more context"],
  },
  {
    id: "approval-3",
    title: "Publish pricing anomaly digest",
    workflow: "Daily pricing workflow",
    status: "Review",
    confidence: 82,
    recommendation: "Share the digest internally only and wait one more run before alerting customers.",
    inputSummary: "Two margin anomalies were detected, but both are within the temporary variance threshold.",
    provenance: ["Workflow run 842", "ERP landed costs", "Supplier feed delta"],
    actions: ["Share internally", "Escalate externally", "Dismiss"],
  },
];

export const workflowDefinitions: WorkflowDefinition[] = [
  {
    id: "wf-1",
    name: "Sales PI to PO",
    owner: "Commercial ops",
    cadence: "Manual trigger",
    approvalMode: "Required",
    outcomes: "Turns customer threads into approved outbound responses and internal tasks.",
  },
  {
    id: "wf-2",
    name: "Daily pricing workflow",
    owner: "Pricing",
    cadence: "Daily · 06:00 UTC",
    approvalMode: "Only on anomalies",
    outcomes: "Assembles landed cost changes and produces a margin watch brief.",
  },
  {
    id: "wf-3",
    name: "Compliance monitoring",
    owner: "Compliance",
    cadence: "Hourly watch",
    approvalMode: "Required",
    outcomes: "Monitors certificate freshness and routes supplier exceptions into review.",
  },
];

export const workflowRuns: WorkflowRun[] = [
  {
    id: "run-1",
    name: "Sales PI to PO · MR-Q2",
    status: "Awaiting approval",
    startedAt: "Today · 08:39",
    owner: "Commercial ops",
    summary: "Context assembled from inbound email, contract, and prior thread. Draft reply is ready for human review.",
    steps: [
      { id: "step-1", label: "Assemble thread context", status: "done" },
      { id: "step-2", label: "Extract tasks and policy checks", status: "done" },
      { id: "step-3", label: "Generate reply draft", status: "done" },
      { id: "step-4", label: "Await approval", status: "running" },
    ],
    artifacts: ["Draft response", "Context packet", "Approval note"],
  },
  {
    id: "run-2",
    name: "Daily pricing workflow · Atlantic Fresh",
    status: "Completed",
    startedAt: "Today · 06:00",
    owner: "Pricing",
    summary: "Completed with two margin anomalies and a new internal digest.",
    steps: [
      { id: "step-5", label: "Pull supplier feeds", status: "done" },
      { id: "step-6", label: "Calculate margin shifts", status: "done" },
      { id: "step-7", label: "Write daily brief", status: "done" },
    ],
    artifacts: ["Pricing digest", "Anomaly trace"],
  },
];

export const agents: AgentRecord[] = [
  {
    id: "agent-1",
    name: "Inbox triage agent",
    status: "Healthy",
    lastRun: "2 min ago",
    linkedWorkflow: "Sales PI to PO",
    summary: "Prioritizes inbound threads and assembles source context before the operator opens them.",
  },
  {
    id: "agent-2",
    name: "Pricing monitor agent",
    status: "Watching",
    lastRun: "12 min ago",
    linkedWorkflow: "Daily pricing workflow",
    summary: "Monitors supplier price movement and flags anomalies before customer impact.",
  },
  {
    id: "agent-3",
    name: "Compliance review agent",
    status: "Paused",
    lastRun: "Yesterday",
    linkedWorkflow: "Compliance monitoring",
    summary: "Tracks certificate freshness and prepares exception packets for human review.",
  },
];

export const intelligenceRecords: IntelligenceRecord[] = [
  {
    id: "intel-1",
    title: "EU cold-chain policy watch",
    freshness: "Updated 42 min ago",
    source: "Policy monitor",
    summary: "No new restrictions, but two wording changes affect inspection lead times for reefers.",
  },
  {
    id: "intel-2",
    title: "Atlantic lane pricing brief",
    freshness: "Updated 2 hrs ago",
    source: "Pricing monitor",
    summary: "Margin pressure concentrated in frozen whitefish lots; two suppliers remain outside threshold.",
  },
  {
    id: "intel-3",
    title: "Competitor watch digest",
    freshness: "Yesterday",
    source: "Research agent",
    summary: "Two competing distributors widened payment terms this week; monitor implications for renewal offers.",
  },
];

export const archiveRecords: ArchiveRecord[] = [
  { id: "archive-1", title: "March operator brief", type: "Brief", updatedAt: "Mar 29", owner: "Ubik" },
  { id: "archive-2", title: "Supplier audit closure pack", type: "Project", updatedAt: "Mar 27", owner: "Compliance" },
  { id: "archive-3", title: "Pricing monitor run 801", type: "Workflow run", updatedAt: "Mar 25", owner: "Pricing" },
];

export const settingsSections: SettingsSection[] = [
  {
    id: "settings-1",
    title: "Workspace",
    description: "Operator defaults for tabs, theme, and shell behavior.",
    values: [
      { label: "Default home", value: "Chat" },
      { label: "Theme", value: "Paper-first light" },
      { label: "Workbench restore", value: "Session only" },
    ],
  },
  {
    id: "settings-2",
    title: "Connectors",
    description: "Connected systems available in the current operator workspace.",
    values: [
      { label: "Messaging", value: "Gmail, Slack, WhatsApp" },
      { label: "Systems", value: "ERP, CRM, Drive" },
      { label: "Calendar", value: "Connected" },
    ],
  },
  {
    id: "settings-3",
    title: "Environment",
    description: "Runtime metadata and deployment visibility.",
    values: [
      { label: "Workspace", value: "Business / Prod" },
      { label: "Version", value: "v1.0.4" },
      { label: "Mode", value: "Desktop + Web" },
    ],
  },
];

export const helpResources: HelpResource[] = [
  {
    id: "help-1",
    title: "Inbox to approval flow",
    description: "How Ubik assembles thread context, extracts tasks, and routes items into review.",
    action: "Open guide",
  },
  {
    id: "help-2",
    title: "Workflow trace inspection",
    description: "How to read runtime artifacts, provenance, and execution steps.",
    action: "Read docs",
  },
  {
    id: "help-3",
    title: "Operator support",
    description: "Escalation paths, release notes, and implementation caveats.",
    action: "Contact support",
  },
];

export function getRouteMeta(pathname: string) {
  if (pathname.startsWith("/meetings/")) {
    return routeMetas.find((route) => route.path === "/meetings") ?? routeMetas.find((route) => route.path === "/home");
  }
  if (pathname.startsWith("/inbox/")) {
    return routeMetas.find((route) => route.path === "/inbox") ?? routeMetas.find((route) => route.path === "/home");
  }
  return routeMetas.find((route) => route.path === pathname) ?? routeMetas.find((route) => route.path === "/home");
}
