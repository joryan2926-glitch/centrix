import { getSupabaseSyncResult } from "@/services/supabaseSync";
import { securityFallbackData } from "@/data/security";
import { getSupabaseClient } from "@/lib/supabase";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";
import type { SecurityData } from "@/types/security";

const storageKey = "centrix-security-data-v1";

function readLocal(): SecurityData {
  if (typeof window === "undefined") return securityFallbackData;
  const local = window.localStorage.getItem(storageKey);
  return local ? JSON.parse(local) : securityFallbackData;
}

function writeLocal(data: SecurityData) {
  if (typeof window !== "undefined") window.localStorage.setItem(storageKey, JSON.stringify(data));
}

export async function loadSecurityData(): Promise<{ data: SecurityData; mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: readLocal(), mode: "local" };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { data: readLocal(), mode: "local" };
  const [logs, sessions, loginAttempts, alerts, apiLogs, permissions, auditLogs, backups, gdprRequests] = await Promise.all([
    supabase.from("security_logs").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false }),
    supabase.from("user_sessions").select("*").eq("workspace_id", workspace.workspaceId).order("lastSeenAt", { ascending: false }),
    supabase.from("login_attempts").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false }),
    supabase.from("security_alerts").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false }),
    supabase.from("api_security_logs").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false }),
    supabase.from("user_permissions").select("*").eq("workspace_id", workspace.workspaceId).order("lastReviewedAt", { ascending: false }),
    supabase.from("audit_logs").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false }),
    supabase.from("backups").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false }),
    supabase.from("gdpr_requests").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false })
  ]);
  if ([logs, sessions, loginAttempts, alerts, apiLogs, permissions, auditLogs, backups, gdprRequests].some((result) => result.error)) return { data: readLocal(), mode: "local" };
  if (!logs.data?.length && !sessions.data?.length && !alerts.data?.length) return { data: readLocal(), mode: "supabase" };
  return {
    data: {
      logs: logs.data ?? [],
      sessions: sessions.data ?? [],
      loginAttempts: loginAttempts.data ?? [],
      alerts: alerts.data ?? [],
      apiLogs: apiLogs.data ?? [],
      permissions: permissions.data ?? [],
      auditLogs: auditLogs.data ?? [],
      backups: backups.data ?? [],
      gdprRequests: gdprRequests.data ?? []
    },
    mode: "supabase"
  };
}

export async function saveSecurityData(data: SecurityData) {
  writeLocal(data);
}

export async function syncSecurityData(data: SecurityData) {
  writeLocal(data);
  const supabase = getSupabaseClient();
  if (!supabase) return { mode: "local" as const };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { mode: "local" as const };
  const withWorkspace = <T extends object>(row: T) => ({ ...row, workspace_id: workspace.workspaceId });
  const results = await Promise.all([
    ...data.logs.map((row) => supabase.from("security_logs").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.sessions.map((row) => supabase.from("user_sessions").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.loginAttempts.map((row) => supabase.from("login_attempts").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.alerts.map((row) => supabase.from("security_alerts").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.apiLogs.map((row) => supabase.from("api_security_logs").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.permissions.map((row) => supabase.from("user_permissions").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.auditLogs.map((row) => supabase.from("audit_logs").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.backups.map((row) => supabase.from("backups").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.gdprRequests.map((row) => supabase.from("gdpr_requests").upsert(withWorkspace(row), { onConflict: "id" }))
  ]);
  return getSupabaseSyncResult(results);
}
