import type { NotificationsData } from "@/types/notifications";

export const notificationsFallbackData: NotificationsData = {
  notifications: [
    {
      id: "notif-1",
      title: "Pipeline CRM accelere",
      detail: "NovaCore vient de passer en proposition, une relance est planifiee automatiquement.",
      module: "crm",
      severity: "success",
      read: false,
      actionUrl: "/crm",
      createdAt: "2026-05-27T08:10:00.000Z",
      remindAt: "2026-05-27T15:30:00.000Z"
    },
    {
      id: "notif-2",
      title: "Facture premium en attente",
      detail: "La facture FAC-2026-041 arrive a echeance dans 48 heures.",
      module: "billing",
      severity: "warning",
      read: false,
      actionUrl: "/facturation",
      createdAt: "2026-05-27T07:42:00.000Z",
      remindAt: "2026-05-28T09:00:00.000Z"
    },
    {
      id: "notif-3",
      title: "Alerte securite",
      detail: "Connexion inhabituelle detectee sur le compte administrateur.",
      module: "security",
      severity: "critical",
      read: false,
      actionUrl: "/security",
      createdAt: "2026-05-27T06:55:00.000Z",
      remindAt: null
    },
    {
      id: "notif-4",
      title: "Campagne marketing publiee",
      detail: "La sequence email onboarding affiche 18,6% de conversion.",
      module: "marketing",
      severity: "info",
      read: true,
      actionUrl: "/marketing",
      createdAt: "2026-05-26T18:20:00.000Z",
      remindAt: null
    },
    {
      id: "notif-5",
      title: "Document partage",
      detail: "Le contrat Blue Atlas a ete partage dans Documents Cloud.",
      module: "documents",
      severity: "info",
      read: true,
      actionUrl: "/documents",
      createdAt: "2026-05-26T16:05:00.000Z",
      remindAt: null
    }
  ],
  preferences: [
    { id: "pref-crm", module: "crm", email: true, push: true, dashboard: true },
    { id: "pref-billing", module: "billing", email: true, push: true, dashboard: true },
    { id: "pref-projects", module: "projects", email: false, push: true, dashboard: true },
    { id: "pref-support", module: "support", email: true, push: true, dashboard: true },
    { id: "pref-security", module: "security", email: true, push: true, dashboard: true },
    { id: "pref-marketing", module: "marketing", email: false, push: true, dashboard: true }
  ],
  rules: [
    { id: "rule-1", name: "Relance facture impayee", trigger: "invoice.overdue", channel: "all", active: true, createdAt: "2026-05-01T08:00:00.000Z" },
    { id: "rule-2", name: "Lead chaud CRM", trigger: "crm.lead.scored", channel: "dashboard", active: true, createdAt: "2026-05-03T08:00:00.000Z" },
    { id: "rule-3", name: "Ticket support urgent", trigger: "support.ticket.urgent", channel: "all", active: true, createdAt: "2026-05-04T08:00:00.000Z" },
    { id: "rule-4", name: "Anomalie securite", trigger: "security.alert.critical", channel: "all", active: true, createdAt: "2026-05-05T08:00:00.000Z" }
  ],
  conversations: [
    { id: "conv-ops", name: "Equipe operations", type: "team", module: "projects", unreadCount: 3, updatedAt: "2026-05-27T09:25:00.000Z" },
    { id: "conv-support", name: "Support prioritaire", type: "project", module: "support", unreadCount: 1, updatedAt: "2026-05-27T08:50:00.000Z" },
    { id: "conv-annonce", name: "Annonces direction", type: "announcement", module: "system", unreadCount: 0, updatedAt: "2026-05-26T17:10:00.000Z" }
  ],
  messages: [
    { id: "msg-ops-1", conversationId: "conv-ops", author: "Nadia", role: "manager", content: "Point rapide: les relances factures sont automatisees.", attachmentName: null, createdAt: "2026-05-27T09:10:00.000Z" },
    { id: "msg-ops-2", conversationId: "conv-ops", author: "Yanis", role: "employee", content: "J'ajoute le compte-rendu dans Documents Cloud.", attachmentName: "compte-rendu.pdf", createdAt: "2026-05-27T09:24:00.000Z" },
    { id: "msg-support-1", conversationId: "conv-support", author: "Sarah", role: "admin", content: "Ticket urgent assigne, reponse client preparee.", attachmentName: null, createdAt: "2026-05-27T08:50:00.000Z" }
  ],
  presence: [
    { id: "presence-1", name: "Nadia", role: "Manager operations", status: "online", lastSeenAt: "2026-05-27T09:30:00.000Z" },
    { id: "presence-2", name: "Yanis", role: "Projet", status: "away", lastSeenAt: "2026-05-27T09:12:00.000Z" },
    { id: "presence-3", name: "Sarah", role: "Support", status: "online", lastSeenAt: "2026-05-27T09:28:00.000Z" }
  ],
  sharedFiles: [
    { id: "file-1", conversationId: "conv-ops", name: "compte-rendu.pdf", fileType: "PDF", sizeMb: 1.2, secureUrl: "#", createdAt: "2026-05-27T09:24:00.000Z" },
    { id: "file-2", conversationId: "conv-support", name: "capture-ticket.png", fileType: "PNG", sizeMb: 0.6, secureUrl: "#", createdAt: "2026-05-27T08:51:00.000Z" }
  ]
};
