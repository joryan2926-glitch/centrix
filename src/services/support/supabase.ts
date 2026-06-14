import { supportFallbackData } from "@/data/support";
import { getSupabaseClient } from "@/lib/supabase";
import type { SupportData } from "@/types/support";

const storageKey = "centrix-support-data-v1";

function readLocal(): SupportData {
  if (typeof window === "undefined") return supportFallbackData;
  const local = window.localStorage.getItem(storageKey);
  return local ? JSON.parse(local) : supportFallbackData;
}

function writeLocal(data: SupportData) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey, JSON.stringify(data));
  }
}

export async function loadSupportData(): Promise<{ data: SupportData; mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: readLocal(), mode: "local" };

  const [tickets, messages, comments, agents, categories, articles, feedback, notifications] = await Promise.all([
    supabase.from("support_tickets").select("*").order("updated_at", { ascending: false }),
    supabase.from("support_messages").select("*").order("createdAt", { ascending: true }),
    supabase.from("support_comments").select("*").order("createdAt", { ascending: false }),
    supabase.from("support_agents").select("*"),
    supabase.from("support_categories").select("*"),
    supabase.from("support_articles").select("*").order("updatedAt", { ascending: false }),
    supabase.from("support_feedback").select("*").order("createdAt", { ascending: false }),
    supabase.from("support_notifications").select("*").order("createdAt", { ascending: false })
  ]);

  if ([tickets, messages, comments, agents, categories, articles, feedback, notifications].some((result) => result.error)) {
    return { data: readLocal(), mode: "local" };
  }

  return {
    data: {
      tickets: tickets.data ?? [],
      messages: messages.data ?? [],
      comments: comments.data ?? [],
      agents: agents.data ?? [],
      categories: categories.data ?? [],
      articles: articles.data ?? [],
      feedback: feedback.data ?? [],
      notifications: notifications.data ?? []
    },
    mode: "supabase"
  };
}

export async function saveSupportData(data: SupportData) {
  writeLocal(data);
}

export async function syncSupportData(data: SupportData) {
  writeLocal(data);
  const supabase = getSupabaseClient();
  if (!supabase) return { mode: "local" as const };

  await Promise.all([
    ...data.agents.map((row) => supabase.from("support_agents").upsert(row, { onConflict: "id" })),
    ...data.categories.map((row) => supabase.from("support_categories").upsert(row, { onConflict: "id" })),
    ...data.tickets.map((row) => supabase.from("support_tickets").upsert(row, { onConflict: "id" })),
    ...data.messages.map((row) => supabase.from("support_messages").upsert(row, { onConflict: "id" })),
    ...data.comments.map((row) => supabase.from("support_comments").upsert(row, { onConflict: "id" })),
    ...data.articles.map((row) => supabase.from("support_articles").upsert(row, { onConflict: "id" })),
    ...data.feedback.map((row) => supabase.from("support_feedback").upsert(row, { onConflict: "id" })),
    ...data.notifications.map((row) => supabase.from("support_notifications").upsert(row, { onConflict: "id" }))
  ]);

  return { mode: "supabase" as const };
}
