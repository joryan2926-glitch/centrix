import type { ClientPortalData } from "@/types/client-portal";

export function getClientPortalDashboard(data: ClientPortalData) {
  return {
    pendingInvoices: data.invoices.filter((invoice) => invoice.status === "pending" || invoice.status === "overdue").length,
    activeProjects: data.projects.filter((project) => project.status === "active" || project.status === "planned").length,
    supportTickets: data.notifications.filter((notification) => notification.title.toLowerCase().includes("support")).length || 2,
    appointments: data.appointments.filter((appointment) => appointment.status !== "cancelled").length,
    documents: data.documents.length,
    activity: data.activityLogs.length
  };
}

export function createClientMessage(portalId: string, content = "Nouveau message client") {
  return {
    id: `msg-${crypto.randomUUID()}`,
    portalId,
    author: "Client",
    role: "client" as const,
    content,
    createdAt: new Date().toISOString()
  };
}
