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

export type RouteSearchConfig = {
  placeholder: string;
  sections: string[];
};

export type RouteMeta = {
  key: string;
  title: string;
  shortTitle?: string;
  path: string;
  description: string;
  actions: PageAction[];
  search: RouteSearchConfig;
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
  category: string;
  icon:
    | "project"
    | "follow-up"
    | "approval"
    | "meeting"
    | "workflow"
    | "research";
  seedPrompt: string;
};

export type SignalItem = {
  id: string;
  label: string;
  value: string;
  description?: string;
  href?: string;
  tone?: "default" | "alert";
};

export type HomeUsageStat = {
  id: string;
  label: string;
  value: string;
  detail: string;
  trend?: HomeUsageTrend;
};

export type HomeUsageActivityDay = {
  id: string;
  level: 0 | 1 | 2 | 3 | 4;
  label: string;
};

export type HomeUsageTrend = {
  direction: "up" | "down" | "flat";
  label: string;
  tone?: "positive" | "negative" | "neutral";
};

export type HomeUsageOverview = {
  stats: HomeUsageStat[];
  activity: HomeUsageActivityDay[];
  footer: string;
};

export type UnifiedTaskPriority = "Urgent" | "High" | "Medium" | "Low";

export type UnifiedTaskSourceKey =
  | "inbox"
  | "meetings"
  | "approvals"
  | "workflows"
  | "workspace";

export type UnifiedTaskSection = "Today" | "No deadline";

export type UnifiedTask = {
  id: string;
  title: string;
  summary: string;
  project: string;
  owner: string;
  priority: UnifiedTaskPriority;
  source: UnifiedTaskSourceKey;
  sourceLabel: string;
  href: string;
  originHref: string;
  section: UnifiedTaskSection;
  dueLabel: string;
  category: string;
  timelineStart: string;
  timelineEnd: string;
};

export type InboxSource = "Email" | "Slack" | "WhatsApp" | "System";

export type InboxPriority = "Critical" | "High" | "Medium";

export type InboxPriorityBand =
  | "needs_attention"
  | "review_today"
  | "waiting_on_you"
  | "follow_up_risk"
  | "awaiting_approval"
  | "delegated"
  | "watching"
  | "auto_handled"
  | "archive";

export type InboxActionKey =
  | "generate_reply"
  | "request_approval"
  | "set_follow_up"
  | "create_task"
  | "run_workflow"
  | "suggest_delegate"
  | "open_systems"
  | "analyze_attachments"
  | "mark_reviewed"
  | "watch"
  | "archive";

export type InboxRecommendationAction = {
  key: InboxActionKey;
  label: string;
  kind: "primary" | "secondary" | "tertiary";
  description: string;
};

export type InboxTimelineMessage = {
  id: string;
  sender: string;
  role: string;
  time: string;
  body: string;
  summary?: string;
  attachments?: string[];
};

export type InboxContextModule = {
  id: string;
  title: string;
  items: { label: string; value: string }[];
};

export type InboxLinkedReference = {
  id: string;
  label: string;
  status: string;
};

export type InboxProvenanceItem = {
  label: string;
  value: string;
};

export type InboxApprovalPacket = {
  actionType: string;
  riskLevel: string;
  whyApprovalNeeded: string;
  businessImpact: string;
  target: string;
  editableOutput: string;
  sourceThread: string;
  trace: string[];
};

export type InboxTaskPacket = {
  mode: "create" | "update";
  taskTitle: string;
  owner: string;
  dueDate: string;
  nextAction: string;
  sourceThread: string;
  workflowLinkage: string;
  approvalRequirement: string;
  currentStatus: string;
  delegationHistory: string[];
  followUpPlan: string;
  linkedPlaybook: string;
  linkedAgent: string;
};

export type InboxThread = {
  id: string;
  source: InboxSource;
  sender: string;
  company: string;
  subject: string;
  preview: string;
  priority: InboxPriority;
  priorityBand: InboxPriorityBand;
  owner: string;
  waitingState: string;
  dueRisk: string;
  lastMaterialChangeAt: string;
  lastReviewedAt: string;
  whyThisMatters: string;
  whatChanged: string;
  whatIsBlocked: string;
  nextAction: string;
  account: string;
  project: string;
  participants: string[];
  approvalStatus: "approval_required" | "not_required" | "approved";
  followUpStatus: "none" | "recommended" | "due_soon" | "overdue" | "auto_handled" | "blocked_by_approval";
  delegationStatus: "none" | "suggested" | "delegated";
  attachmentPresence: boolean;
  linkedTask?: InboxLinkedReference;
  linkedWorkflow?: InboxLinkedReference & { nextStep: string };
  tags: string[];
  time: string;
  extractedTasks: string[];
  recommendedReply: string;
  timeline: InboxTimelineMessage[];
  contextModules: InboxContextModule[];
  actionRecommendations: InboxRecommendationAction[];
  provenance: InboxProvenanceItem[];
  attachments: string[];
  status?: "Action required" | "Waiting" | "Reviewed";
  domainTag?: string;
  intentTag?: string;
  branchGroupId?: string;
  branchCount?: number;
  approvalRequired?: boolean;
  isUnread?: boolean;
  approvalPacket?: InboxApprovalPacket;
  taskPacket: InboxTaskPacket;
  permissionsLimited?: boolean;
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

export type ContactCard = {
  id: string;
  name: string;
  role: string;
  company: string;
  domain?: string;
  avatarSrc?: string;
  avatarFallback: string;
};

export type ContextualSearchItem = {
  id: string;
  section: string;
  kind: "record" | "artifact" | "person" | "prompt" | "action";
  label: string;
  supportingText?: string;
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
  kind?: "generic";
  title: string;
  eyebrow?: string;
  description?: string;
  metadata?: { label: string; value: string }[];
  timeline?: string[];
  actions?: string[];
};

export type ApprovalDrawerContent = {
  kind: "approval";
  title: string;
  eyebrow?: string;
  description?: string;
  approval: InboxApprovalPacket;
};

export type TaskWorkflowDrawerContent = {
  kind: "task_workflow";
  title: string;
  eyebrow?: string;
  description?: string;
  task: InboxTaskPacket;
};

export type ProvenanceDrawerContent = {
  kind: "provenance";
  title: string;
  eyebrow?: string;
  description?: string;
  items: InboxProvenanceItem[];
  supportingTrace?: string[];
};

export type DrawerSurfaceContent =
  | DrawerContent
  | ApprovalDrawerContent
  | TaskWorkflowDrawerContent
  | ProvenanceDrawerContent;

export type RuntimeContent = {
  title: string;
  status: string;
  lines: string[];
  artifactLabel?: string;
};
