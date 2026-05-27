import type { SecurityAlert, SecurityData, SecurityLog, SecuritySeverity, SecurityStatus } from "@/types/security";

export const severityLabels: Record<SecuritySeverity, string> = {
  low: "faible",
  medium: "moyen",
  high: "eleve",
  critical: "critique"
};

export const statusLabels: Record<SecurityStatus, string> = {
  open: "ouvert",
  investigating: "analyse",
  resolved: "resolu",
  blocked: "bloque"
};

export function severityTone(severity: SecuritySeverity): "cyan" | "violet" | "emerald" | "rose" {
  if (severity === "critical" || severity === "high") return "rose";
  if (severity === "medium") return "violet";
  return "emerald";
}

export function statusTone(status: SecurityStatus): "cyan" | "violet" | "emerald" | "rose" {
  if (status === "resolved" || status === "blocked") return "emerald";
  if (status === "investigating") return "violet";
  return "rose";
}

export function getSecurityDashboard(data: SecurityData) {
  const activeSessions = data.sessions.filter((session) => session.status === "active");
  const suspiciousAttempts = data.loginAttempts.filter((attempt) => attempt.suspicious);
  const openAlerts = data.alerts.filter((alert) => alert.status !== "resolved");
  const blockedApiEvents = data.apiLogs.filter((log) => log.blocked);
  const averageRisk = activeSessions.length ? activeSessions.reduce((sum, session) => sum + session.riskScore, 0) / activeSessions.length : 0;
  const mfaCoverage = data.permissions.length ? (data.permissions.filter((permission) => permission.mfaEnabled).length / data.permissions.length) * 100 : 0;
  const backupHealth = data.backups.length ? (data.backups.filter((backup) => backup.status === "completed" || backup.status === "running").length / data.backups.length) * 100 : 0;
  const securityScore = Math.max(0, Math.min(100, 100 - averageRisk - suspiciousAttempts.length * 4 - openAlerts.filter((alert) => alert.severity === "critical").length * 10 + mfaCoverage * 0.12 + backupHealth * 0.08));

  return {
    activeConnections: activeSessions.length,
    suspiciousAttempts: suspiciousAttempts.length,
    connectedDevices: new Set(activeSessions.map((session) => session.device)).size,
    securityScore,
    openSessions: data.sessions.filter((session) => session.status !== "expired").length,
    openAlerts: openAlerts.length,
    blockedThreats: blockedApiEvents.length,
    mfaCoverage,
    backupHealth
  };
}

export function createSecurityAlert(): SecurityAlert {
  return {
    id: `alert-${Date.now()}`,
    title: "Nouvelle alerte securite",
    description: "Evenement a analyser depuis le centre de monitoring CENTRIX.",
    severity: "medium",
    status: "open",
    source: "auth",
    assignedTo: "Security Ops",
    createdAt: new Date().toISOString()
  };
}

export function createSecurityLog(actor = "Security Ops"): SecurityLog {
  return {
    id: `log-${Date.now()}`,
    event: "Verification manuelle ajoutee",
    category: "system",
    severity: "low",
    actor,
    ipAddress: "127.0.0.1",
    location: "CENTRIX",
    device: "Console securite",
    createdAt: new Date().toISOString()
  };
}
