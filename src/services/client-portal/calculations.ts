import type { ClientActivityLog, ClientAppointment, ClientDocument, ClientNotification, ClientPortalData, ClientSignature } from "@/types/client-portal";

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

export function createClientActivity(portalId: string, label: string, module = "Portail client"): ClientActivityLog {
  return {
    id: `act-${crypto.randomUUID()}`,
    portalId,
    label,
    module,
    createdAt: new Date().toISOString()
  };
}

export function createClientNotification(portalId: string, title: string, detail: string): ClientNotification {
  return {
    id: `notif-${crypto.randomUUID()}`,
    portalId,
    title,
    detail,
    read: false,
    createdAt: new Date().toISOString()
  };
}

export function createClientAppointment(portalId: string): ClientAppointment {
  return {
    id: `apt-${crypto.randomUUID()}`,
    portalId,
    title: "Nouveau rendez-vous client",
    type: "project",
    status: "pending",
    startsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
  };
}

export function createClientDocument(portalId: string, name = "Document partage.pdf"): ClientDocument {
  return {
    id: `doc-${crypto.randomUUID()}`,
    portalId,
    name,
    category: "shared",
    fileType: name.split(".").pop()?.toUpperCase() || "PDF",
    sizeMb: 0.4,
    secureUrl: "#",
    createdAt: new Date().toISOString()
  };
}

export function createClientSignature(portalId: string, documentName = "Document a signer.pdf"): ClientSignature {
  return {
    id: `sig-${crypto.randomUUID()}`,
    portalId,
    documentName,
    status: "pending",
    requestedAt: new Date().toISOString()
  };
}
