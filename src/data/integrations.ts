import type { IntegrationData } from "@/types/integrations";

export const integrationsFallbackData: IntegrationData = {
  apiKeys: [
    { id: "key-prod", name: "Production API", tokenPreview: "cx_live_9f3...a81", scopes: ["crm", "billing", "support"], expiresAt: "2026-12-31T23:00:00.000Z", revoked: false, lastUsedAt: "2026-05-26T09:40:00.000Z", createdAt: "2026-03-01T08:00:00.000Z" },
    { id: "key-zapier", name: "Zapier Sync", tokenPreview: "cx_live_2d1...c42", scopes: ["crm", "agenda", "marketing"], expiresAt: null, revoked: false, lastUsedAt: "2026-05-26T08:25:00.000Z", createdAt: "2026-04-02T08:00:00.000Z" },
    { id: "key-test", name: "Sandbox Dev", tokenPreview: "cx_test_78a...f10", scopes: ["crm", "analytics"], expiresAt: "2026-06-15T23:00:00.000Z", revoked: false, lastUsedAt: "2026-05-24T08:25:00.000Z", createdAt: "2026-05-01T08:00:00.000Z" }
  ],
  apiLogs: [
    { id: "log-api-1", apiKeyId: "key-prod", method: "GET", endpoint: "/api/v1/crm?limit=25", statusCode: 200, responseTimeMs: 118, ipAddress: "82.64.10.42", createdAt: "2026-05-26T09:40:00.000Z" },
    { id: "log-api-2", apiKeyId: "key-prod", method: "POST", endpoint: "/api/v1/billing/invoices", statusCode: 201, responseTimeMs: 164, ipAddress: "82.64.10.42", createdAt: "2026-05-26T09:12:00.000Z" },
    { id: "log-api-3", apiKeyId: "key-zapier", method: "GET", endpoint: "/api/v1/agenda/events", statusCode: 429, responseTimeMs: 72, ipAddress: "34.117.59.81", createdAt: "2026-05-26T08:25:00.000Z" },
    { id: "log-api-4", apiKeyId: null, method: "GET", endpoint: "/api/v1/admin/users", statusCode: 401, responseTimeMs: 41, ipAddress: "185.220.101.7", createdAt: "2026-05-26T07:30:00.000Z" }
  ],
  webhooks: [
    { id: "wh-finance", name: "Finance paid invoices", url: "https://finance.example.com/centrix", events: ["invoice.paid"], secretPreview: "whsec_91...aa", active: true, retryEnabled: true, createdAt: "2026-03-12T08:00:00.000Z" },
    { id: "wh-crm", name: "CRM customers", url: "https://crm.example.com/hooks", events: ["customer.created", "support.ticket"], secretPreview: "whsec_44...fd", active: true, retryEnabled: true, createdAt: "2026-04-10T08:00:00.000Z" },
    { id: "wh-ops", name: "Ops workflows", url: "https://ops.example.com/events", events: ["workflow.executed", "task.created"], secretPreview: "whsec_72...be", active: false, retryEnabled: true, createdAt: "2026-05-10T08:00:00.000Z" }
  ],
  webhookLogs: [
    { id: "wh-log-1", webhookId: "wh-finance", event: "invoice.paid", status: "delivered", statusCode: 200, attempts: 1, responseTimeMs: 220, createdAt: "2026-05-26T09:30:00.000Z" },
    { id: "wh-log-2", webhookId: "wh-crm", event: "customer.created", status: "delivered", statusCode: 204, attempts: 1, responseTimeMs: 180, createdAt: "2026-05-26T09:10:00.000Z" },
    { id: "wh-log-3", webhookId: "wh-ops", event: "workflow.executed", status: "retrying", statusCode: 503, attempts: 2, responseTimeMs: 940, createdAt: "2026-05-26T08:50:00.000Z" }
  ],
  integrations: [
    { id: "int-google-calendar", provider: "google", name: "Google Calendar", category: "google", description: "Synchronisez evenements et disponibilites.", status: "connected", syncEnabled: true, lastSyncAt: "2026-05-26T09:00:00.000Z" },
    { id: "int-google-drive", provider: "google", name: "Google Drive", category: "google", description: "Importez documents et pieces jointes.", status: "connected", syncEnabled: true, lastSyncAt: "2026-05-26T08:30:00.000Z" },
    { id: "int-gmail", provider: "google", name: "Gmail", category: "google", description: "Connectez emails et conversations CRM.", status: "disconnected", syncEnabled: false, lastSyncAt: null },
    { id: "int-outlook", provider: "microsoft", name: "Outlook", category: "microsoft", description: "Calendrier et emails Microsoft.", status: "connected", syncEnabled: true, lastSyncAt: "2026-05-25T18:00:00.000Z" },
    { id: "int-onedrive", provider: "microsoft", name: "OneDrive", category: "microsoft", description: "Documents Microsoft 365.", status: "disconnected", syncEnabled: false, lastSyncAt: null },
    { id: "int-teams", provider: "microsoft", name: "Teams", category: "microsoft", description: "Notifications et collaboration.", status: "error", syncEnabled: true, lastSyncAt: "2026-05-24T12:00:00.000Z" },
    { id: "int-slack", provider: "slack", name: "Slack", category: "communication", description: "Alertes support, ventes et billing.", status: "connected", syncEnabled: true, lastSyncAt: "2026-05-26T09:20:00.000Z" },
    { id: "int-discord", provider: "discord", name: "Discord", category: "communication", description: "Notifications communautaires.", status: "disconnected", syncEnabled: false, lastSyncAt: null },
    { id: "int-whatsapp", provider: "whatsapp", name: "WhatsApp Business", category: "communication", description: "Messages clients et SAV.", status: "disconnected", syncEnabled: false, lastSyncAt: null },
    { id: "int-zapier", provider: "zapier", name: "Zapier", category: "automation", description: "Connectez CENTRIX a 6000+ apps.", status: "connected", syncEnabled: true, lastSyncAt: "2026-05-26T08:10:00.000Z" },
    { id: "int-make", provider: "make", name: "Make", category: "automation", description: "Scenarios visuels et synchronisations.", status: "connected", syncEnabled: true, lastSyncAt: "2026-05-26T08:05:00.000Z" },
    { id: "int-n8n", provider: "n8n", name: "n8n", category: "automation", description: "Automatisation self-hosted.", status: "disconnected", syncEnabled: false, lastSyncAt: null },
    { id: "int-stripe", provider: "stripe", name: "Stripe", category: "payments", description: "Paiements, abonnements et webhooks.", status: "connected", syncEnabled: true, lastSyncAt: "2026-05-26T09:15:00.000Z" },
    { id: "int-paypal", provider: "paypal", name: "PayPal", category: "payments", description: "Paiements alternatifs.", status: "disconnected", syncEnabled: false, lastSyncAt: null },
    { id: "int-hubspot", provider: "hubspot", name: "HubSpot", category: "crm_productivity", description: "CRM, contacts et deals.", status: "connected", syncEnabled: true, lastSyncAt: "2026-05-25T16:00:00.000Z" },
    { id: "int-notion", provider: "notion", name: "Notion", category: "crm_productivity", description: "Docs, bases et wikis.", status: "connected", syncEnabled: true, lastSyncAt: "2026-05-25T15:00:00.000Z" },
    { id: "int-trello", provider: "trello", name: "Trello", category: "crm_productivity", description: "Taches et tableaux projets.", status: "disconnected", syncEnabled: false, lastSyncAt: null }
  ],
  oauthConnections: [
    { id: "oauth-google", integrationId: "int-google-calendar", accountEmail: "ops@centrix.local", scopes: ["calendar.read", "calendar.write"], tokenStatus: "valid", connectedAt: "2026-04-01T08:00:00.000Z" },
    { id: "oauth-slack", integrationId: "int-slack", accountEmail: "workspace@centrix.local", scopes: ["chat.write", "channels.read"], tokenStatus: "valid", connectedAt: "2026-03-12T08:00:00.000Z" },
    { id: "oauth-teams", integrationId: "int-teams", accountEmail: "admin@centrix.local", scopes: ["team.read"], tokenStatus: "expired", connectedAt: "2026-03-20T08:00:00.000Z" }
  ],
  permissions: [
    { id: "perm-crm", scope: "crm", label: "CRM", read: true, write: true, admin: false },
    { id: "perm-billing", scope: "billing", label: "Facturation", read: true, write: true, admin: true },
    { id: "perm-support", scope: "support", label: "Support", read: true, write: true, admin: false },
    { id: "perm-admin", scope: "admin", label: "Administration", read: true, write: false, admin: true }
  ],
  rateLimits: [
    { id: "rate-prod", apiKeyId: "key-prod", window: "minute", limit: 1200, used: 842 },
    { id: "rate-zapier", apiKeyId: "key-zapier", window: "minute", limit: 600, used: 612 },
    { id: "rate-global", apiKeyId: null, window: "day", limit: 250000, used: 82400 }
  ],
  notifications: [
    { id: "int-notif-1", title: "Rate limit proche", detail: "Zapier Sync a depasse 100% de sa fenetre minute.", severity: "warning", createdAt: "2026-05-26T08:25:00.000Z" },
    { id: "int-notif-2", title: "Webhook livre", detail: "invoice.paid livre en 220ms vers Finance.", severity: "success", createdAt: "2026-05-26T09:30:00.000Z" }
  ]
};
