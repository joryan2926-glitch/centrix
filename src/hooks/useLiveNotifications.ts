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

const fallbackNotifications: LiveNotification[] = [
  {
    id: "fallback-ai",
    title: "Insight IA disponible",
    body: "Le dashboard a detecte une hausse du pipeline commercial.",
    type: "info",
    module: "analytics",
    readAt: null,
    createdAt: new Date().toISOString()
  },
  {
    id: "fallback-billing",
    title: "Facture en attente",
    body: "Une facture premium attend validation.",
    type: "warning",
    module: "billing",
    readAt: null,
    createdAt: new Date().toISOString()
  }
];

function mapNotification(row: Record<string, unknown>): LiveNotification {
  return {
    id: String(row.id),
    title: String(row.title ?? "Notification"),
    body: String(row.body ?? ""),
    type: String(row.type ?? "info"),
    module: String(row.module ?? "system"),
    readAt: row.read_at ? String(row.read_at) : null,
    createdAt: String(row.created_at ?? new Date().toISOString())
  };
}

export function useLiveNotifications() {
  const { supabase } = useSupabaseContext();
  const [items, setItems] = useState<LiveNotification[]>(fallbackNotifications);
  const [loading, setLoading] = useState(Boolean(supabase));

  const refresh = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const workspace = await resolveWorkspaceContext(supabase);
    if (!workspace) {
      setItems(fallbackNotifications);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("workspace_id", workspace.workspaceId)
      .order("created_at", { ascending: false })
      .limit(12);

    if (!error && data?.length) {
      setItems(data.map(mapNotification));
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel("centrix-live-notifications")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => refresh())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh, supabase]);

  const unreadCount = useMemo(() => items.filter((item) => !item.readAt).length, [items]);

  return { items, loading, refresh, unreadCount };
}
