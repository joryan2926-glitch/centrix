import { getSupabaseSyncResult } from "@/services/supabaseSync";
import { integrationsFallbackData } from "@/data/integrations";
import { getSupabaseClient } from "@/lib/supabase";
import type { IntegrationData } from "@/types/integrations";

const storageKey = "centrix-integrations-data-v1";

function readLocal(): IntegrationData {
  if (typeof window === "undefined") return integrationsFallbackData;
  const local = window.localStorage.getItem(storageKey);
  return local ? JSON.parse(local) : integrationsFallbackData;
}

function writeLocal(data: IntegrationData) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey, JSON.stringify(data));
  }
}

export async function loadIntegrationsData(): Promise<{ data: IntegrationData; mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: readLocal(), mode: "local" };

  const [apiKeys, apiLogs, webhooks, webhookLogs, integrations, oauthConnections, permissions, rateLimits, notifications] = await Promise.all([
    supabase.from("api_keys").select("*").order("createdAt", { ascending: false }),
    supabase.from("api_logs").select("*").order("createdAt", { ascending: false }),
    supabase.from("webhooks").select("*").order("createdAt", { ascending: false }),
    supabase.from("webhook_logs").select("*").order("createdAt", { ascending: false }),
    supabase.from("integrations").select("*"),
    supabase.from("oauth_connections").select("*"),
    supabase.from("api_permissions").select("*"),
    supabase.from("api_rate_limits").select("*"),
    supabase.from("integration_notifications").select("*").order("createdAt", { ascending: false })
  ]);

  if ([apiKeys, apiLogs, webhooks, webhookLogs, integrations, oauthConnections, permissions, rateLimits, notifications].some((result) => result.error)) {
    return { data: readLocal(), mode: "local" };
  }

  return {
    data: {
      apiKeys: apiKeys.data ?? [],
      apiLogs: apiLogs.data ?? [],
      webhooks: webhooks.data ?? [],
      webhookLogs: webhookLogs.data ?? [],
      integrations: integrations.data ?? [],
      oauthConnections: oauthConnections.data ?? [],
      permissions: permissions.data ?? [],
      rateLimits: rateLimits.data ?? [],
      notifications: notifications.data ?? []
    },
    mode: "supabase"
  };
}

export async function saveIntegrationsData(data: IntegrationData) {
  writeLocal(data);
}

export async function syncIntegrationsData(data: IntegrationData) {
  writeLocal(data);
  const supabase = getSupabaseClient();
  if (!supabase) return { mode: "local" as const };

  const results = await Promise.all([
    ...data.apiKeys.map((row) => supabase.from("api_keys").upsert(row, { onConflict: "id" })),
    ...data.apiLogs.map((row) => supabase.from("api_logs").upsert(row, { onConflict: "id" })),
    ...data.webhooks.map((row) => supabase.from("webhooks").upsert(row, { onConflict: "id" })),
    ...data.webhookLogs.map((row) => supabase.from("webhook_logs").upsert(row, { onConflict: "id" })),
    ...data.integrations.map((row) => supabase.from("integrations").upsert(row, { onConflict: "id" })),
    ...data.oauthConnections.map((row) => supabase.from("oauth_connections").upsert(row, { onConflict: "id" })),
    ...data.permissions.map((row) => supabase.from("api_permissions").upsert(row, { onConflict: "id" })),
    ...data.rateLimits.map((row) => supabase.from("api_rate_limits").upsert(row, { onConflict: "id" })),
    ...data.notifications.map((row) => supabase.from("integration_notifications").upsert(row, { onConflict: "id" }))
  ]);

  return getSupabaseSyncResult(results);
}
