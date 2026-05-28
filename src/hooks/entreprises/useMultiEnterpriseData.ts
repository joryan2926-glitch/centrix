"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { multiEnterpriseFallbackData } from "@/data/entreprises";
import { getSupabaseClient } from "@/lib/supabase";
import { loadMultiEnterpriseData, saveMultiEnterpriseData, syncMultiEnterpriseData } from "@/services/entreprises/supabase";
import type { MultiEnterpriseData } from "@/types/entreprises";

type Toast = { title: string; detail: string };

const realtimeTables = [
  "enterprise_companies",
  "enterprise_workspaces",
  "franchise_units",
  "enterprise_users",
  "enterprise_teams",
  "permission_policies",
  "enterprise_activities",
  "consolidated_metrics"
];

export function useMultiEnterpriseData() {
  const [data, setData] = useState<MultiEnterpriseData>(multiEnterpriseFallbackData);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"local" | "supabase">("local");
  const [toast, setToast] = useState<Toast | null>(null);

  const notify = useCallback((title: string, detail: string) => {
    setToast({ title, detail });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const refresh = useCallback(async () => {
    const result = await loadMultiEnterpriseData();
    setData(result.data);
    setMode(result.mode);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const channel = supabase.channel("centrix-multi-enterprise-realtime");
    realtimeTables.forEach((table) => {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, () => refresh());
    });
    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const mutate = useCallback(
    (updater: (current: MultiEnterpriseData) => MultiEnterpriseData, message?: Toast) => {
      setData((current) => {
        const next = updater(current);
        saveMultiEnterpriseData(next);
        if (mode === "supabase") syncMultiEnterpriseData(next).then((result) => setMode(result.mode));
        return next;
      });
      if (message) notify(message.title, message.detail);
    },
    [mode, notify]
  );

  const sync = useCallback(async () => {
    const result = await syncMultiEnterpriseData(data);
    setMode(result.mode);
    notify(result.mode === "supabase" ? "Multi-entreprises synchronise" : "Sauvegarde locale", "Les workspaces et franchises sont a jour.");
  }, [data, notify]);

  return useMemo(() => ({ data, loading, mode, toast, mutate, sync, notify }), [data, loading, mode, toast, mutate, sync, notify]);
}
