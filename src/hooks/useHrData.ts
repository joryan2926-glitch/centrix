"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { hrFallbackData } from "@/data/hr";
import { getSupabaseClient } from "@/lib/supabase";
import { deleteHrEmployee, loadHrData, saveHrData, syncHrData } from "@/services/supabaseHr";
import type { HrData } from "@/types/hr";

type ToastState = {
  title: string;
  detail: string;
};

export function useHrData() {
  const [data, setData] = useState<HrData>(hrFallbackData);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"local" | "supabase">("local");
  const [toast, setToast] = useState<ToastState | null>(null);

  const notify = useCallback((title: string, detail: string) => {
    setToast({ title, detail });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const refresh = useCallback(async () => {
    const result = await loadHrData();
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
      .channel("centrix-hr-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "hr_employees" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "hr_contracts" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "hr_leaves" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "hr_absences" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "hr_salaries" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "hr_documents" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "hr_schedule" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "hr_notifications" }, () => refresh())
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") setMode("local");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const mutate = useCallback(
    (updater: (current: HrData) => HrData, message?: ToastState) => {
      setData((current) => {
        const next = updater(current);
        saveHrData(next);
        if (mode === "supabase") syncHrData(next).then((result) => setMode(result.mode));
        return next;
      });

      if (message) notify(message.title, message.detail);
    },
    [mode, notify]
  );

  const sync = useCallback(async () => {
    const result = await syncHrData(data);
    setMode(result.mode);
    notify(result.mode === "supabase" ? "RH synchronise" : "Sauvegarde locale", "Les donnees RH sont a jour.");
  }, [data, notify]);

  const removeEmployee = useCallback(async (employeeId: string) => {
    const result = await deleteHrEmployee(employeeId);
    setMode(result.mode);
  }, []);

  return useMemo(() => ({ data, loading, mode, toast, mutate, notify, removeEmployee, sync }), [data, loading, mode, toast, mutate, notify, removeEmployee, sync]);
}
