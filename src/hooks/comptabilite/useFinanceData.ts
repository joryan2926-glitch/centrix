"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { financeFallbackData } from "@/data/comptabilite";
import { getSupabaseClient } from "@/lib/supabase";
import { loadFinanceData, saveFinanceData, syncFinanceData } from "@/services/comptabilite/supabase";
import type { FinanceData } from "@/types/comptabilite";

type Toast = { title: string; detail: string };

export function useFinanceData() {
  const [data, setData] = useState<FinanceData>(financeFallbackData);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"local" | "supabase">("local");
  const [toast, setToast] = useState<Toast | null>(null);

  const notify = useCallback((title: string, detail: string) => {
    setToast({ title, detail });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const refresh = useCallback(async () => {
    const result = await loadFinanceData();
    setData(result.data);
    setMode(result.mode);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const channel = supabase
      .channel("centrix-finance-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "bank_accounts" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "accounting_entries" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "tax_records" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "financial_reports" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "financial_settings" }, () => refresh())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const mutate = useCallback(
    (updater: (current: FinanceData) => FinanceData, message?: Toast) => {
      setData((current) => {
        const next = updater(current);
        saveFinanceData(next);
        if (mode === "supabase") syncFinanceData(next).then((result) => setMode(result.mode));
        return next;
      });
      if (message) notify(message.title, message.detail);
    },
    [mode, notify]
  );

  const sync = useCallback(async () => {
    const result = await syncFinanceData(data);
    setMode(result.mode);
    notify(result.mode === "supabase" ? "Finance synchronisee" : "Sauvegarde locale", "Les donnees comptables sont a jour.");
  }, [data, notify]);

  return useMemo(() => ({ data, loading, mode, toast, mutate, notify, refresh, sync }), [data, loading, mode, toast, mutate, notify, refresh, sync]);
}
