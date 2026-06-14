import { getSupabaseSyncResult } from "@/services/supabaseSync";
import { salesFallbackData } from "@/data/sales";
import { getSupabaseClient } from "@/lib/supabase";
import type { SalesData } from "@/types/sales";

const storageKey = "centrix-sales-data-v1";

function readLocal(): SalesData {
  if (typeof window === "undefined") return salesFallbackData;
  const local = window.localStorage.getItem(storageKey);
  return local ? JSON.parse(local) : salesFallbackData;
}

function writeLocal(data: SalesData) {
  if (typeof window !== "undefined") window.localStorage.setItem(storageKey, JSON.stringify(data));
}

export async function loadSalesData(): Promise<{ data: SalesData; mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: readLocal(), mode: "local" };
  const [leads, pipeline, opportunities, activities, notes, quotes, targets, notifications, teams] = await Promise.all([
    supabase.from("sales_leads").select("*").order("createdAt", { ascending: false }),
    supabase.from("sales_pipeline").select("*").order("order", { ascending: true }),
    supabase.from("sales_opportunities").select("*").order("deadline", { ascending: true }),
    supabase.from("sales_activities").select("*").order("createdAt", { ascending: false }),
    supabase.from("sales_notes").select("*").order("createdAt", { ascending: false }),
    supabase.from("sales_quotes").select("*").order("createdAt", { ascending: false }),
    supabase.from("sales_targets").select("*"),
    supabase.from("sales_notifications").select("*").order("createdAt", { ascending: false }),
    supabase.from("sales_teams").select("*")
  ]);
  if ([leads, pipeline, opportunities, activities, notes, quotes, targets, notifications, teams].some((result) => result.error)) return { data: readLocal(), mode: "local" };
  return { data: { leads: leads.data ?? [], pipeline: pipeline.data ?? [], opportunities: opportunities.data ?? [], activities: activities.data ?? [], notes: notes.data ?? [], quotes: quotes.data ?? [], targets: targets.data ?? [], notifications: notifications.data ?? [], teams: teams.data ?? [] }, mode: "supabase" };
}

export async function saveSalesData(data: SalesData) {
  writeLocal(data);
}

export async function syncSalesData(data: SalesData) {
  writeLocal(data);
  const supabase = getSupabaseClient();
  if (!supabase) return { mode: "local" as const };
  const results = await Promise.all([
    ...data.leads.map((row) => supabase.from("sales_leads").upsert(row, { onConflict: "id" })),
    ...data.pipeline.map((row) => supabase.from("sales_pipeline").upsert(row, { onConflict: "id" })),
    ...data.opportunities.map((row) => supabase.from("sales_opportunities").upsert(row, { onConflict: "id" })),
    ...data.activities.map((row) => supabase.from("sales_activities").upsert(row, { onConflict: "id" })),
    ...data.notes.map((row) => supabase.from("sales_notes").upsert(row, { onConflict: "id" })),
    ...data.quotes.map((row) => supabase.from("sales_quotes").upsert(row, { onConflict: "id" })),
    ...data.targets.map((row) => supabase.from("sales_targets").upsert(row, { onConflict: "id" })),
    ...data.notifications.map((row) => supabase.from("sales_notifications").upsert(row, { onConflict: "id" })),
    ...data.teams.map((row) => supabase.from("sales_teams").upsert(row, { onConflict: "id" }))
  ]);
  return getSupabaseSyncResult(results);
}
