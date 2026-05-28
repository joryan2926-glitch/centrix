import type { DataTableName } from "@/repositories/supabaseRepository";

export type WorkspaceRole = "admin" | "manager" | "employee" | "client";
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
  invoicesPending: number;
  quotesTotal: number;
  projectsActive: number;
  tasksOpen: number;
  meetingsUpcoming: number;
  unreadNotifications: number;
  supportOpen: number;
  revenueSeries: Array<{ label: string; value: number }>;
  leadSeries: Array<{ label: string; value: number }>;
  recentActivity: PlatformActivity[];
};
