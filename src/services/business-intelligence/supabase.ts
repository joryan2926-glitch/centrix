import { businessIntelligenceFallbackData } from "@/data/businessIntelligence";
import { getSupabaseClient } from "@/lib/supabase";
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
  const [reports, predictiveMetrics, insights, scores, goals, alerts, performanceMetrics, models, exports] = await Promise.all([
    supabase.from("business_reports").select("*").order("generatedAt", { ascending: false }),
    supabase.from("predictive_metrics").select("*"),
    supabase.from("ai_insights").select("*").order("createdAt", { ascending: false }),
    supabase.from("business_scores").select("*").order("rank", { ascending: true }),
    supabase.from("company_goals").select("*"),
    supabase.from("analytics_alerts").select("*").order("createdAt", { ascending: false }),
    supabase.from("performance_metrics").select("*"),
    supabase.from("predictive_models").select("*"),
    supabase.from("analytics_exports").select("*").order("createdAt", { ascending: false })
  ]);
  if ([reports, predictiveMetrics, insights, scores, goals, alerts, performanceMetrics, models, exports].some((result) => result.error)) return { data: readLocal(), mode: "local" };
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
  await Promise.all([
    ...data.reports.map((row) => supabase.from("business_reports").upsert(row, { onConflict: "id" })),
    ...data.predictiveMetrics.map((row) => supabase.from("predictive_metrics").upsert(row, { onConflict: "id" })),
    ...data.insights.map((row) => supabase.from("ai_insights").upsert(row, { onConflict: "id" })),
    ...data.scores.map((row) => supabase.from("business_scores").upsert(row, { onConflict: "id" })),
    ...data.goals.map((row) => supabase.from("company_goals").upsert(row, { onConflict: "id" })),
    ...data.alerts.map((row) => supabase.from("analytics_alerts").upsert(row, { onConflict: "id" })),
    ...data.performanceMetrics.map((row) => supabase.from("performance_metrics").upsert(row, { onConflict: "id" })),
    ...data.models.map((row) => supabase.from("predictive_models").upsert(row, { onConflict: "id" })),
    ...data.exports.map((row) => supabase.from("analytics_exports").upsert(row, { onConflict: "id" }))
  ]);
  return { mode: "supabase" as const };
}
