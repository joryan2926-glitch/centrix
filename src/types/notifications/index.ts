export type NotificationSeverity = "info" | "success" | "warning" | "critical";

export type NotificationModule =
  | "crm"
  | "billing"
  | "projects"
  | "support"
  | "security"
  | "marketing"
  | "documents"
  | "system";

export type RealtimeNotification = {
  id: string;
  title: string;
  detail: string;
  module: NotificationModule;
  severity: NotificationSeverity;
  read: boolean;
  actionUrl: string | null;
  createdAt: string;
  remindAt: string | null;
};

export type NotificationPreference = {
  id: string;
  module: NotificationModule;
  email: boolean;
  push: boolean;
  dashboard: boolean;
};

export type NotificationRule = {
  id: string;
  name: string;
  trigger: string;
  channel: "dashboard" | "email" | "push" | "all";
  active: boolean;
  createdAt: string;
};

export type NotificationsData = {
  notifications: RealtimeNotification[];
  preferences: NotificationPreference[];
  rules: NotificationRule[];
};
