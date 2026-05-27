import type { SettingsData } from "@/types/settings";

export const settingsFallbackData: SettingsData = {
  userSettings: [
    {
      id: "user-settings-1",
      userId: "user-super",
      name: "Lea Martin",
      email: "lea@centrix.local",
      avatarUrl: null,
      language: "fr",
      timezone: "Europe/Paris",
      notificationsEmail: true,
      notificationsPush: true,
      twoFactorEnabled: false,
      updatedAt: "2026-05-26T10:00:00.000Z"
    }
  ],
  companySettings: [
    {
      companyId: "company-centrix",
      name: "CENTRIX",
      legalName: "CENTRIX SAS",
      logoUrl: null,
      primaryColor: "#5ee7ff",
      accentColor: "#8b5cf6",
      vatNumber: "FR12948221845",
      iban: "FR76 3000 6000 0112 3456 7890 189",
      legalAddress: "18 rue des Archives, 75004 Paris",
      theme: "dark",
      updatedAt: "2026-05-26T10:00:00.000Z"
    }
  ],
  subscriptions: [
    { id: "sub-enterprise", companyId: "company-centrix", plan: "enterprise", status: "active", seats: 150, usedSeats: 128, monthlyPrice: 2490, renewalAt: "2026-06-26T10:00:00.000Z" }
  ],
  userRoles: [
    { id: "role-1", userId: "user-super", companyId: null, name: "Lea Martin", email: "lea@centrix.local", role: "super_admin", active: true, lastLoginAt: "2026-05-26T09:40:00.000Z" },
    { id: "role-2", userId: "user-admin", companyId: "company-centrix", name: "Sarah Picon", email: "sarah@centrix.local", role: "admin", active: true, lastLoginAt: "2026-05-26T08:20:00.000Z" },
    { id: "role-3", userId: "user-manager", companyId: "company-centrix", name: "Yanis Perrin", email: "yanis@centrix.local", role: "manager", active: true, lastLoginAt: "2026-05-25T17:10:00.000Z" },
    { id: "role-4", userId: "user-guest", companyId: "company-centrix", name: "Nora Guest", email: "guest@centrix.local", role: "guest", active: false, lastLoginAt: "2026-05-21T12:00:00.000Z" }
  ],
  activityLogs: [
    { id: "act-admin-1", userId: "user-super", companyId: "company-centrix", action: "module.updated", target: "Support", detail: "Module Support active pour les managers.", severity: "success", createdAt: "2026-05-26T09:20:00.000Z" },
    { id: "act-admin-2", userId: "user-admin", companyId: "company-centrix", action: "billing.payment", target: "INV-SUB-2048", detail: "Paiement abonnement enterprise confirme.", severity: "success", createdAt: "2026-05-25T11:00:00.000Z" },
    { id: "act-admin-3", userId: null, companyId: null, action: "security.alert", target: "Session", detail: "Connexion inhabituelle detectee depuis un nouvel appareil.", severity: "warning", createdAt: "2026-05-26T07:30:00.000Z" }
  ],
  securityLogs: [
    { id: "sec-1", userId: "user-super", event: "login", device: "MacBook Pro - Chrome", ipAddress: "82.64.10.42", location: "Paris, FR", severity: "success", createdAt: "2026-05-26T09:40:00.000Z" },
    { id: "sec-2", userId: "user-admin", event: "password_change", device: "Windows - Edge", ipAddress: "90.12.44.18", location: "Lyon, FR", severity: "info", createdAt: "2026-05-25T16:00:00.000Z" },
    { id: "sec-3", userId: null, event: "suspicious_activity", device: "Unknown", ipAddress: "185.220.101.7", location: "Unknown", severity: "warning", createdAt: "2026-05-26T07:30:00.000Z" }
  ],
  notifications: [
    { id: "notif-admin-1", title: "Securite plateforme", detail: "Activez la double authentification pour les administrateurs.", channel: "security", read: false, severity: "warning", createdAt: "2026-05-26T08:00:00.000Z" },
    { id: "notif-admin-2", title: "Quota licences", detail: "128 sieges utilises sur 150 dans le plan Enterprise.", channel: "dashboard", read: false, severity: "info", createdAt: "2026-05-26T09:00:00.000Z" }
  ],
  moduleSettings: [
    { id: "module-crm", companyId: "company-centrix", module: "crm", enabled: true, permissions: ["super_admin", "admin", "manager"], preferences: { pipelineDefault: "enterprise" }, updatedAt: "2026-05-26T08:00:00.000Z" },
    { id: "module-billing", companyId: "company-centrix", module: "billing", enabled: true, permissions: ["super_admin", "admin"], preferences: { vatMode: "france" }, updatedAt: "2026-05-26T08:00:00.000Z" },
    { id: "module-hr", companyId: "company-centrix", module: "hr", enabled: true, permissions: ["super_admin", "admin"], preferences: { approvalFlow: true }, updatedAt: "2026-05-26T08:00:00.000Z" },
    { id: "module-marketing", companyId: "company-centrix", module: "marketing", enabled: true, permissions: ["super_admin", "admin", "manager"], preferences: { approvalRequired: false }, updatedAt: "2026-05-26T08:00:00.000Z" },
    { id: "module-ai", companyId: "company-centrix", module: "ai", enabled: true, permissions: ["super_admin", "admin"], preferences: { monthlyTokenLimit: 500000 }, updatedAt: "2026-05-26T08:00:00.000Z" }
  ],
  billingHistory: [
    { id: "bill-1", subscriptionId: "sub-enterprise", invoiceNumber: "INV-SUB-2048", amount: 2490, status: "paid", paidAt: "2026-05-25T11:00:00.000Z", createdAt: "2026-05-25T10:00:00.000Z" },
    { id: "bill-2", subscriptionId: "sub-enterprise", invoiceNumber: "INV-SUB-2047", amount: 2490, status: "paid", paidAt: "2026-04-25T11:00:00.000Z", createdAt: "2026-04-25T10:00:00.000Z" }
  ]
};
