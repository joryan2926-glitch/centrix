import { getSupabaseSyncResult } from "@/services/supabaseSync";
import { workflowFallbackData } from "@/data/workflows";
import { getSupabaseClient } from "@/lib/supabase";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";
import type { WorkflowData } from "@/types/workflows";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type SupabaseRow = Record<string, unknown> & { metadata?: Record<string, unknown> | null };
const legacyWorkflowIds: Record<string, string> = {
  "wf-1": "11111111-1111-4111-8111-111111111111",
  "wf-2": "22222222-2222-4222-8222-222222222222",
  "wf-3": "33333333-3333-4333-8333-333333333333"
};

function readLocal(): WorkflowData {
  if (typeof window === "undefined") return workflowFallbackData;
  return normalizeWorkflowData(workflowFallbackData);
}

function writeLocal(data: WorkflowData) {
  void data;
}

export async function loadWorkflowData(): Promise<{ data: WorkflowData; mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: readLocal(), mode: "local" };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { data: readLocal(), mode: "local" };
  const [workflows, blocks, connections, runs, templates, tasks, alerts] = await Promise.all([
    supabase.from("workflows").select("*").eq("workspace_id", workspace.workspaceId).order("updated_at", { ascending: false }),
    supabase.from("workflow_blocks").select("*").eq("workspace_id", workspace.workspaceId),
    supabase.from("workflow_connections").select("*").eq("workspace_id", workspace.workspaceId),
    supabase.from("workflow_runs").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false }),
    supabase.from("workflow_templates").select("*").eq("workspace_id", workspace.workspaceId),
    supabase.from("productivity_tasks").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false }),
    supabase.from("workflow_alerts").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false })
  ]);
  if ([workflows, blocks, connections, runs, templates, tasks, alerts].some((result) => result.error)) return { data: readLocal(), mode: "local" };
  const workflowRows = (workflows.data ?? []).filter((row) => !row.metadata?.module || row.metadata.module === "workflows");
  if (!workflowRows.length && !blocks.data?.length && !runs.data?.length) return { data: readLocal(), mode: "supabase" };
  return {
    data: {
      workflows: workflowRows.map(mapWorkflowRow),
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
  const normalized = normalizeWorkflowData(data);
  writeLocal(normalized);
  const supabase = getSupabaseClient();
  if (!supabase) return { mode: "local" as const };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { mode: "local" as const };
  const validWorkflowIds = new Set(normalized.workflows.filter((row) => isUuid(row.id)).map((row) => row.id));
  const withWorkspace = <T extends object>(row: T) => ({ ...row, workspace_id: workspace.workspaceId });
  const results = await Promise.all([
    ...normalized.workflows.filter((row) => validWorkflowIds.has(row.id)).map((row) => supabase.from("workflows").upsert(toWorkflowRow(row, workspace.workspaceId, workspace.userId), { onConflict: "id" })),
    ...normalized.blocks.filter((row) => validWorkflowIds.has(row.workflowId)).map((row) => supabase.from("workflow_blocks").upsert(withWorkspace(row), { onConflict: "id" })),
    ...normalized.connections.filter((row) => validWorkflowIds.has(row.workflowId)).map((row) => supabase.from("workflow_connections").upsert(withWorkspace(row), { onConflict: "id" })),
    ...normalized.runs.filter((row) => validWorkflowIds.has(row.workflowId)).map((row) => supabase.from("workflow_runs").upsert(withWorkspace(row), { onConflict: "id" })),
    ...normalized.templates.map((row) => supabase.from("workflow_templates").upsert(withWorkspace(row), { onConflict: "id" })),
    ...normalized.tasks.map((row) => supabase.from("productivity_tasks").upsert({ ...row, workspace_id: workspace.workspaceId }, { onConflict: "id" })),
    ...normalized.alerts.filter((row) => validWorkflowIds.has(row.workflowId)).map((row) => supabase.from("workflow_alerts").upsert(withWorkspace(row), { onConflict: "id" }))
  ]);
  return getSupabaseSyncResult(results);
}

function normalizeWorkflowData(data: WorkflowData): WorkflowData {
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
    blocks: data.blocks.map((block) => ({ ...block, workflowId: resolveId(block.workflowId) })),
    connections: data.connections.map((connection) => ({ ...connection, workflowId: resolveId(connection.workflowId) })),
    runs: data.runs.map((run) => ({ ...run, workflowId: resolveId(run.workflowId) })),
    alerts: data.alerts.map((alert) => ({ ...alert, workflowId: resolveId(alert.workflowId) }))
  };
}

function isUuid(value: string) {
  return uuidPattern.test(value);
}

function mapWorkflowRow(row: SupabaseRow) {
  const metadata = row.metadata ?? {};
  return {
    id: String(row.id),
    name: String(row.name ?? "Workflow"),
    description: String(row.description ?? metadata.description ?? "Scenario automatise CENTRIX."),
    status: (row.status ?? metadata.status ?? "draft") as WorkflowData["workflows"][number]["status"],
    runs: Number(row.runs_count ?? row.runs ?? metadata.runs ?? 0),
    successRate: Number(row.successRate ?? metadata.successRate ?? 100),
    timeSavedHours: Number(row.timeSavedHours ?? metadata.timeSavedHours ?? 0),
    owner: String(row.owner ?? metadata.owner ?? "Ops"),
    updatedAt: String(row.updatedAt ?? row.updated_at ?? metadata.updatedAt ?? new Date().toISOString())
  };
}

function toWorkflowRow(row: WorkflowData["workflows"][number], workspaceId: string, userId: string) {
  return {
    id: row.id,
    workspace_id: workspaceId,
    created_by: userId,
    name: row.name,
    status: row.status,
    trigger_type: "manual",
    steps: [],
    metadata: {
      module: "workflows",
      description: row.description,
      owner: row.owner,
      runs: row.runs,
      successRate: row.successRate,
      timeSavedHours: row.timeSavedHours,
      updatedAt: row.updatedAt
    },
    updated_at: row.updatedAt
  };
}
