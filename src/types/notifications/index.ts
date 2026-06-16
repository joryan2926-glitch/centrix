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

export type CollaborationConversation = {
  id: string;
  name: string;
  type: "direct" | "team" | "project" | "announcement";
  module: NotificationModule;
  unreadCount: number;
  updatedAt: string;
};

export type CollaborationMessage = {
  id: string;
  conversationId: string;
  author: string;
  role: "admin" | "manager" | "employee" | "client";
  content: string;
  attachmentName: string | null;
  createdAt: string;
};

export type UserPresence = {
  id: string;
  name: string;
  role: string;
  status: "online" | "away" | "offline";
  lastSeenAt: string;
};

export type SharedFile = {
  id: string;
  conversationId: string;
  name: string;
  fileType: string;
  sizeMb: number;
  secureUrl: string;
  createdAt: string;
};

export type NotificationsData = {
  notifications: RealtimeNotification[];
  preferences: NotificationPreference[];
  rules: NotificationRule[];
  conversations: CollaborationConversation[];
  messages: CollaborationMessage[];
  presence: UserPresence[];
  sharedFiles: SharedFile[];
};
