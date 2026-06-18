import { crmEmptyData } from "@/data/crm";
import { getSupabaseClient } from "@/lib/supabase";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";
import type { CrmActivity, CrmClient, CrmData, CrmLead, CrmNote, CrmTask } from "@/types/crm";

const emptyData: CrmData = {
  leads: [],
  clients: [],
  notes: [],
  tasks: [],
  activities: []
};

function readLocal(): CrmData {
  if (typeof window === "undefined") return crmEmptyData;

  return crmEmptyData;
}

function writeLocal(data: CrmData) {
  void data;
}

export async function loadCrmData(): Promise<{ data: CrmData; mode: "supabase" | "local" }> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return { data: readLocal(), mode: "local" };
  }

  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { data: readLocal(), mode: "local" };

  const [leads, clients, notes, tasks, activities] = await Promise.all([
    supabase.from("prospects").select("*").eq("workspace_id", workspace.workspaceId).order("updated_at", { ascending: false }),
    supabase.from("clients").select("*").eq("workspace_id", workspace.workspaceId).order("updated_at", { ascending: false }),
    supabase.from("messages").select("*").eq("workspace_id", workspace.workspaceId).eq("channel", "crm-note").order("created_at", { ascending: false }),
    supabase.from("tasks").select("*").eq("workspace_id", workspace.workspaceId).order("due_at", { ascending: true }),
    supabase.from("messages").select("*").eq("workspace_id", workspace.workspaceId).eq("channel", "crm-activity").order("created_at", { ascending: false })
  ]);

  if (leads.error || clients.error || notes.error || tasks.error || activities.error) {
    return { data: readLocal(), mode: "local" };
  }

  return {
    data: {
      leads: (leads.data ?? []).map(mapProspectToLead),
      clients: (clients.data ?? []).map(mapClientRowToCrmClient),
      notes: (notes.data ?? []).map(mapMessageToNote),
      tasks: (tasks.data ?? []).map(mapTaskRowToCrmTask),
      activities: (activities.data ?? []).map(mapMessageToActivity)
    },
    mode: "supabase"
  };
}

export async function saveCrmData(data: CrmData) {
  writeLocal(data);
}

export async function upsertLead(lead: CrmLead) {
  const supabase = getSupabaseClient();
  if (!supabase) return "Supabase non configure.";
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return "Workspace introuvable.";
  const { error } = await supabase.from("prospects").upsert(toProspectRow(lead, workspace.workspaceId, workspace.userId), { onConflict: "id" });
  return error?.message ?? null;
}

export async function deleteLeadFromSupabase(leadId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return "Supabase non configure.";
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return "Workspace introuvable.";

  await supabase.from("messages").delete().eq("workspace_id", workspace.workspaceId).filter("metadata->>leadId", "eq", leadId);
  await supabase.from("tasks").delete().eq("workspace_id", workspace.workspaceId).filter("metadata->>leadId", "eq", leadId);
  const { error } = await supabase.from("prospects").delete().eq("workspace_id", workspace.workspaceId).eq("id", leadId);
  return error?.message ?? null;
}

export async function upsertClient(client: CrmClient) {
  const supabase = getSupabaseClient();
  if (!supabase) return "Supabase non configure.";
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return "Workspace introuvable.";
  const { error } = await supabase.from("clients").upsert(toClientRow(client, workspace.workspaceId, workspace.userId), { onConflict: "id" });
  return error?.message ?? null;
}

export async function deleteClientFromSupabase(clientId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return "Supabase non configure.";
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return "Workspace introuvable.";

  await supabase.from("messages").delete().eq("workspace_id", workspace.workspaceId).eq("client_id", clientId);
  await supabase.from("tasks").delete().eq("workspace_id", workspace.workspaceId).eq("client_id", clientId);
  const { error } = await supabase.from("clients").delete().eq("workspace_id", workspace.workspaceId).eq("id", clientId);
  return error?.message ?? null;
}

export async function insertNote(note: CrmNote) {
  const supabase = getSupabaseClient();
  if (!supabase) return "Supabase non configure.";
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return "Workspace introuvable.";
  const { error } = await supabase.from("messages").upsert(toMessageRow(note, workspace.workspaceId, workspace.userId, "crm-note"), { onConflict: "id" });
  return error?.message ?? null;
}

export async function upsertTask(task: CrmTask) {
  const supabase = getSupabaseClient();
  if (!supabase) return "Supabase non configure.";
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return "Workspace introuvable.";
  const { error } = await supabase.from("tasks").upsert(toTaskRow(task, workspace.workspaceId, workspace.userId), { onConflict: "id" });
  return error?.message ?? null;
}

export async function insertActivity(activity: CrmActivity) {
  const supabase = getSupabaseClient();
  if (!supabase) return "Supabase non configure.";
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return "Workspace introuvable.";
  const { error } = await supabase.from("messages").upsert(toActivityMessageRow(activity, workspace.workspaceId, workspace.userId), { onConflict: "id" });
  return error?.message ?? null;
}

export async function syncCrmData(data: CrmData) {
  writeLocal(data);
  const supabase = getSupabaseClient();

  if (!supabase) return { mode: "local" as const };

  const errors = await Promise.all([
    ...data.leads.map((lead) => upsertLead(lead)),
    ...data.clients.map((client) => upsertClient(client)),
    ...data.notes.map((note) => insertNote(note)),
    ...data.tasks.map((task) => upsertTask(task)),
    ...data.activities.map((activity) => insertActivity(activity))
  ]);

  const error = errors.find(Boolean) ?? null;
  return { error, mode: error ? "local" as const : "supabase" as const };
}

export function mergeCrmData(data: Partial<CrmData>): CrmData {
  return { ...emptyData, ...data };
}

function mapProspectToLead(row: Record<string, unknown>): CrmLead {
  const metadata = (row.metadata ?? {}) as Record<string, unknown>;
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    company: String(row.company ?? ""),
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
    status: normalizeLeadStatus(String(row.stage ?? "new")),
    priority: (metadata.priority as CrmLead["priority"]) ?? "medium",
    potentialAmount: Number(row.potential_amount ?? 0),
    probability: Number(metadata.probability ?? row.score ?? 0),
    owner: String(metadata.owner ?? "Equipe"),
    source: String(row.source ?? "Manuel"),
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : Array.isArray(metadata.tags) ? (metadata.tags as string[]) : [],
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? row.created_at ?? new Date().toISOString())
  };
}

function mapClientRowToCrmClient(row: Record<string, unknown>): CrmClient {
  const metadata = (row.metadata ?? {}) as Record<string, unknown>;
  return {
    id: String(row.id),
    leadId: metadata.leadId ? String(metadata.leadId) : null,
    name: String(row.name ?? ""),
    company: String(row.company ?? ""),
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    lifetimeValue: Number(metadata.lifetimeValue ?? 0),
    status: normalizeClientStatus(String(row.status ?? "active")),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? row.created_at ?? new Date().toISOString())
  };
}

function mapMessageToNote(row: Record<string, unknown>): CrmNote {
  const metadata = (row.metadata ?? {}) as Record<string, unknown>;
  return {
    id: String(row.id),
    leadId: metadata.leadId ? String(metadata.leadId) : null,
    clientId: row.client_id ? String(row.client_id) : null,
    body: String(row.body ?? ""),
    createdAt: String(row.created_at ?? new Date().toISOString())
  };
}

function mapMessageToActivity(row: Record<string, unknown>): CrmActivity {
  const metadata = (row.metadata ?? {}) as Record<string, unknown>;
  return {
    id: String(row.id),
    leadId: metadata.leadId ? String(metadata.leadId) : null,
    clientId: row.client_id ? String(row.client_id) : null,
    type: (metadata.type as CrmActivity["type"]) ?? "note",
    title: String(metadata.title ?? "Activite CRM"),
    detail: String(row.body ?? ""),
    createdAt: String(row.created_at ?? new Date().toISOString())
  };
}

function mapTaskRowToCrmTask(row: Record<string, unknown>): CrmTask {
  const metadata = (row.metadata ?? {}) as Record<string, unknown>;
  return {
    id: String(row.id),
    leadId: metadata.leadId ? String(metadata.leadId) : null,
    clientId: row.client_id ? String(row.client_id) : null,
    title: String(row.title ?? ""),
    dueDate: String(row.due_at ?? row.created_at ?? new Date().toISOString()).slice(0, 10),
    done: String(row.status ?? "todo") === "done",
    createdAt: String(row.created_at ?? new Date().toISOString())
  };
}

function toProspectRow(lead: CrmLead, workspaceId: string, userId: string) {
  return {
    id: lead.id,
    company: lead.company,
    created_by: userId,
    email: lead.email,
    name: lead.name,
    notes: "",
    phone: lead.phone,
    potential_amount: lead.potentialAmount,
    score: lead.probability,
    source: lead.source,
    stage: lead.status,
    tags: lead.tags,
    metadata: { owner: lead.owner, priority: lead.priority, probability: lead.probability, tags: lead.tags },
    updated_at: lead.updatedAt,
    workspace_id: workspaceId
  };
}

function toClientRow(client: CrmClient, workspaceId: string, userId: string) {
  return {
    id: client.id,
    company: client.company,
    created_by: userId,
    email: client.email,
    metadata: { leadId: client.leadId, lifetimeValue: client.lifetimeValue },
    name: client.name,
    phone: client.phone,
    status: client.status,
    tags: client.tags,
    updated_at: client.updatedAt,
    workspace_id: workspaceId
  };
}

function toMessageRow(note: CrmNote, workspaceId: string, userId: string, channel: string) {
  return {
    id: note.id,
    body: note.body,
    channel,
    client_id: note.clientId,
    metadata: { leadId: note.leadId },
    sender_id: userId,
    workspace_id: workspaceId
  };
}

function toTaskRow(task: CrmTask, workspaceId: string, userId: string) {
  return {
    id: task.id,
    client_id: task.clientId,
    created_by: userId,
    due_at: task.dueDate,
    metadata: { leadId: task.leadId },
    status: task.done ? "done" : "todo",
    title: task.title,
    workspace_id: workspaceId
  };
}

function toActivityMessageRow(activity: CrmActivity, workspaceId: string, userId: string) {
  return {
    id: activity.id,
    body: activity.detail,
    channel: "crm-activity",
    client_id: activity.clientId,
    metadata: { leadId: activity.leadId, title: activity.title, type: activity.type },
    sender_id: userId,
    workspace_id: workspaceId
  };
}

function normalizeLeadStatus(status: string): CrmLead["status"] {
  if (["new", "qualified", "proposal", "negotiation", "won", "lost"].includes(status)) return status as CrmLead["status"];
  return "new";
}

function normalizeClientStatus(status: string): CrmClient["status"] {
  if (["active", "onboarding", "at_risk"].includes(status)) return status as CrmClient["status"];
  return "active";
}
