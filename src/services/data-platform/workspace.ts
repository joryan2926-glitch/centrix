import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkspaceContext, WorkspaceRole } from "@/types/data-platform";

type WorkspaceMemberRow = {
  workspace_id: string;
  role: WorkspaceRole;
  workspaces?: { name?: string | null } | Array<{ name?: string | null }> | null;
};

type ProfileRow = {
  workspace_id?: string | null;
  role?: WorkspaceRole | null;
};

type WorkspaceRow = {
  id: string;
  name: string;
  owner_id: string;
};

function getJoinedWorkspaceName(row: WorkspaceMemberRow) {
  const workspace = Array.isArray(row.workspaces) ? row.workspaces[0] : row.workspaces;
  return workspace?.name ?? "CENTRIX Workspace";
}

export async function resolveWorkspaceContext(supabase: SupabaseClient): Promise<WorkspaceContext | null> {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("workspace_id, role")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  if (profile?.workspace_id) {
    const { data: workspace } = await supabase.from("workspaces").select("id, name, owner_id").eq("id", profile.workspace_id).maybeSingle<WorkspaceRow>();
    if (workspace) {
      return {
        userId: user.id,
        workspaceId: workspace.id,
        workspaceName: workspace.name,
        role: profile.role ?? (workspace.owner_id === user.id ? "admin" : "employee")
      };
    }
  }

  const { data: member } = await supabase
    .from("workspace_members")
    .select("workspace_id, role, workspaces(name)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle<WorkspaceMemberRow>();

  if (member) {
    return {
      userId: user.id,
      workspaceId: member.workspace_id,
      workspaceName: getJoinedWorkspaceName(member),
      role: member.role
    };
  }

  const { data: ownedWorkspace } = await supabase.from("workspaces").select("id, name, owner_id").eq("owner_id", user.id).limit(1).maybeSingle<WorkspaceRow>();

  if (!ownedWorkspace) return null;

  return {
    userId: user.id,
    workspaceId: ownedWorkspace.id,
    workspaceName: ownedWorkspace.name,
    role: "admin"
  };
}
