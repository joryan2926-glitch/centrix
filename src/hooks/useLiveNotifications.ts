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

const demoNotifications: LiveNotification[] = [
  {
    body: "Le chiffre d'affaires progresse de 18,4% sur le mois.",
    createdAt: new Date().toISOString(),
    id: "demo-ai",
    module: "analytics",
    readAt: null,
    title: "Insight IA disponible",
    type: "info"
  },
  {
    body: "3 factures nécessitent une relance dans les prochaines 48h.",
    createdAt: new Date().toISOString(),
    id: "demo-billing",
    module: "billing",
    readAt: null,
    title: "Relances facturation",
    type: "warning"
  },
  {
    body: "5 rendez-vous sont planifiés aujourd'hui dans l'agenda équipe.",
    createdAt: new Date().toISOString(),
    id: "demo-agenda",
    module: "agenda",
    readAt: null,
    title: "Agenda chargé",
    type: "info"
  },
  {
    body: "Le workflow CRM vers facturation a été exécuté avec succès.",
    createdAt: new Date().toISOString(),
    id: "demo-workflow",
    module: "automation",
    readAt: new Date().toISOString(),
    title: "Automation exécutée",
    type: "success"
  }
];

export function useLiveNotifications() {
  const { supabase, user } = useSupabaseContext();
  const [items, setItems] = useState<LiveNotification[]>(demoNotifications);
  const [loading, setLoading] = useState(Boolean(supabase));

  const refresh = useCallback(async () => {
    if (!supabase || !user) {
      setLoading(false);
      return;
    }

    const workspace = await resolveWorkspaceContext(supabase);
    if (!workspace) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("workspace_id", workspace.workspaceId)
      .order("created_at", { ascending: false })
      .limit(30);

    if (!error) {
      setItems((data ?? []).map((row) => ({
        body: String(row.body ?? ""),
        createdAt: String(row.created_at),
        id: String(row.id),
        module: String(row.module ?? "system"),
        readAt: row.read_at ? String(row.read_at) : null,
        title: String(row.title ?? "Notification"),
        type: String(row.type ?? "info")
      })));
    }
    setLoading(false);
  }, [supabase, user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!supabase || !user) return undefined;
    const channel = supabase
      .channel("centrix-live-notifications")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => void refresh())
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refresh, supabase, user]);

  const unreadCount = useMemo(() => items.filter((item) => !item.readAt).length, [items]);

  return { items, loading, refresh, unreadCount };
}
