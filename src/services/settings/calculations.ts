import type { ActivityLog, AdminNotification, AdminRole, ModuleKey, SettingsData, UserRole } from "@/types/settings";

export const roleLabels: Record<AdminRole, string> = {
  super_admin: "Super admin",
  admin: "Admin",
  manager: "Manager",
  employee: "Employe",
  guest: "Invite"
};

export const moduleLabels: Record<ModuleKey, string> = {
  crm: "CRM",
  billing: "Facturation",
  finance: "Finance",
  hr: "RH",
  agenda: "Agenda",
  marketing: "Marketing",
  support: "Support",
  documents: "Documents",
  ai: "IA",
  legal: "Juridique"
};

export function getAdminDashboard(data: SettingsData) {
  const activeUsers = data.userRoles.filter((user) => user.active).length;
  const activeCompanies = data.companySettings.length;
  const activeSubscriptions = data.subscriptions.filter((subscription) => subscription.status === "active" || subscription.status === "trialing").length;
  const userConnections = data.securityLogs.filter((log) => log.event === "login").length;
  const securityWarnings = data.securityLogs.filter((log) => log.severity === "warning").length;
  const storageUsed = 35600000000;

  return {
    activeUsers,
    activeCompanies,
    storageUsed,
    activeSubscriptions,
    recentActivities: data.activityLogs.length,
    userConnections,
    securityScore: Math.max(72, 98 - securityWarnings * 8)
  };
}

export function createUserRole(name: string, email: string, role: AdminRole): UserRole {
  return {
    id: `role-${crypto.randomUUID()}`,
    userId: `user-${crypto.randomUUID()}`,
    companyId: "company-centrix",
    name,
    email,
    role,
    active: true,
    lastLoginAt: new Date().toISOString()
  };
}

export function createActivity(action: string, target: string, detail: string, severity: ActivityLog["severity"] = "info"): ActivityLog {
  return {
    id: `act-admin-${crypto.randomUUID()}`,
    userId: "user-super",
    companyId: "company-centrix",
    action,
    target,
    detail,
    severity,
    createdAt: new Date().toISOString()
  };
}

export function createAdminNotification(title: string, detail: string, severity: AdminNotification["severity"] = "info"): AdminNotification {
  return {
    id: `notif-admin-${crypto.randomUUID()}`,
    title,
    detail,
    channel: severity === "warning" ? "security" : "dashboard",
    read: false,
    severity,
    createdAt: new Date().toISOString()
  };
}

export function toneForSeverity(severity: "info" | "success" | "warning") {
  if (severity === "success") return "emerald" as const;
  if (severity === "warning") return "rose" as const;
  return "cyan" as const;
}

export function roleTone(role: AdminRole) {
  if (role === "super_admin") return "rose" as const;
  if (role === "admin") return "violet" as const;
  if (role === "manager") return "cyan" as const;
  return "emerald" as const;
}
