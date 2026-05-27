import type { ApiKey, IntegrationData, IntegrationNotification, WebhookEndpoint } from "@/types/integrations";

export function getIntegrationDashboard(data: IntegrationData) {
  const apiCalls = data.apiLogs.length;
  const errors = data.apiLogs.filter((log) => log.statusCode >= 400).length;
  const avgResponse = data.apiLogs.length ? Math.round(data.apiLogs.reduce((sum, log) => sum + log.responseTimeMs, 0) / data.apiLogs.length) : 0;

  return {
    apiCalls,
    activeIntegrations: data.integrations.filter((integration) => integration.status === "connected").length,
    activeWebhooks: data.webhooks.filter((webhook) => webhook.active).length,
    apiErrors: errors,
    avgResponse,
    externalConnections: data.oauthConnections.filter((connection) => connection.tokenStatus === "valid").length
  };
}

export function createApiKey(name: string): ApiKey {
  return {
    id: `key-${crypto.randomUUID()}`,
    name,
    tokenPreview: `cx_live_${crypto.randomUUID().slice(0, 3)}...${crypto.randomUUID().slice(0, 3)}`,
    scopes: ["crm", "billing"],
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180).toISOString(),
    revoked: false,
    lastUsedAt: null,
    createdAt: new Date().toISOString()
  };
}

export function createWebhook(name: string, url: string): WebhookEndpoint {
  return {
    id: `wh-${crypto.randomUUID()}`,
    name,
    url,
    events: ["customer.created", "invoice.paid"],
    secretPreview: `whsec_${crypto.randomUUID().slice(0, 2)}...${crypto.randomUUID().slice(0, 2)}`,
    active: true,
    retryEnabled: true,
    createdAt: new Date().toISOString()
  };
}

export function createIntegrationNotification(title: string, detail: string, severity: IntegrationNotification["severity"] = "info"): IntegrationNotification {
  return {
    id: `int-notif-${crypto.randomUUID()}`,
    title,
    detail,
    severity,
    createdAt: new Date().toISOString()
  };
}

export function statusTone(status: "connected" | "disconnected" | "error" | "delivered" | "failed" | "retrying") {
  if (status === "connected" || status === "delivered") return "emerald" as const;
  if (status === "error" || status === "failed") return "rose" as const;
  if (status === "retrying") return "violet" as const;
  return "cyan" as const;
}
