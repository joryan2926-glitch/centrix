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
    return Response.json({ error: error instanceof Error ? error.message : "Synchronisation bancaire impossible." }, { status: 503 });
  }
}
