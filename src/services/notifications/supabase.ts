import { notificationsFallbackData } from "@/data/notifications";
import { getSupabaseClient } from "@/lib/supabase";
import type { NotificationPreference, NotificationRule, NotificationsData, RealtimeNotification } from "@/types/notifications";

const storageKey = "centrix-notifications-data";

export function saveNotificationsData(data: NotificationsData) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey, JSON.stringify(data));
  }
}

function loadLocalData(): NotificationsData {
  if (typeof window === "undefined") return notificationsFallbackData;

  const cached = window.localStorage.getItem(storageKey);
  if (!cached) return notificationsFallbackData;

  try {
    return JSON.parse(cached) as NotificationsData;
  } catch {
    return notificationsFallbackData;
  }
}

export async function loadNotificationsData(): Promise<{ data: NotificationsData; mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: loadLocalData(), mode: "local" };

  const [notifications, preferences, rules] = await Promise.all([
    supabase.from("realtime_notifications").select("*").order("created_at", { ascending: false }),
    supabase.from("notification_preferences").select("*").order("module"),
    supabase.from("notification_rules").select("*").order("created_at", { ascending: false })
  ]);

  if (notifications.error || preferences.error || rules.error) {
    return { data: loadLocalData(), mode: "local" };
  }

  return {
    mode: "supabase",
    data: {
      notifications: (notifications.data ?? []).map(mapNotification),
      preferences: (preferences.data ?? []).map(mapPreference),
      rules: (rules.data ?? []).map(mapRule)
    }
  };
}

export async function syncNotificationsData(data: NotificationsData): Promise<{ mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();
  saveNotificationsData(data);

  if (!supabase) return { mode: "local" };

  const [notifications, preferences, rules] = await Promise.all([
    supabase.from("realtime_notifications").upsert(data.notifications.map(toNotificationRow)),
    supabase.from("notification_preferences").upsert(data.preferences.map(toPreferenceRow)),
    supabase.from("notification_rules").upsert(data.rules.map(toRuleRow))
  ]);

  if (notifications.error || preferences.error || rules.error) return { mode: "local" };
  return { mode: "supabase" };
}

function mapNotification(row: Record<string, unknown>): RealtimeNotification {
  return {
    id: String(row.id),
    title: String(row.title),
    detail: String(row.detail),
    module: row.module as RealtimeNotification["module"],
    severity: row.severity as RealtimeNotification["severity"],
    read: Boolean(row.read),
    actionUrl: row.action_url ? String(row.action_url) : null,
    createdAt: String(row.created_at),
    remindAt: row.remind_at ? String(row.remind_at) : null
  };
}

function mapPreference(row: Record<string, unknown>): NotificationPreference {
  return {
    id: String(row.id),
    module: row.module as NotificationPreference["module"],
    email: Boolean(row.email),
    push: Boolean(row.push),
    dashboard: Boolean(row.dashboard)
  };
}

function mapRule(row: Record<string, unknown>): NotificationRule {
  return {
    id: String(row.id),
    name: String(row.name),
    trigger: String(row.trigger),
    channel: row.channel as NotificationRule["channel"],
    active: Boolean(row.active),
    createdAt: String(row.created_at)
  };
}

function toNotificationRow(item: RealtimeNotification) {
  return {
    id: item.id,
    title: item.title,
    detail: item.detail,
    module: item.module,
    severity: item.severity,
    read: item.read,
    action_url: item.actionUrl,
    created_at: item.createdAt,
    remind_at: item.remindAt
  };
}

function toPreferenceRow(item: NotificationPreference) {
  return { id: item.id, module: item.module, email: item.email, push: item.push, dashboard: item.dashboard };
}

function toRuleRow(item: NotificationRule) {
  return { id: item.id, name: item.name, trigger: item.trigger, channel: item.channel, active: item.active, created_at: item.createdAt };
}
