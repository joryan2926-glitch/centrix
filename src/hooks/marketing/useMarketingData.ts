"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { marketingFallbackData } from "@/data/marketing";
import { getSupabaseClient } from "@/lib/supabase";
import { loadMarketingData, saveMarketingData, syncMarketingData } from "@/services/marketing/supabase";
import type { MarketingData } from "@/types/marketing";

type Toast = { title: string; detail: string };

export function useMarketingData() {
  const [data, setData] = useState<MarketingData>(marketingFallbackData);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"local" | "supabase">("local");
  const [toast, setToast] = useState<Toast | null>(null);

  const notify = useCallback((title: string, detail: string) => {
    setToast({ title, detail });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const refresh = useCallback(async () => {
    const result = await loadMarketingData();
    setData(result.data);
    setMode(result.mode);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase || mode !== "supabase") return;

    const channel = supabase
      .channel("centrix-marketing-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "marketing_social_accounts" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "marketing_posts" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "marketing_campaigns" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "marketing_media_assets" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "marketing_activities" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "marketing_reports" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "social_publication_logs" }, () => refresh())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mode, refresh]);

  const mutate = useCallback(
    (updater: (current: MarketingData) => MarketingData, message?: Toast) => {
      setData((current) => {
        const next = updater(current);
        saveMarketingData(next);
        if (mode === "supabase") syncMarketingData(next).then((result) => setMode(result.mode));
        return next;
      });
      if (message) notify(message.title, message.detail);
    },
    [mode, notify]
  );

  const sync = useCallback(async () => {
    const result = await syncMarketingData(data);
    setMode(result.mode);
    notify(result.mode === "supabase" ? "Marketing synchronise" : "Sauvegarde locale", "Les donnees marketing sont a jour.");
  }, [data, notify]);

  return useMemo(() => ({ data, loading, mode, toast, mutate, notify, refresh, sync }), [data, loading, mode, toast, mutate, notify, refresh, sync]);
}
