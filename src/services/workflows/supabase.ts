import { workflowFallbackData } from "@/data/workflows";
import { getSupabaseClient } from "@/lib/supabase";
import type { WorkflowData } from "@/types/workflows";

const storageKey = "centrix-workflow-data-v1";

function readLocal(): WorkflowData {
  if (typeof window === "undefined") return workflowFallbackData;
  const local = window.localStorage.getItem(storageKey);
  return local ? JSON.parse(local) : workflowFallbackData;
}

function writeLocal(data: WorkflowData) {
  if (typeof window !== "undefined") window.localStorage.setItem(storageKey, JSON.stringify(data));
}

export async function loadWorkflowData(): Promise<{ data: WorkflowData; mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: readLocal(), mode: "local" };
  const [workflows, blocks, connections, runs, templates, tasks, alerts] = await Promise.all([
    supabase.from("workflows").select("*").order("updatedAt", { ascending: false }),
    supabase.from("workflow_blocks").select("*"),
    supabase.from("workflow_connections").select("*"),
    supabase.from("workflow_runs").select("*").order("createdAt", { ascending: false }),
    supabase.from("workflow_templates").select("*"),
    supabase.from("productivity_tasks").select("*").order("createdAt", { ascending: false }),
    supabase.from("workflow_alerts").select("*").order("createdAt", { ascending: false })
  ]);
  if ([workflows, blocks, connections, runs, templates, tasks, alerts].some((result) => result.error)) return { data: readLocal(), mode: "local" };
  return {
    data: {
      workflows: workflows.data ?? [],
      blocks: blocks.data ?? [],
      connections: connections.data ?? [],
      runs: runs.data ?? [],
      templates: templates.data ?? [],
      tasks: tasks.data ?? [],
      alerts: alerts.data ?? []
    },
    mode: "supabase"
  };
}

export async function saveWorkflowData(data: WorkflowData) {
  writeLocal(data);
}

export async function syncWorkflowData(data: WorkflowData) {
  writeLocal(data);
  const supabase = getSupabaseClient();
  if (!supabase) return { mode: "local" as const };
  await Promise.all([
    ...data.workflows.map((row) => supabase.from("workflows").upsert(row, { onConflict: "id" })),
    ...data.blocks.map((row) => supabase.from("workflow_blocks").upsert(row, { onConflict: "id" })),
    ...data.connections.map((row) => supabase.from("workflow_connections").upsert(row, { onConflict: "id" })),
    ...data.runs.map((row) => supabase.from("workflow_runs").upsert(row, { onConflict: "id" })),
    ...data.templates.map((row) => supabase.from("workflow_templates").upsert(row, { onConflict: "id" })),
    ...data.tasks.map((row) => supabase.from("productivity_tasks").upsert(row, { onConflict: "id" })),
    ...data.alerts.map((row) => supabase.from("workflow_alerts").upsert(row, { onConflict: "id" }))
  ]);
  return { mode: "supabase" as const };
}
