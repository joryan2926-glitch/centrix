"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { enterpriseLegalFallbackData } from "@/data/entreprise";
import { getSupabaseClient } from "@/lib/supabase";
import { loadEnterpriseLegalData, saveEnterpriseLegalData, syncEnterpriseLegalData } from "@/services/entreprise/supabase";
import type { EnterpriseLegalData } from "@/types/entreprise";

type Toast = { title: string; detail: string };

const realtimeTables = [
  "companies",
  "legal_forms",
  "legal_documents",
  "legal_announcements",
  "shareholders",
  "company_steps",
  "company_settings",
  "capital_deposits",
  "legal_notifications"
];

export function useEnterpriseLegalData() {
  const [data, setData] = useState<EnterpriseLegalData>(enterpriseLegalFallbackData);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"local" | "supabase">("local");
  const [toast, setToast] = useState<Toast | null>(null);

  const notify = useCallback((title: string, detail: string) => {
    setToast({ title, detail });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const refresh = useCallback(async () => {
    const result = await loadEnterpriseLegalData();
    setData(result.data);
    setMode(result.mode);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const channel = supabase.channel("centrix-enterprise-legal-realtime");
    realtimeTables.forEach((table) => {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, () => refresh());
    });
    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const mutate = useCallback(
    (updater: (current: EnterpriseLegalData) => EnterpriseLegalData, message?: Toast) => {
      setData((current) => {
        const next = updater(current);
        saveEnterpriseLegalData(next);
        return next;
      });
      if (message) notify(message.title, message.detail);
    },
    [notify]
  );

  const sync = useCallback(async () => {
    const result = await syncEnterpriseLegalData(data);
    setMode(result.mode);
    notify(result.mode === "supabase" ? "Legal synchronise" : "Sauvegarde locale", "Les dossiers entreprise et juridique sont a jour.");
  }, [data, notify]);

  return useMemo(() => ({ data, loading, mode, toast, mutate, sync, notify }), [data, loading, mode, toast, mutate, sync, notify]);
}
