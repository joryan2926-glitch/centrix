import { getSupabaseSyncResult } from "@/services/supabaseSync";
import { salesFallbackData } from "@/data/sales";
import { getSupabaseClient } from "@/lib/supabase";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";
import type { SalesData } from "@/types/sales";

function readLocal(): SalesData {
  if (typeof window === "undefined") return salesFallbackData;
  return salesFallbackData;
}

function writeLocal(data: SalesData) {
  void data;
}

export async function loadSalesData(): Promise<{ data: SalesData; mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: readLocal(), mode: "local" };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { data: readLocal(), mode: "local" };

  const [leads, pipeline, opportunities, activities, notes, quotes, targets, notifications, teams] = await Promise.all([
    supabase.from("sales_leads").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false }),
    supabase.from("sales_pipeline").select("*").eq("workspace_id", workspace.workspaceId).order("order", { ascending: true }),
    supabase.from("sales_opportunities").select("*").eq("workspace_id", workspace.workspaceId).order("deadline", { ascending: true }),
    supabase.from("sales_activities").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false }),
    supabase.from("sales_notes").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false }),
    supabase.from("sales_quotes").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false }),
    supabase.from("sales_targets").select("*").eq("workspace_id", workspace.workspaceId),
    supabase.from("sales_notifications").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false }),
    supabase.from("sales_teams").select("*").eq("workspace_id", workspace.workspaceId)
  ]);
  if ([leads, pipeline, opportunities, activities, notes, quotes, targets, notifications, teams].some((result) => result.error)) return { data: readLocal(), mode: "local" };
  if (!leads.data?.length && !pipeline.data?.length && !teams.data?.length) return { data: readLocal(), mode: "supabase" };

  return { data: { leads: leads.data ?? [], pipeline: pipeline.data ?? [], opportunities: opportunities.data ?? [], activities: activities.data ?? [], notes: notes.data ?? [], quotes: quotes.data ?? [], targets: targets.data ?? [], notifications: notifications.data ?? [], teams: teams.data ?? [] }, mode: "supabase" };
}

export async function saveSalesData(data: SalesData) {
  writeLocal(data);
}

export async function syncSalesData(data: SalesData) {
  writeLocal(data);
  const supabase = getSupabaseClient();
  if (!supabase) return { mode: "local" as const };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { mode: "local" as const };
  const withWorkspace = <T extends object>(row: T) => ({ ...row, workspace_id: workspace.workspaceId });

  const results = await Promise.all([
    ...data.teams.map((row) => supabase.from("sales_teams").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.pipeline.map((row) => supabase.from("sales_pipeline").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.leads.map((row) => supabase.from("sales_leads").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.opportunities.map((row) => supabase.from("sales_opportunities").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.activities.map((row) => supabase.from("sales_activities").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.notes.map((row) => supabase.from("sales_notes").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.quotes.map((row) => supabase.from("sales_quotes").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.targets.map((row) => supabase.from("sales_targets").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.notifications.map((row) => supabase.from("sales_notifications").upsert(withWorkspace(row), { onConflict: "id" }))
  ]);
  return getSupabaseSyncResult(results);
}
