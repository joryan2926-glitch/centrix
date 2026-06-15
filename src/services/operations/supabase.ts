import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";
import type { OperationalHistory, OperationalRecord, OperationalRecordDraft } from "@/types/operations";

export async function loadOperationalModule(supabase: SupabaseClient, moduleKey: string) {
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { error: "Workspace introuvable.", history: [], records: [], workspace: null };

  const [records, history] = await Promise.all([
    supabase.from("module_records").select("*").eq("workspace_id", workspace.workspaceId).eq("module_key", moduleKey).order("updated_at", { ascending: false }),
    supabase.from("module_record_history").select("*").eq("workspace_id", workspace.workspaceId).eq("module_key", moduleKey).order("created_at", { ascending: false }).limit(40)
  ]);
  const error = records.error?.message ?? null;
  return {
    error,
    history: (history.data ?? []) as OperationalHistory[],
    records: (records.data ?? []) as OperationalRecord[],
    workspace
  };
}

export async function createOperationalRecord(supabase: SupabaseClient, moduleKey: string, draft: OperationalRecordDraft) {
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { data: null, error: "Workspace introuvable." };
  const id = crypto.randomUUID();
  const { data, error } = await supabase.from("module_records").insert({
    ...draft,
    id,
    module_key: moduleKey,
    workspace_id: workspace.workspaceId,
    created_by: workspace.userId
  }).select("*").single();
  if (!error) await writeHistory(supabase, workspace.workspaceId, moduleKey, id, workspace.userId, "created", `${draft.title} a ete cree.`);
  if (!error && moduleKey === "permissions") await syncModulePermission(supabase, workspace.workspaceId, draft);
  return { data: data as OperationalRecord | null, error: error?.message ?? null };
}

export async function updateOperationalRecord(supabase: SupabaseClient, moduleKey: string, id: string, draft: OperationalRecordDraft) {
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { data: null, error: "Workspace introuvable." };
  const { data, error } = await supabase.from("module_records").update({ ...draft, updated_at: new Date().toISOString() }).eq("workspace_id", workspace.workspaceId).eq("module_key", moduleKey).eq("id", id).select("*").single();
  if (!error) await writeHistory(supabase, workspace.workspaceId, moduleKey, id, workspace.userId, "updated", `${draft.title} a ete modifie.`);
  if (!error && moduleKey === "permissions") await syncModulePermission(supabase, workspace.workspaceId, draft);
  return { data: data as OperationalRecord | null, error: error?.message ?? null };
}

export async function executeOperationalAction(supabase: SupabaseClient, moduleKey: string, action: string) {
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { error: "Workspace introuvable." };
  const { error } = await supabase.from("module_record_history").insert({
    action: "workflow_action",
    actor_id: workspace.userId,
    detail: `${action} lance depuis le module ${moduleKey}.`,
    module_key: moduleKey,
    record_id: null,
    workspace_id: workspace.workspaceId
  });
  return { error: error?.message ?? null };
}

export async function deleteOperationalRecord(supabase: SupabaseClient, moduleKey: string, record: OperationalRecord) {
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { error: "Workspace introuvable." };
  const { error } = await supabase.from("module_records").delete().eq("workspace_id", workspace.workspaceId).eq("module_key", moduleKey).eq("id", record.id);
  if (!error) await writeHistory(supabase, workspace.workspaceId, moduleKey, null, workspace.userId, "deleted", `${record.title} a ete supprime.`);
  return { error: error?.message ?? null };
}

async function writeHistory(supabase: SupabaseClient, workspaceId: string, moduleKey: string, recordId: string | null, actorId: string, action: string, detail: string) {
  await supabase.from("module_record_history").insert({
    action,
    actor_id: actorId,
    detail,
    module_key: moduleKey,
    record_id: recordId,
    workspace_id: workspaceId
  });
}

async function syncModulePermission(supabase: SupabaseClient, workspaceId: string, draft: OperationalRecordDraft) {
  const roleMap: Record<string, string> = { Admin: "admin", Client: "client", Employe: "employee", Manager: "manager" };
  const role = roleMap[String(draft.metadata.role ?? "")];
  const moduleKey = String(draft.metadata.module ?? "").trim();
  if (!role || !moduleKey) return;
  await supabase.from("module_permissions").upsert({
    can_create: Boolean(draft.metadata.can_create),
    can_delete: Boolean(draft.metadata.can_delete),
    can_export: Boolean(draft.metadata.can_export),
    can_manage: Boolean(draft.metadata.can_manage),
    can_read: Boolean(draft.metadata.can_read),
    can_update: Boolean(draft.metadata.can_update),
    module_key: moduleKey,
    role,
    workspace_id: workspaceId
  }, { onConflict: "workspace_id,module_key,role" });
}
