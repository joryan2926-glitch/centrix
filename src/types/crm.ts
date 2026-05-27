export type CrmStatus = "new" | "qualified" | "proposal" | "negotiation" | "won" | "lost";

export type CrmPriority = "low" | "medium" | "high";

export type CrmActivityType = "call" | "email" | "meeting" | "note" | "status" | "task" | "client";

export type CrmLead = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: CrmStatus;
  priority: CrmPriority;
  potentialAmount: number;
  probability: number;
  owner: string;
  source: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type CrmClient = {
  id: string;
  leadId: string | null;
  name: string;
  company: string;
  email: string;
  phone: string;
  tags: string[];
  lifetimeValue: number;
  status: "active" | "onboarding" | "at_risk";
  createdAt: string;
  updatedAt: string;
};

export type CrmNote = {
  id: string;
  leadId: string | null;
  clientId: string | null;
  body: string;
  createdAt: string;
};

export type CrmTask = {
  id: string;
  leadId: string | null;
  clientId: string | null;
  title: string;
  dueDate: string;
  done: boolean;
  createdAt: string;
};

export type CrmActivity = {
  id: string;
  leadId: string | null;
  clientId: string | null;
  type: CrmActivityType;
  title: string;
  detail: string;
  createdAt: string;
};

export type CrmData = {
  leads: CrmLead[];
  clients: CrmClient[];
  notes: CrmNote[];
  tasks: CrmTask[];
  activities: CrmActivity[];
};

export type CrmFilters = {
  query: string;
  status: "all" | CrmStatus;
  priority: "all" | CrmPriority;
};

export type CrmSelection =
  | { type: "lead"; id: string }
  | { type: "client"; id: string };
