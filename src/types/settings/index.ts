export type AdminRole = "super_admin" | "admin" | "manager" | "employee" | "guest";
export type SubscriptionPlan = "starter" | "premium" | "business" | "enterprise";
export type ModuleKey = "crm" | "billing" | "finance" | "hr" | "agenda" | "marketing" | "support" | "documents" | "ai" | "legal";

export type UserSettings = {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  language: "fr" | "en";
  timezone: string;
  notificationsEmail: boolean;
  notificationsPush: boolean;
  twoFactorEnabled: boolean;
  updatedAt: string;
};

export type AdminCompanySettings = {
  companyId: string;
  name: string;
  legalName: string;
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  vatNumber: string;
  iban: string;
  legalAddress: string;
  theme: "dark" | "system";
  updatedAt: string;
};

export type Subscription = {
  id: string;
  companyId: string;
  plan: SubscriptionPlan;
  status: "active" | "trialing" | "past_due" | "canceled";
  seats: number;
  usedSeats: number;
  monthlyPrice: number;
  renewalAt: string;
};

export type UserRole = {
  id: string;
  userId: string;
  companyId: string | null;
  name: string;
  email: string;
  role: AdminRole;
  active: boolean;
  lastLoginAt: string;
};

export type ActivityLog = {
  id: string;
  userId: string | null;
  companyId: string | null;
  action: string;
  target: string;
  detail: string;
  severity: "info" | "success" | "warning";
  createdAt: string;
};

export type SecurityLog = {
  id: string;
  userId: string | null;
  event: "login" | "logout" | "password_change" | "suspicious_activity" | "session_revoked";
  device: string;
  ipAddress: string;
  location: string;
  severity: "info" | "success" | "warning";
  createdAt: string;
};

export type AdminNotification = {
  id: string;
  title: string;
  detail: string;
  channel: "dashboard" | "email" | "security";
  read: boolean;
  severity: "info" | "success" | "warning";
  createdAt: string;
};

export type ModuleSetting = {
  id: string;
  companyId: string;
  module: ModuleKey;
  enabled: boolean;
  permissions: AdminRole[];
  preferences: Record<string, string | number | boolean>;
  updatedAt: string;
};

export type BillingHistory = {
  id: string;
  subscriptionId: string;
  invoiceNumber: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  paidAt: string | null;
  createdAt: string;
};

export type SettingsData = {
  userSettings: UserSettings[];
  companySettings: AdminCompanySettings[];
  subscriptions: Subscription[];
  userRoles: UserRole[];
  activityLogs: ActivityLog[];
  securityLogs: SecurityLog[];
  notifications: AdminNotification[];
  moduleSettings: ModuleSetting[];
  billingHistory: BillingHistory[];
};
