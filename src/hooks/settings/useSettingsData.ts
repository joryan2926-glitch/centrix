"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { settingsFallbackData } from "@/data/settings";
import { getSupabaseClient } from "@/lib/supabase";
import { loadSettingsData, saveSettingsData, syncSettingsData } from "@/services/settings/supabase";
import type { SettingsData } from "@/types/settings";

type Toast = { title: string; detail: string };

const realtimeTables = [
  "user_settings",
  "company_settings",
  "subscriptions",
  "user_roles",
  "activity_logs",
  "security_logs",
  "notifications",
  "module_settings",
  "billing_history"
];

export function useSettingsData() {
  const [data, setData] = useState<SettingsData>(settingsFallbackData);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"local" | "supabase">("local");
  const [toast, setToast] = useState<Toast | null>(null);

  const notify = useCallback((title: string, detail: string) => {
    setToast({ title, detail });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const refresh = useCallback(async () => {
    const result = await loadSettingsData();
    setData(result.data);
    setMode(result.mode);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const channel = supabase.channel("centrix-settings-realtime");
    realtimeTables.forEach((table) => {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, () => refresh());
    });
    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const mutate = useCallback(
    (updater: (current: SettingsData) => SettingsData, message?: Toast) => {
      setData((current) => {
        const next = updater(current);
        saveSettingsData(next);
        if (mode === "supabase") syncSettingsData(next).then((result) => setMode(result.mode));
        return next;
      });
      if (message) notify(message.title, message.detail);
    },
    [mode, notify]
  );

  const sync = useCallback(async () => {
    const result = await syncSettingsData(data);
    setMode(result.mode);
    notify(result.mode === "supabase" ? "Administration synchronisee" : "Sauvegarde locale", "Les parametres SaaS sont a jour.");
  }, [data, notify]);

  return useMemo(() => ({ data, loading, mode, toast, mutate, sync, notify }), [data, loading, mode, toast, mutate, sync, notify]);
}
