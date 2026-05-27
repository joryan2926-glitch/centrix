"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { workflowFallbackData } from "@/data/workflows";
import { getSupabaseClient } from "@/lib/supabase";
import { loadWorkflowData, saveWorkflowData, syncWorkflowData } from "@/services/workflows/supabase";
import type { WorkflowData } from "@/types/workflows";

type Toast = { title: string; detail: string };
const tables = ["workflows", "workflow_blocks", "workflow_connections", "workflow_runs", "workflow_templates", "productivity_tasks", "workflow_alerts"];

export function useWorkflowData() {
  const [data, setData] = useState<WorkflowData>(workflowFallbackData);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"local" | "supabase">("local");
  const [toast, setToast] = useState<Toast | null>(null);

  const notify = useCallback((title: string, detail: string) => {
    setToast({ title, detail });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const refresh = useCallback(async () => {
    const result = await loadWorkflowData();
    setData(result.data);
    setMode(result.mode);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const channel = supabase.channel("centrix-workflows-realtime");
    tables.forEach((table) => channel.on("postgres_changes", { event: "*", schema: "public", table }, () => refresh()));
    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const mutate = useCallback((updater: (current: WorkflowData) => WorkflowData, message?: Toast) => {
    setData((current) => {
      const next = updater(current);
      saveWorkflowData(next);
      return next;
    });
    if (message) notify(message.title, message.detail);
  }, [notify]);

  const sync = useCallback(async () => {
    const result = await syncWorkflowData(data);
    setMode(result.mode);
    notify(result.mode === "supabase" ? "Workflows synchronises" : "Sauvegarde locale", "Automatisations, blocs et logs sont a jour.");
  }, [data, notify]);

  return useMemo(() => ({ data, loading, mode, toast, mutate, sync, notify }), [data, loading, mode, toast, mutate, sync, notify]);
}
