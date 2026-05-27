export type SecuritySeverity = "low" | "medium" | "high" | "critical";
export type SecurityStatus = "open" | "investigating" | "resolved" | "blocked";
export type SessionStatus = "active" | "expired" | "revoked";
export type BackupStatus = "completed" | "running" | "failed";
export type GdprRequestStatus = "pending" | "processing" | "completed" | "rejected";

export type SecurityLog = {
  id: string;
  event: string;
  category: "auth" | "data" | "api" | "admin" | "system";
  severity: SecuritySeverity;
  actor: string;
  ipAddress: string;
  location: string;
  device: string;
  createdAt: string;
};

export type UserSession = {
  id: string;
  userName: string;
  email: string;
  device: string;
  browser: string;
  ipAddress: string;
  location: string;
  status: SessionStatus;
  riskScore: number;
  lastSeenAt: string;
  expiresAt: string;
};

export type LoginAttempt = {
  id: string;
  email: string;
  ipAddress: string;
  location: string;
  success: boolean;
  suspicious: boolean;
  reason: string;
  createdAt: string;
};

export type SecurityAlert = {
  id: string;
  title: string;
  description: string;
  severity: SecuritySeverity;
  status: SecurityStatus;
  source: "auth" | "api" | "data" | "backup" | "compliance";
  assignedTo: string;
  createdAt: string;
};

export type ApiSecurityLog = {
  id: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  statusCode: number;
  latencyMs: number;
  apiKeyLabel: string;
  ipAddress: string;
  blocked: boolean;
  createdAt: string;
};

export type UserPermission = {
  id: string;
  userName: string;
  role: "super_admin" | "security_admin" | "admin" | "manager" | "employee" | "guest";
  modules: string[];
  mfaEnabled: boolean;
  sensitiveAccess: boolean;
  lastReviewedAt: string;
};

export type AuditLog = {
  id: string;
  action: string;
  actor: string;
  target: string;
  module: string;
  before: string;
  after: string;
  createdAt: string;
};

export type Backup = {
  id: string;
  name: string;
  scope: "database" | "storage" | "full";
  status: BackupStatus;
  sizeGb: number;
  encrypted: boolean;
  retentionDays: number;
  createdAt: string;
};

export type GdprRequest = {
  id: string;
  requester: string;
  email: string;
  type: "export" | "delete" | "rectify" | "consent";
  status: GdprRequestStatus;
  dueAt: string;
  createdAt: string;
};

export type SecurityData = {
  logs: SecurityLog[];
  sessions: UserSession[];
  loginAttempts: LoginAttempt[];
  alerts: SecurityAlert[];
  apiLogs: ApiSecurityLog[];
  permissions: UserPermission[];
  auditLogs: AuditLog[];
  backups: Backup[];
  gdprRequests: GdprRequest[];
};
