import { getSupabaseSyncResult } from "@/services/supabaseSync";
import { clientPortalFallbackData } from "@/data/clientPortal";
import { getSupabaseClient } from "@/lib/supabase";
import type { ClientPortalData } from "@/types/client-portal";

const storageKey = "centrix-client-portal-data-v1";

function readLocal(): ClientPortalData {
  if (typeof window === "undefined") return clientPortalFallbackData;
  const local = window.localStorage.getItem(storageKey);
  return local ? JSON.parse(local) : clientPortalFallbackData;
}

function writeLocal(data: ClientPortalData) {
  if (typeof window !== "undefined") window.localStorage.setItem(storageKey, JSON.stringify(data));
}

export async function loadClientPortalData(): Promise<{ data: ClientPortalData; mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: readLocal(), mode: "local" };
  const [portals, projects, documents, messages, notifications, appointments, signatures, activityLogs] = await Promise.all([
    supabase.from("client_portals").select("*"),
    supabase.from("client_projects").select("*"),
    supabase.from("client_documents").select("*").order("createdAt", { ascending: false }),
    supabase.from("client_messages").select("*").order("createdAt", { ascending: true }),
    supabase.from("client_notifications").select("*").order("createdAt", { ascending: false }),
    supabase.from("client_appointments").select("*").order("startsAt", { ascending: true }),
    supabase.from("client_signatures").select("*").order("requestedAt", { ascending: false }),
    supabase.from("client_activity_logs").select("*").order("createdAt", { ascending: false })
  ]);
  if ([portals, projects, documents, messages, notifications, appointments, signatures, activityLogs].some((result) => result.error)) return { data: readLocal(), mode: "local" };
  return { data: { portals: portals.data ?? [], invoices: readLocal().invoices, projects: projects.data ?? [], documents: documents.data ?? [], messages: messages.data ?? [], notifications: notifications.data ?? [], appointments: appointments.data ?? [], signatures: signatures.data ?? [], activityLogs: activityLogs.data ?? [] }, mode: "supabase" };
}

export async function saveClientPortalData(data: ClientPortalData) {
  writeLocal(data);
}

export async function syncClientPortalData(data: ClientPortalData) {
  writeLocal(data);
  const supabase = getSupabaseClient();
  if (!supabase) return { mode: "local" as const };
  const results = await Promise.all([
    ...data.portals.map((row) => supabase.from("client_portals").upsert(row, { onConflict: "id" })),
    ...data.projects.map((row) => supabase.from("client_projects").upsert(row, { onConflict: "id" })),
    ...data.documents.map((row) => supabase.from("client_documents").upsert(row, { onConflict: "id" })),
    ...data.messages.map((row) => supabase.from("client_messages").upsert(row, { onConflict: "id" })),
    ...data.notifications.map((row) => supabase.from("client_notifications").upsert(row, { onConflict: "id" })),
    ...data.appointments.map((row) => supabase.from("client_appointments").upsert(row, { onConflict: "id" })),
    ...data.signatures.map((row) => supabase.from("client_signatures").upsert(row, { onConflict: "id" })),
    ...data.activityLogs.map((row) => supabase.from("client_activity_logs").upsert(row, { onConflict: "id" }))
  ]);
  return getSupabaseSyncResult(results);
}
