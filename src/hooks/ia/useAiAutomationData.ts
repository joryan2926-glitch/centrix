"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { aiAutomationFallbackData } from "@/data/ia";
import { getSupabaseClient } from "@/lib/supabase";
import { loadAiAutomationData, saveAiAutomationData, syncAiAutomationData } from "@/services/ia/supabase";
import type { AiAutomationData } from "@/types/ia";

type Toast = { title: string; detail: string };

const realtimeTables = [
  "ai_conversations",
  "ai_messages",
  "ai_generations",
  "workflows",
  "workflow_steps",
  "automation_logs",
  "ai_notifications",
  "ai_templates"
];

export function useAiAutomationData() {
  const [data, setData] = useState<AiAutomationData>(aiAutomationFallbackData);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"local" | "supabase">("local");
  const [toast, setToast] = useState<Toast | null>(null);

  const notify = useCallback((title: string, detail: string) => {
    setToast({ title, detail });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const refresh = useCallback(async () => {
    const result = await loadAiAutomationData();
    setData(result.data);
    setMode(result.mode);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const channel = supabase.channel("centrix-ai-automation-realtime");
    realtimeTables.forEach((table) => {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, () => refresh());
    });
    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const mutate = useCallback(
    (updater: (current: AiAutomationData) => AiAutomationData, message?: Toast) => {
      setData((current) => {
        const next = updater(current);
        saveAiAutomationData(next);
        if (mode === "supabase") syncAiAutomationData(next).then((result) => setMode(result.mode));
        return next;
      });
      if (message) notify(message.title, message.detail);
    },
    [mode, notify]
  );

  const sync = useCallback(async () => {
    const result = await syncAiAutomationData(data);
    setMode(result.mode);
    notify(result.mode === "supabase" ? "IA synchronisee" : "Sauvegarde locale", "Les donnees IA et automatisations sont a jour.");
  }, [data, notify]);

  return useMemo(() => ({ data, loading, mode, toast, mutate, sync, notify }), [data, loading, mode, toast, mutate, sync, notify]);
}
