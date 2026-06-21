import { getSupabaseSyncResult } from "@/services/supabaseSync";
import { settingsFallbackData } from "@/data/settings";
import { getSupabaseClient } from "@/lib/supabase";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";
import type { SettingsData } from "@/types/settings";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readLocal(): SettingsData {
  if (typeof window === "undefined") return settingsFallbackData;
  return settingsFallbackData;
}

function writeLocal(data: SettingsData) {
  void data;
}

export async function loadSettingsData(): Promise<{ data: SettingsData; mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: readLocal(), mode: "local" };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { data: readLocal(), mode: "local" };

  const [userSettings, companySettings, subscriptions, userRoles, activityLogs, securityLogs, notifications, moduleSettings, billingHistory] = await Promise.all([
    supabase.from("user_settings").select("*").eq("workspace_id", workspace.workspaceId).order("updatedAt", { ascending: false }),
    supabase.from("company_settings").select("*").eq("workspace_id", workspace.workspaceId),
    supabase.from("subscriptions").select("*").eq("workspace_id", workspace.workspaceId),
    supabase.from("user_roles").select("*").eq("workspace_id", workspace.workspaceId).order("lastLoginAt", { ascending: false }),
    supabase.from("activity_logs").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false }),
    supabase.from("security_logs").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false }),
    supabase.from("notifications").select("*").eq("workspace_id", workspace.workspaceId).order("created_at", { ascending: false }),
    supabase.from("module_settings").select("*").eq("workspace_id", workspace.workspaceId),
    supabase.from("billing_history").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false })
  ]);

  if ([userSettings, companySettings, subscriptions, userRoles, activityLogs, securityLogs, notifications, moduleSettings, billingHistory].some((result) => result.error)) {
    return { data: readLocal(), mode: "local" };
  }

  return {
    data: {
      userSettings: userSettings.data?.length ? userSettings.data : settingsFallbackData.userSettings,
      companySettings: companySettings.data?.length ? companySettings.data : settingsFallbackData.companySettings,
      subscriptions: subscriptions.data ?? [],
      userRoles: userRoles.data ?? [],
      activityLogs: activityLogs.data ?? [],
      securityLogs: securityLogs.data ?? [],
      notifications: notifications.data?.map(mapSettingsNotification) ?? [],
      moduleSettings: moduleSettings.data ?? [],
      billingHistory: billingHistory.data ?? []
    },
    mode: "supabase"
  };
}

export async function saveSettingsData(data: SettingsData) {
  writeLocal(data);
}

export async function syncSettingsData(data: SettingsData) {
  writeLocal(data);
  const supabase = getSupabaseClient();
  if (!supabase) return { error: "Supabase non configure.", mode: "local" as const };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { error: "Workspace introuvable.", mode: "local" as const };
  const withWorkspace = <T extends object>(row: T) => ({ ...row, workspace_id: workspace.workspaceId });

  const results = await Promise.all([
    ...data.userSettings.map((row) => supabase.from("user_settings").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.companySettings.map((row) => supabase.from("company_settings").upsert(withWorkspace(row), { onConflict: "companyId" })),
    ...data.subscriptions.filter((row) => isUuid(row.id)).map((row) => supabase.from("subscriptions").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.userRoles.map((row) => supabase.from("user_roles").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.activityLogs.map((row) => supabase.from("activity_logs").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.securityLogs.map((row) => supabase.from("security_logs").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.notifications.filter((row) => isUuid(row.id)).map((row) => supabase.from("notifications").upsert(withWorkspace(toSettingsNotificationRow(row)), { onConflict: "id" })),
    ...data.moduleSettings.map((row) => supabase.from("module_settings").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.billingHistory.filter((row) => isUuid(row.subscriptionId)).map((row) => supabase.from("billing_history").upsert(withWorkspace(row), { onConflict: "id" }))
  ]);

  return getSupabaseSyncResult(results);
}

function isUuid(value: string) {
  return uuidPattern.test(value);
}

type NotificationRow = Record<string, unknown>;

function mapSettingsNotification(row: NotificationRow) {
  return {
    id: String(row.id),
    title: String(row.title ?? "Notification"),
    detail: String(row.detail ?? row.body ?? ""),
    channel: (row.channel ?? row.module ?? "dashboard") as "dashboard" | "email" | "security",
    read: Boolean(row.read ?? row.read_at),
    severity: (row.severity ?? row.type ?? "info") as "info" | "success" | "warning",
    createdAt: String(row.createdAt ?? row.created_at ?? new Date().toISOString())
  };
}

function toSettingsNotificationRow(row: SettingsData["notifications"][number]) {
  return {
    id: row.id,
    title: row.title,
    body: row.detail,
    module: row.channel === "security" ? "security" : "settings",
    type: row.severity,
    read_at: row.read ? row.createdAt : null,
    metadata: { channel: row.channel, source: "settings" },
    created_at: row.createdAt
  };
}
