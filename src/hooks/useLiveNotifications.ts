"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSupabaseContext } from "@/providers/SupabaseProvider";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";

export type LiveNotification = {
  id: string;
  title: string;
  body: string;
  type: string;
  module: string;
  readAt: string | null;
  createdAt: string;
};

export function useLiveNotifications() {
  const { supabase, user } = useSupabaseContext();
  const [items, setItems] = useState<LiveNotification[]>([]);
  const [loading, setLoading] = useState(Boolean(supabase));

  const refresh = useCallback(async () => {
    try {
      if (!supabase || !user) {
        setItems([]);
        return;
      }

      const workspace = await resolveWorkspaceContext(supabase);
      if (!workspace) {
        setItems([]);
        return;
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("workspace_id", workspace.workspaceId)
        .order("created_at", { ascending: false })
        .limit(30);

      if (error) throw error;

      setItems((data ?? []).map((row) => ({
        body: String(row.body ?? row.detail ?? ""),
        createdAt: String(row.created_at ?? new Date().toISOString()),
        id: String(row.id),
        module: String(row.module ?? "system"),
        readAt: row.read_at ? String(row.read_at) : null,
        title: String(row.title ?? "Notification"),
        type: String(row.type ?? "info")
      })));
    } catch (error) {
      console.warn("[CENTRIX_NOTIFICATIONS_SUPABASE_ERROR]", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [supabase, user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!supabase || !user) return undefined;
    let channel;
    try {
      channel = supabase
        .channel("centrix-live-notifications")
        .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => void refresh())
        .subscribe();
    } catch (error) {
      console.warn("[CENTRIX_NOTIFICATIONS_REALTIME_DISABLED]", error);
      return undefined;
    }
    return () => {
      if (channel) void supabase.removeChannel(channel).catch(() => undefined);
    };
  }, [refresh, supabase, user]);

  const unreadCount = useMemo(() => items.filter((item) => !item.readAt).length, [items]);

  return { items, loading, refresh, unreadCount };
}
