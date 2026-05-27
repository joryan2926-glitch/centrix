export type SalesStage = "new_lead" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
export type SalesPriority = "low" | "medium" | "high" | "urgent";
export type QuoteStatus = "draft" | "sent" | "opened" | "accepted" | "rejected";

export type SalesLead = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  sector: string;
  source: string;
  potentialValue: number;
  score: number;
  priority: SalesPriority;
  tags: string[];
  ownerId: string;
  stage: SalesStage;
  createdAt: string;
};

export type SalesPipelineStage = {
  id: SalesStage;
  label: string;
  order: number;
  probability: number;
};

export type SalesOpportunity = {
  id: string;
  leadId: string;
  title: string;
  amount: number;
  probability: number;
  deadline: string;
  status: SalesStage;
};

export type SalesActivity = {
  id: string;
  leadId: string;
  type: "call" | "email" | "meeting" | "task" | "signature";
  title: string;
  owner: string;
  createdAt: string;
};

export type SalesNote = {
  id: string;
  leadId: string;
  author: string;
  content: string;
  createdAt: string;
};

export type SalesQuote = {
  id: string;
  leadId: string;
  title: string;
  amount: number;
  status: QuoteStatus;
  openedCount: number;
  createdAt: string;
};

export type SalesTarget = {
  id: string;
  sellerId: string;
  label: string;
  targetAmount: number;
  currentAmount: number;
  period: string;
};

export type SalesNotification = {
  id: string;
  title: string;
  detail: string;
  priority: SalesPriority;
  read: boolean;
  createdAt: string;
};

export type SalesTeamMember = {
  id: string;
  name: string;
  role: string;
  active: boolean;
  closedRevenue: number;
  quota: number;
  activities: number;
};

export type SalesData = {
  leads: SalesLead[];
  pipeline: SalesPipelineStage[];
  opportunities: SalesOpportunity[];
  activities: SalesActivity[];
  notes: SalesNote[];
  quotes: SalesQuote[];
  targets: SalesTarget[];
  notifications: SalesNotification[];
  teams: SalesTeamMember[];
};
