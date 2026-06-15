import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";
import type { ModulePermission } from "@/types/operations";

export type PermissionSet = Pick<ModulePermission, "can_read" | "can_create" | "can_update" | "can_delete" | "can_export" | "can_manage">;

export async function loadCurrentPermissions(supabase: SupabaseClient, moduleKey: string): Promise<{ permissions: PermissionSet; role: string; error: string | null }> {
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { error: "Workspace introuvable.", permissions: denyAll, role: "user" };
  if (workspace.role === "super_admin" || workspace.role === "admin") return { error: null, permissions: allowAll, role: workspace.role };

  const { data, error } = await supabase
    .from("module_permissions")
    .select("can_read,can_create,can_update,can_delete,can_export,can_manage")
    .eq("workspace_id", workspace.workspaceId)
    .eq("module_key", moduleKey)
    .eq("role", workspace.role)
    .maybeSingle();
  return { error: error?.message ?? null, permissions: data ? normalizePermission(data) : defaultsForRole(workspace.role), role: workspace.role };
}

export async function loadPermissionMatrix(supabase: SupabaseClient) {
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { error: "Workspace introuvable.", permissions: [] as ModulePermission[], workspace: null };
  const { data, error } = await supabase.from("module_permissions").select("*").eq("workspace_id", workspace.workspaceId).order("module_key");
  return { error: error?.message ?? null, permissions: (data ?? []) as ModulePermission[], workspace };
}

export async function saveModulePermission(supabase: SupabaseClient, permission: Pick<ModulePermission, "module_key" | "role"> & PermissionSet) {
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { error: "Workspace introuvable." };
  const { error } = await supabase.from("module_permissions").upsert({
    ...permission,
    workspace_id: workspace.workspaceId
  }, { onConflict: "workspace_id,module_key,role" });
  return { error: error?.message ?? null };
}

export async function applyPermissionTemplate(supabase: SupabaseClient, modules: readonly string[], template: "balanced" | "restricted" | "collaborative") {
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { error: "Workspace introuvable." };
  const rows = modules.flatMap((module_key) => (["manager", "employee", "client"] as const).map((role) => ({
    ...templatePermission(template, role),
    module_key,
    role,
    workspace_id: workspace.workspaceId
  })));
  const { error } = await supabase.from("module_permissions").upsert(rows, { onConflict: "workspace_id,module_key,role" });
  return { error: error?.message ?? null };
}

export const allowAll: PermissionSet = { can_create: true, can_delete: true, can_export: true, can_manage: true, can_read: true, can_update: true };
export const denyAll: PermissionSet = { can_create: false, can_delete: false, can_export: false, can_manage: false, can_read: false, can_update: false };

export function defaultsForRole(role: string): PermissionSet {
  if (role === "super_admin" || role === "admin") return allowAll;
  if (role === "manager") return { ...allowAll, can_manage: false };
  if (role === "employee") return { ...denyAll, can_create: true, can_read: true, can_update: true };
  if (role === "client") return { ...denyAll, can_read: true };
  return denyAll;
}

function templatePermission(template: "balanced" | "restricted" | "collaborative", role: string): PermissionSet {
  if (template === "restricted") return role === "manager" ? { ...denyAll, can_export: true, can_read: true } : { ...denyAll, can_read: role === "employee" };
  if (template === "collaborative") return role === "client" ? { ...denyAll, can_read: true } : { ...allowAll, can_delete: role === "manager", can_manage: false };
  return defaultsForRole(role);
}

function normalizePermission(value: Partial<PermissionSet>): PermissionSet {
  return {
    can_create: Boolean(value.can_create),
    can_delete: Boolean(value.can_delete),
    can_export: Boolean(value.can_export),
    can_manage: Boolean(value.can_manage),
    can_read: Boolean(value.can_read),
    can_update: Boolean(value.can_update)
  };
}
