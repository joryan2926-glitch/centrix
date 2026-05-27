import type { CrmActivity, CrmClient, CrmData, CrmFilters, CrmLead, CrmNote, CrmPriority, CrmStatus, CrmTask } from "@/types/crm";

export const statusLabels: Record<CrmStatus, string> = {
  new: "Nouveau",
  qualified: "Qualifie",
  proposal: "Proposition",
  negotiation: "Negociation",
  won: "Gagne",
  lost: "Perdu"
};

export const priorityLabels: Record<CrmPriority, string> = {
  low: "Faible",
  medium: "Moyenne",
  high: "Haute"
};

export function createCrmId(prefix = "crm") {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function formatCrmCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatCrmDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export function priorityTone(priority: CrmPriority) {
  return priority === "high" ? "rose" : priority === "medium" ? "cyan" : "emerald";
}

export function statusTone(status: CrmStatus) {
  if (status === "won") return "emerald";
  if (status === "lost") return "rose";
  if (status === "proposal" || status === "negotiation") return "violet";
  return "cyan";
}

export function filterLeads(leads: CrmLead[], filters: CrmFilters) {
  const query = filters.query.trim().toLowerCase();

  return leads.filter((lead) => {
    const matchesQuery =
      !query ||
      [lead.name, lead.company, lead.email, lead.phone, lead.owner, lead.source, ...lead.tags]
        .join(" ")
        .toLowerCase()
        .includes(query);
    const matchesStatus = filters.status === "all" || lead.status === filters.status;
    const matchesPriority = filters.priority === "all" || lead.priority === filters.priority;

    return matchesQuery && matchesStatus && matchesPriority;
  });
}

export function filterClients(clients: CrmClient[], query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return clients;
  }

  return clients.filter((client) =>
    [client.name, client.company, client.email, client.phone, ...client.tags].join(" ").toLowerCase().includes(normalized)
  );
}

export function createActivity(payload: Omit<CrmActivity, "id" | "createdAt">): CrmActivity {
  return {
    id: createCrmId("activity"),
    createdAt: new Date().toISOString(),
    ...payload
  };
}

export function buildNewLead(count: number): CrmLead {
  const now = new Date().toISOString();

  return {
    id: createCrmId("lead"),
    name: "Contact principal",
    company: `Nouveau prospect ${count + 1}`,
    email: "contact@client.fr",
    phone: "+33 6 00 00 00 00",
    status: "new",
    priority: "medium",
    potentialAmount: 15000,
    probability: 25,
    owner: "Sarah",
    source: "Manuel",
    tags: ["A qualifier"],
    createdAt: now,
    updatedAt: now
  };
}

export function buildClientFromLead(lead: CrmLead): CrmClient {
  const now = new Date().toISOString();

  return {
    id: createCrmId("client"),
    leadId: lead.id,
    name: lead.name,
    company: lead.company,
    email: lead.email,
    phone: lead.phone,
    tags: [...lead.tags, "Client"],
    lifetimeValue: lead.potentialAmount,
    status: "onboarding",
    createdAt: now,
    updatedAt: now
  };
}

export function buildNote(leadId: string | null, clientId: string | null, body: string): CrmNote {
  return {
    id: createCrmId("note"),
    leadId,
    clientId,
    body,
    createdAt: new Date().toISOString()
  };
}

export function buildTask(leadId: string | null, clientId: string | null, title: string): CrmTask {
  return {
    id: createCrmId("task"),
    leadId,
    clientId,
    title,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    done: false,
    createdAt: new Date().toISOString()
  };
}

export function getCrmDashboard(data: CrmData) {
  const open = data.leads.filter((lead) => lead.status !== "won" && lead.status !== "lost");
  const pipelineValue = open.reduce((sum, lead) => sum + lead.potentialAmount, 0);
  const weighted = open.reduce((sum, lead) => sum + lead.potentialAmount * (lead.probability / 100), 0);
  const won = data.leads.filter((lead) => lead.status === "won").reduce((sum, lead) => sum + lead.potentialAmount, 0);
  const activeTasks = data.tasks.filter((task) => !task.done).length;

  return { pipelineValue, weighted, won, activeTasks };
}
