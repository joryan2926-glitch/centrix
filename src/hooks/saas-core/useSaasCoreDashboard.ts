"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { saasCoreFallbackDashboard } from "@/data/saasCore";
import { getSupabaseClient } from "@/lib/supabase";
import { loadDataPlatformDashboard } from "@/services/data-platform/dashboard";
import { loadSaasCoreDashboard, saveSaasCoreDashboard, syncSaasCoreDashboard } from "@/services/saas-core/supabase";
import type { PlatformDashboardSnapshot } from "@/types/data-platform";
import type { SaasCoreDashboard } from "@/types/saas-core";

type Toast = { title: string; detail: string };

export function useSaasCoreDashboard() {
  const [data, setData] = useState<SaasCoreDashboard>(saasCoreFallbackDashboard);
  const [snapshot, setSnapshot] = useState<PlatformDashboardSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"local" | "supabase">("local");
  const [toast, setToast] = useState<Toast | null>(null);

  const notify = useCallback((title: string, detail: string) => {
    setToast({ title, detail });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const refresh = useCallback(async () => {
    const platformResult = await loadDataPlatformDashboard();
    if (platformResult.mode === "supabase") {
      setData(platformResult.data);
      setSnapshot(platformResult.snapshot);
      setMode("supabase");
      return;
    }

    const legacyResult = await loadSaasCoreDashboard();
    setData(legacyResult.data);
    setSnapshot(null);
    setMode(legacyResult.mode);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const channel = supabase
      .channel("centrix-saas-core-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "clients" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "prospects" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "quotes" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "invoices" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "meetings" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "support_tickets" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "analytics" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "dashboard_metrics" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "dashboard_analytics" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "module_events" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "module_tasks" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "module_connections" }, () => refresh())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const mutate = useCallback(
    (updater: (current: SaasCoreDashboard) => SaasCoreDashboard, message?: Toast) => {
      setData((current) => {
        const next = updater(current);
        saveSaasCoreDashboard(next);
        return next;
      });
      if (message) notify(message.title, message.detail);
    },
    [notify]
  );

  const sync = useCallback(async () => {
    const result = await syncSaasCoreDashboard(data);
    setMode(result.mode);
    notify(result.mode === "supabase" ? "Socle SaaS synchronise" : "Mode local actif", "Dashboard, evenements et connexions modules sont a jour.");
  }, [data, notify]);

  return useMemo(() => ({ data, snapshot, loading, mode, toast, mutate, refresh, sync }), [data, snapshot, loading, mode, toast, mutate, refresh, sync]);
}
