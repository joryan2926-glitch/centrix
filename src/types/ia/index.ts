export type AiConversation = {
  id: string;
  title: string;
  model: string;
  tokensUsed: number;
  createdAt: string;
  updatedAt: string;
};

export type AiMessage = {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  tokens: number;
  createdAt: string;
};

export type AiTemplate = {
  id: string;
  category: "sales" | "finance" | "legal" | "marketing" | "crm" | "productivity" | "strategy";
  title: string;
  prompt: string;
  favorite: boolean;
};

export type AiGeneration = {
  id: string;
  templateId: string | null;
  title: string;
  output: string;
  category: AiTemplate["category"];
  createdAt: string;
};

export type WorkflowTrigger = "new_client" | "invoice_paid" | "meeting_created" | "new_lead" | "email_received";
export type WorkflowAction = "send_notification" | "create_task" | "send_email" | "create_invoice" | "update_crm" | "generate_document";

export type Workflow = {
  id: string;
  name: string;
  description: string;
  active: boolean;
  trigger: WorkflowTrigger;
  runs: number;
  successRate: number;
  timeSavedHours: number;
  createdAt: string;
  updatedAt: string;
};

export type WorkflowStep = {
  id: string;
  workflowId: string;
  type: "trigger" | "condition" | "action";
  label: string;
  action: WorkflowAction | null;
  positionX: number;
  positionY: number;
  order: number;
};

export type AutomationLog = {
  id: string;
  workflowId: string;
  status: "success" | "failed" | "running";
  message: string;
  createdAt: string;
};

export type AiNotification = {
  id: string;
  title: string;
  detail: string;
  severity: "info" | "success" | "warning";
  createdAt: string;
};

export type AiAutomationData = {
  conversations: AiConversation[];
  messages: AiMessage[];
  generations: AiGeneration[];
  templates: AiTemplate[];
  workflows: Workflow[];
  workflowSteps: WorkflowStep[];
  automationLogs: AutomationLog[];
  notifications: AiNotification[];
};
