import type { NextRequest } from "next/server";
import { createBridgeConnectSession } from "@/lib/banking/bridge";
import { getTrustedAppOrigin, requireExternalApiUser, unauthorizedExternalApiResponse } from "@/lib/integrations/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const user = await requireExternalApiUser();
  if (!user) return unauthorizedExternalApiResponse();
  if (!user.email) return Response.json({ error: "Une adresse email utilisateur est requise." }, { status: 400 });

  try {
    const callbackUrl = `${getTrustedAppOrigin(request)}/api/banking/bridge/callback`;
    const session = await createBridgeConnectSession({ callbackUrl, email: user.email, userId: user.id });
    const supabase = await createServerSupabaseClient();
    const workspace = supabase ? await resolveWorkspaceContext(supabase) : null;
    if (supabase && workspace) {
      await supabase.from("bridge_connections").upsert({
        external_user_id: user.id,
        status: "pending",
        user_id: user.id,
        workspace_id: workspace.workspaceId
      }, { onConflict: "workspace_id,user_id" });
    }
    return Response.json(session);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Connexion Bridge indisponible." }, { status: 503 });
  }
}
