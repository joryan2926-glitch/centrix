"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { businessIntelligenceFallbackData } from "@/data/businessIntelligence";
import { getSupabaseClient } from "@/lib/supabase";
import { loadBusinessIntelligenceData, saveBusinessIntelligenceData, syncBusinessIntelligenceData } from "@/services/business-intelligence/supabase";
import type { BusinessIntelligenceData } from "@/types/business-intelligence";

type Toast = { title: string; detail: string };
const tables = ["business_reports", "predictive_metrics", "ai_insights", "business_scores", "company_goals", "analytics_alerts", "performance_metrics", "predictive_models", "analytics_exports"];

export function useBusinessIntelligenceData() {
  const [data, setData] = useState<BusinessIntelligenceData>(businessIntelligenceFallbackData);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"local" | "supabase">("local");
  const [toast, setToast] = useState<Toast | null>(null);

  const notify = useCallback((title: string, detail: string) => {
    setToast({ title, detail });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const refresh = useCallback(async () => {
    const result = await loadBusinessIntelligenceData();
    setData(result.data);
    setMode(result.mode);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const channel = supabase.channel("centrix-business-intelligence-realtime");
    try {
      tables.forEach((table) => channel.on("postgres_changes", { event: "*", schema: "public", table }, () => refresh()));
      channel.subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          supabase.removeChannel(channel);
        }
      });
    } catch {
      supabase.removeChannel(channel);
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const mutate = useCallback((updater: (current: BusinessIntelligenceData) => BusinessIntelligenceData, message?: Toast) => {
    setData((current) => {
      const next = updater(current);
      saveBusinessIntelligenceData(next);
      if (mode === "supabase") syncBusinessIntelligenceData(next).then((result) => setMode(result.mode));
      return next;
    });
    if (message) notify(message.title, message.detail);
  }, [mode, notify]);

  const sync = useCallback(async () => {
    const result = await syncBusinessIntelligenceData(data);
    setMode(result.mode);
    notify(result.mode === "supabase" ? "BI synchronisee" : "Sauvegarde locale", "Rapports, predictions et insights sont a jour.");
  }, [data, notify]);

  return useMemo(() => ({ data, loading, mode, toast, mutate, sync, notify }), [data, loading, mode, toast, mutate, sync, notify]);
}
