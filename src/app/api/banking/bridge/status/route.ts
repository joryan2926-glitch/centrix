import { getBridgeBankingSummary, hasBridgeCredentials } from "@/lib/banking/bridge";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return Response.json({ configured: false, connected: false });
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return Response.json({ configured: hasBridgeCredentials(), connected: false }, { status: 401 });

  return Response.json(await getBridgeBankingSummary(supabase, workspace), {
    headers: { "Cache-Control": "no-store" }
  });
}
