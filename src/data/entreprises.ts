import type { MultiEnterpriseData } from "@/types/entreprises";

export const multiEnterpriseFallbackData: MultiEnterpriseData = {
  companies: [
    {
      id: "ent-centrix-hq",
      name: "CENTRIX HQ",
      siret: "948 221 845 00019",
      vatNumber: "FR12948221845",
      address: "18 rue des Archives, 75004 Paris",
      iban: "FR76 3000 6000 0112 3456 7890 189",
      logoUrl: null,
      industry: "SaaS B2B",
      status: "active",
      revenue: 482000,
      activeUsers: 128,
      brandColor: "#5ee7ff",
      workspaceSlug: "centrix-hq",
      createdAt: "2026-01-10T08:00:00.000Z",
      updatedAt: "2026-05-26T08:00:00.000Z"
    },
    {
      id: "ent-nova-retail",
      name: "Nova Retail",
      siret: "839 114 228 00027",
      vatNumber: "FR74839114228",
      address: "42 avenue de la Republique, 69002 Lyon",
      iban: "FR76 3000 4000 0222 3456 7890 210",
      logoUrl: null,
      industry: "Retail franchise",
      status: "active",
      revenue: 318000,
      activeUsers: 86,
      brandColor: "#8b5cf6",
      workspaceSlug: "nova-retail",
      createdAt: "2026-02-02T08:00:00.000Z",
      updatedAt: "2026-05-25T08:00:00.000Z"
    },
    {
      id: "ent-orion-services",
      name: "Orion Services",
      siret: "812 447 620 00031",
      vatNumber: "FR41812447620",
      address: "9 place Bellecour, 69002 Lyon",
      iban: "FR76 2004 1000 0199 8877 6655 443",
      logoUrl: null,
      industry: "Services B2B",
      status: "pending",
      revenue: 146000,
      activeUsers: 34,
      brandColor: "#34d399",
      workspaceSlug: "orion-services",
      createdAt: "2026-04-08T08:00:00.000Z",
      updatedAt: "2026-05-22T08:00:00.000Z"
    }
  ],
  workspaces: [
    { id: "ws-hq", companyId: "ent-centrix-hq", name: "HQ Workspace", primaryColor: "#5ee7ff", accentColor: "#8b5cf6", logoUrl: null, modules: ["crm", "billing", "finance", "hr", "agenda", "marketing", "support", "documents", "ai"], preferences: { locale: "fr-FR", currency: "EUR", timezone: "Europe/Paris" }, isolatedData: true, updatedAt: "2026-05-26T08:00:00.000Z" },
    { id: "ws-nova", companyId: "ent-nova-retail", name: "Nova Franchise Network", primaryColor: "#8b5cf6", accentColor: "#d946ef", logoUrl: null, modules: ["crm", "billing", "finance", "hr", "support", "documents"], preferences: { locale: "fr-FR", currency: "EUR", timezone: "Europe/Paris" }, isolatedData: true, updatedAt: "2026-05-25T08:00:00.000Z" },
    { id: "ws-orion", companyId: "ent-orion-services", name: "Orion Workspace", primaryColor: "#34d399", accentColor: "#5ee7ff", logoUrl: null, modules: ["crm", "billing", "agenda", "support"], preferences: { locale: "fr-FR", currency: "EUR", timezone: "Europe/Paris" }, isolatedData: true, updatedAt: "2026-05-22T08:00:00.000Z" }
  ],
  franchises: [
    { id: "fr-paris-01", companyId: "ent-nova-retail", name: "Nova Paris Centre", franchiseeName: "Amelie Roche", zone: "Ile-de-France", city: "Paris", status: "active", monthlyRevenue: 82000, targetRevenue: 76000, satisfaction: 94, openedAt: "2025-09-01T08:00:00.000Z" },
    { id: "fr-lyon-01", companyId: "ent-nova-retail", name: "Nova Lyon Bellecour", franchiseeName: "Karim Benali", zone: "Auvergne-Rhone-Alpes", city: "Lyon", status: "active", monthlyRevenue: 64000, targetRevenue: 70000, satisfaction: 88, openedAt: "2025-11-12T08:00:00.000Z" },
    { id: "fr-lille-01", companyId: "ent-nova-retail", name: "Nova Lille Grand Place", franchiseeName: "Julie Moreau", zone: "Hauts-de-France", city: "Lille", status: "onboarding", monthlyRevenue: 28000, targetRevenue: 52000, satisfaction: 82, openedAt: "2026-04-20T08:00:00.000Z" },
    { id: "fr-marseille-01", companyId: "ent-nova-retail", name: "Nova Marseille Prado", franchiseeName: "Nora Haddad", zone: "PACA", city: "Marseille", status: "at_risk", monthlyRevenue: 39000, targetRevenue: 62000, satisfaction: 71, openedAt: "2025-12-02T08:00:00.000Z" }
  ],
  users: [
    { id: "user-super", companyId: null, name: "Lea Martin", email: "lea@centrix.local", role: "super_admin", team: "Executive", active: true, modules: ["crm", "billing", "finance", "hr", "agenda", "marketing", "support", "documents", "ai"], lastSeenAt: "2026-05-26T09:00:00.000Z" },
    { id: "user-admin-nova", companyId: "ent-nova-retail", name: "Sarah Picon", email: "sarah@novaretail.fr", role: "company_admin", team: "Operations", active: true, modules: ["crm", "billing", "finance", "support", "documents"], lastSeenAt: "2026-05-26T08:40:00.000Z" },
    { id: "user-manager-fr", companyId: "ent-nova-retail", name: "Yanis Perrin", email: "yanis@novaretail.fr", role: "manager", team: "Franchises", active: true, modules: ["crm", "finance", "support"], lastSeenAt: "2026-05-26T08:20:00.000Z" },
    { id: "user-orion", companyId: "ent-orion-services", name: "Nora Chen", email: "nora@orion.fr", role: "manager", team: "Sales", active: false, modules: ["crm", "agenda"], lastSeenAt: "2026-05-24T08:20:00.000Z" }
  ],
  teams: [
    { id: "team-exec", companyId: "ent-centrix-hq", name: "Executive", members: 6, modules: ["finance", "hr", "ai"] },
    { id: "team-franchise", companyId: "ent-nova-retail", name: "Franchise Ops", members: 18, modules: ["crm", "finance", "support"] },
    { id: "team-sales", companyId: "ent-orion-services", name: "Sales", members: 9, modules: ["crm", "agenda"] }
  ],
  policies: [
    { id: "policy-super", role: "super_admin", label: "Super admin", modules: ["crm", "billing", "finance", "hr", "agenda", "marketing", "support", "documents", "ai"], canManageBilling: true, canManageUsers: true, canViewConsolidatedReports: true },
    { id: "policy-admin", role: "company_admin", label: "Admin entreprise", modules: ["crm", "billing", "finance", "hr", "support", "documents"], canManageBilling: true, canManageUsers: true, canViewConsolidatedReports: false },
    { id: "policy-manager", role: "manager", label: "Manager", modules: ["crm", "agenda", "support", "documents"], canManageBilling: false, canManageUsers: false, canViewConsolidatedReports: false },
    { id: "policy-employee", role: "employee", label: "Employe", modules: ["agenda", "documents", "support"], canManageBilling: false, canManageUsers: false, canViewConsolidatedReports: false },
    { id: "policy-viewer", role: "viewer", label: "Lecture seule", modules: ["documents"], canManageBilling: false, canManageUsers: false, canViewConsolidatedReports: false }
  ],
  activities: [
    { id: "act-ent-1", companyId: "ent-nova-retail", title: "Franchise a risque", detail: "Nova Marseille Prado est sous 63% de son objectif mensuel.", severity: "warning", createdAt: "2026-05-26T09:30:00.000Z" },
    { id: "act-ent-2", companyId: "ent-centrix-hq", title: "Workspace cree", detail: "Orion Services a rejoint le portefeuille multi-entreprises.", severity: "success", createdAt: "2026-05-22T08:00:00.000Z" },
    { id: "act-ent-3", companyId: null, title: "Permissions synchronisees", detail: "Les politiques d'acces managers ont ete mises a jour.", severity: "info", createdAt: "2026-05-25T15:00:00.000Z" }
  ],
  metrics: [
    { month: "Jan", revenue: 610000, expenses: 328000, users: 182, franchises: 2 },
    { month: "Fev", revenue: 682000, expenses: 341000, users: 211, franchises: 2 },
    { month: "Mar", revenue: 748000, expenses: 372000, users: 230, franchises: 3 },
    { month: "Avr", revenue: 826000, expenses: 404000, users: 248, franchises: 4 },
    { month: "Mai", revenue: 946000, expenses: 438000, users: 248, franchises: 4 }
  ]
};
