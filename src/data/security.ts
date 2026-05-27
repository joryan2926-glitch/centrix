import type { SecurityData } from "@/types/security";

export const securityFallbackData: SecurityData = {
  logs: [
    { id: "log-1", event: "Connexion administrateur validee", category: "auth", severity: "low", actor: "Nadia Belkacem", ipAddress: "82.64.18.22", location: "Paris, FR", device: "MacBook Pro", createdAt: "2026-05-27T06:42:00.000Z" },
    { id: "log-2", event: "Export donnees client", category: "data", severity: "medium", actor: "Thomas Leroy", ipAddress: "185.22.11.8", location: "Lyon, FR", device: "Windows 11", createdAt: "2026-05-27T05:18:00.000Z" },
    { id: "log-3", event: "Webhook facture bloque", category: "api", severity: "high", actor: "API Billing", ipAddress: "104.21.12.44", location: "Dublin, IE", device: "Server", createdAt: "2026-05-26T22:09:00.000Z" }
  ],
  sessions: [
    { id: "ses-1", userName: "Nadia Belkacem", email: "nadia@centrix.local", device: "MacBook Pro", browser: "Arc", ipAddress: "82.64.18.22", location: "Paris, FR", status: "active", riskScore: 12, lastSeenAt: "2026-05-27T06:55:00.000Z", expiresAt: "2026-05-27T14:55:00.000Z" },
    { id: "ses-2", userName: "Thomas Leroy", email: "thomas@centrix.local", device: "Surface Laptop", browser: "Edge", ipAddress: "185.22.11.8", location: "Lyon, FR", status: "active", riskScore: 28, lastSeenAt: "2026-05-27T06:31:00.000Z", expiresAt: "2026-05-27T12:31:00.000Z" },
    { id: "ses-3", userName: "Invite Support", email: "guest@centrix.local", device: "iPhone", browser: "Safari", ipAddress: "91.160.42.3", location: "Marseille, FR", status: "revoked", riskScore: 74, lastSeenAt: "2026-05-26T20:11:00.000Z", expiresAt: "2026-05-26T21:00:00.000Z" }
  ],
  loginAttempts: [
    { id: "att-1", email: "nadia@centrix.local", ipAddress: "82.64.18.22", location: "Paris, FR", success: true, suspicious: false, reason: "Connexion normale", createdAt: "2026-05-27T06:40:00.000Z" },
    { id: "att-2", email: "admin@centrix.local", ipAddress: "45.155.205.8", location: "Unknown", success: false, suspicious: true, reason: "Trop de tentatives", createdAt: "2026-05-27T04:14:00.000Z" },
    { id: "att-3", email: "finance@centrix.local", ipAddress: "104.21.12.44", location: "Dublin, IE", success: false, suspicious: true, reason: "Pays inhabituel", createdAt: "2026-05-26T22:09:00.000Z" }
  ],
  alerts: [
    { id: "alert-1", title: "Tentatives suspectes sur compte admin", description: "Blocage automatique apres 12 echecs en 8 minutes.", severity: "critical", status: "investigating", source: "auth", assignedTo: "Security Ops", createdAt: "2026-05-27T04:16:00.000Z" },
    { id: "alert-2", title: "Webhook non signe detecte", description: "Signature absente sur endpoint billing entrant.", severity: "high", status: "blocked", source: "api", assignedTo: "API Team", createdAt: "2026-05-26T22:10:00.000Z" },
    { id: "alert-3", title: "Demande RGPD proche echeance", description: "Export donnees utilisateur a finaliser avant 72h.", severity: "medium", status: "open", source: "compliance", assignedTo: "DPO", createdAt: "2026-05-26T09:30:00.000Z" }
  ],
  apiLogs: [
    { id: "api-1", endpoint: "/api/v1/crm", method: "GET", statusCode: 200, latencyMs: 84, apiKeyLabel: "CRM Production", ipAddress: "82.64.18.22", blocked: false, createdAt: "2026-05-27T06:47:00.000Z" },
    { id: "api-2", endpoint: "/api/stripe/webhook", method: "POST", statusCode: 401, latencyMs: 21, apiKeyLabel: "Unknown", ipAddress: "104.21.12.44", blocked: true, createdAt: "2026-05-26T22:09:00.000Z" },
    { id: "api-3", endpoint: "/api/v1/documents", method: "GET", statusCode: 429, latencyMs: 18, apiKeyLabel: "Partner Sandbox", ipAddress: "45.155.205.8", blocked: true, createdAt: "2026-05-26T18:43:00.000Z" }
  ],
  permissions: [
    { id: "perm-1", userName: "Nadia Belkacem", role: "super_admin", modules: ["admin", "security", "billing", "crm"], mfaEnabled: true, sensitiveAccess: true, lastReviewedAt: "2026-05-20T10:00:00.000Z" },
    { id: "perm-2", userName: "Thomas Leroy", role: "security_admin", modules: ["security", "logs", "api"], mfaEnabled: true, sensitiveAccess: true, lastReviewedAt: "2026-05-18T09:00:00.000Z" },
    { id: "perm-3", userName: "Invite Support", role: "guest", modules: ["support"], mfaEnabled: false, sensitiveAccess: false, lastReviewedAt: "2026-05-12T16:00:00.000Z" }
  ],
  auditLogs: [
    { id: "audit-1", action: "Role modifie", actor: "Nadia Belkacem", target: "Thomas Leroy", module: "settings", before: "admin", after: "security_admin", createdAt: "2026-05-26T15:24:00.000Z" },
    { id: "audit-2", action: "Cle API revoquee", actor: "Thomas Leroy", target: "Partner Sandbox", module: "integrations", before: "active", after: "revoked", createdAt: "2026-05-26T13:12:00.000Z" },
    { id: "audit-3", action: "Export RGPD cree", actor: "DPO", target: "client-452", module: "privacy", before: "pending", after: "processing", createdAt: "2026-05-25T17:46:00.000Z" }
  ],
  backups: [
    { id: "backup-1", name: "Backup complet quotidien", scope: "full", status: "completed", sizeGb: 42.8, encrypted: true, retentionDays: 30, createdAt: "2026-05-27T02:00:00.000Z" },
    { id: "backup-2", name: "Storage documents", scope: "storage", status: "running", sizeGb: 18.4, encrypted: true, retentionDays: 14, createdAt: "2026-05-27T06:20:00.000Z" },
    { id: "backup-3", name: "Database hebdomadaire", scope: "database", status: "failed", sizeGb: 9.6, encrypted: true, retentionDays: 90, createdAt: "2026-05-26T03:00:00.000Z" }
  ],
  gdprRequests: [
    { id: "gdpr-1", requester: "Claire Martin", email: "claire@example.com", type: "export", status: "processing", dueAt: "2026-05-30T17:00:00.000Z", createdAt: "2026-05-24T11:00:00.000Z" },
    { id: "gdpr-2", requester: "Armand Petit", email: "armand@example.com", type: "delete", status: "pending", dueAt: "2026-06-05T09:00:00.000Z", createdAt: "2026-05-26T09:00:00.000Z" },
    { id: "gdpr-3", requester: "Sofia Nadir", email: "sofia@example.com", type: "consent", status: "completed", dueAt: "2026-05-28T09:00:00.000Z", createdAt: "2026-05-22T09:00:00.000Z" }
  ]
};
