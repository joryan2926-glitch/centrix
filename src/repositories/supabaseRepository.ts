import type { SupabaseClient } from "@supabase/supabase-js";

export type CrudResult<T> = {
  data: T | null;
  error: string | null;
};

export type ListResult<T> = {
  data: T[];
  error: string | null;
};

export const allowedDataTables = [
  "users",
  "profiles",
  "workspaces",
  "clients",
  "prospects",
  "invoices",
  "quotes",
  "projects",
  "tasks",
  "employees",
  "payroll",
  "notifications",
  "meetings",
  "documents",
  "messages",
  "workflows",
  "analytics",
  "subscriptions",
  "support_tickets"
] as const;

export type DataTableName = (typeof allowedDataTables)[number];

export function isAllowedDataTable(table: string): table is DataTableName {
  return allowedDataTables.includes(table as DataTableName);
}

export class SupabaseRepository<T extends Record<string, unknown>> {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly table: DataTableName
  ) {}

  async list(options?: { workspaceId?: string; limit?: number; query?: string; orderBy?: string }): Promise<ListResult<T>> {
    let request = this.supabase.from(this.table).select("*");

    if (options?.workspaceId && this.table !== "users" && this.table !== "profiles") {
      request = request.eq("workspace_id", options.workspaceId);
    }

    if (options?.query) {
      request = request.or(`name.ilike.%${options.query}%,title.ilike.%${options.query}%,email.ilike.%${options.query}%`);
    }

    const { data, error } = await request.order(options?.orderBy ?? "created_at", { ascending: false }).limit(options?.limit ?? 50);
    return { data: (data ?? []) as T[], error: error?.message ?? null };
  }

  async get(id: string): Promise<CrudResult<T>> {
    const { data, error } = await this.supabase.from(this.table).select("*").eq("id", id).maybeSingle();
    return { data: (data as T | null) ?? null, error: error?.message ?? null };
  }

  async create(values: Partial<T>): Promise<CrudResult<T>> {
    const { data, error } = await this.supabase.from(this.table).insert(values as never).select("*").single();
    return { data: (data as T | null) ?? null, error: error?.message ?? null };
  }

  async update(id: string, values: Partial<T>): Promise<CrudResult<T>> {
    const { data, error } = await this.supabase.from(this.table).update(values as never).eq("id", id).select("*").single();
    return { data: (data as T | null) ?? null, error: error?.message ?? null };
  }

  async delete(id: string): Promise<CrudResult<T>> {
    const { data, error } = await this.supabase.from(this.table).delete().eq("id", id).select("*").maybeSingle();
    return { data: (data as T | null) ?? null, error: error?.message ?? null };
  }
}

export function createRepository<T extends Record<string, unknown>>(supabase: SupabaseClient, table: DataTableName) {
  return new SupabaseRepository<T>(supabase, table);
}
