"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { academyFallbackData } from "@/data/academy";
import { getSupabaseClient } from "@/lib/supabase";
import { loadAcademyData, saveAcademyData, syncAcademyData } from "@/services/academy/supabase";
import type { AcademyData } from "@/types/academy";

type Toast = { title: string; detail: string };
const tables = ["courses", "course_modules", "lessons", "quizzes", "quiz_results", "enrollments", "certificates", "community_posts", "community_comments", "student_progress", "academy_notifications"];

export function useAcademyData() {
  const [data, setData] = useState<AcademyData>(academyFallbackData);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"local" | "supabase">("local");
  const [toast, setToast] = useState<Toast | null>(null);

  const notify = useCallback((title: string, detail: string) => {
    setToast({ title, detail });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const refresh = useCallback(async () => {
    const result = await loadAcademyData();
    setData(result.data);
    setMode(result.mode);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const channel = supabase.channel("centrix-academy-realtime");
    try {
      tables.forEach((table) => channel.on("postgres_changes", { event: "*", schema: "public", table }, () => refresh()));
      channel.subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          supabase.removeChannel(channel);
        }
      });
    } catch {
      supabase.removeChannel(channel);
    }
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const mutate = useCallback((updater: (current: AcademyData) => AcademyData, message?: Toast) => {
    setData((current) => {
      const next = updater(current);
      saveAcademyData(next);
      if (mode === "supabase") syncAcademyData(next).then((result) => setMode(result.mode));
      return next;
    });
    if (message) notify(message.title, message.detail);
  }, [mode, notify]);

  const sync = useCallback(async () => {
    const result = await syncAcademyData(data);
    setMode(result.mode);
    notify(result.mode === "supabase" ? "Academy synchronisee" : "Sauvegarde locale", "Les formations et la communaute sont a jour.");
  }, [data, notify]);

  return useMemo(() => ({ data, loading, mode, toast, mutate, sync, notify }), [data, loading, mode, toast, mutate, sync, notify]);
}
