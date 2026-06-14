"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { saasCoreFallbackDashboard } from "@/data/saasCore";
import { getSupabaseClient } from "@/lib/supabase";
import { loadDataPlatformDashboard } from "@/services/data-platform/dashboard";
import { syncSaasCoreDashboard } from "@/services/saas-core/supabase";
import type { PlatformDashboardSnapshot } from "@/types/data-platform";
import type { SaasCoreDashboard } from "@/types/saas-core";

type Toast = { title: string; detail: string };

const demoSnapshot: PlatformDashboardSnapshot = {
  cashflow: 41800,
  cashflowSeries: [
    { label: "Jan", value: 17 },
    { label: "Fev", value: 21 },
    { label: "Mar", value: 22 },
    { label: "Avr", value: 29 },
    { label: "Mai", value: 33 },
    { label: "Juin", value: 43 }
  ],
  clientsCount: 128,
  conversionRate: 28.6,
  forecastRevenue: 118400,
  forecastSeries: [
    { label: "Jan", value: 48 },
    { label: "Fev", value: 54 },
    { label: "Mar", value: 61 },
    { label: "Avr", value: 74 },
    { label: "Mai", value: 88 },
    { label: "Juin", value: 104 }
  ],
  growthRate: 18.4,
  invoicesPending: 7,
  invoicesTotal: 84200,
  leadSeries: [
    { label: "Jan", value: 74 },
    { label: "Fev", value: 82 },
    { label: "Mar", value: 96 },
    { label: "Avr", value: 118 },
    { label: "Mai", value: 142 },
    { label: "Juin", value: 168 }
  ],
  meetingsUpcoming: 5,
  monthlyRevenue: 84200,
  paidRevenue: 72400,
  pendingQuotes: 4,
  profitability: 74,
  projectsActive: 12,
  prospectsCount: 46,
  quotesTotal: 138000,
  recentActivity: [
    { id: "demo-act-1", module: "crm", title: "Nouveau client ajoute", detail: "NovaCore a ete ajoute au pipeline commercial.", createdAt: new Date().toISOString() },
    { id: "demo-act-2", module: "billing", title: "Paiement recu", detail: "Facture premium reglee pour 12 400 EUR.", createdAt: new Date().toISOString() },
    { id: "demo-act-3", module: "automation", title: "Workflow execute", detail: "Relance automatique envoyee aux devis ouverts.", createdAt: new Date().toISOString() }
  ],
  revenueSeries: [
    { label: "Jan", value: 42 },
    { label: "Fev", value: 48 },
    { label: "Mar", value: 51 },
    { label: "Avr", value: 63 },
    { label: "Mai", value: 71 },
    { label: "Juin", value: 84 }
  ],
  supportOpen: 6,
  tasksOpen: 18,
  unreadNotifications: 5,
  unpaidInvoices: 3,
  urgentTasks: 4,
  workspace: {
    role: "admin",
    userId: "admin",
    workspaceId: "demo",
    workspaceName: "CENTRIX SAS"
  }
};

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
    try {
      const result = await loadDataPlatformDashboard();
      setData(result.data);
      setSnapshot(result.snapshot);
      setMode(result.mode);
    } catch (error) {
      console.warn("[CENTRIX_DASHBOARD_FALLBACK]", error);
      setData(saasCoreFallbackDashboard);
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
      snapshot: snapshot ?? demoSnapshot,
      sync,
      toast
    }),
    [data, loading, mode, mutate, refresh, snapshot, sync, toast]
  );
}
