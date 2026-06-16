"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { saasBillingFallbackData } from "@/data/billingSaas";
import { getSupabaseClient } from "@/lib/supabase";
import { loadSaaSBillingData, saveSaaSBillingData, syncSaaSBillingData } from "@/services/billingSaasSupabase";
import type { SaaSBillingData } from "@/types/billing";

type Toast = { title: string; detail: string };

const realtimeTables = [
  "subscriptions",
  "subscription_plans",
  "billing_customers",
  "invoices",
  "payments",
  "coupons",
  "usage_limits",
  "billing_notifications",
  "stripe_events"
];

export function useSaaSBillingData() {
  const [data, setData] = useState<SaaSBillingData>(saasBillingFallbackData);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"local" | "supabase">("local");
  const [toast, setToast] = useState<Toast | null>(null);

  const notify = useCallback((title: string, detail: string) => {
    setToast({ title, detail });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const refresh = useCallback(async () => {
    const result = await loadSaaSBillingData();
    setData(result.data);
    setMode(result.mode);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const channel = supabase.channel("centrix-saas-billing-realtime");
    realtimeTables.forEach((table) => {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, () => refresh());
    });
    channel.subscribe((status) => {
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") setMode("local");
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const mutate = useCallback(
    (updater: (current: SaaSBillingData) => SaaSBillingData, message?: Toast) => {
      setData((current) => {
        const next = updater(current);
        saveSaaSBillingData(next);
        if (mode === "supabase") syncSaaSBillingData(next).then((result) => setMode(result.mode));
        return next;
      });
      if (message) notify(message.title, message.detail);
    },
    [mode, notify]
  );

  const sync = useCallback(async () => {
    const result = await syncSaaSBillingData(data);
    setMode(result.mode);
    notify(result.mode === "supabase" ? "Billing synchronise" : "Sauvegarde locale", "Les donnees abonnements et Stripe sont a jour.");
  }, [data, notify]);

  return useMemo(() => ({ data, loading, mode, toast, mutate, sync, notify, refresh }), [data, loading, mode, toast, mutate, sync, notify, refresh]);
}
