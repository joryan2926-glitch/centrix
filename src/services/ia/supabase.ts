import { getSupabaseSyncResult } from "@/services/supabaseSync";
import { aiAutomationFallbackData } from "@/data/ia";
import { getSupabaseClient } from "@/lib/supabase";
import type { AiAutomationData } from "@/types/ia";

const storageKey = "centrix-ai-automation-data-v1";

function readLocal(): AiAutomationData {
  if (typeof window === "undefined") return aiAutomationFallbackData;
  const local = window.localStorage.getItem(storageKey);
  return local ? JSON.parse(local) : aiAutomationFallbackData;
}

function writeLocal(data: AiAutomationData) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey, JSON.stringify(data));
  }
}

export async function loadAiAutomationData(): Promise<{ data: AiAutomationData; mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: readLocal(), mode: "local" };

  const [conversations, messages, generations, templates, workflows, workflowSteps, automationLogs, notifications] = await Promise.all([
    supabase.from("ai_conversations").select("*").order("updatedAt", { ascending: false }),
    supabase.from("ai_messages").select("*").order("createdAt", { ascending: true }),
    supabase.from("ai_generations").select("*").order("createdAt", { ascending: false }),
    supabase.from("ai_templates").select("*"),
    supabase.from("workflows").select("*").order("updated_at", { ascending: false }),
    supabase.from("workflow_steps").select("*").order("order", { ascending: true }),
    supabase.from("automation_logs").select("*").order("createdAt", { ascending: false }),
    supabase.from("ai_notifications").select("*").order("createdAt", { ascending: false })
  ]);

  if ([conversations, messages, generations, templates, workflows, workflowSteps, automationLogs, notifications].some((result) => result.error)) {
    return { data: readLocal(), mode: "local" };
  }

  return {
    data: {
      conversations: conversations.data ?? [],
      messages: messages.data ?? [],
      generations: generations.data ?? [],
      templates: templates.data ?? [],
      workflows: workflows.data ?? [],
      workflowSteps: workflowSteps.data ?? [],
      automationLogs: automationLogs.data ?? [],
      notifications: notifications.data ?? []
    },
    mode: "supabase"
  };
}

export async function saveAiAutomationData(data: AiAutomationData) {
  writeLocal(data);
}

export async function syncAiAutomationData(data: AiAutomationData) {
  writeLocal(data);
  const supabase = getSupabaseClient();
  if (!supabase) return { mode: "local" as const };

  const results = await Promise.all([
    ...data.conversations.map((row) => supabase.from("ai_conversations").upsert(row, { onConflict: "id" })),
    ...data.messages.map((row) => supabase.from("ai_messages").upsert(row, { onConflict: "id" })),
    ...data.generations.map((row) => supabase.from("ai_generations").upsert(row, { onConflict: "id" })),
    ...data.templates.map((row) => supabase.from("ai_templates").upsert(row, { onConflict: "id" })),
    ...data.workflows.map((row) => supabase.from("workflows").upsert(row, { onConflict: "id" })),
    ...data.workflowSteps.map((row) => supabase.from("workflow_steps").upsert(row, { onConflict: "id" })),
    ...data.automationLogs.map((row) => supabase.from("automation_logs").upsert(row, { onConflict: "id" })),
    ...data.notifications.map((row) => supabase.from("ai_notifications").upsert(row, { onConflict: "id" }))
  ]);

  return getSupabaseSyncResult(results);
}
