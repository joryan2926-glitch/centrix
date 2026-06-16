import type { CollaborationMessage, NotificationModule, NotificationSeverity, NotificationsData, RealtimeNotification, SharedFile } from "@/types/notifications";

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
  const onlineUsers = data.presence.filter((item) => item.status === "online").length;
  const unreadMessages = data.conversations.reduce((sum, conversation) => sum + conversation.unreadCount, 0);

  return { unread, critical, reminders, activeRules, realtimeChannels, businessAlerts, onlineUsers, unreadMessages };
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

export function createCollaborationMessage(conversationId: string, content = "Nouvelle mise a jour partagee avec l'equipe."): CollaborationMessage {
  return {
    id: `collab-msg-${crypto.randomUUID()}`,
    conversationId,
    author: "Administrateur",
    role: "admin",
    content,
    attachmentName: null,
    createdAt: new Date().toISOString()
  };
}

export function createSharedFile(conversationId: string, name = "document-partage.pdf"): SharedFile {
  return {
    id: `shared-file-${crypto.randomUUID()}`,
    conversationId,
    name,
    fileType: name.split(".").pop()?.toUpperCase() || "PDF",
    sizeMb: 0.8,
    secureUrl: "#",
    createdAt: new Date().toISOString()
  };
}
