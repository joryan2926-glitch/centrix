export type OperationalPriority = "low" | "medium" | "high" | "critical";
export type OperationalStatus = "draft" | "active" | "pending" | "completed" | "archived";

export type OperationalRecord = {
  id: string;
  workspace_id: string;
  module_key: string;
  record_type: string;
  title: string;
  description: string;
  status: OperationalStatus;
  priority: OperationalPriority;
  amount: number;
  owner_name: string;
  due_at: string | null;
  tags: string[];
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type OperationalHistory = {
  id: string;
  workspace_id: string;
  module_key: string;
  record_id: string | null;
  action: string;
  detail: string;
  actor_id: string | null;
  created_at: string;
};

export type ModuleAction = "read" | "create" | "update" | "delete" | "export" | "manage";

export type ModulePermission = {
  id: string;
  workspace_id: string;
  module_key: string;
  role: "super_admin" | "workspace_admin" | "admin" | "manager" | "employee" | "user" | "client";
  can_read: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
  can_export: boolean;
  can_manage: boolean;
  created_at: string;
  updated_at: string;
};

export type OperationalModuleConfig = {
  key: string;
  title: string;
  eyebrow: string;
  description: string;
  recordLabel: string;
  recordTypes: readonly string[];
  suggestions: readonly string[];
  specialization: OperationalSpecialization;
};

export type OperationalField = {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "boolean" | "textarea";
  options?: readonly string[];
  placeholder?: string;
  required?: boolean;
  suffix?: string;
};

export type OperationalSpecialization = {
  fields: readonly OperationalField[];
  stages: readonly string[];
  metricLabels: readonly [string, string, string, string];
  amountLabel: string;
  ownerLabel: string;
  dueLabel: string;
  quickActions: readonly string[];
};

export type OperationalRecordDraft = Pick<
  OperationalRecord,
  "title" | "description" | "record_type" | "status" | "priority" | "amount" | "owner_name" | "due_at" | "tags" | "metadata"
>;
