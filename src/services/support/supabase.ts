import { getSupabaseSyncResult } from "@/services/supabaseSync";
import { supportFallbackData } from "@/data/support";
import { getSupabaseClient } from "@/lib/supabase";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";
import type { SupportData } from "@/types/support";

const storageKey = "centrix-support-data-v1";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const legacyTicketIds: Record<string, string> = {
  "ticket-1024": "10241024-1024-4024-8024-102410241024",
  "ticket-1025": "10251025-1025-4025-8025-102510251025",
  "ticket-1026": "10261026-1026-4026-8026-102610261026",
  "ticket-1027": "10271027-1027-4027-8027-102710271027"
};
type SupportTicketRow = Record<string, unknown> & { metadata?: Record<string, unknown> | null };

function readLocal(): SupportData {
  if (typeof window === "undefined") return supportFallbackData;
  const local = window.localStorage.getItem(storageKey);
  return normalizeSupportData(local ? JSON.parse(local) : supportFallbackData);
}

function writeLocal(data: SupportData) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey, JSON.stringify(normalizeSupportData(data)));
  }
}

export async function loadSupportData(): Promise<{ data: SupportData; mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: readLocal(), mode: "local" };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { data: readLocal(), mode: "local" };

  const [tickets, messages, comments, agents, categories, articles, feedback, notifications] = await Promise.all([
    supabase.from("support_tickets").select("*").eq("workspace_id", workspace.workspaceId).order("updated_at", { ascending: false }),
    supabase.from("support_messages").select("*").order("createdAt", { ascending: true }),
    supabase.from("support_comments").select("*").order("createdAt", { ascending: false }),
    supabase.from("support_agents").select("*"),
    supabase.from("support_categories").select("*"),
    supabase.from("support_articles").select("*").order("updatedAt", { ascending: false }),
    supabase.from("support_feedback").select("*").order("createdAt", { ascending: false }),
    supabase.from("support_notifications").select("*").order("createdAt", { ascending: false })
  ]);

  if ([tickets, messages, comments, agents, categories, articles, feedback, notifications].some((result) => result.error)) {
    return { data: readLocal(), mode: "local" };
  }

  return {
    data: {
      tickets: (tickets.data ?? []).map(mapTicketRow),
      messages: messages.data ?? [],
      comments: comments.data ?? [],
      agents: agents.data ?? [],
      categories: categories.data ?? [],
      articles: articles.data ?? [],
      feedback: feedback.data ?? [],
      notifications: notifications.data ?? []
    },
    mode: "supabase"
  };
}

export async function saveSupportData(data: SupportData) {
  writeLocal(data);
}

export async function syncSupportData(data: SupportData) {
  const normalized = normalizeSupportData(data);
  writeLocal(normalized);
  const supabase = getSupabaseClient();
  if (!supabase) return { mode: "local" as const };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { mode: "local" as const };
  const validTicketIds = new Set(normalized.tickets.filter((row) => isUuid(row.id)).map((row) => row.id));

  const results = await Promise.all([
    ...normalized.agents.map((row) => supabase.from("support_agents").upsert(row, { onConflict: "id" })),
    ...normalized.categories.map((row) => supabase.from("support_categories").upsert(row, { onConflict: "id" })),
    ...normalized.tickets.filter((row) => validTicketIds.has(row.id)).map((row) => supabase.from("support_tickets").upsert(toTicketRow(row, workspace.workspaceId, workspace.userId), { onConflict: "id" })),
    ...normalized.messages.filter((row) => validTicketIds.has(row.ticketId)).map((row) => supabase.from("support_messages").upsert(row, { onConflict: "id" })),
    ...normalized.comments.filter((row) => validTicketIds.has(row.ticketId)).map((row) => supabase.from("support_comments").upsert(row, { onConflict: "id" })),
    ...normalized.articles.map((row) => supabase.from("support_articles").upsert(row, { onConflict: "id" })),
    ...normalized.feedback.filter((row) => validTicketIds.has(row.ticketId)).map((row) => supabase.from("support_feedback").upsert(row, { onConflict: "id" })),
    ...normalized.notifications.filter((row) => !row.ticketId || validTicketIds.has(row.ticketId)).map((row) => supabase.from("support_notifications").upsert(row, { onConflict: "id" }))
  ]);

  return getSupabaseSyncResult(results);
}

function normalizeSupportData(data: SupportData): SupportData {
  const mappedIds = new Map<string, string>();
  const resolveTicketId = (id: string) => {
    if (isUuid(id)) return id;
    const mapped = legacyTicketIds[id] ?? mappedIds.get(id) ?? crypto.randomUUID();
    mappedIds.set(id, mapped);
    return mapped;
  };

  return {
    ...data,
    tickets: data.tickets.map((ticket) => ({ ...ticket, id: resolveTicketId(ticket.id) })),
    messages: data.messages.map((message) => ({ ...message, ticketId: resolveTicketId(message.ticketId) })),
    comments: data.comments.map((comment) => ({ ...comment, ticketId: resolveTicketId(comment.ticketId) })),
    feedback: data.feedback.map((item) => ({ ...item, ticketId: resolveTicketId(item.ticketId) })),
    notifications: data.notifications.map((notification) => ({ ...notification, ticketId: notification.ticketId ? resolveTicketId(notification.ticketId) : null }))
  };
}

function isUuid(value: string) {
  return uuidPattern.test(value);
}

function mapTicketRow(row: SupportTicketRow) {
  const metadata = row.metadata ?? {};
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    description: String(row.description ?? ""),
    clientName: String(row.clientName ?? metadata.clientName ?? "Client CENTRIX"),
    clientEmail: String(row.clientEmail ?? metadata.clientEmail ?? "client@centrix.fr"),
    priority: String(row.priority ?? "medium") as SupportData["tickets"][number]["priority"],
    categoryId: String(row.categoryId ?? row.category ?? metadata.categoryId ?? "cat-technical"),
    status: String(row.status ?? "open") as SupportData["tickets"][number]["status"],
    assignedAgentId: row.assignedAgentId ? String(row.assignedAgentId) : metadata.assignedAgentId ? String(metadata.assignedAgentId) : null,
    attachments: Array.isArray(row.attachments) ? row.attachments.map(String) : Array.isArray(metadata.attachments) ? metadata.attachments.map(String) : [],
    createdAt: String(row.createdAt ?? row.created_at ?? new Date().toISOString()),
    updatedAt: String(row.updatedAt ?? row.updated_at ?? new Date().toISOString())
  };
}

function toTicketRow(ticket: SupportData["tickets"][number], workspaceId: string, userId: string) {
  return {
    id: ticket.id,
    workspace_id: workspaceId,
    created_by: userId,
    title: ticket.title,
    description: ticket.description,
    status: ticket.status,
    priority: ticket.priority,
    category: ticket.categoryId,
    "clientName": ticket.clientName,
    "clientEmail": ticket.clientEmail,
    "categoryId": ticket.categoryId,
    "assignedAgentId": ticket.assignedAgentId,
    attachments: ticket.attachments,
    "createdAt": ticket.createdAt,
    "updatedAt": ticket.updatedAt,
    metadata: {
      clientName: ticket.clientName,
      clientEmail: ticket.clientEmail,
      categoryId: ticket.categoryId,
      assignedAgentId: ticket.assignedAgentId,
      attachments: ticket.attachments
    },
    updated_at: ticket.updatedAt
  };
}
