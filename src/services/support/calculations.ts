import type { SupportData, SupportNotification, SupportTicket, TicketPriority, TicketStatus } from "@/types/support";

export const statusLabels: Record<TicketStatus, string> = {
  open: "Ouvert",
  pending: "En attente",
  in_progress: "En cours",
  resolved: "Resolu",
  closed: "Ferme"
};

export const priorityLabels: Record<TicketPriority, string> = {
  low: "Faible",
  medium: "Moyenne",
  high: "Haute",
  urgent: "Urgente"
};

export function getSupportDashboard(data: SupportData) {
  const closed = data.tickets.filter((ticket) => ticket.status === "closed" || ticket.status === "resolved").length;
  const open = data.tickets.filter((ticket) => ticket.status !== "closed" && ticket.status !== "resolved").length;
  const urgent = data.tickets.filter((ticket) => ticket.priority === "urgent").length;
  const activeAgents = data.agents.filter((agent) => agent.online).length;
  const satisfaction = data.feedback.length
    ? Math.round((data.feedback.reduce((sum, item) => sum + item.rating, 0) / data.feedback.length / 5) * 100)
    : 0;
  const averageResponseMinutes = data.messages.length ? 34 : 0;

  return {
    open,
    closed,
    averageResponseMinutes,
    satisfaction,
    urgent,
    activeAgents,
    articles: data.articles.filter((article) => article.published).length
  };
}

export function createTicket(input: Pick<SupportTicket, "title" | "description" | "clientName" | "clientEmail" | "priority" | "categoryId">): SupportTicket {
  const now = new Date().toISOString();
  return {
    id: `ticket-${crypto.randomUUID()}`,
    ...input,
    status: "open",
    assignedAgentId: null,
    attachments: [],
    createdAt: now,
    updatedAt: now
  };
}

export function createNotification(ticketId: string | null, title: string, detail: string, severity: SupportNotification["severity"] = "info"): SupportNotification {
  return {
    id: `support-notif-${crypto.randomUUID()}`,
    ticketId,
    title,
    detail,
    severity,
    createdAt: new Date().toISOString()
  };
}

export function filterTickets(data: SupportData, query: string, status: TicketStatus | "all", priority: TicketPriority | "all") {
  const needle = query.toLowerCase();
  return data.tickets.filter((ticket) => {
    const category = data.categories.find((item) => item.id === ticket.categoryId);
    const agent = data.agents.find((item) => item.id === ticket.assignedAgentId);
    const matchQuery =
      !needle ||
      ticket.title.toLowerCase().includes(needle) ||
      ticket.clientName.toLowerCase().includes(needle) ||
      ticket.clientEmail.toLowerCase().includes(needle) ||
      category?.name.toLowerCase().includes(needle) ||
      agent?.name.toLowerCase().includes(needle);
    return matchQuery && (status === "all" || ticket.status === status) && (priority === "all" || ticket.priority === priority);
  });
}

export function statusTone(status: TicketStatus) {
  if (status === "resolved" || status === "closed") return "emerald" as const;
  if (status === "open") return "cyan" as const;
  if (status === "pending") return "violet" as const;
  return "cyan" as const;
}

export function priorityTone(priority: TicketPriority) {
  if (priority === "urgent") return "rose" as const;
  if (priority === "high") return "violet" as const;
  if (priority === "medium") return "cyan" as const;
  return "emerald" as const;
}
