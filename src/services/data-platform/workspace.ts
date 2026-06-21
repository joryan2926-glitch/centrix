import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkspaceContext, WorkspaceRole } from "@/types/data-platform";

export async function resolveWorkspaceContext(supabase: SupabaseClient): Promise<WorkspaceContext | null> {
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("workspace_id, role, workspaces(name)")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.workspace_id) {
    const { data: ownedWorkspace } = await supabase
      .from("workspaces")
      .select("id, name")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!ownedWorkspace?.id) return null;

    return {
      role: "admin",
      userId: user.id,
      workspaceId: String(ownedWorkspace.id),
      workspaceName: String(ownedWorkspace.name ?? "CENTRIX Workspace")
    };
  }
  const workspace = Array.isArray(profile.workspaces) ? profile.workspaces[0] : profile.workspaces;

  return {
    role: String(profile.role ?? "employee") as WorkspaceRole,
    userId: user.id,
    workspaceId: String(profile.workspace_id),
    workspaceName: String(workspace?.name ?? "CENTRIX Workspace")
  };
}
