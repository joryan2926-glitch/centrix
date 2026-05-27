import { projectsFallbackData } from "@/data/projects";
import { getSupabaseClient } from "@/lib/supabase";
import type { ProjectsData } from "@/types/projects";

const storageKey = "centrix-projects-data-v1";

function readLocal(): ProjectsData {
  if (typeof window === "undefined") return projectsFallbackData;
  const local = window.localStorage.getItem(storageKey);
  return local ? JSON.parse(local) : projectsFallbackData;
}

function writeLocal(data: ProjectsData) {
  if (typeof window !== "undefined") window.localStorage.setItem(storageKey, JSON.stringify(data));
}

export async function loadProjectsData(): Promise<{ data: ProjectsData; mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: readLocal(), mode: "local" };
  const [projects, members, tasks, comments, checklists, files, activities, notifications, timeTracking] = await Promise.all([
    supabase.from("projects").select("*").order("deadline", { ascending: true }),
    supabase.from("project_members").select("*"),
    supabase.from("tasks").select("*").order("dueAt", { ascending: true }),
    supabase.from("task_comments").select("*").order("createdAt", { ascending: false }),
    supabase.from("task_checklists").select("*"),
    supabase.from("project_files").select("*"),
    supabase.from("project_activity").select("*").order("createdAt", { ascending: false }),
    supabase.from("project_notifications").select("*").order("createdAt", { ascending: false }),
    supabase.from("time_tracking").select("*").order("startedAt", { ascending: false })
  ]);
  if ([projects, members, tasks, comments, checklists, files, activities, notifications, timeTracking].some((result) => result.error)) return { data: readLocal(), mode: "local" };
  return {
    data: {
      projects: projects.data ?? [],
      members: members.data ?? [],
      tasks: tasks.data ?? [],
      comments: comments.data ?? [],
      checklists: checklists.data ?? [],
      files: files.data ?? [],
      activities: activities.data ?? [],
      notifications: notifications.data ?? [],
      timeTracking: timeTracking.data ?? []
    },
    mode: "supabase"
  };
}

export async function saveProjectsData(data: ProjectsData) {
  writeLocal(data);
}

export async function syncProjectsData(data: ProjectsData) {
  writeLocal(data);
  const supabase = getSupabaseClient();
  if (!supabase) return { mode: "local" as const };
  await Promise.all([
    ...data.projects.map((row) => supabase.from("projects").upsert(row, { onConflict: "id" })),
    ...data.members.map((row) => supabase.from("project_members").upsert(row, { onConflict: "id" })),
    ...data.tasks.map((row) => supabase.from("tasks").upsert(row, { onConflict: "id" })),
    ...data.comments.map((row) => supabase.from("task_comments").upsert(row, { onConflict: "id" })),
    ...data.checklists.map((row) => supabase.from("task_checklists").upsert(row, { onConflict: "id" })),
    ...data.files.map((row) => supabase.from("project_files").upsert(row, { onConflict: "id" })),
    ...data.activities.map((row) => supabase.from("project_activity").upsert(row, { onConflict: "id" })),
    ...data.notifications.map((row) => supabase.from("project_notifications").upsert(row, { onConflict: "id" })),
    ...data.timeTracking.map((row) => supabase.from("time_tracking").upsert(row, { onConflict: "id" }))
  ]);
  return { mode: "supabase" as const };
}
