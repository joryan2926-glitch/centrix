export type ApiScope = "crm" | "billing" | "hr" | "agenda" | "marketing" | "analytics" | "support" | "admin";
export type WebhookEvent = "customer.created" | "invoice.paid" | "user.created" | "task.created" | "support.ticket" | "workflow.executed";
export type IntegrationProvider = "google" | "microsoft" | "slack" | "discord" | "whatsapp" | "zapier" | "make" | "n8n" | "stripe" | "paypal" | "hubspot" | "notion" | "trello";

export type ApiKey = {
  id: string;
  name: string;
  tokenPreview: string;
  scopes: ApiScope[];
  expiresAt: string | null;
  revoked: boolean;
  lastUsedAt: string | null;
  createdAt: string;
};

export type ApiLog = {
  id: string;
  apiKeyId: string | null;
  method: "GET" | "POST" | "PUT" | "DELETE";
  endpoint: string;
  statusCode: number;
  responseTimeMs: number;
  ipAddress: string;
  createdAt: string;
};

export type WebhookEndpoint = {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  secretPreview: string;
  active: boolean;
  retryEnabled: boolean;
  createdAt: string;
};

export type WebhookLog = {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  status: "delivered" | "failed" | "retrying";
  statusCode: number;
  attempts: number;
  responseTimeMs: number;
  createdAt: string;
};

export type ExternalIntegration = {
  id: string;
  provider: IntegrationProvider;
  name: string;
  category: "google" | "microsoft" | "communication" | "automation" | "payments" | "crm_productivity";
  description: string;
  status: "connected" | "disconnected" | "error";
  syncEnabled: boolean;
  lastSyncAt: string | null;
};

export type OAuthConnection = {
  id: string;
  integrationId: string;
  accountEmail: string;
  scopes: string[];
  tokenStatus: "valid" | "expired" | "revoked";
  connectedAt: string;
};

export type ApiPermission = {
  id: string;
  scope: ApiScope;
  label: string;
  read: boolean;
  write: boolean;
  admin: boolean;
};

export type ApiRateLimit = {
  id: string;
  apiKeyId: string | null;
  window: "minute" | "hour" | "day";
  limit: number;
  used: number;
};

export type IntegrationNotification = {
  id: string;
  title: string;
  detail: string;
  severity: "info" | "success" | "warning";
  createdAt: string;
};

export type IntegrationData = {
  apiKeys: ApiKey[];
  apiLogs: ApiLog[];
  webhooks: WebhookEndpoint[];
  webhookLogs: WebhookLog[];
  integrations: ExternalIntegration[];
  oauthConnections: OAuthConnection[];
  permissions: ApiPermission[];
  rateLimits: ApiRateLimit[];
  notifications: IntegrationNotification[];
};
