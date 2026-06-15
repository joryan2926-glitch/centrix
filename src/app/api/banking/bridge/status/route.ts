import { hasBridgeCredentials } from "@/lib/banking/bridge";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return Response.json({ configured: false, connected: false });
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return Response.json({ configured: hasBridgeCredentials(), connected: false }, { status: 401 });

  const { data } = await supabase
    .from("bridge_connections")
    .select("status,last_synced_at")
    .eq("workspace_id", workspace.workspaceId)
    .eq("user_id", workspace.userId)
    .maybeSingle();

  return Response.json({
    configured: hasBridgeCredentials(),
    connected: data?.status === "connected",
    lastSyncedAt: data?.last_synced_at ?? null
  });
}
