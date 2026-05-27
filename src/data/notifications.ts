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
  ]
};
