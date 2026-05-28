import type { Metric } from "@/types/navigation";

export type CentrixModuleKey =
  | "dashboard"
  | "crm"
  | "clients"
  | "billing"
  | "accounting"
  | "banking"
  | "enterprise"
  | "legal"
  | "documents"
  | "hr"
  | "payroll"
  | "agenda"
  | "projects"
  | "collaboration"
  | "marketing"
  | "social"
  | "ai"
  | "automations"
  | "analytics"
  | "support"
  | "notifications"
  | "marketplace"
  | "academy"
  | "settings"
  | "integrations"
  | "security"
  | "multi-company";

export type ModuleStatus = "active" | "planned" | "needs_config";
export type EventSeverity = "info" | "success" | "warning" | "critical";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "in_progress" | "done" | "blocked";

export type CentrixModule = {
  key: CentrixModuleKey;
  label: string;
  href: string;
  status: ModuleStatus;
  description: string;
  connectedModules: CentrixModuleKey[];
};

export type ModuleEvent = {
  id: string;
  module: CentrixModuleKey;
  entityType: string;
  entityId: string | null;
  title: string;
  detail: string;
  severity: EventSeverity;
  status: "open" | "resolved";
  createdAt: string;
};

export type ModuleTask = {
  id: string;
  module: CentrixModuleKey;
  title: string;
  assignee: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueAt: string | null;
};

export type ModuleConnection = {
  id: string;
  sourceModule: CentrixModuleKey;
  targetModule: CentrixModuleKey;
  trigger: string;
  action: string;
  active: boolean;
};

export type DashboardAnalyticsPoint = {
  label: string;
  revenue: number;
  expenses: number;
  leads: number;
};

export type SaasCoreDashboard = {
  metrics: Metric[];
  events: ModuleEvent[];
  tasks: ModuleTask[];
  connections: ModuleConnection[];
  analytics: DashboardAnalyticsPoint[];
  modules: CentrixModule[];
};
