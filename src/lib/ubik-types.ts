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
  approvalRequired?: boolean;
};

export type MeetingRecord = {
  id: string;
  title: string;
  time: string;
  stage: "Upcoming" | "Completed";
  owner: string;
  participants: string[];
  summary: string;
  agenda: string[];
  decisions: string[];
  actionItems: string[];
};

export type LinkedItem = {
  label: string;
  kind: "workflow" | "report" | "approval" | "file" | "chat" | "meeting";
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
