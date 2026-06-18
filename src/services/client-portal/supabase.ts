import { getSupabaseSyncResult } from "@/services/supabaseSync";
import { clientPortalFallbackData } from "@/data/clientPortal";
import { getSupabaseClient } from "@/lib/supabase";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";
import type { ClientPortalData } from "@/types/client-portal";

function readLocal(): ClientPortalData {
  if (typeof window === "undefined") return clientPortalFallbackData;
  return clientPortalFallbackData;
}

function writeLocal(data: ClientPortalData) {
  void data;
}

export async function loadClientPortalData(): Promise<{ data: ClientPortalData; mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: readLocal(), mode: "local" };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { data: readLocal(), mode: "local" };

  const [portals, invoices, projects, documents, messages, notifications, appointments, signatures, activityLogs] = await Promise.all([
    supabase.from("client_portals").select("*").eq("workspace_id", workspace.workspaceId),
    supabase.from("client_invoices").select("*").eq("workspace_id", workspace.workspaceId).order("dueAt", { ascending: true }),
    supabase.from("client_projects").select("*").eq("workspace_id", workspace.workspaceId),
    supabase.from("client_documents").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false }),
    supabase.from("client_messages").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: true }),
    supabase.from("client_notifications").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false }),
    supabase.from("client_appointments").select("*").eq("workspace_id", workspace.workspaceId).order("startsAt", { ascending: true }),
    supabase.from("client_signatures").select("*").eq("workspace_id", workspace.workspaceId).order("requestedAt", { ascending: false }),
    supabase.from("client_activity_logs").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false })
  ]);
  if ([portals, invoices, projects, documents, messages, notifications, appointments, signatures, activityLogs].some((result) => result.error)) return { data: readLocal(), mode: "local" };
  if (!portals.data?.length && !invoices.data?.length && !projects.data?.length) return { data: readLocal(), mode: "supabase" };

  return {
    data: {
      portals: portals.data ?? [],
      invoices: invoices.data ?? [],
      projects: projects.data ?? [],
      documents: documents.data ?? [],
      messages: messages.data ?? [],
      notifications: notifications.data ?? [],
      appointments: appointments.data ?? [],
      signatures: signatures.data ?? [],
      activityLogs: activityLogs.data ?? []
    },
    mode: "supabase"
  };
}

export async function saveClientPortalData(data: ClientPortalData) {
  writeLocal(data);
}

export async function syncClientPortalData(data: ClientPortalData) {
  writeLocal(data);
  const supabase = getSupabaseClient();
  if (!supabase) return { mode: "local" as const };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { mode: "local" as const };
  const withWorkspace = <T extends object>(row: T) => ({ ...row, workspace_id: workspace.workspaceId });

  const results = await Promise.all([
    ...data.portals.map((row) => supabase.from("client_portals").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.invoices.map((row) => supabase.from("client_invoices").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.projects.map((row) => supabase.from("client_projects").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.documents.map((row) => supabase.from("client_documents").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.messages.map((row) => supabase.from("client_messages").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.notifications.map((row) => supabase.from("client_notifications").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.appointments.map((row) => supabase.from("client_appointments").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.signatures.map((row) => supabase.from("client_signatures").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.activityLogs.map((row) => supabase.from("client_activity_logs").upsert(withWorkspace(row), { onConflict: "id" }))
  ]);
  return getSupabaseSyncResult(results);
}
