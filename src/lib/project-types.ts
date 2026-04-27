export type ProjectScopeId =
  | "po-queue"
  | "vmi"
  | "delivery-workflow"
  | "order-planning"
  | "supplier-status"
  | "doc-verification"
  | "templates";

export type ProjectStatus = "On track" | "At risk" | "Blocked" | "Paused";

export type ProjectDetailVariant = "default" | "vmi" | "docqueue";

export type ProjectStepStatus = "done" | "current" | "next";

export type ProjectJourneyStep = {
  id: string;
  label: string;
  role: "human" | "ai";
  status: ProjectStepStatus;
  owner?: string;
  summary?: string;
};

export type ProjectScope = {
  id: ProjectScopeId;
  title: string;
  description: string;
  railLabel: string;
  sidebarHint: string;
};

export type ProjectMetric = {
  label: string;
  value: string;
  detail: string;
};

export type ProjectDecisionTraceItem = {
  id: string;
  source: string;
  copy: string;
  timestamp: string;
};

export type ProjectOperationalCard = {
  title: string;
  body: string;
  owner: string;
};

export type ProjectTrendPoint = {
  label: string;
  throughput: number;
  risk: number;
};

export type ProjectInstance = {
  id: string;
  scope: ProjectScopeId;
  title: string;
  code: string;
  status: ProjectStatus;
  progress: number;
  owner: string;
  customer: string;
  dueLabel: string;
  priority: "Critical" | "High" | "Medium";
  summary: string;
  detailVariant: ProjectDetailVariant;
  metrics: ProjectMetric[];
  steps: ProjectJourneyStep[];
  trace: ProjectDecisionTraceItem[];
  cards: ProjectOperationalCard[];
  trend: ProjectTrendPoint[];
  tabs: {
    emails: string[];
    meetings: string[];
    logistics: string[];
    documents: string[];
  };
};

export type ProjectPreset = {
  id: string;
  name: string;
  scope: Exclude<ProjectScopeId, "templates">;
  sources: string[];
  trigger: string;
  journey: ProjectJourneyStep[];
  detailVariant: ProjectDetailVariant;
  summary: string;
};
