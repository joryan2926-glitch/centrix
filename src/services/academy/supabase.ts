import { academyFallbackData } from "@/data/academy";
import { getSupabaseClient } from "@/lib/supabase";
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

  const [courses, modules, lessons, quizzes, quizResults, enrollments, certificates, posts, comments, progress, notifications] = await Promise.all([
    supabase.from("courses").select("*").order("updatedAt", { ascending: false }),
    supabase.from("course_modules").select("*").order("order", { ascending: true }),
    supabase.from("lessons").select("*").order("order", { ascending: true }),
    supabase.from("quizzes").select("*"),
    supabase.from("quiz_results").select("*").order("completedAt", { ascending: false }),
    supabase.from("enrollments").select("*").order("enrolledAt", { ascending: false }),
    supabase.from("certificates").select("*").order("issuedAt", { ascending: false }),
    supabase.from("community_posts").select("*").order("createdAt", { ascending: false }),
    supabase.from("community_comments").select("*").order("createdAt", { ascending: false }),
    supabase.from("student_progress").select("*").order("updatedAt", { ascending: false }),
    supabase.from("academy_notifications").select("*").order("createdAt", { ascending: false })
  ]);

  if ([courses, modules, lessons, quizzes, quizResults, enrollments, certificates, posts, comments, progress, notifications].some((result) => result.error)) {
    return { data: readLocal(), mode: "local" };
  }

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

  await Promise.all([
    ...data.courses.map((row) => supabase.from("courses").upsert(row, { onConflict: "id" })),
    ...data.modules.map((row) => supabase.from("course_modules").upsert(row, { onConflict: "id" })),
    ...data.lessons.map((row) => supabase.from("lessons").upsert(row, { onConflict: "id" })),
    ...data.quizzes.map((row) => supabase.from("quizzes").upsert(row, { onConflict: "id" })),
    ...data.quizResults.map((row) => supabase.from("quiz_results").upsert(row, { onConflict: "id" })),
    ...data.enrollments.map((row) => supabase.from("enrollments").upsert(row, { onConflict: "id" })),
    ...data.certificates.map((row) => supabase.from("certificates").upsert(row, { onConflict: "id" })),
    ...data.communityPosts.map((row) => supabase.from("community_posts").upsert(row, { onConflict: "id" })),
    ...data.communityComments.map((row) => supabase.from("community_comments").upsert(row, { onConflict: "id" })),
    ...data.studentProgress.map((row) => supabase.from("student_progress").upsert(row, { onConflict: "id" })),
    ...data.notifications.map((row) => supabase.from("academy_notifications").upsert(row, { onConflict: "id" }))
  ]);
  return { mode: "supabase" as const };
}
