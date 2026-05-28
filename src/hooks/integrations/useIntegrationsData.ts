"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { integrationsFallbackData } from "@/data/integrations";
import { getSupabaseClient } from "@/lib/supabase";
import { loadIntegrationsData, saveIntegrationsData, syncIntegrationsData } from "@/services/integrations/supabase";
import type { IntegrationData } from "@/types/integrations";

type Toast = { title: string; detail: string };

const realtimeTables = ["api_keys", "api_logs", "webhooks", "webhook_logs", "integrations", "oauth_connections", "api_permissions", "api_rate_limits", "integration_notifications"];

export function useIntegrationsData() {
  const [data, setData] = useState<IntegrationData>(integrationsFallbackData);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"local" | "supabase">("local");
  const [toast, setToast] = useState<Toast | null>(null);

  const notify = useCallback((title: string, detail: string) => {
    setToast({ title, detail });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const refresh = useCallback(async () => {
    const result = await loadIntegrationsData();
    setData(result.data);
    setMode(result.mode);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const channel = supabase.channel("centrix-integrations-realtime");
    realtimeTables.forEach((table) => channel.on("postgres_changes", { event: "*", schema: "public", table }, () => refresh()));
    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const mutate = useCallback(
    (updater: (current: IntegrationData) => IntegrationData, message?: Toast) => {
      setData((current) => {
        const next = updater(current);
        saveIntegrationsData(next);
        if (mode === "supabase") syncIntegrationsData(next).then((result) => setMode(result.mode));
        return next;
      });
      if (message) notify(message.title, message.detail);
    },
    [mode, notify]
  );

  const sync = useCallback(async () => {
    const result = await syncIntegrationsData(data);
    setMode(result.mode);
    notify(result.mode === "supabase" ? "Integrations synchronisees" : "Sauvegarde locale", "Les API, webhooks et connexions sont a jour.");
  }, [data, notify]);

  return useMemo(() => ({ data, loading, mode, toast, mutate, sync, notify }), [data, loading, mode, toast, mutate, sync, notify]);
}
