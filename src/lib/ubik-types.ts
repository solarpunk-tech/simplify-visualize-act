export type NavigationSectionKey = "navigate" | "playbooks" | "support";

export type NavigationStatus = "live" | "watching" | "urgent" | "healthy";

export type NavigationItem = {
  key: string;
  title: string;
  path: string;
  section: NavigationSectionKey;
  badge?: string;
  status?: NavigationStatus;
};

export type PageAction = {
  label: string;
  kind?: "primary" | "secondary";
};

export type RouteMeta = {
  key: string;
  title: string;
  shortTitle?: string;
  path: string;
  description: string;
  actions: PageAction[];
};

export type WorkbenchTab = {
  id: string;
  routeKey: string;
  title: string;
  path: string;
  pinned?: boolean;
  closable?: boolean;
  temporary?: boolean;
};

export type PinnedItem = {
  id: string;
  title: string;
  type: "chat" | "project" | "workflow" | "approval" | "meeting";
  subtitle: string;
};

export type RecentItem = {
  id: string;
  title: string;
  type: "chat" | "project" | "workflow" | "meeting" | "file";
  time: string;
};

export type QuickConnection = {
  id: string;
  label: string;
  state: "connected" | "watching";
};

export type StarterAction = {
  id: string;
  title: string;
  description: string;
};

export type SignalItem = {
  id: string;
  label: string;
  value: string;
  tone?: "default" | "alert";
};

export type InboxThread = {
  id: string;
  source: "Email" | "Slack" | "WhatsApp" | "System";
  sender: string;
  subject: string;
  preview: string;
  priority: "Critical" | "High" | "Medium";
  owner: string;
  status: "Action required" | "Waiting" | "Reviewed";
  time: string;
  extractedTasks: string[];
  recommendedReply: string;
  provenance: string[];
  attachments: string[];
  domainTag?: string;
  intentTag?: string;
  branchGroupId?: string;
  branchCount?: number;
  approvalRequired?: boolean;
  isUnread?: boolean;
};

export type MeetingRecord = {
  id: string;
  title: string;
  time: string;
  stage: "Upcoming" | "Completed";
  domain?: "Compliance" | "Logistics" | "Commercial" | "Standup";
  owner: string;
  participants: string[];
  summary: string;
  agenda: string[];
  decisions: string[];
  actionItems: string[];
  dayGroup?: "Today" | "Yesterday" | "This Week";
  platform?: "Google Meet" | "Zoom" | "Microsoft Teams" | "Phone";
  platformDomain?: string;
  linkedProject?: string;
  linkedClient?: string;
  clientDomain?: string;
  vendor?: string;
  vendorDomain?: string;
  folder?: "Compliance" | "Customer Calls" | "Standups";
  summaryLines?: string[];
  preReadNudges?: string[];
  generatedNotes?: string;
  preReadContext?: {
    whyThisMatters?: string;
    whatChanged?: string;
    whatIsBlocked?: string;
    recommendedNextStep?: string;
  };
  schedulingSuggestions?: {
    timezoneLabel?: string;
    seedDate?: string;
    suggestedSlots?: string[];
    defaultDurationMinutes?: number;
  };
  landingHelper?: {
    relatedMeetings?: string[];
    folderHighlights?: string[];
    decisionCarryovers?: string[];
  };
  attendeeBriefs?: Array<{
    name: string;
    role?: string;
    whatsOnMind: string;
    worthBringingUp: string;
    headsUp: string;
  }>;
};

export type ActivityFeedItem = {
  id: string;
  type: "meeting" | "artifact" | "approval" | "followup";
  dayGroup: "Today" | "Yesterday";
  displayMode?: "hero" | "row";
  title: string;
  insight: string;
  owner: string;
  time: string;
  priority: "Critical" | "High" | "Medium";
  source: "Meetings" | "Agents" | "Approvals" | "Inbox";
  sourceDomain?: string;
  linkedMeetingId?: string;
  linkedThreadId?: string;
  ctaLabel: string;
};

export type ProjectPreset =
  | "sales"
  | "account_management"
  | "plant_ops"
  | "packaging_sustainability"
  | "finance"
  | "custom";

export type ContactCard = {
  id: string;
  name: string;
  role: string;
  company: string;
  domain?: string;
  avatarSrc?: string;
  avatarFallback: string;
};

export type LinkedItem = {
  label: string;
  kind: "workflow" | "report" | "approval" | "file" | "chat";
};

export type ProjectRecord = {
  id: string;
  name: string;
  code: string;
  status: "On track" | "At risk" | "Needs attention";
  owner: string;
  progress: number;
  summary: string;
  milestones: { label: string; state: "Done" | "Active" | "Upcoming" }[];
  linked: LinkedItem[];
  team: string[];
  nextActions: string[];
};

export type ApprovalItem = {
  id: string;
  title: string;
  workflow: string;
  status: "Urgent" | "Review";
  confidence: number;
  recommendation: string;
  inputSummary: string;
  provenance: string[];
  actions: string[];
};

export type WorkflowStep = {
  id: string;
  label: string;
  status: "done" | "running" | "pending";
};

export type WorkflowDefinition = {
  id: string;
  name: string;
  owner: string;
  cadence: string;
  approvalMode: string;
  outcomes: string;
};

export type WorkflowRun = {
  id: string;
  name: string;
  status: "Running" | "Awaiting approval" | "Completed";
  startedAt: string;
  owner: string;
  summary: string;
  steps: WorkflowStep[];
  artifacts: string[];
};

export type AgentRecord = {
  id: string;
  name: string;
  status: "Healthy" | "Watching" | "Paused";
  lastRun: string;
  linkedWorkflow: string;
  summary: string;
};

export type IntelligenceRecord = {
  id: string;
  title: string;
  freshness: string;
  source: string;
  summary: string;
};

export type ArchiveRecord = {
  id: string;
  title: string;
  type: string;
  updatedAt: string;
  owner: string;
};

export type SettingsSection = {
  id: string;
  title: string;
  description: string;
  values: { label: string; value: string }[];
};

export type HelpResource = {
  id: string;
  title: string;
  description: string;
  action: string;
};

export type DrawerContent = {
  title: string;
  eyebrow?: string;
  description?: string;
  metadata?: { label: string; value: string }[];
  timeline?: string[];
  actions?: string[];
};

export type RuntimeContent = {
  title: string;
  status: string;
  lines: string[];
  artifactLabel?: string;
};
