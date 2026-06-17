import { syncBridgeBankingData } from "@/lib/banking/bridge";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";

export const runtime = "nodejs";

export async function POST() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return Response.json({ error: "Supabase non configure." }, { status: 503 });
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return Response.json({ error: "Session ou workspace introuvable." }, { status: 401 });

  try {
    return Response.json(await syncBridgeBankingData(supabase, workspace));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Synchronisation bancaire impossible.";
    await supabase.from("bridge_connections").upsert({
      external_user_id: workspace.userId,
      last_error: message,
      status: "attention_required",
      user_id: workspace.userId,
      workspace_id: workspace.workspaceId
    }, { onConflict: "workspace_id,user_id" });
    return Response.json({ error: message }, { status: 503 });
  }
}
