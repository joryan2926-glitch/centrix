"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { notificationsFallbackData } from "@/data/notifications";
import { getSupabaseClient } from "@/lib/supabase";
import { loadNotificationsData, saveNotificationsData, syncNotificationsData } from "@/services/notifications/supabase";
import type { NotificationsData } from "@/types/notifications";

type Toast = { title: string; detail: string };

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

    const channel = supabase
      .channel("centrix-notifications-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "realtime_notifications" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "notification_preferences" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "notification_rules" }, () => refresh())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const mutate = useCallback(
    (updater: (current: NotificationsData) => NotificationsData, message?: Toast) => {
      setData((current) => {
        const next = updater(current);
        saveNotificationsData(next);
        return next;
      });
      if (message) notify(message.title, message.detail);
    },
    [notify]
  );

  const sync = useCallback(async () => {
    const result = await syncNotificationsData(data);
    setMode(result.mode);
    notify(result.mode === "supabase" ? "Notifications synchronisees" : "Sauvegarde locale", "Le centre realtime est a jour.");
  }, [data, notify]);

  return useMemo(() => ({ data, loading, mode, toast, mutate, sync }), [data, loading, mode, toast, mutate, sync]);
}
