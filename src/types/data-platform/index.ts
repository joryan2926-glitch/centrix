import type { DataTableName } from "@/repositories/supabaseRepository";

export type WorkspaceRole = "super_admin" | "admin" | "manager" | "employee" | "client";
export type WorkspaceMode = "local" | "supabase";

export type WorkspaceContext = {
  userId: string;
  workspaceId: string;
  workspaceName: string;
  role: WorkspaceRole;
};

export type DataPlatformTable = DataTableName;

export type DataPlatformRow = {
  id: string;
  workspace_id?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
};

export type DataPlatformMutation<T extends DataPlatformRow> = Omit<Partial<T>, "id"> & {
  id?: string;
  workspace_id?: string;
};

export type PlatformActivity = {
  id: string;
  module: string;
  title: string;
  detail: string;
  createdAt: string;
};

export type PlatformDashboardSnapshot = {
  workspace: WorkspaceContext | null;
  clientsCount: number;
  prospectsCount: number;
  invoicesTotal: number;
  paidRevenue: number;
  monthlyRevenue: number;
  invoicesPending: number;
  unpaidInvoices: number;
  quotesTotal: number;
  pendingQuotes: number;
  projectsActive: number;
  tasksOpen: number;
  urgentTasks: number;
  meetingsUpcoming: number;
  unreadNotifications: number;
  supportOpen: number;
  conversionRate: number;
  growthRate: number;
  cashflow: number;
  forecastRevenue: number;
  profitability: number;
  revenueSeries: Array<{ label: string; value: number }>;
  leadSeries: Array<{ label: string; value: number }>;
  cashflowSeries: Array<{ label: string; value: number }>;
  forecastSeries: Array<{ label: string; value: number }>;
  recentActivity: PlatformActivity[];
  businessPipeline: Array<{
    id: string;
    label: string;
    value: number;
    conversion: number;
    cards: Array<{
      id: string;
      amount: number;
      company: string;
      owner: string;
      score: number;
    }>;
  }>;
};
