"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { crmFallbackData } from "@/data/crm";
import { getSupabaseClient } from "@/lib/supabase";
import { saveCrmData, loadCrmData, syncCrmData } from "@/services/supabaseCrm";
import type { CrmData } from "@/types/crm";

type Toast = {
  title: string;
  detail: string;
};

export function useCrmData() {
  const [data, setData] = useState<CrmData>(crmFallbackData);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"local" | "supabase">("local");
  const [toast, setToast] = useState<Toast | null>(null);

  const notify = useCallback((title: string, detail: string) => {
    setToast({ title, detail });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  useEffect(() => {
    let active = true;

    loadCrmData().then((result) => {
      if (!active) return;
      setData(result.data);
      setMode(result.mode);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    const result = await loadCrmData();
    setData(result.data);
    setMode(result.mode);
  }, []);

  useEffect(() => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      return;
    }

    const channel = supabase
      .channel("centrix-crm-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "crm_leads" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "crm_clients" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "crm_notes" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "crm_tasks" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "crm_activities" }, () => refresh())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const mutate = useCallback(
    (updater: (current: CrmData) => CrmData, message?: Toast) => {
      setData((current) => {
        const next = updater(current);
        saveCrmData(next);
        return next;
      });

      if (message) {
        notify(message.title, message.detail);
      }
    },
    [notify]
  );

  const sync = useCallback(async () => {
    const result = await syncCrmData(data);
    setMode(result.mode);
    notify(result.mode === "supabase" ? "CRM synchronise" : "Sauvegarde locale", "Les donnees CRM sont a jour.");
  }, [data, notify]);

  return useMemo(
    () => ({ data, loading, mode, toast, setToast, mutate, sync, refresh, notify }),
    [data, loading, mode, toast, mutate, sync, refresh, notify]
  );
}
