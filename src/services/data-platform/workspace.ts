import type { SupabaseClient } from "@supabase/supabase-js";
import { DEMO_WORKSPACE_CONTEXT } from "@/lib/auth/demo-session";
import type { WorkspaceContext } from "@/types/data-platform";

export async function resolveWorkspaceContext(supabase: SupabaseClient): Promise<WorkspaceContext | null> {
  void supabase;
  return DEMO_WORKSPACE_CONTEXT;
}
