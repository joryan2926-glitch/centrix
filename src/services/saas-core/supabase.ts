import { saasCoreFallbackDashboard } from "@/data/saasCore";
import { getSupabaseClient } from "@/lib/supabase";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";
import type { DashboardAnalyticsPoint, ModuleConnection, ModuleEvent, ModuleTask, SaasCoreDashboard } from "@/types/saas-core";
import type { Metric } from "@/types/navigation";

export function saveSaasCoreDashboard(data: SaasCoreDashboard) {
  void data;
}

function loadLocalDashboard(): SaasCoreDashboard {
  return saasCoreFallbackDashboard;
}

export async function loadSaasCoreDashboard(): Promise<{ data: SaasCoreDashboard; mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: loadLocalDashboard(), mode: "local" };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { data: loadLocalDashboard(), mode: "local" };

  const [metrics, events, tasks, connections, analytics] = await Promise.all([
    supabase.from("dashboard_metrics").select("*").eq("workspace_id", workspace.workspaceId).order("sort_order"),
    supabase.from("module_events").select("*").eq("workspace_id", workspace.workspaceId).order("created_at", { ascending: false }).limit(20),
    supabase.from("module_tasks").select("*").eq("workspace_id", workspace.workspaceId).order("created_at", { ascending: false }).limit(20),
    supabase.from("module_connections").select("*").eq("workspace_id", workspace.workspaceId).order("created_at", { ascending: false }),
    supabase.from("dashboard_analytics").select("*").eq("workspace_id", workspace.workspaceId).order("period_index")
  ]);

  if (metrics.error || events.error || tasks.error || connections.error || analytics.error) {
    return { data: loadLocalDashboard(), mode: "local" };
  }

  const data: SaasCoreDashboard = {
    modules: saasCoreFallbackDashboard.modules,
    metrics: (metrics.data ?? []).map(mapMetric),
    events: (events.data ?? []).map(mapEvent),
    tasks: (tasks.data ?? []).map(mapTask),
    connections: (connections.data ?? []).map(mapConnection),
    analytics: (analytics.data ?? []).map(mapAnalytics)
  };

  return {
    mode: "supabase",
    data
  };
}

export async function syncSaasCoreDashboard(data: SaasCoreDashboard): Promise<{ mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();
  saveSaasCoreDashboard(data);

  if (!supabase) return { mode: "local" };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { mode: "local" };

  const [metrics, events, tasks, connections, analytics] = await Promise.all([
    supabase.from("dashboard_metrics").upsert(data.metrics.map((metric, index) => ({ ...toMetricRow(metric, index, workspace.workspaceId), workspace_id: workspace.workspaceId }))),
    supabase.from("module_events").upsert(data.events.map((event) => ({ ...toEventRow(event), created_by: workspace.userId, workspace_id: workspace.workspaceId }))),
    supabase.from("module_tasks").upsert(data.tasks.map((task) => ({ ...toTaskRow(task), created_by: workspace.userId, workspace_id: workspace.workspaceId }))),
    supabase.from("module_connections").upsert(data.connections.map((connection) => ({ ...toConnectionRow(connection), workspace_id: workspace.workspaceId }))),
    supabase.from("dashboard_analytics").upsert(data.analytics.map((point, index) => ({ ...toAnalyticsRow(point, index, workspace.workspaceId), workspace_id: workspace.workspaceId })))
  ]);

  if (metrics.error || events.error || tasks.error || connections.error || analytics.error) return { mode: "local" };
  return { mode: "supabase" };
}

function mapMetric(row: Record<string, unknown>): Metric {
  return {
    label: String(row.label),
    value: String(row.value),
    delta: String(row.delta ?? ""),
    tone: (row.tone as Metric["tone"]) ?? "cyan"
  };
}

function mapEvent(row: Record<string, unknown>): ModuleEvent {
  return {
    id: String(row.id),
    module: row.module as ModuleEvent["module"],
    entityType: String(row.entity_type),
    entityId: row.entity_id ? String(row.entity_id) : null,
    title: String(row.title),
    detail: String(row.detail),
    severity: row.severity as ModuleEvent["severity"],
    status: row.status as ModuleEvent["status"],
    createdAt: String(row.created_at)
  };
}

function mapTask(row: Record<string, unknown>): ModuleTask {
  return {
    id: String(row.id),
    module: row.module as ModuleTask["module"],
    title: String(row.title),
    assignee: String(row.assignee),
    priority: row.priority as ModuleTask["priority"],
    status: row.status as ModuleTask["status"],
    dueAt: row.due_at ? String(row.due_at) : null
  };
}

function mapConnection(row: Record<string, unknown>): ModuleConnection {
  return {
    id: String(row.id),
    sourceModule: row.source_module as ModuleConnection["sourceModule"],
    targetModule: row.target_module as ModuleConnection["targetModule"],
    trigger: String(row.trigger),
    action: String(row.action),
    active: Boolean(row.active)
  };
}

function mapAnalytics(row: Record<string, unknown>): DashboardAnalyticsPoint {
  return {
    label: String(row.label),
    revenue: Number(row.revenue ?? 0),
    expenses: Number(row.expenses ?? 0),
    leads: Number(row.leads ?? 0)
  };
}

function toMetricRow(metric: Metric, index: number, workspaceId: string) {
  return {
    id: `${workspaceId}-metric-${index + 1}`,
    key: metric.label.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
    label: metric.label,
    value: metric.value,
    delta: metric.delta,
    tone: metric.tone ?? "cyan",
    sort_order: index
  };
}

function toEventRow(event: ModuleEvent) {
  return {
    id: event.id,
    module: event.module,
    entity_type: event.entityType,
    entity_id: event.entityId,
    title: event.title,
    detail: event.detail,
    severity: event.severity,
    status: event.status,
    created_at: event.createdAt
  };
}

function toTaskRow(task: ModuleTask) {
  return {
    id: task.id,
    module: task.module,
    title: task.title,
    assignee: task.assignee,
    priority: task.priority,
    status: task.status,
    due_at: task.dueAt
  };
}

function toConnectionRow(connection: ModuleConnection) {
  return {
    id: connection.id,
    source_module: connection.sourceModule,
    target_module: connection.targetModule,
    trigger: connection.trigger,
    action: connection.action,
    active: connection.active
  };
}

function toAnalyticsRow(point: DashboardAnalyticsPoint, index: number, workspaceId: string) {
  return {
    id: `${workspaceId}-analytics-${index + 1}`,
    period_index: index,
    label: point.label,
    revenue: point.revenue,
    expenses: point.expenses,
    leads: point.leads
  };
}
