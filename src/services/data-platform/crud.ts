import { getSupabaseClient } from "@/lib/supabase";
import { createRepository, type DataTableName } from "@/repositories/supabaseRepository";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";
import type { DataPlatformMutation, DataPlatformRow, WorkspaceContext } from "@/types/data-platform";

export type CrudResult<T> = {
  data: T | null;
  error: string | null;
  workspace: WorkspaceContext | null;
};

export async function listWorkspaceRows<T extends DataPlatformRow>(table: DataTableName, limit = 100): Promise<CrudResult<T[]>> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: null, error: "Supabase non configure.", workspace: null };

  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace && table !== "users" && table !== "profiles") return { data: null, error: "Workspace introuvable.", workspace: null };

  const repository = createRepository<T>(supabase, table);
  const result = workspace && table !== "users" && table !== "profiles" ? await repository.list({ workspaceId: workspace.workspaceId, limit }) : await repository.list({ limit });

  return { data: result.data, error: result.error, workspace };
}

export async function createWorkspaceRow<T extends DataPlatformRow>(table: DataTableName, values: DataPlatformMutation<T>): Promise<CrudResult<T>> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: null, error: "Supabase non configure.", workspace: null };

  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace && table !== "users" && table !== "profiles") return { data: null, error: "Workspace introuvable.", workspace: null };

  const repository = createRepository<T>(supabase, table);
  const payload = workspace && table !== "users" && table !== "profiles" ? { ...values, workspace_id: workspace.workspaceId } : values;
  const result = await repository.create(payload as Partial<T>);

  return { data: result.data, error: result.error, workspace };
}

export async function updateWorkspaceRow<T extends DataPlatformRow>(table: DataTableName, id: string, values: DataPlatformMutation<T>): Promise<CrudResult<T>> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: null, error: "Supabase non configure.", workspace: null };

  const workspace = await resolveWorkspaceContext(supabase);
  const repository = createRepository<T>(supabase, table);
  const result = await repository.update(id, values as Partial<T>);

  return { data: result.data, error: result.error, workspace };
}

export async function deleteWorkspaceRow<T extends DataPlatformRow>(table: DataTableName, id: string): Promise<CrudResult<T>> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: null, error: "Supabase non configure.", workspace: null };

  const workspace = await resolveWorkspaceContext(supabase);
  const repository = createRepository<T>(supabase, table);
  const result = await repository.delete(id);

  return { data: result.data, error: result.error, workspace };
}
