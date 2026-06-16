import { notificationsFallbackData } from "@/data/notifications";
import { getSupabaseClient } from "@/lib/supabase";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";
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
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { data: loadLocalData(), mode: "local" };

  const [notifications, preferences, rules, conversations, messages, presence, sharedFiles] = await Promise.all([
    supabase.from("realtime_notifications").select("*").eq("workspace_id", workspace.workspaceId).order("created_at", { ascending: false }),
    supabase.from("notification_preferences").select("*").eq("workspace_id", workspace.workspaceId).order("module"),
    supabase.from("notification_rules").select("*").eq("workspace_id", workspace.workspaceId).order("created_at", { ascending: false }),
    supabase.from("collaboration_conversations").select("*").eq("workspace_id", workspace.workspaceId).order("updated_at", { ascending: false }),
    supabase.from("collaboration_messages").select("*").eq("workspace_id", workspace.workspaceId).order("created_at", { ascending: true }),
    supabase.from("user_presence").select("*").eq("workspace_id", workspace.workspaceId).order("last_seen_at", { ascending: false }),
    supabase.from("shared_files").select("*").eq("workspace_id", workspace.workspaceId).order("created_at", { ascending: false })
  ]);

  if (notifications.error || preferences.error || rules.error || conversations.error || messages.error || presence.error || sharedFiles.error) {
    return { data: loadLocalData(), mode: "local" };
  }
  if (!notifications.data?.length && !conversations.data?.length) return { data: loadLocalData(), mode: "supabase" };

  return {
    mode: "supabase",
    data: {
      notifications: (notifications.data ?? []).map(mapNotification),
      preferences: (preferences.data ?? []).map(mapPreference),
      rules: (rules.data ?? []).map(mapRule),
      conversations: (conversations.data ?? []).map(mapConversation),
      messages: (messages.data ?? []).map(mapMessage),
      presence: (presence.data ?? []).map(mapPresence),
      sharedFiles: (sharedFiles.data ?? []).map(mapSharedFile)
    }
  };
}

export async function syncNotificationsData(data: NotificationsData): Promise<{ mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();
  saveNotificationsData(data);

  if (!supabase) return { mode: "local" };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { mode: "local" };
  const withWorkspace = <T extends object>(row: T) => ({ ...row, workspace_id: workspace.workspaceId });

  const [notifications, preferences, rules, conversations, messages, presence, sharedFiles] = await Promise.all([
    supabase.from("realtime_notifications").upsert(data.notifications.map((item) => withWorkspace(toNotificationRow(item))), { onConflict: "id" }),
    supabase.from("notification_preferences").upsert(data.preferences.map((item) => withWorkspace(toPreferenceRow(item))), { onConflict: "id" }),
    supabase.from("notification_rules").upsert(data.rules.map((item) => withWorkspace(toRuleRow(item))), { onConflict: "id" }),
    supabase.from("collaboration_conversations").upsert(data.conversations.map((item) => withWorkspace(toConversationRow(item))), { onConflict: "id" }),
    supabase.from("collaboration_messages").upsert(data.messages.map((item) => withWorkspace(toMessageRow(item))), { onConflict: "id" }),
    supabase.from("user_presence").upsert(data.presence.map((item) => withWorkspace(toPresenceRow(item))), { onConflict: "id" }),
    supabase.from("shared_files").upsert(data.sharedFiles.map((item) => withWorkspace(toSharedFileRow(item))), { onConflict: "id" })
  ]);

  if (notifications.error || preferences.error || rules.error || conversations.error || messages.error || presence.error || sharedFiles.error) return { mode: "local" };
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

function mapConversation(row: Record<string, unknown>) {
  return { id: String(row.id), name: String(row.name), type: row.type as NotificationsData["conversations"][number]["type"], module: row.module as RealtimeNotification["module"], unreadCount: Number(row.unread_count ?? 0), updatedAt: String(row.updated_at) };
}

function mapMessage(row: Record<string, unknown>) {
  return { id: String(row.id), conversationId: String(row.conversation_id), author: String(row.author), role: row.role as NotificationsData["messages"][number]["role"], content: String(row.content), attachmentName: row.attachment_name ? String(row.attachment_name) : null, createdAt: String(row.created_at) };
}

function mapPresence(row: Record<string, unknown>) {
  return { id: String(row.id), name: String(row.name), role: String(row.role), status: row.status as NotificationsData["presence"][number]["status"], lastSeenAt: String(row.last_seen_at) };
}

function mapSharedFile(row: Record<string, unknown>) {
  return { id: String(row.id), conversationId: String(row.conversation_id), name: String(row.name), fileType: String(row.file_type), sizeMb: Number(row.size_mb ?? 0), secureUrl: String(row.secure_url ?? "#"), createdAt: String(row.created_at) };
}

function toConversationRow(item: NotificationsData["conversations"][number]) {
  return { id: item.id, name: item.name, type: item.type, module: item.module, unread_count: item.unreadCount, updated_at: item.updatedAt };
}

function toMessageRow(item: NotificationsData["messages"][number]) {
  return { id: item.id, conversation_id: item.conversationId, author: item.author, role: item.role, content: item.content, attachment_name: item.attachmentName, created_at: item.createdAt };
}

function toPresenceRow(item: NotificationsData["presence"][number]) {
  return { id: item.id, name: item.name, role: item.role, status: item.status, last_seen_at: item.lastSeenAt };
}

function toSharedFileRow(item: NotificationsData["sharedFiles"][number]) {
  return { id: item.id, conversation_id: item.conversationId, name: item.name, file_type: item.fileType, size_mb: item.sizeMb, secure_url: item.secureUrl, created_at: item.createdAt };
}
