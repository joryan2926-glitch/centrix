import type { NotificationModule, NotificationSeverity, NotificationsData, RealtimeNotification } from "@/types/notifications";

export const moduleLabels: Record<NotificationModule, string> = {
  crm: "CRM",
  billing: "Facturation",
  projects: "Projets",
  support: "Support",
  security: "Securite",
  marketing: "Marketing",
  documents: "Documents",
  system: "Systeme"
};

export const severityLabels: Record<NotificationSeverity, string> = {
  info: "Info",
  success: "Succes",
  warning: "A surveiller",
  critical: "Critique"
};

export function severityTone(severity: NotificationSeverity) {
  if (severity === "success") return "emerald";
  if (severity === "warning") return "violet";
  if (severity === "critical") return "rose";
  return "cyan";
}

export function getNotificationsDashboard(data: NotificationsData) {
  const unread = data.notifications.filter((item) => !item.read).length;
  const critical = data.notifications.filter((item) => item.severity === "critical").length;
  const reminders = data.notifications.filter((item) => item.remindAt).length;
  const activeRules = data.rules.filter((rule) => rule.active).length;
  const realtimeChannels = data.preferences.filter((pref) => pref.dashboard || pref.push).length;
  const businessAlerts = data.notifications.filter((item) => ["crm", "billing", "support", "security"].includes(item.module)).length;

  return { unread, critical, reminders, activeRules, realtimeChannels, businessAlerts };
}

export function createNotification(input: Pick<RealtimeNotification, "title" | "detail" | "module" | "severity">): RealtimeNotification {
  return {
    id: `notif-${Date.now()}`,
    ...input,
    read: false,
    actionUrl: input.module === "system" ? "/" : `/${input.module}`,
    createdAt: new Date().toISOString(),
    remindAt: null
  };
}
