"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { clientPortalFallbackData } from "@/data/clientPortal";
import { getSupabaseClient } from "@/lib/supabase";
import { loadClientPortalData, saveClientPortalData, syncClientPortalData } from "@/services/client-portal/supabase";
import type { ClientPortalData } from "@/types/client-portal";

type Toast = { title: string; detail: string };
const tables = ["client_portals", "client_projects", "client_documents", "client_messages", "client_notifications", "client_appointments", "client_signatures", "client_activity_logs"];

export function useClientPortalData() {
  const [data, setData] = useState<ClientPortalData>(clientPortalFallbackData);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"local" | "supabase">("local");
  const [toast, setToast] = useState<Toast | null>(null);

  const notify = useCallback((title: string, detail: string) => {
    setToast({ title, detail });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const refresh = useCallback(async () => {
    const result = await loadClientPortalData();
    setData(result.data);
    setMode(result.mode);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const channel = supabase.channel("centrix-client-portal-realtime");
    tables.forEach((table) => channel.on("postgres_changes", { event: "*", schema: "public", table }, () => refresh()));
    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const mutate = useCallback((updater: (current: ClientPortalData) => ClientPortalData, message?: Toast) => {
    setData((current) => {
      const next = updater(current);
      saveClientPortalData(next);
      return next;
    });
    if (message) notify(message.title, message.detail);
  }, [notify]);

  const sync = useCallback(async () => {
    const result = await syncClientPortalData(data);
    setMode(result.mode);
    notify(result.mode === "supabase" ? "Portail synchronise" : "Sauvegarde locale", "Documents, messages et projets client sont a jour.");
  }, [data, notify]);

  return useMemo(() => ({ data, loading, mode, toast, mutate, sync, notify }), [data, loading, mode, toast, mutate, sync, notify]);
}
