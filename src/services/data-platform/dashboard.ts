import type { SupabaseClient } from "@supabase/supabase-js";
import { centrixModules } from "@/data/saasCore";
import { getSupabaseClient } from "@/lib/supabase";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";
import type { DashboardAnalyticsPoint, ModuleConnection, ModuleEvent, ModuleTask, SaasCoreDashboard } from "@/types/saas-core";
import type { PlatformActivity, PlatformDashboardSnapshot, WorkspaceContext } from "@/types/data-platform";
import type { Metric } from "@/types/navigation";

type Rows = Record<string, unknown>[];

type TableResult = {
  clients: Rows;
  prospects: Rows;
  crmContacts: Rows;
  crmLeads: Rows;
  crmClients: Rows;
  salesLeads: Rows;
  salesOpportunities: Rows;
  invoices: Rows;
  quotes: Rows;
  payments: Rows;
  subscriptions: Rows;
  transactions: Rows;
  expenses: Rows;
  revenues: Rows;
  bankAccounts: Rows;
  projects: Rows;
  tasks: Rows;
  meetings: Rows;
  calendarEvents: Rows;
  reservations: Rows;
  employees: Rows;
  hrEmployees: Rows;
  payroll: Rows;
  documents: Rows;
  workflows: Rows;
  workflowRuns: Rows;
  notifications: Rows;
  realtimeNotifications: Rows;
  supportTickets: Rows;
  marketingCampaigns: Rows;
  marketingPosts: Rows;
  marketingReports: Rows;
  marketplaceOrders: Rows;
  courses: Rows;
  enrollments: Rows;
  securityLogs: Rows;
  integrations: Rows;
  oauthConnections: Rows;
  analytics: Rows;
  dashboardAnalytics: Rows;
  moduleEvents: Rows;
  moduleTasks: Rows;
  moduleConnections: Rows;
};

type TableDescriptor = {
  key: keyof TableResult;
  table: string;
  orderColumn?: string;
  workspaceScoped?: boolean;
  limit?: number;
};

const tableDescriptors: TableDescriptor[] = [
  { key: "clients", table: "clients" },
  { key: "prospects", table: "prospects" },
  { key: "crmContacts", table: "crm_contacts" },
  { key: "crmLeads", table: "crm_leads" },
  { key: "crmClients", table: "crm_clients" },
  { key: "salesLeads", table: "sales_leads" },
  { key: "salesOpportunities", table: "sales_opportunities" },
  { key: "invoices", table: "invoices" },
  { key: "quotes", table: "quotes" },
  { key: "payments", table: "payments" },
  { key: "subscriptions", table: "subscriptions" },
  { key: "transactions", table: "transactions", orderColumn: "date" },
  { key: "expenses", table: "expenses" },
  { key: "revenues", table: "revenues" },
  { key: "bankAccounts", table: "bank_accounts" },
  { key: "projects", table: "projects" },
  { key: "tasks", table: "tasks", orderColumn: "due_at" },
  { key: "meetings", table: "meetings", orderColumn: "starts_at" },
  { key: "calendarEvents", table: "calendar_events", orderColumn: "start" },
  { key: "reservations", table: "reservations", orderColumn: "start" },
  { key: "employees", table: "employees" },
  { key: "hrEmployees", table: "hr_employees" },
  { key: "payroll", table: "payroll" },
  { key: "documents", table: "documents" },
  { key: "workflows", table: "workflows" },
  { key: "workflowRuns", table: "workflow_runs" },
  { key: "notifications", table: "notifications" },
  { key: "realtimeNotifications", table: "realtime_notifications" },
  { key: "supportTickets", table: "support_tickets" },
  { key: "marketingCampaigns", table: "marketing_campaigns" },
  { key: "marketingPosts", table: "marketing_posts", orderColumn: "scheduled_at" },
  { key: "marketingReports", table: "marketing_reports" },
  { key: "marketplaceOrders", table: "marketplace_orders" },
  { key: "courses", table: "courses" },
  { key: "enrollments", table: "enrollments" },
  { key: "securityLogs", table: "security_logs" },
  { key: "integrations", table: "integrations" },
  { key: "oauthConnections", table: "oauth_connections" },
  { key: "analytics", table: "analytics" },
  { key: "dashboardAnalytics", table: "dashboard_analytics" },
  { key: "moduleEvents", table: "module_events" },
  { key: "moduleTasks", table: "module_tasks" },
  { key: "moduleConnections", table: "module_connections" }
];

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

function textValue(row: Record<string, unknown>, keys: string[], defaultValue = "") {
  for (const key of keys) {
    const value = row[key];
    if (value !== null && value !== undefined && String(value).trim()) return String(value);
  }
  return defaultValue;
}

function amountValue(row: Record<string, unknown>) {
  return numberValue(
    row.total ??
      row.amount ??
      row.value ??
      row.revenue ??
      row.price ??
      row.budget ??
      row.total_amount ??
      row.potential_amount ??
      row.estimated_amount ??
      row.monthly_amount ??
      row.balance
  );
}

function createdValue(row: Record<string, unknown>) {
  return String(row.created_at ?? row.createdAt ?? row.updated_at ?? row.date ?? row.starts_at ?? row.start ?? row.scheduled_at ?? new Date().toISOString());
}

function metricName(row: Record<string, unknown>) {
  return String(row.metric ?? row.metric_key ?? row.name ?? "");
}

function metricAmount(row: Record<string, unknown>) {
  return numberValue(row.value ?? row.metric_value ?? row.amount);
}

function dateLabel(value: unknown) {
  if (!value) return "Maintenant";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(new Date(String(value)));
}

function statusValue(row: Record<string, unknown>) {
  return String(row.status ?? row.state ?? "").toLowerCase();
}

function stageValue(row: Record<string, unknown>) {
  return String(row.stage ?? row.status ?? row.pipeline_stage ?? row.commercial_status ?? "new").toLowerCase();
}

function stageLabel(stage: string) {
  const labels: Record<string, string> = {
    contacted: "Contactes",
    contacté: "Contactes",
    lost: "Perdus",
    perdu: "Perdus",
    negotiation: "Negociation",
    négociation: "Negociation",
    new: "Nouveaux leads",
    nouveau: "Nouveaux leads",
    proposal: "Propositions",
    proposition: "Propositions",
    qualified: "Qualifies",
    qualifié: "Qualifies",
    won: "Gagnes",
    gagné: "Gagnes"
  };
  return labels[stage] ?? stage;
}

function normalizeStage(stage: string) {
  const normalized = stage.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  if (["contacte", "contacted"].includes(normalized)) return "contacted";
  if (["qualifie", "qualified"].includes(normalized)) return "qualified";
  if (["proposition", "proposal", "devis", "quote"].includes(normalized)) return "proposal";
  if (["negociation", "negotiation"].includes(normalized)) return "negotiation";
  if (["gagne", "won"].includes(normalized)) return "won";
  if (["perdu", "lost"].includes(normalized)) return "lost";
  return "new";
}

function isOpenStatus(row: Record<string, unknown>) {
  return !["done", "completed", "closed", "resolved", "paid", "cancelled", "canceled", "termine", "terminé"].includes(statusValue(row));
}

function isPaid(row: Record<string, unknown>) {
  return ["paid", "succeeded", "success", "complete", "regle", "réglé"].includes(statusValue(row));
}

function isPending(row: Record<string, unknown>) {
  return ["draft", "sent", "pending", "overdue", "open", "en_attente", "unpaid"].includes(statusValue(row));
}

function monthKey(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [year, month] = key.split("-");
  return new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(new Date(Number(year), Number(month) - 1, 1));
}

function lastMonthKeys(count = 7) {
  const now = new Date();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (count - 1 - index), 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  });
}

function sumByMonth(rows: Rows, amount: (row: Record<string, unknown>) => number, date: (row: Record<string, unknown>) => string, multiplier = 1) {
  const totals = new Map<string, number>();
  for (const row of rows) {
    const key = monthKey(date(row));
    if (!key) continue;
    totals.set(key, (totals.get(key) ?? 0) + amount(row) * multiplier);
  }
  return totals;
}

function rowsByMonth(rows: Rows, date: (row: Record<string, unknown>) => string) {
  const totals = new Map<string, number>();
  for (const row of rows) {
    const key = monthKey(date(row));
    if (!key) continue;
    totals.set(key, (totals.get(key) ?? 0) + 1);
  }
  return totals;
}

function buildEmptySnapshot(workspace: WorkspaceContext | null): PlatformDashboardSnapshot {
  const labels = lastMonthKeys();
  return {
    workspace,
    clientsCount: 0,
    prospectsCount: 0,
    invoicesTotal: 0,
    paidRevenue: 0,
    monthlyRevenue: 0,
    invoicesPending: 0,
    unpaidInvoices: 0,
    quotesTotal: 0,
    pendingQuotes: 0,
    projectsActive: 0,
    tasksOpen: 0,
    urgentTasks: 0,
    meetingsUpcoming: 0,
    unreadNotifications: 0,
    supportOpen: 0,
    conversionRate: 0,
    growthRate: 0,
    cashflow: 0,
    forecastRevenue: 0,
    profitability: 0,
    revenueSeries: labels.map((label) => ({ label: monthLabel(label), value: 0 })),
    leadSeries: labels.map((label) => ({ label: monthLabel(label), value: 0 })),
    cashflowSeries: labels.map((label) => ({ label: monthLabel(label), value: 0 })),
    forecastSeries: labels.map((label) => ({ label: monthLabel(label), value: 0 })),
    recentActivity: [],
    businessPipeline: []
  };
}

function buildEmptyDashboard(workspace: WorkspaceContext | null = null): { data: SaasCoreDashboard; snapshot: PlatformDashboardSnapshot } {
  const snapshot = buildEmptySnapshot(workspace);
  return {
    snapshot,
    data: {
      modules: centrixModules,
      metrics: buildMetricCards(snapshot),
      analytics: snapshot.revenueSeries.map((point) => ({ label: point.label, revenue: point.value, expenses: 0, leads: 0 })),
      events: [],
      tasks: [],
      connections: []
    }
  };
}

async function selectWorkspaceRows(supabase: SupabaseClient, descriptor: TableDescriptor, workspaceId: string | null) {
  const limit = descriptor.limit ?? 120;
  const orderColumn = descriptor.orderColumn ?? "created_at";
  const workspaceScoped = descriptor.workspaceScoped ?? true;

  let query = supabase.from(descriptor.table).select("*");
  if (workspaceScoped && workspaceId) query = query.eq("workspace_id", workspaceId);
  let result = await query.order(orderColumn, { ascending: false }).limit(limit);

  if (result.error && orderColumn !== "created_at") {
    let retry = supabase.from(descriptor.table).select("*");
    if (workspaceScoped && workspaceId) retry = retry.eq("workspace_id", workspaceId);
    result = await retry.order("created_at", { ascending: false }).limit(limit);
  }

  if (result.error && workspaceScoped && workspaceId && result.error.message.toLowerCase().includes("workspace_id")) {
    result = await supabase.from(descriptor.table).select("*").order(orderColumn, { ascending: false }).limit(limit);
    if (result.error && orderColumn !== "created_at") {
      result = await supabase.from(descriptor.table).select("*").order("created_at", { ascending: false }).limit(limit);
    }
  }

  if (result.error) {
    let retry = supabase.from(descriptor.table).select("*");
    if (workspaceScoped && workspaceId) retry = retry.eq("workspace_id", workspaceId);
    result = await retry.limit(limit);
  }

  if (result.error) {
    console.warn(`[CENTRIX_DASHBOARD_TABLE_SKIPPED] ${descriptor.table}`, result.error.message);
    return [];
  }

  return (result.data ?? []) as Rows;
}

async function loadTables(supabase: SupabaseClient, workspaceId: string | null): Promise<TableResult> {
  const entries = await Promise.all(
    tableDescriptors.map(async (descriptor) => [descriptor.key, await selectWorkspaceRows(supabase, descriptor, workspaceId)] as const)
  );

  return entries.reduce((acc, [key, rows]) => {
    acc[key] = rows;
    return acc;
  }, {} as TableResult);
}

function buildMetricCards(snapshot: PlatformDashboardSnapshot): Metric[] {
  return [
    {
      label: "Chiffre d'affaires",
      value: currencyFormatter.format(snapshot.invoicesTotal),
      delta: `${snapshot.growthRate >= 0 ? "+" : ""}${snapshot.growthRate.toFixed(1)}% croissance`,
      tone: "emerald"
    },
    {
      label: "Revenus mensuels",
      value: currencyFormatter.format(snapshot.monthlyRevenue),
      delta: `${snapshot.unpaidInvoices} impayee(s)`,
      tone: "cyan"
    },
    {
      label: "Clients actifs",
      value: String(snapshot.clientsCount),
      delta: `${snapshot.conversionRate.toFixed(1)}% conversion`,
      tone: "violet"
    },
    {
      label: "Taches urgentes",
      value: String(snapshot.urgentTasks),
      delta: `${snapshot.pendingQuotes} devis en attente`,
      tone: "rose"
    }
  ];
}

function activity(module: string, row: Record<string, unknown>, title: string, detail: string): PlatformActivity {
  const syntheticId = `${createdValue(row)}-${title}`.replace(/[^a-zA-Z0-9-]/g, "-");
  return {
    id: `${module}-${String(row.id ?? syntheticId)}`,
    module,
    title,
    detail,
    createdAt: createdValue(row)
  };
}

function buildActivities(tables: TableResult): PlatformActivity[] {
  const rows: PlatformActivity[] = [
    ...tables.clients.map((row) => activity("clients", row, `Client ajoute: ${textValue(row, ["company", "name", "full_name"], "Client")}`, textValue(row, ["email", "phone"], "Fiche client synchronisee"))),
    ...tables.crmLeads.map((row) => activity("crm", row, `Lead CRM: ${textValue(row, ["company", "name", "fullName"], "Prospect")}`, `${stageLabel(normalizeStage(stageValue(row)))} - ${currencyFormatter.format(amountValue(row))}`)),
    ...tables.salesLeads.map((row) => activity("crm", row, `Lead commercial: ${textValue(row, ["company", "name"], "Prospect")}`, `${stageLabel(normalizeStage(stageValue(row)))} - ${currencyFormatter.format(amountValue(row))}`)),
    ...tables.invoices.map((row) => activity("billing", row, `Facture ${textValue(row, ["number", "invoice_number"], "")}`, `${statusValue(row) || "pending"} - ${currencyFormatter.format(amountValue(row))}`)),
    ...tables.quotes.map((row) => activity("billing", row, `Devis ${textValue(row, ["number", "quote_number"], "")}`, `${statusValue(row) || "draft"} - ${currencyFormatter.format(amountValue(row))}`)),
    ...tables.transactions.map((row) => activity("banking", row, `Operation bancaire: ${textValue(row, ["label", "description", "name"], "Transaction")}`, `${statusValue(row) || "validé"} - ${currencyFormatter.format(amountValue(row))}`)),
    ...tables.projects.map((row) => activity("projects", row, `Projet: ${textValue(row, ["name", "title"], "Projet")}`, `${statusValue(row) || "planned"} - ${numberValue(row.progress)}%`)),
    ...tables.tasks.map((row) => activity("projects", row, `Tache: ${textValue(row, ["title", "name"], "Tache")}`, `${textValue(row, ["priority"], "medium")} - ${statusValue(row) || "todo"}`)),
    ...tables.calendarEvents.map((row) => activity("agenda", row, `Agenda: ${textValue(row, ["title", "name"], "Evenement")}`, textValue(row, ["status", "location"], "Evenement planifie"))),
    ...tables.employees.map((row) => activity("hr", row, `Employe: ${textValue(row, ["name", "full_name"], "Collaborateur")}`, textValue(row, ["role", "position"], "Profil RH synchronise"))),
    ...tables.hrEmployees.map((row) => activity("hr", row, `Employe RH: ${textValue(row, ["name", "fullName"], "Collaborateur")}`, textValue(row, ["role", "position"], "Profil RH synchronise"))),
    ...tables.documents.map((row) => activity("documents", row, `Document: ${textValue(row, ["name", "title", "file_name"], "Fichier")}`, textValue(row, ["category", "mime_type"], "Stockage cloud"))),
    ...tables.marketingCampaigns.map((row) => activity("marketing", row, `Campagne: ${textValue(row, ["name", "title"], "Campagne")}`, `${statusValue(row) || "draft"} - ${currencyFormatter.format(amountValue(row))}`)),
    ...tables.marketingPosts.map((row) => activity("social", row, `Publication: ${textValue(row, ["title", "content"], "Post social")}`, `${statusValue(row) || "scheduled"} - ${textValue(row, ["network", "platform"], "reseau")}`)),
    ...tables.workflowRuns.map((row) => activity("automations", row, `Workflow execute`, `${statusValue(row) || "running"} - ${textValue(row, ["message", "name"], "Execution")}`)),
    ...tables.supportTickets.map((row) => activity("support", row, `Ticket: ${textValue(row, ["title", "subject"], "Support")}`, `${textValue(row, ["priority"], "medium")} - ${statusValue(row) || "open"}`)),
    ...tables.marketplaceOrders.map((row) => activity("marketplace", row, `Commande marketplace`, `${statusValue(row) || "pending"} - ${currencyFormatter.format(amountValue(row))}`)),
    ...tables.securityLogs.map((row) => activity("security", row, `Securite: ${textValue(row, ["event", "action", "title"], "Evenement")}`, textValue(row, ["ip_address", "severity", "detail"], "Journal audit")))
  ];

  return rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 14);
}

function buildBusinessPipeline(tables: TableResult): PlatformDashboardSnapshot["businessPipeline"] {
  const stages = ["new", "qualified", "proposal", "negotiation", "won", "lost"];
  const leads = [...tables.prospects, ...tables.crmLeads, ...tables.salesLeads, ...tables.salesOpportunities];
  const totalProspects = Math.max(leads.length, 1);

  return stages.map((stage) => {
    const stageRows = leads.filter((row) => normalizeStage(stageValue(row)) === stage);
    const value = stageRows.reduce((sum, row) => sum + amountValue(row), 0);
    return {
      id: stage,
      label: stageLabel(stage),
      value,
      conversion: Math.round((stageRows.length / totalProspects) * 100),
      cards: stageRows.slice(0, 5).map((row) => {
        const metadata = row.metadata && typeof row.metadata === "object" ? row.metadata as Record<string, unknown> : {};
        return {
          id: String(row.id),
          amount: amountValue(row),
          company: textValue(row, ["company", "company_name", "name", "title"], "Prospect"),
          owner: String(row.owner ?? row.owner_name ?? metadata.owner ?? "Equipe"),
          score: Math.min(100, Math.max(0, Math.round(numberValue(row.score ?? row.ai_score ?? metadata.probability))))
        };
      })
    };
  }).filter((column) => column.cards.length || column.value > 0);
}

function buildAnalytics(tables: TableResult, snapshot: PlatformDashboardSnapshot): DashboardAnalyticsPoint[] {
  const explicit = [...tables.dashboardAnalytics, ...tables.analytics].filter((row) => ["revenue", "revenus", "ca"].includes(metricName(row).toLowerCase()));
  if (explicit.length) {
    return explicit.slice(0, 8).map((row) => {
      const metadata = row.metadata && typeof row.metadata === "object" ? row.metadata as Record<string, unknown> : {};
      return {
        label: String(row.period ?? row.label ?? row.metric ?? "Periode"),
        revenue: metricAmount(row) / 1000,
        expenses: numberValue(metadata.expenses ?? row.expenses) / 1000,
        leads: numberValue(metadata.leads ?? row.leads)
      };
    });
  }

  return snapshot.revenueSeries.map((point, index) => ({
    label: point.label,
    revenue: point.value,
    expenses: Math.max(0, (snapshot.revenueSeries[index]?.value ?? 0) - (snapshot.cashflowSeries[index]?.value ?? 0)),
    leads: snapshot.leadSeries[index]?.value ?? 0
  }));
}

function toModuleTask(row: Record<string, unknown>, module: ModuleTask["module"]): ModuleTask {
  const rawStatus = statusValue(row);
  const status = rawStatus.includes("progress") || rawStatus.includes("cours") ? "in_progress" : rawStatus.includes("done") || rawStatus.includes("termin") ? "done" : rawStatus.includes("block") ? "blocked" : "todo";
  const rawPriority = String(row.priority ?? "").toLowerCase();
  const priority = rawPriority.includes("urgent") ? "urgent" : rawPriority.includes("high") || rawPriority.includes("haute") ? "high" : rawPriority.includes("low") || rawPriority.includes("faible") ? "low" : "medium";
  return {
    id: String(row.id),
    module,
    title: textValue(row, ["title", "name", "label"], "Tache"),
    assignee: textValue(row, ["assignee", "assignee_id", "owner", "owner_id"], "Equipe"),
    priority,
    status,
    dueAt: row.due_at || row.dueAt || row.deadline ? String(row.due_at ?? row.dueAt ?? row.deadline) : null
  };
}

function buildTasks(tables: TableResult): ModuleTask[] {
  return [
    ...tables.tasks.map((task) => toModuleTask(task, "projects")),
    ...tables.moduleTasks.map((task) => toModuleTask(task, String(task.module ?? "dashboard") as ModuleTask["module"])),
    ...tables.crmLeads.filter((lead) => isOpenStatus(lead)).map((lead) => toModuleTask({ ...lead, title: `Relancer ${textValue(lead, ["company", "name"], "prospect")}` }, "crm")),
    ...tables.supportTickets.filter((ticket) => isOpenStatus(ticket)).map((ticket) => toModuleTask({ ...ticket, title: `Traiter ticket ${textValue(ticket, ["title", "subject"], "support")}` }, "support"))
  ].sort((a, b) => new Date(a.dueAt ?? "2999-01-01").getTime() - new Date(b.dueAt ?? "2999-01-01").getTime()).slice(0, 12);
}

function toModuleEvent(activityItem: PlatformActivity): ModuleEvent {
  return {
    id: activityItem.id,
    module: activityItem.module as ModuleEvent["module"],
    entityType: activityItem.module,
    entityId: activityItem.id,
    title: activityItem.title,
    detail: activityItem.detail,
    severity: "info",
    status: "open",
    createdAt: activityItem.createdAt
  };
}

function buildEvents(tables: TableResult, activities: PlatformActivity[]): ModuleEvent[] {
  const moduleEvents = tables.moduleEvents.map((row) => ({
    id: String(row.id),
    module: String(row.module ?? "dashboard") as ModuleEvent["module"],
    entityType: textValue(row, ["entity_type", "entityType"], String(row.module ?? "dashboard")),
    entityId: row.entity_id || row.entityId ? String(row.entity_id ?? row.entityId) : null,
    title: textValue(row, ["title"], "Evenement"),
    detail: textValue(row, ["detail", "description"], ""),
    severity: String(row.severity ?? "info") as ModuleEvent["severity"],
    status: String(row.status ?? "open") as ModuleEvent["status"],
    createdAt: createdValue(row)
  }));

  return [...moduleEvents, ...activities.map(toModuleEvent)]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 18);
}

function buildConnections(tables: TableResult): ModuleConnection[] {
  const fromModuleConnections = tables.moduleConnections.map((row) => ({
    id: String(row.id),
    sourceModule: String(row.source_module ?? row.sourceModule ?? "dashboard") as ModuleConnection["sourceModule"],
    targetModule: String(row.target_module ?? row.targetModule ?? "dashboard") as ModuleConnection["targetModule"],
    trigger: textValue(row, ["trigger"], "Evenement"),
    action: textValue(row, ["action"], "Action"),
    active: Boolean(row.active ?? statusValue(row) === "active")
  }));

  const workflowConnections = tables.workflows.map((row) => ({
    id: `workflow-${String(row.id)}`,
    sourceModule: "automations" as const,
    targetModule: "dashboard" as const,
    trigger: textValue(row, ["trigger", "name", "title"], "Workflow"),
    action: textValue(row, ["action", "description"], "Synchronisation dashboard"),
    active: statusValue(row) === "active" || Boolean(row.active)
  }));

  const integrationConnections = [...tables.integrations, ...tables.oauthConnections].map((row) => ({
    id: `integration-${String(row.id)}`,
    sourceModule: "integrations" as const,
    targetModule: "dashboard" as const,
    trigger: textValue(row, ["provider", "name"], "Integration"),
    action: textValue(row, ["status", "scope"], "Connexion externe"),
    active: statusValue(row) === "active" || Boolean(row.active)
  }));

  return [...fromModuleConnections, ...workflowConnections, ...integrationConnections].slice(0, 12);
}

function currentMonthTotal(rows: Rows, amount: (row: Record<string, unknown>) => number, date: (row: Record<string, unknown>) => string) {
  const current = monthKey(new Date().toISOString());
  return rows.reduce((sum, row) => monthKey(date(row)) === current ? sum + amount(row) : sum, 0);
}

function calculateGrowth(series: Array<{ value: number }>) {
  const lastNonZero = [...series].reverse().find((point) => point.value > 0)?.value ?? 0;
  const previousNonZero = [...series].reverse().slice(1).find((point) => point.value > 0)?.value ?? 0;
  if (!previousNonZero) return lastNonZero ? 100 : 0;
  return ((lastNonZero - previousNonZero) / previousNonZero) * 100;
}

function buildSnapshot(workspace: WorkspaceContext | null, tables: TableResult): PlatformDashboardSnapshot {
  const clients = [...tables.clients, ...tables.crmClients];
  const leads = [...tables.prospects, ...tables.crmLeads, ...tables.salesLeads, ...tables.salesOpportunities];
  const wonLeads = leads.filter((lead) => normalizeStage(stageValue(lead)) === "won").length;
  const upcomingMeetings = [...tables.meetings, ...tables.calendarEvents, ...tables.reservations].filter((meeting) => {
    const date = new Date(String(meeting.starts_at ?? meeting.start ?? meeting.date ?? meeting.scheduled_at ?? 0));
    return date.getTime() >= Date.now();
  });
  const paidRevenue = [
    ...tables.invoices.filter(isPaid),
    ...tables.payments.filter(isPaid),
    ...tables.revenues
  ].reduce((sum, row) => sum + amountValue(row), 0);
  const invoiceTotal = tables.invoices.reduce((sum, row) => sum + amountValue(row), 0);
  const quoteTotal = tables.quotes.reduce((sum, row) => sum + amountValue(row), 0);
  const transactionIncome = tables.transactions.filter((row) => ["income", "revenue", "credit"].includes(String(row.type ?? row.direction ?? "").toLowerCase())).reduce((sum, row) => sum + amountValue(row), 0);
  const expensesTotal = [
    ...tables.expenses,
    ...tables.transactions.filter((row) => ["expense", "debit"].includes(String(row.type ?? row.direction ?? "").toLowerCase()))
  ].reduce((sum, row) => sum + amountValue(row), 0);
  const revenueRows = [...tables.invoices.filter(isPaid), ...tables.payments.filter(isPaid), ...tables.revenues, ...tables.transactions.filter((row) => ["income", "revenue", "credit"].includes(String(row.type ?? row.direction ?? "").toLowerCase()))];
  const expenseRows = [...tables.expenses, ...tables.transactions.filter((row) => ["expense", "debit"].includes(String(row.type ?? row.direction ?? "").toLowerCase()))];
  const revenueByMonth = sumByMonth(revenueRows, amountValue, createdValue);
  const expenseByMonth = sumByMonth(expenseRows, amountValue, createdValue);
  const leadByMonth = rowsByMonth(leads, createdValue);
  const monthKeys = lastMonthKeys();
  const revenueSeries = monthKeys.map((key) => ({ label: monthLabel(key), value: Math.round((revenueByMonth.get(key) ?? 0) / 1000) }));
  const leadSeries = monthKeys.map((key) => ({ label: monthLabel(key), value: leadByMonth.get(key) ?? 0 }));
  const cashflowSeries = monthKeys.map((key) => ({ label: monthLabel(key), value: Math.round(((revenueByMonth.get(key) ?? 0) - (expenseByMonth.get(key) ?? 0)) / 1000) }));
  const openQuotes = tables.quotes.filter(isPending).reduce((sum, row) => sum + amountValue(row), 0);
  const openPipeline = leads.filter((lead) => !["won", "lost"].includes(normalizeStage(stageValue(lead)))).reduce((sum, row) => sum + amountValue(row), 0);
  const forecastRevenue = paidRevenue + openQuotes * 0.42 + openPipeline * 0.28;
  const forecastSeries = monthKeys.map((key, index) => {
    const base = revenueByMonth.get(key) ?? 0;
    const forecast = base + (forecastRevenue / Math.max(monthKeys.length, 1)) * ((index + 1) / monthKeys.length);
    return { label: monthLabel(key), value: Math.round(forecast / 1000) };
  });
  const cashflow = paidRevenue + transactionIncome - expensesTotal;
  const monthlyRevenue = currentMonthTotal(revenueRows, amountValue, createdValue) || paidRevenue;
  const profitability = monthlyRevenue ? Math.max(0, Math.min(100, (cashflow / monthlyRevenue) * 100)) : 0;
  const unreadNotifications = [...tables.notifications, ...tables.realtimeNotifications].filter((notification) => !notification.read_at && !notification.readAt).length;
  const urgentTasks = [...tables.tasks, ...tables.moduleTasks].filter((task) => ["urgent", "high", "haute"].includes(String(task.priority ?? "").toLowerCase())).length;
  const growthMetric = [...tables.analytics, ...tables.dashboardAnalytics].find((row) => metricName(row).toLowerCase() === "growth");
  const snapshot: PlatformDashboardSnapshot = {
    workspace,
    clientsCount: clients.length,
    prospectsCount: leads.length,
    invoicesTotal: invoiceTotal,
    paidRevenue,
    monthlyRevenue,
    invoicesPending: tables.invoices.filter(isPending).length,
    unpaidInvoices: tables.invoices.filter((invoice) => !isPaid(invoice)).length,
    quotesTotal: quoteTotal,
    pendingQuotes: tables.quotes.filter(isPending).length,
    projectsActive: tables.projects.filter(isOpenStatus).length,
    tasksOpen: [...tables.tasks, ...tables.moduleTasks].filter(isOpenStatus).length,
    urgentTasks,
    meetingsUpcoming: upcomingMeetings.length,
    unreadNotifications,
    supportOpen: tables.supportTickets.filter(isOpenStatus).length,
    conversionRate: leads.length ? (wonLeads / leads.length) * 100 : 0,
    growthRate: growthMetric ? metricAmount(growthMetric) : calculateGrowth(revenueSeries),
    cashflow,
    forecastRevenue,
    profitability,
    revenueSeries,
    leadSeries,
    cashflowSeries,
    forecastSeries,
    recentActivity: buildActivities(tables),
    businessPipeline: buildBusinessPipeline(tables)
  };

  return snapshot;
}

function toSaasCoreDashboard(snapshot: PlatformDashboardSnapshot, tables: TableResult): SaasCoreDashboard {
  return {
    modules: centrixModules,
    metrics: buildMetricCards(snapshot),
    analytics: buildAnalytics(tables, snapshot),
    events: buildEvents(tables, snapshot.recentActivity),
    tasks: buildTasks(tables),
    connections: buildConnections(tables)
  };
}

export async function loadDataPlatformDashboard(): Promise<{ data: SaasCoreDashboard; snapshot: PlatformDashboardSnapshot | null; mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    const empty = buildEmptyDashboard();
    return { data: empty.data, snapshot: empty.snapshot, mode: "local" };
  }

  const workspace = await resolveWorkspaceContext(supabase);
  const tables = await loadTables(supabase, workspace?.workspaceId ?? null);
  const snapshot = buildSnapshot(workspace, tables);

  return { data: toSaasCoreDashboard(snapshot, tables), snapshot, mode: "supabase" };
}

export function formatActivityDate(value: string) {
  return dateLabel(value);
}
