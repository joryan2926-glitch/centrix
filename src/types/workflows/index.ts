export type WorkflowStatus = "active" | "paused" | "draft" | "error";
export type BlockType = "trigger" | "action" | "condition" | "delay" | "ai" | "notification" | "filter";
export type RunStatus = "success" | "failed" | "running";

export type Workflow = {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  runs: number;
  successRate: number;
  timeSavedHours: number;
  owner: string;
  updatedAt: string;
};

export type WorkflowBlock = {
  id: string;
  workflowId: string;
  type: BlockType;
  label: string;
  description: string;
  positionX: number;
  positionY: number;
  config: Record<string, string | number | boolean>;
};

export type WorkflowConnection = {
  id: string;
  workflowId: string;
  sourceId: string;
  targetId: string;
  label?: string;
};

export type WorkflowRun = {
  id: string;
  workflowId: string;
  status: RunStatus;
  durationMs: number;
  message: string;
  createdAt: string;
};

export type WorkflowTemplate = {
  id: string;
  name: string;
  category: "crm" | "billing" | "marketing" | "support" | "hr" | "ai";
  description: string;
  blocks: number;
};

export type ProductivityTask = {
  id: string;
  title: string;
  module: string;
  automated: boolean;
  savedMinutes: number;
  createdAt: string;
};

export type WorkflowAlert = {
  id: string;
  workflowId: string;
  title: string;
  detail: string;
  severity: "info" | "warning" | "critical";
  createdAt: string;
};

export type WorkflowData = {
  workflows: Workflow[];
  blocks: WorkflowBlock[];
  connections: WorkflowConnection[];
  runs: WorkflowRun[];
  templates: WorkflowTemplate[];
  tasks: ProductivityTask[];
  alerts: WorkflowAlert[];
};
