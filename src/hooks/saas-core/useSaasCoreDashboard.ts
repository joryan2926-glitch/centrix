"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { centrixModules } from "@/data/saasCore";
import { getSupabaseClient } from "@/lib/supabase";
import { loadDataPlatformDashboard } from "@/services/data-platform/dashboard";
import { syncSaasCoreDashboard } from "@/services/saas-core/supabase";
import type { PlatformDashboardSnapshot } from "@/types/data-platform";
import type { SaasCoreDashboard } from "@/types/saas-core";

type Toast = { title: string; detail: string };

const emptyDashboard: SaasCoreDashboard = {
  analytics: [],
  connections: [],
  events: [],
  metrics: [
    { label: "Chiffre d'affaires", value: "0 EUR", delta: "+0.0% croissance", tone: "emerald" },
    { label: "Revenus mensuels", value: "0 EUR", delta: "0 impayee(s)", tone: "cyan" },
    { label: "Clients actifs", value: "0", delta: "0.0% conversion", tone: "violet" },
    { label: "Taches urgentes", value: "0", delta: "0 devis en attente", tone: "rose" }
  ],
  modules: centrixModules,
  tasks: []
};

export function useSaasCoreDashboard() {
  const [data, setData] = useState<SaasCoreDashboard>(emptyDashboard);
  const [snapshot, setSnapshot] = useState<PlatformDashboardSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"local" | "supabase">("local");
  const [toast, setToast] = useState<Toast | null>(null);

  const notify = useCallback((title: string, detail: string) => {
    setToast({ title, detail });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const result = await loadDataPlatformDashboard();
      setData(result.data);
      setSnapshot(result.snapshot);
      setMode(result.mode);
    } catch (error) {
      console.warn("[CENTRIX_DASHBOARD_SUPABASE_ERROR]", error);
      setData(emptyDashboard);
      setSnapshot(null);
      setMode("local");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase || mode !== "supabase") return undefined;

    let channel;
    try {
      channel = supabase
        .channel("centrix-dashboard-realtime")
        .on("postgres_changes", { event: "*", schema: "public", table: "clients" }, () => void refresh())
        .on("postgres_changes", { event: "*", schema: "public", table: "invoices" }, () => void refresh())
        .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, () => void refresh())
        .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => void refresh())
        .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => void refresh())
        .subscribe();
    } catch (error) {
      console.warn("[CENTRIX_DASHBOARD_REALTIME_DISABLED]", error);
      return undefined;
    }

    return () => {
      if (channel) void supabase.removeChannel(channel).catch(() => undefined);
    };
  }, [mode, refresh]);

  const mutate = useCallback(
    (updater: (current: SaasCoreDashboard) => SaasCoreDashboard, message?: Toast) => {
      setData((current) => updater(current));
      if (message) notify(message.title, message.detail);
    },
    [notify]
  );

  const sync = useCallback(async () => {
    const result = await syncSaasCoreDashboard(data);
    setMode(result.mode);
    notify(result.mode === "supabase" ? "Dashboard synchronise" : "Synchronisation indisponible", result.mode === "supabase" ? "Les widgets CENTRIX sont synchronises avec Supabase." : "Reconnectez-vous pour synchroniser le dashboard.");
  }, [data, notify]);

  return useMemo(
    () => ({
      data,
      loading,
      mode,
      mutate,
      refresh,
      snapshot,
      sync,
      toast
    }),
    [data, loading, mode, mutate, refresh, snapshot, sync, toast]
  );
}
