import { agendaFallbackData } from "@/data/agenda";
import { getSupabaseClient } from "@/lib/supabase";
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

  const [calendars, events, participants, reservations, reminders, tasks, comments, availabilitySlots] =
    await Promise.all([
      supabase.from("calendars").select("*"),
      supabase.from("calendar_events").select("*").order("start", { ascending: true }),
      supabase.from("event_participants").select("*"),
      supabase.from("reservations").select("*").order("start", { ascending: true }),
      supabase.from("reminders").select("*"),
      supabase.from("tasks").select("*").order("dueDate", { ascending: true }),
      supabase.from("event_comments").select("*").order("createdAt", { ascending: false }),
      supabase.from("availability_slots").select("*")
    ]);

  if ([calendars, events, participants, reservations, reminders, tasks, comments, availabilitySlots].some((result) => result.error)) {
    return { data: readLocal(), mode: "local" };
  }

  return {
    data: {
      calendars: calendars.data ?? [],
      events: events.data ?? [],
      participants: participants.data ?? [],
      reservations: reservations.data ?? [],
      reminders: reminders.data ?? [],
      tasks: tasks.data ?? [],
      comments: comments.data ?? [],
      availabilitySlots: availabilitySlots.data ?? []
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

  await Promise.all([
    ...data.calendars.map((row) => supabase.from("calendars").upsert(row, { onConflict: "id" })),
    ...data.events.map((row) => supabase.from("calendar_events").upsert(row, { onConflict: "id" })),
    ...data.participants.map((row) => supabase.from("event_participants").upsert(row, { onConflict: "id" })),
    ...data.reservations.map((row) => supabase.from("reservations").upsert(row, { onConflict: "id" })),
    ...data.reminders.map((row) => supabase.from("reminders").upsert(row, { onConflict: "id" })),
    ...data.tasks.map((row) => supabase.from("tasks").upsert(row, { onConflict: "id" })),
    ...data.comments.map((row) => supabase.from("event_comments").upsert(row, { onConflict: "id" })),
    ...data.availabilitySlots.map((row) => supabase.from("availability_slots").upsert(row, { onConflict: "id" }))
  ]);

  return { mode: "supabase" as const };
}
