import type { SupabaseClient } from "@supabase/supabase-js";
import { DEMO_WORKSPACE_CONTEXT } from "@/lib/auth/demo-session";
import { DEMO_MODE } from "@/lib/demo-mode";
import type { WorkspaceContext, WorkspaceRole } from "@/types/data-platform";

export async function resolveWorkspaceContext(supabase: SupabaseClient): Promise<WorkspaceContext | null> {
  if (DEMO_MODE) return DEMO_WORKSPACE_CONTEXT;

  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("workspace_id, role, workspaces(name)")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.workspace_id) return null;
  const workspace = Array.isArray(profile.workspaces) ? profile.workspaces[0] : profile.workspaces;

  return {
    role: String(profile.role ?? "employee") as WorkspaceRole,
    userId: user.id,
    workspaceId: String(profile.workspace_id),
    workspaceName: String(workspace?.name ?? "CENTRIX Workspace")
  };
}
