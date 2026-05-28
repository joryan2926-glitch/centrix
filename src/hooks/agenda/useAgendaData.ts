"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { agendaFallbackData } from "@/data/agenda";
import { getSupabaseClient } from "@/lib/supabase";
import { loadAgendaData, saveAgendaData, syncAgendaData } from "@/services/agenda/supabase";
import type { AgendaData } from "@/types/agenda";

type Toast = { title: string; detail: string };

export function useAgendaData() {
  const [data, setData] = useState<AgendaData>(agendaFallbackData);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"local" | "supabase">("local");
  const [toast, setToast] = useState<Toast | null>(null);

  const notify = useCallback((title: string, detail: string) => {
    setToast({ title, detail });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const refresh = useCallback(async () => {
    const result = await loadAgendaData();
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
      .channel("centrix-agenda-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "meetings" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => refresh())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const mutate = useCallback(
    (updater: (current: AgendaData) => AgendaData, message?: Toast) => {
      setData((current) => {
        const next = updater(current);
        saveAgendaData(next);
        return next;
      });
      if (message) notify(message.title, message.detail);
    },
    [notify]
  );

  const sync = useCallback(async () => {
    const result = await syncAgendaData(data);
    setMode(result.mode);
    notify(result.mode === "supabase" ? "Agenda synchronise" : "Sauvegarde locale", "Les donnees agenda sont a jour.");
  }, [data, notify]);

  return useMemo(() => ({ data, loading, mode, toast, mutate, sync, notify }), [data, loading, mode, toast, mutate, sync, notify]);
}
