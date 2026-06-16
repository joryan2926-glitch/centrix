import { getSupabaseSyncResult } from "@/services/supabaseSync";
import { academyFallbackData } from "@/data/academy";
import { getSupabaseClient } from "@/lib/supabase";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";
import type { AcademyData } from "@/types/academy";

const storageKey = "centrix-academy-data-v1";

function readLocal(): AcademyData {
  if (typeof window === "undefined") return academyFallbackData;
  const local = window.localStorage.getItem(storageKey);
  return local ? JSON.parse(local) : academyFallbackData;
}

function writeLocal(data: AcademyData) {
  if (typeof window !== "undefined") window.localStorage.setItem(storageKey, JSON.stringify(data));
}

export async function loadAcademyData(): Promise<{ data: AcademyData; mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: readLocal(), mode: "local" };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { data: readLocal(), mode: "local" };

  const [courses, modules, lessons, quizzes, quizResults, enrollments, certificates, posts, comments, progress, notifications] = await Promise.all([
    supabase.from("courses").select("*").eq("workspace_id", workspace.workspaceId).order("updatedAt", { ascending: false }),
    supabase.from("course_modules").select("*").eq("workspace_id", workspace.workspaceId).order("order", { ascending: true }),
    supabase.from("lessons").select("*").eq("workspace_id", workspace.workspaceId).order("order", { ascending: true }),
    supabase.from("quizzes").select("*").eq("workspace_id", workspace.workspaceId),
    supabase.from("quiz_results").select("*").eq("workspace_id", workspace.workspaceId).order("completedAt", { ascending: false }),
    supabase.from("enrollments").select("*").eq("workspace_id", workspace.workspaceId).order("enrolledAt", { ascending: false }),
    supabase.from("certificates").select("*").eq("workspace_id", workspace.workspaceId).order("issuedAt", { ascending: false }),
    supabase.from("community_posts").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false }),
    supabase.from("community_comments").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false }),
    supabase.from("student_progress").select("*").eq("workspace_id", workspace.workspaceId).order("updatedAt", { ascending: false }),
    supabase.from("academy_notifications").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false })
  ]);

  if ([courses, modules, lessons, quizzes, quizResults, enrollments, certificates, posts, comments, progress, notifications].some((result) => result.error)) {
    return { data: readLocal(), mode: "local" };
  }
  if (!courses.data?.length && !posts.data?.length && !enrollments.data?.length) return { data: readLocal(), mode: "supabase" };

  return {
    data: {
      courses: courses.data ?? [],
      modules: modules.data ?? [],
      lessons: lessons.data ?? [],
      quizzes: quizzes.data ?? [],
      quizResults: quizResults.data ?? [],
      enrollments: enrollments.data ?? [],
      certificates: certificates.data ?? [],
      communityPosts: posts.data ?? [],
      communityComments: comments.data ?? [],
      studentProgress: progress.data ?? [],
      notifications: notifications.data ?? [],
      students: academyFallbackData.students
    },
    mode: "supabase"
  };
}

export async function saveAcademyData(data: AcademyData) {
  writeLocal(data);
}

export async function syncAcademyData(data: AcademyData) {
  writeLocal(data);
  const supabase = getSupabaseClient();
  if (!supabase) return { mode: "local" as const };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { mode: "local" as const };
  const withWorkspace = <T extends object>(row: T) => ({ ...row, workspace_id: workspace.workspaceId });

  const results = await Promise.all([
    ...data.courses.map((row) => supabase.from("courses").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.modules.map((row) => supabase.from("course_modules").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.lessons.map((row) => supabase.from("lessons").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.quizzes.map((row) => supabase.from("quizzes").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.quizResults.map((row) => supabase.from("quiz_results").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.enrollments.map((row) => supabase.from("enrollments").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.certificates.map((row) => supabase.from("certificates").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.communityPosts.map((row) => supabase.from("community_posts").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.communityComments.map((row) => supabase.from("community_comments").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.studentProgress.map((row) => supabase.from("student_progress").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.notifications.map((row) => supabase.from("academy_notifications").upsert(withWorkspace(row), { onConflict: "id" }))
  ]);
  return getSupabaseSyncResult(results);
}
