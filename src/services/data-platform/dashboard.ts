import { saasCoreFallbackDashboard } from "@/data/saasCore";
import { getSupabaseClient } from "@/lib/supabase";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";
import type { DashboardAnalyticsPoint, ModuleEvent, ModuleTask, SaasCoreDashboard } from "@/types/saas-core";
import type { PlatformActivity, PlatformDashboardSnapshot } from "@/types/data-platform";
import type { Metric } from "@/types/navigation";

type TableResult = {
  clients: Record<string, unknown>[];
  prospects: Record<string, unknown>[];
  invoices: Record<string, unknown>[];
  quotes: Record<string, unknown>[];
  projects: Record<string, unknown>[];
  tasks: Record<string, unknown>[];
  meetings: Record<string, unknown>[];
  notifications: Record<string, unknown>[];
  supportTickets: Record<string, unknown>[];
  analytics: Record<string, unknown>[];
};

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  currency: "EUR",
  maximumFractionDigits: 0,
  notation: "compact",
  style: "currency"
});

function numberValue(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function dateLabel(value: unknown) {
  if (!value) return "Maintenant";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(new Date(String(value)));
}

function isOpenStatus(row: Record<string, unknown>) {
  return !["done", "completed", "closed", "resolved", "paid", "cancelled"].includes(String(row.status ?? "").toLowerCase());
}

function buildMetricCards(snapshot: PlatformDashboardSnapshot): Metric[] {
  return [
    {
      label: "Revenus factures",
      value: currencyFormatter.format(snapshot.invoicesTotal),
      delta: `${snapshot.invoicesPending} facture(s) en attente`,
      tone: "emerald"
    },
    {
      label: "Clients actifs",
      value: String(snapshot.clientsCount),
      delta: `${snapshot.prospectsCount} prospect(s) dans le pipeline`,
      tone: "cyan"
    },
    {
      label: "Projets actifs",
      value: String(snapshot.projectsActive),
      delta: `${snapshot.tasksOpen} tache(s) ouvertes`,
      tone: "violet"
    },
    {
      label: "Agenda & support",
      value: String(snapshot.meetingsUpcoming + snapshot.supportOpen),
      delta: `${snapshot.unreadNotifications} notification(s) non lues`,
      tone: "rose"
    }
  ];
}

function buildActivities(tables: TableResult): PlatformActivity[] {
  const rows: PlatformActivity[] = [
    ...tables.clients.map((row) => ({
      id: `client-${row.id}`,
      module: "clients",
      title: `Client ajoute: ${String(row.company ?? row.name ?? "Client")}`,
      detail: String(row.email ?? "Fiche client synchronisee"),
      createdAt: String(row.created_at ?? new Date().toISOString())
    })),
    ...tables.invoices.map((row) => ({
      id: `invoice-${row.id}`,
      module: "billing",
      title: `Facture ${String(row.number ?? "")}`,
      detail: `${String(row.status ?? "pending")} - ${currencyFormatter.format(numberValue(row.total))}`,
      createdAt: String(row.created_at ?? new Date().toISOString())
    })),
    ...tables.projects.map((row) => ({
      id: `project-${row.id}`,
      module: "projects",
      title: `Projet: ${String(row.name ?? "Projet")}`,
      detail: `${String(row.status ?? "planned")} - ${numberValue(row.progress)}%`,
      createdAt: String(row.created_at ?? new Date().toISOString())
    })),
    ...tables.supportTickets.map((row) => ({
      id: `support-${row.id}`,
      module: "support",
      title: `Ticket: ${String(row.title ?? "Support")}`,
      detail: `${String(row.priority ?? "medium")} - ${String(row.status ?? "open")}`,
      createdAt: String(row.created_at ?? new Date().toISOString())
    }))
  ];

  return rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);
}

function buildAnalytics(tables: TableResult): DashboardAnalyticsPoint[] {
  const explicit = tables.analytics.filter((row) => String(row.metric_key ?? "") === "revenue");
  if (explicit.length) {
    return explicit.slice(0, 8).map((row) => ({
      label: String(row.period ?? row.metric_label ?? "Periode"),
      revenue: numberValue(row.metric_value) / 1000,
      expenses: numberValue(row.dimensions && typeof row.dimensions === "object" ? (row.dimensions as Record<string, unknown>).expenses : 0) / 1000,
      leads: numberValue(row.dimensions && typeof row.dimensions === "object" ? (row.dimensions as Record<string, unknown>).leads : 0)
    }));
  }

  const paidRevenue = tables.invoices.filter((invoice) => String(invoice.status) === "paid").reduce((sum, invoice) => sum + numberValue(invoice.total), 0);
  const pendingRevenue = tables.invoices.filter((invoice) => String(invoice.status) !== "paid").reduce((sum, invoice) => sum + numberValue(invoice.total), 0);

  return [
    { label: "Clients", revenue: tables.clients.length * 2.5, expenses: 0.8, leads: tables.prospects.length },
    { label: "Devis", revenue: tables.quotes.reduce((sum, quote) => sum + numberValue(quote.total), 0) / 1000, expenses: 1.2, leads: tables.quotes.length },
    { label: "En attente", revenue: pendingRevenue / 1000, expenses: 2.1, leads: tables.prospects.filter((lead) => String(lead.stage) !== "won").length },
    { label: "Encaisse", revenue: paidRevenue / 1000, expenses: 2.8, leads: tables.prospects.filter((lead) => String(lead.stage) === "won").length }
  ];
}

function buildTasks(tables: TableResult): ModuleTask[] {
  return tables.tasks.slice(0, 12).map((task) => ({
    id: String(task.id),
    module: "projects",
    title: String(task.title ?? "Tache"),
    assignee: String(task.assignee_id ?? "Equipe"),
    priority: String(task.priority ?? "medium") as ModuleTask["priority"],
    status: String(task.status ?? "todo") as ModuleTask["status"],
    dueAt: task.due_at ? String(task.due_at) : null
  }));
}

function buildEvents(activities: PlatformActivity[]): ModuleEvent[] {
  return activities.map((activity) => ({
    id: activity.id,
    module: activity.module as ModuleEvent["module"],
    entityType: activity.module,
    entityId: activity.id,
    title: activity.title,
    detail: activity.detail,
    severity: "info",
    status: "open",
    createdAt: activity.createdAt
  }));
}

function toSaasCoreDashboard(snapshot: PlatformDashboardSnapshot, tables: TableResult): SaasCoreDashboard {
  const activities = snapshot.recentActivity;

  return {
    ...saasCoreFallbackDashboard,
    metrics: buildMetricCards(snapshot),
    analytics: buildAnalytics(tables),
    events: buildEvents(activities),
    tasks: buildTasks(tables),
    connections: saasCoreFallbackDashboard.connections
  };
}

async function selectWorkspaceRows(table: string, workspaceId: string, orderColumn = "created_at", limit = 80) {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: [], error: null };

  return supabase.from(table).select("*").eq("workspace_id", workspaceId).order(orderColumn, { ascending: false }).limit(limit);
}

export async function loadDataPlatformDashboard(): Promise<{ data: SaasCoreDashboard; snapshot: PlatformDashboardSnapshot | null; mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: saasCoreFallbackDashboard, snapshot: null, mode: "local" };

  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { data: saasCoreFallbackDashboard, snapshot: null, mode: "local" };

  const [clients, prospects, invoices, quotes, projects, tasks, meetings, notifications, supportTickets, analytics] = await Promise.all([
    selectWorkspaceRows("clients", workspace.workspaceId),
    selectWorkspaceRows("prospects", workspace.workspaceId),
    selectWorkspaceRows("invoices", workspace.workspaceId),
    selectWorkspaceRows("quotes", workspace.workspaceId),
    selectWorkspaceRows("projects", workspace.workspaceId),
    selectWorkspaceRows("tasks", workspace.workspaceId),
    selectWorkspaceRows("meetings", workspace.workspaceId, "starts_at"),
    selectWorkspaceRows("notifications", workspace.workspaceId),
    selectWorkspaceRows("support_tickets", workspace.workspaceId),
    selectWorkspaceRows("analytics", workspace.workspaceId)
  ]);

  if ([clients, prospects, invoices, quotes, projects, tasks, meetings, notifications, supportTickets, analytics].some((result) => result.error)) {
    return { data: saasCoreFallbackDashboard, snapshot: null, mode: "local" };
  }

  const tables: TableResult = {
    clients: clients.data ?? [],
    prospects: prospects.data ?? [],
    invoices: invoices.data ?? [],
    quotes: quotes.data ?? [],
    projects: projects.data ?? [],
    tasks: tasks.data ?? [],
    meetings: meetings.data ?? [],
    notifications: notifications.data ?? [],
    supportTickets: supportTickets.data ?? [],
    analytics: analytics.data ?? []
  };

  const upcomingMeetings = tables.meetings.filter((meeting) => new Date(String(meeting.starts_at ?? 0)).getTime() >= Date.now());
  const snapshot: PlatformDashboardSnapshot = {
    workspace,
    clientsCount: tables.clients.length,
    prospectsCount: tables.prospects.length,
    invoicesTotal: tables.invoices.reduce((sum, invoice) => sum + numberValue(invoice.total), 0),
    invoicesPending: tables.invoices.filter((invoice) => ["pending", "overdue"].includes(String(invoice.status))).length,
    quotesTotal: tables.quotes.reduce((sum, quote) => sum + numberValue(quote.total), 0),
    projectsActive: tables.projects.filter(isOpenStatus).length,
    tasksOpen: tables.tasks.filter(isOpenStatus).length,
    meetingsUpcoming: upcomingMeetings.length,
    unreadNotifications: tables.notifications.filter((notification) => !notification.read_at).length,
    supportOpen: tables.supportTickets.filter(isOpenStatus).length,
    revenueSeries: [],
    leadSeries: [],
    recentActivity: buildActivities(tables)
  };

  snapshot.revenueSeries = buildAnalytics(tables).map((point) => ({ label: point.label, value: point.revenue }));
  snapshot.leadSeries = buildAnalytics(tables).map((point) => ({ label: point.label, value: point.leads }));

  return { data: toSaasCoreDashboard(snapshot, tables), snapshot, mode: "supabase" };
}

export function formatActivityDate(value: string) {
  return dateLabel(value);
}
