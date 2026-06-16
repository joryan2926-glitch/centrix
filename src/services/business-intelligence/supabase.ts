import { getSupabaseSyncResult } from "@/services/supabaseSync";
import { businessIntelligenceFallbackData } from "@/data/businessIntelligence";
import { getSupabaseClient } from "@/lib/supabase";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";
import type { BusinessIntelligenceData } from "@/types/business-intelligence";

const storageKey = "centrix-business-intelligence-data-v1";

function readLocal(): BusinessIntelligenceData {
  if (typeof window === "undefined") return businessIntelligenceFallbackData;
  const local = window.localStorage.getItem(storageKey);
  return local ? JSON.parse(local) : businessIntelligenceFallbackData;
}

function writeLocal(data: BusinessIntelligenceData) {
  if (typeof window !== "undefined") window.localStorage.setItem(storageKey, JSON.stringify(data));
}

export async function loadBusinessIntelligenceData(): Promise<{ data: BusinessIntelligenceData; mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: readLocal(), mode: "local" };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { data: readLocal(), mode: "local" };

  const [reports, predictiveMetrics, insights, scores, goals, alerts, performanceMetrics, models, exports] = await Promise.all([
    supabase.from("business_reports").select("*").eq("workspace_id", workspace.workspaceId).order("generatedAt", { ascending: false }),
    supabase.from("predictive_metrics").select("*").eq("workspace_id", workspace.workspaceId),
    supabase.from("ai_insights").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false }),
    supabase.from("business_scores").select("*").eq("workspace_id", workspace.workspaceId).order("rank", { ascending: true }),
    supabase.from("company_goals").select("*").eq("workspace_id", workspace.workspaceId),
    supabase.from("analytics_alerts").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false }),
    supabase.from("performance_metrics").select("*").eq("workspace_id", workspace.workspaceId),
    supabase.from("predictive_models").select("*").eq("workspace_id", workspace.workspaceId),
    supabase.from("analytics_exports").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false })
  ]);
  if ([reports, predictiveMetrics, insights, scores, goals, alerts, performanceMetrics, models, exports].some((result) => result.error)) return { data: readLocal(), mode: "local" };
  if (!reports.data?.length && !predictiveMetrics.data?.length && !insights.data?.length) return { data: readLocal(), mode: "supabase" };

  return {
    data: {
      reports: reports.data ?? [],
      predictiveMetrics: predictiveMetrics.data ?? [],
      insights: insights.data ?? [],
      scores: scores.data ?? [],
      goals: goals.data ?? [],
      alerts: alerts.data ?? [],
      performanceMetrics: performanceMetrics.data ?? [],
      models: models.data ?? [],
      exports: exports.data ?? []
    },
    mode: "supabase"
  };
}

export async function saveBusinessIntelligenceData(data: BusinessIntelligenceData) {
  writeLocal(data);
}

export async function syncBusinessIntelligenceData(data: BusinessIntelligenceData) {
  writeLocal(data);
  const supabase = getSupabaseClient();
  if (!supabase) return { mode: "local" as const };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { mode: "local" as const };
  const withWorkspace = <T extends object>(row: T) => ({ ...row, workspace_id: workspace.workspaceId });

  const results = await Promise.all([
    ...data.reports.map((row) => supabase.from("business_reports").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.predictiveMetrics.map((row) => supabase.from("predictive_metrics").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.insights.map((row) => supabase.from("ai_insights").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.scores.map((row) => supabase.from("business_scores").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.goals.map((row) => supabase.from("company_goals").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.alerts.map((row) => supabase.from("analytics_alerts").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.performanceMetrics.map((row) => supabase.from("performance_metrics").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.models.map((row) => supabase.from("predictive_models").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.exports.map((row) => supabase.from("analytics_exports").upsert(withWorkspace(row), { onConflict: "id" }))
  ]);
  return getSupabaseSyncResult(results);
}
