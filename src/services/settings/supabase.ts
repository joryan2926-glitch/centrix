import { getSupabaseSyncResult } from "@/services/supabaseSync";
import { settingsFallbackData } from "@/data/settings";
import { getSupabaseClient } from "@/lib/supabase";
import type { SettingsData } from "@/types/settings";

const storageKey = "centrix-settings-admin-data-v1";

function readLocal(): SettingsData {
  if (typeof window === "undefined") return settingsFallbackData;
  const local = window.localStorage.getItem(storageKey);
  return local ? JSON.parse(local) : settingsFallbackData;
}

function writeLocal(data: SettingsData) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey, JSON.stringify(data));
  }
}

export async function loadSettingsData(): Promise<{ data: SettingsData; mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: readLocal(), mode: "local" };

  const [userSettings, companySettings, subscriptions, userRoles, activityLogs, securityLogs, notifications, moduleSettings, billingHistory] = await Promise.all([
    supabase.from("user_settings").select("*").order("updatedAt", { ascending: false }),
    supabase.from("company_settings").select("*"),
    supabase.from("subscriptions").select("*"),
    supabase.from("user_roles").select("*").order("lastLoginAt", { ascending: false }),
    supabase.from("activity_logs").select("*").order("createdAt", { ascending: false }),
    supabase.from("security_logs").select("*").order("createdAt", { ascending: false }),
    supabase.from("notifications").select("*").order("created_at", { ascending: false }),
    supabase.from("module_settings").select("*"),
    supabase.from("billing_history").select("*").order("createdAt", { ascending: false })
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
      notifications: notifications.data ?? [],
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
  if (!supabase) return { mode: "local" as const };

  const results = await Promise.all([
    ...data.userSettings.map((row) => supabase.from("user_settings").upsert(row, { onConflict: "id" })),
    ...data.companySettings.map((row) => supabase.from("company_settings").upsert(row, { onConflict: "companyId" })),
    ...data.subscriptions.map((row) => supabase.from("subscriptions").upsert(row, { onConflict: "id" })),
    ...data.userRoles.map((row) => supabase.from("user_roles").upsert(row, { onConflict: "id" })),
    ...data.activityLogs.map((row) => supabase.from("activity_logs").upsert(row, { onConflict: "id" })),
    ...data.securityLogs.map((row) => supabase.from("security_logs").upsert(row, { onConflict: "id" })),
    ...data.notifications.map((row) => supabase.from("notifications").upsert(row, { onConflict: "id" })),
    ...data.moduleSettings.map((row) => supabase.from("module_settings").upsert(row, { onConflict: "id" })),
    ...data.billingHistory.map((row) => supabase.from("billing_history").upsert(row, { onConflict: "id" }))
  ]);

  return getSupabaseSyncResult(results);
}
