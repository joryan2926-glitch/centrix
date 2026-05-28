"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { salesFallbackData } from "@/data/sales";
import { getSupabaseClient } from "@/lib/supabase";
import { loadSalesData, saveSalesData, syncSalesData } from "@/services/sales/supabase";
import type { SalesData } from "@/types/sales";

type Toast = { title: string; detail: string };
const tables = ["sales_leads", "sales_pipeline", "sales_opportunities", "sales_activities", "sales_notes", "sales_quotes", "sales_targets", "sales_notifications", "sales_teams"];

export function useSalesData() {
  const [data, setData] = useState<SalesData>(salesFallbackData);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"local" | "supabase">("local");
  const [toast, setToast] = useState<Toast | null>(null);

  const notify = useCallback((title: string, detail: string) => {
    setToast({ title, detail });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const refresh = useCallback(async () => {
    const result = await loadSalesData();
    setData(result.data);
    setMode(result.mode);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const channel = supabase.channel("centrix-sales-realtime");
    tables.forEach((table) => channel.on("postgres_changes", { event: "*", schema: "public", table }, () => refresh()));
    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const mutate = useCallback((updater: (current: SalesData) => SalesData, message?: Toast) => {
    setData((current) => {
      const next = updater(current);
      saveSalesData(next);
      if (mode === "supabase") syncSalesData(next).then((result) => setMode(result.mode));
      return next;
    });
    if (message) notify(message.title, message.detail);
  }, [mode, notify]);

  const sync = useCallback(async () => {
    const result = await syncSalesData(data);
    setMode(result.mode);
    notify(result.mode === "supabase" ? "Sales synchronise" : "Sauvegarde locale", "Leads, pipeline et ventes sont a jour.");
  }, [data, notify]);

  return useMemo(() => ({ data, loading, mode, toast, mutate, sync, notify }), [data, loading, mode, toast, mutate, sync, notify]);
}
