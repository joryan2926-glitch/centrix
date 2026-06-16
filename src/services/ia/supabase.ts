import { getSupabaseSyncResult } from "@/services/supabaseSync";
import { aiAutomationFallbackData } from "@/data/ia";
import { getSupabaseClient } from "@/lib/supabase";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";
import type { AiAutomationData } from "@/types/ia";

const storageKey = "centrix-ai-automation-data-v1";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type SupabaseRow = Record<string, unknown> & { metadata?: Record<string, unknown> | null };
const legacyWorkflowIds: Record<string, string> = {
  "wf-paid-invoice": "44444444-4444-4444-8444-444444444444",
  "wf-new-lead": "55555555-5555-4555-8555-555555555555"
};

function readLocal(): AiAutomationData {
  if (typeof window === "undefined") return aiAutomationFallbackData;
  const local = window.localStorage.getItem(storageKey);
  return normalizeAiAutomationData(local ? JSON.parse(local) : aiAutomationFallbackData);
}

function writeLocal(data: AiAutomationData) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey, JSON.stringify(normalizeAiAutomationData(data)));
  }
}

export async function loadAiAutomationData(): Promise<{ data: AiAutomationData; mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: readLocal(), mode: "local" };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { data: readLocal(), mode: "local" };

  const [conversations, messages, generations, templates, workflows, workflowSteps, automationLogs, notifications] = await Promise.all([
    supabase.from("ai_conversations").select("*").eq("workspace_id", workspace.workspaceId).order("updatedAt", { ascending: false }),
    supabase.from("ai_messages").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: true }),
    supabase.from("ai_generations").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false }),
    supabase.from("ai_templates").select("*").eq("workspace_id", workspace.workspaceId),
    supabase.from("workflows").select("*").eq("workspace_id", workspace.workspaceId).order("updated_at", { ascending: false }),
    supabase.from("workflow_steps").select("*").eq("workspace_id", workspace.workspaceId).order("order", { ascending: true }),
    supabase.from("automation_logs").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false }),
    supabase.from("ai_notifications").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false })
  ]);

  if ([conversations, messages, generations, templates, workflows, workflowSteps, automationLogs, notifications].some((result) => result.error)) {
    return { data: readLocal(), mode: "local" };
  }
  const workflowRows = (workflows.data ?? []).filter((row) => row.metadata?.module === "ai_automation");
  if (!workflowRows.length && !workflowSteps.data?.length && !automationLogs.data?.length) return { data: readLocal(), mode: "supabase" };

  return {
    data: {
      conversations: conversations.data ?? [],
      messages: messages.data ?? [],
      generations: generations.data ?? [],
      templates: templates.data ?? [],
      workflows: workflowRows.map(mapWorkflowRow),
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
  const normalized = normalizeAiAutomationData(data);
  writeLocal(normalized);
  const supabase = getSupabaseClient();
  if (!supabase) return { mode: "local" as const };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { mode: "local" as const };
  const validWorkflowIds = new Set(normalized.workflows.filter((row) => isUuid(row.id)).map((row) => row.id));
  const withWorkspace = <T extends object>(row: T) => ({ ...row, workspace_id: workspace.workspaceId });

  const results = await Promise.all([
    ...normalized.conversations.map((row) => supabase.from("ai_conversations").upsert(withWorkspace(row), { onConflict: "id" })),
    ...normalized.messages.map((row) => supabase.from("ai_messages").upsert(withWorkspace(row), { onConflict: "id" })),
    ...normalized.generations.map((row) => supabase.from("ai_generations").upsert(withWorkspace(row), { onConflict: "id" })),
    ...normalized.templates.map((row) => supabase.from("ai_templates").upsert(withWorkspace(row), { onConflict: "id" })),
    ...normalized.workflows.filter((row) => validWorkflowIds.has(row.id)).map((row) => supabase.from("workflows").upsert(toWorkflowRow(row, workspace.workspaceId, workspace.userId), { onConflict: "id" })),
    ...normalized.workflowSteps.filter((row) => validWorkflowIds.has(row.workflowId)).map((row) => supabase.from("workflow_steps").upsert(withWorkspace(row), { onConflict: "id" })),
    ...normalized.automationLogs.filter((row) => validWorkflowIds.has(row.workflowId)).map((row) => supabase.from("automation_logs").upsert(withWorkspace(row), { onConflict: "id" })),
    ...normalized.notifications.map((row) => supabase.from("ai_notifications").upsert(withWorkspace(row), { onConflict: "id" }))
  ]);

  return getSupabaseSyncResult(results);
}

function normalizeAiAutomationData(data: AiAutomationData): AiAutomationData {
  const mappedIds = new Map<string, string>();
  const resolveId = (id: string) => {
    if (isUuid(id)) return id;
    const mapped = legacyWorkflowIds[id] ?? mappedIds.get(id) ?? crypto.randomUUID();
    mappedIds.set(id, mapped);
    return mapped;
  };

  return {
    ...data,
    workflows: data.workflows.map((workflow) => ({ ...workflow, id: resolveId(workflow.id) })),
    workflowSteps: data.workflowSteps.map((step) => ({ ...step, workflowId: resolveId(step.workflowId) })),
    automationLogs: data.automationLogs.map((log) => ({ ...log, workflowId: resolveId(log.workflowId) }))
  };
}

function isUuid(value: string) {
  return uuidPattern.test(value);
}

function mapWorkflowRow(row: SupabaseRow) {
  const metadata = row.metadata ?? {};
  return {
    id: String(row.id),
    name: String(row.name ?? "Workflow IA"),
    description: String(row.description ?? metadata.description ?? "Scenario IA CENTRIX."),
    active: Boolean(row.active ?? metadata.active ?? row.status === "active"),
    trigger: (row.trigger ?? row.trigger_type ?? metadata.trigger ?? "new_lead") as AiAutomationData["workflows"][number]["trigger"],
    runs: Number(row.runs_count ?? row.runs ?? metadata.runs ?? 0),
    successRate: Number(row.successRate ?? metadata.successRate ?? 100),
    timeSavedHours: Number(row.timeSavedHours ?? metadata.timeSavedHours ?? 0),
    createdAt: String(row.createdAt ?? row.created_at ?? metadata.createdAt ?? new Date().toISOString()),
    updatedAt: String(row.updatedAt ?? row.updated_at ?? metadata.updatedAt ?? new Date().toISOString())
  };
}

function toWorkflowRow(row: AiAutomationData["workflows"][number], workspaceId: string, userId: string) {
  return {
    id: row.id,
    workspace_id: workspaceId,
    created_by: userId,
    name: row.name,
    status: row.active ? "active" : "paused",
    trigger_type: row.trigger,
    steps: [],
    metadata: {
      module: "ai_automation",
      description: row.description,
      active: row.active,
      trigger: row.trigger,
      runs: row.runs,
      successRate: row.successRate,
      timeSavedHours: row.timeSavedHours,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    },
    updated_at: row.updatedAt
  };
}
