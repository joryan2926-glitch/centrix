"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { notificationsFallbackData } from "@/data/notifications";
import { getSupabaseClient } from "@/lib/supabase";
import { loadNotificationsData, saveNotificationsData, syncNotificationsData } from "@/services/notifications/supabase";
import type { NotificationsData } from "@/types/notifications";

type Toast = { title: string; detail: string };
const realtimeTables = ["realtime_notifications", "notification_preferences", "notification_rules", "collaboration_conversations", "collaboration_messages", "user_presence", "shared_files"];

export function useNotificationsData() {
  const [data, setData] = useState<NotificationsData>(notificationsFallbackData);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"local" | "supabase">("local");
  const [toast, setToast] = useState<Toast | null>(null);

  const notify = useCallback((title: string, detail: string) => {
    setToast({ title, detail });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const refresh = useCallback(async () => {
    const result = await loadNotificationsData();
    setData(result.data);
    setMode(result.mode);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const channel = supabase.channel("centrix-notifications-realtime");
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
    (updater: (current: NotificationsData) => NotificationsData, message?: Toast) => {
      setData((current) => {
        const next = updater(current);
        saveNotificationsData(next);
        if (mode === "supabase") syncNotificationsData(next).then((result) => setMode(result.mode));
        return next;
      });
      if (message) notify(message.title, message.detail);
    },
    [mode, notify]
  );

  const sync = useCallback(async () => {
    const result = await syncNotificationsData(data);
    setMode(result.mode);
    notify(result.mode === "supabase" ? "Notifications synchronisees" : "Sauvegarde locale", "Le centre realtime est a jour.");
  }, [data, notify]);

  return useMemo(() => ({ data, loading, mode, toast, mutate, sync }), [data, loading, mode, toast, mutate, sync]);
}
