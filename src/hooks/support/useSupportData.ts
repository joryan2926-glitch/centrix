"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supportFallbackData } from "@/data/support";
import { getSupabaseClient } from "@/lib/supabase";
import { loadSupportData, saveSupportData, syncSupportData } from "@/services/support/supabase";
import type { SupportData } from "@/types/support";

type Toast = { title: string; detail: string };

const realtimeTables = [
  "support_tickets",
  "support_messages",
  "support_comments",
  "support_agents",
  "support_categories",
  "support_articles",
  "support_feedback",
  "support_notifications"
];

export function useSupportData() {
  const [data, setData] = useState<SupportData>(supportFallbackData);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"local" | "supabase">("local");
  const [toast, setToast] = useState<Toast | null>(null);

  const notify = useCallback((title: string, detail: string) => {
    setToast({ title, detail });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const refresh = useCallback(async () => {
    const result = await loadSupportData();
    setData(result.data);
    setMode(result.mode);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const channel = supabase.channel("centrix-support-realtime");
    try {
      realtimeTables.forEach((table) => {
        channel.on("postgres_changes", { event: "*", schema: "public", table }, () => refresh());
      });
      channel.subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          supabase.removeChannel(channel);
        }
      });
    } catch {
      supabase.removeChannel(channel);
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const mutate = useCallback(
    (updater: (current: SupportData) => SupportData, message?: Toast) => {
      setData((current) => {
        const next = updater(current);
        saveSupportData(next);
        if (mode === "supabase") syncSupportData(next).then((result) => setMode(result.mode));
        return next;
      });
      if (message) notify(message.title, message.detail);
    },
    [mode, notify]
  );

  const sync = useCallback(async () => {
    const result = await syncSupportData(data);
    setMode(result.mode);
    notify(result.mode === "supabase" ? "Support synchronise" : "Sauvegarde locale", "Les donnees support sont a jour.");
  }, [data, notify]);

  return useMemo(() => ({ data, loading, mode, toast, mutate, sync, notify }), [data, loading, mode, toast, mutate, sync, notify]);
}
