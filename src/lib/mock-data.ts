// ─── HOME FEED ───
export const feedCards = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=600&h=400&fit=crop",
    title: "Mumbai Port — Container Yard 7B",
    subtitle: "Live feed • 3 mins ago",
    tag: "SHIPMENT_TRACKING",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop",
    title: "Rotterdam Cold Storage Facility",
    subtitle: "Inspection scheduled • Tomorrow 09:00",
    tag: "COMPLIANCE",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop",
    title: "Atlantic Bluefin — Grade A Lot",
    subtitle: "Price alert • $42.80/kg (+2.3%)",
    tag: "MARKET_DATA",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1515552726023-7125c8d07fb3?w=600&h=400&fit=crop",
    title: "Yokohama Auction House",
    subtitle: "Bidding opens • 06:00 JST",
    tag: "PROCUREMENT",
  },
];

export const recentChats = [
  { id: 1, title: "Rate confirmation — Maersk Q2 contract", participants: "You, Sarah K.", time: "12 min ago" },
  { id: 2, title: "Supplier compliance check — Thai Union", participants: "You, Raj M., Compliance Bot", time: "1 hr ago" },
  { id: 3, title: "Budget variance analysis — March", participants: "You, Finance Agent", time: "3 hrs ago" },
];

// ─── QUICK ACTIONS ───
export const quickActions = [
  { id: 1, label: "EMAIL_ANALYSIS", description: "Scan & summarize inbox threads", icon: "Mail" },
  { id: 2, label: "BUDGET_REPORT", description: "Generate financial overview", icon: "BarChart3" },
  { id: 3, label: "DO_RESEARCH", description: "Deep dive on any topic", icon: "Search" },
  { id: 4, label: "PROJECT_STATUS", description: "Get project health check", icon: "Activity" },
];

// ─── TASK TRACKER ───
export const tasks = [
  {
    id: 1,
    title: "Review rate confirmation from Maersk",
    project: "Mumbai-Rotterdam Q2",
    status: "TODO" as const,
    priority: "high",
    duplicatesMerged: 0,
    source: "Email",
  },
  {
    id: 2,
    title: "Approve supplier compliance report",
    project: "Supplier Compliance Audit",
    status: "IN_PROGRESS" as const,
    priority: "high",
    duplicatesMerged: 3,
    source: "Agent",
  },
  {
    id: 3,
    title: "Send updated PO to Thai Union",
    project: "Mumbai-Rotterdam Q2",
    status: "TODO" as const,
    priority: "medium",
    duplicatesMerged: 0,
    source: "Meeting",
  },
  {
    id: 4,
    title: "Finalize cold chain logistics plan",
    project: "Atlantic Fresh Q3",
    status: "DONE" as const,
    priority: "low",
    duplicatesMerged: 2,
    source: "Auto-detected",
  },
  {
    id: 5,
    title: "Schedule port inspection — Rotterdam",
    project: "Supplier Compliance Audit",
    status: "TODO" as const,
    priority: "medium",
    duplicatesMerged: 0,
    source: "Calendar",
  },
];

// ─── PROJECTS ───
export const projects = [
  {
    id: 1,
    name: "Mumbai-Rotterdam Q2",
    progress: 68,
    lastActivity: "Rate confirmation received — 2 hrs ago",
    tasks: { total: 12, done: 8 },
    status: "ON_TRACK" as const,
  },
  {
    id: 2,
    name: "Supplier Compliance Audit",
    progress: 35,
    lastActivity: "Thai Union docs uploaded — 5 hrs ago",
    tasks: { total: 9, done: 3 },
    status: "AT_RISK" as const,
  },
  {
    id: 3,
    name: "Atlantic Fresh Q3",
    progress: 92,
    lastActivity: "Final logistics approved — 1 day ago",
    tasks: { total: 7, done: 6 },
    status: "ON_TRACK" as const,
  },
];

// ─── CONTEXT INTELLIGENCE ───
export const contextIntelligence = {
  activeWorkflows: 4,
  runningWorkflows: 3,
  pendingApprovals: 5,
  urgentApprovals: 2,
  unreadInbox: 12,
  nextMeetings: [
    { id: 1, title: "Supplier Review — Thai Union", time: "10:30 AM", attendees: 4 },
    { id: 2, title: "Logistics Sync — Maersk", time: "2:00 PM", attendees: 3 },
    { id: 3, title: "Q2 Budget Review", time: "4:30 PM", attendees: 6 },
  ],
  insights: [
    "3 rate confirmations pending > 48hrs",
    "Supplier compliance score dropped 12% — Thai Union",
    "Container YB-7221 delayed 6hrs at Mumbai port",
  ],
};

// ─── AGENTS ───
export const agents = [
  {
    id: 1,
    name: "Email Triage Agent",
    description: "Scans incoming email, categorizes by priority, drafts responses for review",
    active: true,
    lastRun: "2 mins ago",
    category: "active" as const,
    steps: [
      { id: 1, tool: "Gmail", name: "Read Inbox", status: "connected" as const, icon: "Mail" },
      { id: 2, tool: "UBIK AI", name: "Classify & Summarize", status: "connected" as const, icon: "Brain" },
      { id: 3, tool: "Slack", name: "Notify Team", status: "connected" as const, icon: "MessageSquare" },
    ],
  },
  {
    id: 2,
    name: "Rate Confirmation Agent",
    description: "Monitors shipping rate confirmations, validates against contracts, flags discrepancies",
    active: true,
    lastRun: "15 mins ago",
    category: "active" as const,
    steps: [
      { id: 1, tool: "Email", name: "Monitor Inbox", status: "connected" as const, icon: "Mail" },
      { id: 2, tool: "Document AI", name: "Extract Rates", status: "connected" as const, icon: "FileText" },
      { id: 3, tool: "Database", name: "Compare Contracts", status: "connected" as const, icon: "Database" },
      { id: 4, tool: "Slack", name: "Alert if Mismatch", status: "connected" as const, icon: "AlertTriangle" },
    ],
  },
  {
    id: 3,
    name: "Design Review Pipeline",
    description: "Pulls Figma designs, runs browser preview, captures screenshots for approval",
    active: false,
    lastRun: "2 days ago",
    category: "paused" as const,
    steps: [
      { id: 1, tool: "Figma MCP", name: "Fetch Design", status: "connected" as const, icon: "Figma" },
      { id: 2, tool: "Browser Use", name: "Render Preview", status: "connected" as const, icon: "Globe" },
      { id: 3, tool: "Computer Use", name: "Screenshot", status: "disconnected" as const, icon: "Monitor" },
      { id: 4, tool: "Slack", name: "Send for Review", status: "connected" as const, icon: "Send" },
    ],
  },
  {
    id: 4,
    name: "Meeting Follow-up Agent",
    description: "Extracts action items from meeting transcripts, creates tasks, sends follow-ups",
    active: true,
    lastRun: "1 hr ago",
    category: "active" as const,
    steps: [
      { id: 1, tool: "Calendar", name: "Get Transcript", status: "connected" as const, icon: "Calendar" },
      { id: 2, tool: "UBIK AI", name: "Extract Actions", status: "connected" as const, icon: "Brain" },
      { id: 3, tool: "Task Manager", name: "Create Tasks", status: "connected" as const, icon: "CheckSquare" },
      { id: 4, tool: "Email", name: "Send Follow-up", status: "connected" as const, icon: "Send" },
    ],
  },
  {
    id: 5,
    name: "Document Extractor",
    description: "Parse invoices, POs, and compliance docs into structured data",
    active: false,
    lastRun: "5 days ago",
    category: "templates" as const,
    steps: [
      { id: 1, tool: "Email", name: "Detect Attachment", status: "connected" as const, icon: "Mail" },
      { id: 2, tool: "Document AI", name: "OCR & Parse", status: "connected" as const, icon: "FileText" },
      { id: 3, tool: "Database", name: "Store Records", status: "connected" as const, icon: "Database" },
    ],
  },
];

// ─── APPROVALS ───
export const approvals = [
  {
    id: 1,
    agent: "Rate Confirmation Agent",
    action: "Flag rate discrepancy: Maersk invoice #MK-4421 shows $3,200 vs contract rate $2,850",
    confidence: 94,
    urgent: true,
    context: "Contract MK-2024-Q2 specifies $2,850/TEU for Mumbai-Rotterdam. Invoice received at $3,200/TEU. Difference: +$350 (12.3%)",
    timestamp: "5 mins ago",
  },
  {
    id: 2,
    agent: "Email Triage Agent",
    action: "Draft reply to Thai Union regarding delayed compliance documents",
    confidence: 87,
    urgent: true,
    context: "Thai Union requested extension for compliance submission. Agent drafted professional follow-up referencing contract clause 4.2",
    timestamp: "22 mins ago",
  },
  {
    id: 3,
    agent: "Meeting Follow-up Agent",
    action: "Create 3 tasks from Logistics Sync meeting transcript",
    confidence: 91,
    urgent: false,
    context: "Extracted: 1) Update container tracking for YB-7221, 2) Confirm cold chain specs with Rotterdam, 3) Schedule port inspection",
    timestamp: "1 hr ago",
  },
  {
    id: 4,
    agent: "Design Review Pipeline",
    action: "Send dashboard mockup v3 to #design-review channel",
    confidence: 78,
    urgent: false,
    context: "Figma frame 'Dashboard v3' rendered and captured. 2 visual regressions detected vs v2. Awaiting human review before sharing.",
    timestamp: "3 hrs ago",
  },
];

// ─── CONNECTED APPS ───
export const connectedApps = [
  { id: 1, name: "Gmail", status: "connected" as const, icon: "Mail", permissions: { read: true, write: true, execute: false } },
  { id: 2, name: "Slack", status: "connected" as const, icon: "MessageSquare", permissions: { read: true, write: true, execute: false } },
  { id: 3, name: "WhatsApp", status: "connected" as const, icon: "Phone", permissions: { read: true, write: false, execute: false } },
  { id: 4, name: "Figma", status: "connected" as const, icon: "Figma", permissions: { read: true, write: false, execute: true } },
  { id: 5, name: "Google Calendar", status: "connected" as const, icon: "Calendar", permissions: { read: true, write: true, execute: false } },
  { id: 6, name: "Telegram", status: "disconnected" as const, icon: "Send", permissions: { read: false, write: false, execute: false } },
];

export const agentPreferences = {
  aggressiveness: "balanced" as "conservative" | "balanced" | "autonomous",
  autoApproveThreshold: 95,
  notifications: {
    urgent: true,
    routine: false,
    digest: true,
  },
};

// ─── INBOX (UNIFIED — EMAIL, SLACK, WHATSAPP, CALLS) ───
export type InboxChannel = "email" | "slack" | "whatsapp" | "call" | "system";

export const inboxMessages = [
  {
    id: 1,
    from: "Azzahra Salsabil",
    channel: "email" as InboxChannel,
    subject: "Contract Negotiation: Node-04 Cluster Deployment",
    summary: "The revised terms for the Node-04 expansion require immediate legal review. Current protocols are out of sync with the 2024 compliance mandate.",
    priority: "critical" as const,
    time: "08:42 AM",
    unread: true,
    category: "ACTION_REQUIRED" as const,
    labels: ["CONTRACT", "LEGAL"],
    agentSuggestion: "Auto-drafted acceptance reply with digital signature request",
  },
  {
    id: 2,
    from: "Hemanth Rao",
    channel: "slack" as InboxChannel,
    subject: "Biometric Protocol Update",
    summary: "Sync errors detected in the Southeast Sector. We need to re-validate the ledger entries before the next audit cycle starts at 12:00.",
    priority: "high" as const,
    time: "07:15 AM",
    unread: true,
    category: "ACTION_REQUIRED" as const,
    labels: ["COMPLIANCE", "AUDIT"],
    agentSuggestion: "Drafted conditional approval with clause 4.2 reference",
  },
  {
    id: 3,
    from: "Jane Smith",
    channel: "email" as InboxChannel,
    subject: "New feature documentation",
    summary: "The product development team has shared the latest feature documentation for Q2 sprint review.",
    priority: "medium" as const,
    time: "YESTERDAY",
    unread: true,
    category: "ACTION_REQUIRED" as const,
    labels: ["PRODUCT_DEV"],
    agentSuggestion: null,
  },
  {
    id: 4,
    from: "Logistics Bot",
    channel: "system" as InboxChannel,
    subject: "Container YB-7221 — Delay Alert",
    summary: "6hr delay at Mumbai port due to customs hold. ETA revised to March 28 14:00 UTC.",
    priority: "high" as const,
    time: "07:30 AM",
    unread: true,
    category: "UNREAD" as const,
    labels: ["SHIPMENT", "DELAY"],
    agentSuggestion: "Notified downstream partners. Updated delivery schedule.",
  },
  {
    id: 5,
    from: "Sarah Kim",
    channel: "whatsapp" as InboxChannel,
    subject: "Rate Confirmation — Q2 Mumbai-Rotterdam",
    summary: "Confirmed revised rate of $2,850/TEU. Updated contract attached. Requires your signature by Friday.",
    priority: "critical" as const,
    time: "09:14 AM",
    unread: true,
    category: "UNREAD" as const,
    labels: ["RATE_CONFIRMATION"],
    agentSuggestion: "Auto-drafted acceptance reply with digital signature request",
  },
  {
    id: 6,
    from: "System Alert",
    channel: "system" as InboxChannel,
    subject: "Server maintenance",
    summary: "Scheduled server maintenance completed successfully. All systems operational.",
    priority: "low" as const,
    time: "04:00 AM",
    unread: false,
    category: "INFORMATIONAL" as const,
    labels: ["SYSTEM_LOG"],
    agentSuggestion: null,
  },
  {
    id: 7,
    from: "Alice Johnson",
    channel: "slack" as InboxChannel,
    subject: "Weekly Sync Notes",
    summary: "Shared comprehensive notes from this week's sync including action items and follow-ups.",
    priority: "low" as const,
    time: "WEDNESDAY",
    unread: false,
    category: "INFORMATIONAL" as const,
    labels: ["SYNC_MGMT"],
    agentSuggestion: null,
  },
  {
    id: 8,
    from: "Raj Mehta",
    channel: "call" as InboxChannel,
    subject: "Missed call — Compliance Docs",
    summary: "Called regarding HACCP certification renewal extension. Left voicemail requesting callback.",
    priority: "medium" as const,
    time: "YESTERDAY",
    unread: false,
    category: "UNREAD" as const,
    labels: ["COMPLIANCE", "SUPPLIER"],
    agentSuggestion: "Transcribed voicemail. Drafted follow-up email.",
  },
];

export const inboxStats = {
  inboundQueue: 7,
  critical: 2,
  actionRequired: 5,
  updates: 12,
  timeSaved: "1hr 30mins",
};

// ─── INFORMATIONAL SIGNALS ───
export const informationalSignals = [
  {
    id: 1,
    tag: "GLOBAL_VIVID_PROP",
    from: "Bob Williams",
    subject: "Design System V2 Proposals",
    summary: "A full architectural audit of the UBIK interface patterns for next-gen deployment.",
    impact: "HIGH" as const,
    timestamp: "2024.11.02_14:30",
    source: "CREATIVE_LEAD",
  },
  {
    id: 2,
    tag: "GLOBAL_SERENE_PROP",
    from: "Alice Johnson",
    subject: "User Experience Enhancements",
    summary: "Comprehensive evaluation of user feedback to refine interaction flows and improve accessibility.",
    impact: "MEDIUM" as const,
    timestamp: "2024.11.03_09:15",
    source: "UX_RESEARCH",
  },
];

// ─── PROJECTS (EXPANDED) ───
export const projectsDetailed = [
  {
    id: 1,
    name: "Mumbai-Rotterdam Q2",
    code: "MR-Q2",
    progress: 68,
    status: "ON_TRACK" as const,
    owner: "You",
    team: ["Sarah K.", "Raj M.", "Logistics Bot"],
    lastActivity: "Rate confirmation received — 2 hrs ago",
    tasks: { total: 12, done: 8, inProgress: 2, todo: 2 },
    milestones: [
      { name: "Contract Signed", done: true },
      { name: "Rate Confirmed", done: true },
      { name: "Cargo Loaded", done: false },
      { name: "In Transit", done: false },
      { name: "Delivered", done: false },
    ],
    kpis: {
      budget: { spent: 142000, total: 210000 },
      containers: 24,
      daysRemaining: 18,
    },
    contextTabs: [
      { id: "overview", label: "OVERVIEW" },
      { id: "emails", label: "EMAILS" },
      { id: "meetings", label: "MEETINGS" },
      { id: "logistics", label: "LOGISTICS" },
      { id: "documents", label: "DOCUMENTS" },
    ],
    contextData: {
      emails: [
        { id: 1, from: "Sarah Kim", subject: "RE: Rate Confirmation", time: "2 hrs ago", status: "reply_needed" },
        { id: 2, from: "Maersk Ops", subject: "Container Loading Schedule", time: "5 hrs ago", status: "read" },
        { id: 3, from: "Customs Dept", subject: "Documentation Clearance", time: "1 day ago", status: "resolved" },
      ],
      meetings: [
        { id: 1, title: "Logistics Sync — Maersk", time: "Today 2:00 PM", attendees: 3, status: "upcoming" },
        { id: 2, title: "Rate Review", time: "Yesterday", attendees: 4, status: "completed", actionItems: 3 },
      ],
      logistics: [
        { id: 1, container: "YB-7221", status: "DELAYED", location: "Mumbai Port", eta: "Mar 28 14:00" },
        { id: 2, container: "YB-7222", status: "ON_TRACK", location: "In Transit", eta: "Mar 30 08:00" },
        { id: 3, container: "YB-7223", status: "ON_TRACK", location: "Loading", eta: "Apr 02 12:00" },
      ],
    },
  },
  {
    id: 2,
    name: "Supplier Compliance Audit",
    code: "SCA-26",
    progress: 35,
    status: "AT_RISK" as const,
    owner: "You",
    team: ["Raj M.", "Compliance Bot"],
    lastActivity: "Thai Union docs uploaded — 5 hrs ago",
    tasks: { total: 9, done: 3, inProgress: 4, todo: 2 },
    milestones: [
      { name: "Audit Initiated", done: true },
      { name: "Docs Collected", done: false },
      { name: "Review Complete", done: false },
      { name: "Report Filed", done: false },
    ],
    kpis: {
      budget: { spent: 8500, total: 15000 },
      suppliers: 6,
      daysRemaining: 5,
    },
    contextTabs: [
      { id: "overview", label: "OVERVIEW" },
      { id: "emails", label: "EMAILS" },
      { id: "compliance", label: "COMPLIANCE" },
      { id: "documents", label: "DOCUMENTS" },
    ],
    contextData: {
      emails: [
        { id: 1, from: "Raj Mehta", subject: "Extension Request — HACCP", time: "5 hrs ago", status: "reply_needed" },
        { id: 2, from: "Compliance Bot", subject: "Score Alert: Thai Union", time: "8 hrs ago", status: "flagged" },
      ],
      meetings: [
        { id: 1, title: "Supplier Review — Thai Union", time: "Today 10:30 AM", attendees: 4, status: "upcoming" },
      ],
      logistics: [],
    },
  },
  {
    id: 3,
    name: "Atlantic Fresh Q3",
    code: "AF-Q3",
    progress: 92,
    status: "ON_TRACK" as const,
    owner: "Sarah K.",
    team: ["You", "Finance Agent"],
    lastActivity: "Final logistics approved — 1 day ago",
    tasks: { total: 7, done: 6, inProgress: 1, todo: 0 },
    milestones: [
      { name: "Planning", done: true },
      { name: "Procurement", done: true },
      { name: "Logistics", done: true },
      { name: "Delivery", done: false },
    ],
    kpis: {
      budget: { spent: 89000, total: 95000 },
      containers: 12,
      daysRemaining: 3,
    },
    contextTabs: [
      { id: "overview", label: "OVERVIEW" },
      { id: "logistics", label: "LOGISTICS" },
      { id: "finance", label: "FINANCE" },
    ],
    contextData: {
      emails: [
        { id: 1, from: "Finance Agent", subject: "Budget Variance — March", time: "1 day ago", status: "read" },
      ],
      meetings: [],
      logistics: [
        { id: 1, container: "AF-301", status: "ON_TRACK", location: "Rotterdam", eta: "Mar 29 06:00" },
      ],
    },
  },
];

// ─── DATA VIZ (HOME WIDGETS) ───
export const shipmentVolume = [
  { month: "Oct", volume: 142 },
  { month: "Nov", volume: 168 },
  { month: "Dec", volume: 135 },
  { month: "Jan", volume: 189 },
  { month: "Feb", volume: 201 },
  { month: "Mar", volume: 178 },
];

export const complianceScores = [
  { supplier: "Thai Union", score: 72, trend: "down" as const },
  { supplier: "Maersk", score: 94, trend: "up" as const },
  { supplier: "Nordic Fish", score: 88, trend: "stable" as const },
  { supplier: "Pacific Blue", score: 91, trend: "up" as const },
];

export const portActivity = [
  { port: "Mumbai", active: 8, delayed: 2 },
  { port: "Rotterdam", active: 5, delayed: 0 },
  { port: "Yokohama", active: 3, delayed: 1 },
  { port: "Singapore", active: 6, delayed: 0 },
];

// ─── COMMAND PALETTE (ORGANIZED SECTIONS) ───
export const commandSections = [
  {
    id: "quick",
    label: "QUICK ACTIONS",
    layout: "vertical" as const,
    items: [
      { id: "priorities_summarize", label: "Summarize today's priorities", shortcut: "", icon: "Brain" },
      { id: "delay_notice_draft", label: "Draft delay notice", shortcut: "", icon: "Mail" },
      { id: "compliance_check_run", label: "Run compliance check across all shipments", shortcut: "", icon: "CheckSquare" },
      { id: "market_digest_weekly", label: "Generate weekly market digest", shortcut: "", icon: "BarChart3" },
    ],
  },
  {
    id: "data",
    label: "DATA",
    layout: "vertical" as const,
    items: [
      { id: "approvals_fetch_pending", label: "Fetch pending approvals from agents", shortcut: "", icon: "Bot" },
      { id: "schedule_pull_today", label: "Pull today's schedule from Gmail", shortcut: "", icon: "Calendar" },
    ],
  },
];

// Flat list for backward compat
export const commandItems = commandSections.flatMap((s) =>
  s.items.map((item) => ({ ...item, category: s.label }))
);

// ─── SIDEBAR: PINNED ITEMS ───
export type PinnedItemType = "chat" | "research" | "project" | "workflow" | "meeting";

export const pinnedItems: { id: string; title: string; type: PinnedItemType }[] = [
  { id: "p1", title: "Q2 Planning — Executive Review", type: "project" },
  { id: "p2", title: "Competitor Landscape Report", type: "research" },
  { id: "p3", title: "Board Deck v3 — Final", type: "chat" },
  { id: "p4", title: "Shrimp Risk Monitor", type: "workflow" },
  { id: "p5", title: "Supplier Review — Thai Union", type: "meeting" },
];

// ─── SIDEBAR: RECENT ITEMS ───
export type RecentItemType = "chat" | "research" | "project" | "workflow" | "meeting" | "search";

export const recentItems: { id: string; title: string; type: RecentItemType; time: string }[] = [
  { id: "r1", title: "Rate confirmation — Maersk", type: "chat", time: "12m ago" },
  { id: "r2", title: "Shrimp market deep dive", type: "research", time: "1h ago" },
  { id: "r3", title: "Supplier audit project", type: "project", time: "2h ago" },
  { id: "r4", title: "Morning trade workflow", type: "workflow", time: "3h ago" },
  { id: "r5", title: "Buyer meeting brief", type: "meeting", time: "5h ago" },
  { id: "r6", title: "Rotterdam port delays", type: "search", time: "Yesterday" },
];
