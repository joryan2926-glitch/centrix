"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { marketplaceFallbackData } from "@/data/marketplace";
import { getSupabaseClient } from "@/lib/supabase";
import { loadMarketplaceData, saveMarketplaceData, syncMarketplaceData } from "@/services/marketplace/supabase";
import type { MarketplaceData } from "@/types/marketplace";

type Toast = { title: string; detail: string };
const tables = ["marketplace_services", "service_categories", "providers", "provider_reviews", "marketplace_orders", "order_messages", "payouts", "marketplace_notifications", "provider_portfolios"];

export function useMarketplaceData() {
  const [data, setData] = useState<MarketplaceData>(marketplaceFallbackData);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"local" | "supabase">("local");
  const [toast, setToast] = useState<Toast | null>(null);
  const notify = useCallback((title: string, detail: string) => {
    setToast({ title, detail });
    window.setTimeout(() => setToast(null), 3200);
  }, []);
  const refresh = useCallback(async () => {
    const result = await loadMarketplaceData();
    setData(result.data);
    setMode(result.mode);
  }, []);
  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const channel = supabase.channel("centrix-marketplace-realtime");
    tables.forEach((table) => channel.on("postgres_changes", { event: "*", schema: "public", table }, () => refresh()));
    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);
  const mutate = useCallback((updater: (current: MarketplaceData) => MarketplaceData, message?: Toast) => {
    setData((current) => {
      const next = updater(current);
      saveMarketplaceData(next);
      return next;
    });
    if (message) notify(message.title, message.detail);
  }, [notify]);
  const sync = useCallback(async () => {
    const result = await syncMarketplaceData(data);
    setMode(result.mode);
    notify(result.mode === "supabase" ? "Marketplace synchronisee" : "Sauvegarde locale", "Services, prestataires et commandes sont a jour.");
  }, [data, notify]);
  return useMemo(() => ({ data, loading, mode, toast, mutate, sync, notify }), [data, loading, mode, toast, mutate, sync, notify]);
}
