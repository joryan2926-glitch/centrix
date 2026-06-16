import { agendaFallbackData } from "@/data/agenda";
import { getSupabaseClient } from "@/lib/supabase";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";
import type { AgendaData, AgendaTask, CalendarEvent, EventComment, Reminder, Reservation } from "@/types/agenda";

const storageKey = "centrix-agenda-data-v1";

function readLocal(): AgendaData {
  if (typeof window === "undefined") return agendaFallbackData;
  const local = window.localStorage.getItem(storageKey);
  return local ? JSON.parse(local) : agendaFallbackData;
}

function writeLocal(data: AgendaData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey, JSON.stringify(data));
}

export async function loadAgendaData(): Promise<{ data: AgendaData; mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: readLocal(), mode: "local" };

  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { data: readLocal(), mode: "local" };

  const [events, agendaEvents, tasks, reservations, reminders, comments, slots] = await Promise.all([
    supabase.from("meetings").select("*").eq("workspace_id", workspace.workspaceId).order("starts_at", { ascending: true }),
    supabase.from("calendar_events").select("*").eq("workspace_id", workspace.workspaceId).order("start", { ascending: true }),
    supabase.from("tasks").select("*").eq("workspace_id", workspace.workspaceId).order("due_at", { ascending: true }),
    supabase.from("reservations").select("*").eq("workspace_id", workspace.workspaceId).order("start", { ascending: true }),
    supabase.from("reminders").select("*").eq("workspace_id", workspace.workspaceId),
    supabase.from("event_comments").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false }),
    supabase.from("availability_slots").select("*").eq("workspace_id", workspace.workspaceId)
  ]);

  if (events.error || tasks.error) {
    return { data: readLocal(), mode: "local" };
  }

  const local = readLocal();
  const cloudEvents = events.data?.length ? (events.data ?? []).map(mapMeetingToEvent) : (agendaEvents.data ?? []).map(mapCalendarEventToEvent);

  return {
    data: {
      calendars: local.calendars,
      events: cloudEvents.length ? cloudEvents : local.events,
      participants: local.participants,
      reservations: reservations.error ? local.reservations : (reservations.data ?? []).map(mapReservation),
      reminders: reminders.error ? local.reminders : (reminders.data ?? []).map(mapReminder),
      tasks: (tasks.data ?? []).map(mapTaskToAgendaTask),
      comments: comments.error ? local.comments : (comments.data ?? []).map(mapComment),
      availabilitySlots: slots.error ? local.availabilitySlots : (slots.data ?? []).map(mapSlot)
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

  const results = await Promise.all([
    ...data.calendars.map((row) => supabase.from("calendars").upsert({ ...row, workspace_id: workspace.workspaceId }, { onConflict: "id" })),
    ...data.events.filter((row) => isUuid(row.id)).map((row) => supabase.from("meetings").upsert(toMeetingRow(row, workspace.workspaceId, workspace.userId), { onConflict: "id" })),
    ...data.events.map((row) => supabase.from("calendar_events").upsert(toCalendarEventRow(row, workspace.workspaceId), { onConflict: "id" })),
    ...data.reservations.map((row) => supabase.from("reservations").upsert(toReservationRow(row, workspace.workspaceId), { onConflict: "id" })),
    ...data.reminders.map((row) => supabase.from("reminders").upsert(toReminderRow(row, workspace.workspaceId), { onConflict: "id" })),
    ...data.comments.map((row) => supabase.from("event_comments").upsert(toCommentRow(row, workspace.workspaceId), { onConflict: "id" })),
    ...data.availabilitySlots.map((row) => supabase.from("availability_slots").upsert(toSlotRow(row, workspace.workspaceId), { onConflict: "id" })),
    ...data.tasks.filter((row) => isUuid(row.id)).map((row) => supabase.from("tasks").upsert(toAgendaTaskRow(row, workspace.workspaceId, workspace.userId), { onConflict: "id" }))
  ]);

  const error = results.find((result) => result.error)?.error?.message ?? null;
  return { error, mode: error ? "local" as const : "supabase" as const };
}

export async function upsertAgendaWorkflow(input: {
  event: CalendarEvent;
  reservation?: Reservation | null;
  reminder?: Reminder | null;
}) {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: null, mode: "local" as const };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { error: "Workspace introuvable.", mode: "local" as const };
  await ensureAgendaBootstrap(workspace.workspaceId);

  const results = await Promise.all([
    isUuid(input.event.id) ? supabase.from("meetings").upsert(toMeetingRow(input.event, workspace.workspaceId, workspace.userId), { onConflict: "id" }) : Promise.resolve({ error: null }),
    supabase.from("calendar_events").upsert(toCalendarEventRow(input.event, workspace.workspaceId), { onConflict: "id" }),
    input.reservation ? supabase.from("reservations").upsert(toReservationRow(input.reservation, workspace.workspaceId), { onConflict: "id" }) : Promise.resolve({ error: null }),
    input.reminder ? supabase.from("reminders").upsert(toReminderRow(input.reminder, workspace.workspaceId), { onConflict: "id" }) : Promise.resolve({ error: null })
  ]);

  const error = results.find((result) => result.error)?.error?.message ?? null;
  return { error, mode: error ? "local" as const : "supabase" as const };
}

export async function deleteAgendaWorkflow(eventId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: null, mode: "local" as const };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { error: "Workspace introuvable.", mode: "local" as const };

  const results = await Promise.all([
    supabase.from("reservations").delete().eq("eventId", eventId).eq("workspace_id", workspace.workspaceId),
    supabase.from("reminders").delete().eq("eventId", eventId).eq("workspace_id", workspace.workspaceId),
    supabase.from("event_comments").delete().eq("eventId", eventId).eq("workspace_id", workspace.workspaceId),
    supabase.from("calendar_events").delete().eq("id", eventId).eq("workspace_id", workspace.workspaceId),
    isUuid(eventId) ? supabase.from("meetings").delete().eq("id", eventId).eq("workspace_id", workspace.workspaceId) : Promise.resolve({ error: null })
  ]);

  const error = results.find((result) => result.error)?.error?.message ?? null;
  return { error, mode: error ? "local" as const : "supabase" as const };
}

export async function upsertAgendaTask(task: AgendaTask) {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: null, mode: "local" as const };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { error: "Workspace introuvable.", mode: "local" as const };
  if (!isUuid(task.id)) return { error: null, mode: "local" as const };
  const { error } = await supabase.from("tasks").upsert(toAgendaTaskRow(task, workspace.workspaceId, workspace.userId), { onConflict: "id" });
  return { error: error?.message ?? null, mode: error ? "local" as const : "supabase" as const };
}

async function ensureAgendaBootstrap(workspaceId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  await Promise.all(agendaFallbackData.calendars.map((row) => supabase.from("calendars").upsert({ ...row, workspace_id: workspaceId }, { onConflict: "id" })));
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

function mapCalendarEventToEvent(row: Record<string, unknown>) {
  const start = String(row.start ?? new Date().toISOString());
  const end = String(row.end ?? start);
  return {
    calendarId: String(row.calendarId ?? "company"),
    color: String(row.color ?? "#2563EB"),
    createdAt: String(row.createdAt ?? new Date().toISOString()),
    description: String(row.description ?? ""),
    durationMinutes: Number(row.durationMinutes ?? Math.max(15, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000))),
    end,
    id: String(row.id),
    location: String(row.location ?? ""),
    participants: Array.isArray(row.participants) ? row.participants as string[] : [],
    start,
    status: normalizeEventStatus(String(row.status ?? "confirmed")),
    title: String(row.title ?? "Rendez-vous"),
    type: normalizeEventType(String(row.type ?? "client_meeting")),
    updatedAt: String(row.updatedAt ?? row.createdAt ?? new Date().toISOString()),
    videoUrl: String(row.videoUrl ?? "")
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

function toCalendarEventRow(row: AgendaData["events"][number], workspaceId: string) {
  return {
    calendarId: row.calendarId,
    color: row.color,
    createdAt: row.createdAt,
    description: row.description,
    durationMinutes: row.durationMinutes,
    end: row.end,
    id: row.id,
    location: row.location,
    participants: row.participants,
    start: row.start,
    status: row.status,
    title: row.title,
    type: row.type,
    updatedAt: row.updatedAt,
    videoUrl: row.videoUrl,
    workspace_id: workspaceId
  };
}

function toReservationRow(row: Reservation, workspaceId: string) {
  return {
    approvalMode: row.approvalMode,
    capacity: row.capacity,
    createdAt: row.createdAt,
    end: row.end,
    eventId: row.eventId,
    id: row.id,
    resourceName: row.resourceName,
    start: row.start,
    status: row.status,
    type: row.type,
    workspace_id: workspaceId
  };
}

function toReminderRow(row: Reminder, workspaceId: string) {
  return { channel: row.channel, eventId: row.eventId, id: row.id, minutesBefore: row.minutesBefore, sent: row.sent, workspace_id: workspaceId };
}

function toCommentRow(row: EventComment, workspaceId: string) {
  return { author: row.author, body: row.body, createdAt: row.createdAt, eventId: row.eventId, id: row.id, workspace_id: workspaceId };
}

function toSlotRow(row: AgendaData["availabilitySlots"][number], workspaceId: string) {
  return { dayOfWeek: row.dayOfWeek, endTime: row.endTime, id: row.id, startTime: row.startTime, userEmail: row.userEmail, workspace_id: workspaceId };
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

function normalizeEventType(type: string) {
  if (["client_meeting", "team_meeting", "call", "video", "internal"].includes(type)) return type as AgendaData["events"][number]["type"];
  return "client_meeting";
}

function normalizePriority(priority: string) {
  if (["low", "medium", "high", "urgent"].includes(priority)) return priority as AgendaData["tasks"][number]["priority"];
  return "medium";
}

function mapReservation(row: Record<string, unknown>): Reservation {
  return {
    approvalMode: String(row.approvalMode ?? "manual") === "auto" ? "auto" : "manual",
    capacity: Number(row.capacity ?? 1),
    createdAt: String(row.createdAt ?? new Date().toISOString()),
    end: String(row.end ?? new Date().toISOString()),
    eventId: row.eventId ? String(row.eventId) : null,
    id: String(row.id),
    resourceName: String(row.resourceName ?? "Ressource"),
    start: String(row.start ?? new Date().toISOString()),
    status: normalizeReservationStatus(String(row.status ?? "pending")),
    type: normalizeReservationType(String(row.type ?? "room"))
  };
}

function mapReminder(row: Record<string, unknown>): Reminder {
  return {
    channel: String(row.channel ?? "dashboard") === "email_future" ? "email_future" : "dashboard",
    eventId: String(row.eventId ?? ""),
    id: String(row.id),
    minutesBefore: Number(row.minutesBefore ?? 15),
    sent: Boolean(row.sent)
  };
}

function mapComment(row: Record<string, unknown>): EventComment {
  return {
    author: String(row.author ?? "Equipe"),
    body: String(row.body ?? ""),
    createdAt: String(row.createdAt ?? new Date().toISOString()),
    eventId: String(row.eventId ?? ""),
    id: String(row.id)
  };
}

function mapSlot(row: Record<string, unknown>) {
  return {
    dayOfWeek: Number(row.dayOfWeek ?? 1),
    endTime: String(row.endTime ?? "17:00"),
    id: String(row.id),
    startTime: String(row.startTime ?? "09:00"),
    userEmail: String(row.userEmail ?? "team@centrix.fr")
  };
}

function normalizeReservationStatus(status: string) {
  if (["confirmed", "pending", "cancelled"].includes(status)) return status as Reservation["status"];
  return "pending";
}

function normalizeReservationType(type: string) {
  if (["room", "service", "resource"].includes(type)) return type as Reservation["type"];
  return "room";
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
