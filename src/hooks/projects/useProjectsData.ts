"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { projectsFallbackData } from "@/data/projects";
import { getSupabaseClient } from "@/lib/supabase";
import { deleteProjectFromSupabase, deleteTaskFromSupabase, loadProjectsData, saveProjectsData, syncProjectsData } from "@/services/projects/supabase";
import type { ProjectsData } from "@/types/projects";

type Toast = { title: string; detail: string };
const tables = ["projects", "project_members", "tasks", "task_comments", "task_checklists", "project_files", "project_activity", "project_notifications", "time_tracking"];

export function useProjectsData() {
  const [data, setData] = useState<ProjectsData>(projectsFallbackData);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"local" | "supabase">("local");
  const [toast, setToast] = useState<Toast | null>(null);

  const notify = useCallback((title: string, detail: string) => {
    setToast({ title, detail });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const refresh = useCallback(async () => {
    const result = await loadProjectsData();
    setData(result.data);
    setMode(result.mode);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const channel = supabase.channel("centrix-projects-realtime");
    tables.forEach((table) => channel.on("postgres_changes", { event: "*", schema: "public", table }, () => refresh()));
    channel.subscribe((status) => {
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") setMode("local");
    });
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const mutate = useCallback((updater: (current: ProjectsData) => ProjectsData, message?: Toast) => {
    setData((current) => {
      const next = updater(current);
      saveProjectsData(next);
      if (mode === "supabase") syncProjectsData(next).then((result) => setMode(result.mode));
      return next;
    });
    if (message) notify(message.title, message.detail);
  }, [mode, notify]);

  const sync = useCallback(async () => {
    const result = await syncProjectsData(data);
    setMode(result.mode);
    notify(result.mode === "supabase" ? "Projets synchronises" : "Sauvegarde locale", "Projets, taches et activite sont a jour.");
  }, [data, notify]);

  const deleteProject = useCallback(async (projectId: string) => {
    const result = await deleteProjectFromSupabase(projectId);
    setMode(result.mode);
  }, []);

  const deleteTask = useCallback(async (taskId: string) => {
    const result = await deleteTaskFromSupabase(taskId);
    setMode(result.mode);
  }, []);

  return useMemo(() => ({ data, deleteProject, deleteTask, loading, mode, toast, mutate, sync, notify }), [data, deleteProject, deleteTask, loading, mode, toast, mutate, sync, notify]);
}
