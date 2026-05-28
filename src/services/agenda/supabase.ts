import { agendaFallbackData } from "@/data/agenda";
import { getSupabaseClient } from "@/lib/supabase";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";
import type { AgendaData } from "@/types/agenda";

const storageKey = "centrix-agenda-data-v1";

function readLocal(): AgendaData {
  if (typeof window === "undefined") return agendaFallbackData;
  const local = window.localStorage.getItem(storageKey);
  return local ? JSON.parse(local) : agendaFallbackData;
}

function writeLocal(data: AgendaData) {
  window.localStorage.setItem(storageKey, JSON.stringify(data));
}

export async function loadAgendaData(): Promise<{ data: AgendaData; mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: readLocal(), mode: "local" };

  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { data: readLocal(), mode: "local" };

  const [events, tasks] = await Promise.all([
    supabase.from("meetings").select("*").eq("workspace_id", workspace.workspaceId).order("starts_at", { ascending: true }),
    supabase.from("tasks").select("*").eq("workspace_id", workspace.workspaceId).order("due_at", { ascending: true })
  ]);

  if (events.error || tasks.error) {
    return { data: readLocal(), mode: "local" };
  }

  const local = readLocal();

  return {
    data: {
      calendars: local.calendars,
      events: (events.data ?? []).map(mapMeetingToEvent),
      participants: local.participants,
      reservations: local.reservations,
      reminders: local.reminders,
      tasks: (tasks.data ?? []).map(mapTaskToAgendaTask),
      comments: local.comments,
      availabilitySlots: local.availabilitySlots
    },
    mode: "supabase"
  };
}

export async function saveAgendaData(data: AgendaData) {
  writeLocal(data);
}

export async function syncAgendaData(data: AgendaData) {
  writeLocal(data);
  const supabase = getSupabaseClient();
  if (!supabase) return { mode: "local" as const };

  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { mode: "local" as const };

  await Promise.all([
    ...data.events.map((row) => supabase.from("meetings").upsert(toMeetingRow(row, workspace.workspaceId, workspace.userId), { onConflict: "id" })),
    ...data.tasks.map((row) => supabase.from("tasks").upsert(toAgendaTaskRow(row, workspace.workspaceId, workspace.userId), { onConflict: "id" }))
  ]);

  return { mode: "supabase" as const };
}

function mapMeetingToEvent(row: Record<string, unknown>) {
  const participants = Array.isArray(row.participants) ? (row.participants as string[]) : [];
  const start = String(row.starts_at ?? new Date().toISOString());
  const end = String(row.ends_at ?? start);

  return {
    id: String(row.id),
    calendarId: "company",
    title: String(row.title ?? "Rendez-vous"),
    description: String(row.description ?? ""),
    type: "client_meeting" as const,
    status: normalizeEventStatus(String(row.status ?? "confirmed")),
    start,
    end,
    durationMinutes: Math.max(15, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000)),
    participants,
    location: String(row.location ?? ""),
    videoUrl: String(row.video_url ?? ""),
    color: "#2563EB",
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? row.created_at ?? new Date().toISOString())
  };
}

function mapTaskToAgendaTask(row: Record<string, unknown>) {
  const metadata = (row.metadata ?? {}) as Record<string, unknown>;
  return {
    id: String(row.id),
    eventId: metadata.eventId ? String(metadata.eventId) : null,
    title: String(row.title ?? "Tache"),
    priority: normalizePriority(String(row.priority ?? "medium")),
    done: String(row.status ?? "todo") === "done",
    dueDate: String(row.due_at ?? new Date().toISOString()).slice(0, 10),
    checklist: Array.isArray(metadata.checklist) ? (metadata.checklist as Array<{ id: string; label: string; done: boolean }>) : [],
    createdAt: String(row.created_at ?? new Date().toISOString())
  };
}

function toMeetingRow(row: AgendaData["events"][number], workspaceId: string, userId: string) {
  return {
    id: row.id,
    created_by: userId,
    description: row.description,
    ends_at: row.end,
    location: row.location,
    participants: row.participants,
    starts_at: row.start,
    status: row.status,
    title: row.title,
    video_url: row.videoUrl,
    workspace_id: workspaceId
  };
}

function toAgendaTaskRow(row: AgendaData["tasks"][number], workspaceId: string, userId: string) {
  return {
    id: row.id,
    created_by: userId,
    due_at: row.dueDate,
    metadata: { checklist: row.checklist, eventId: row.eventId },
    priority: row.priority,
    status: row.done ? "done" : "todo",
    title: row.title,
    workspace_id: workspaceId
  };
}

function normalizeEventStatus(status: string) {
  if (["confirmed", "pending", "cancelled", "completed"].includes(status)) return status as AgendaData["events"][number]["status"];
  return "confirmed";
}

function normalizePriority(priority: string) {
  if (["low", "medium", "high", "urgent"].includes(priority)) return priority as AgendaData["tasks"][number]["priority"];
  return "medium";
}
