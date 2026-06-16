import type { NextRequest } from "next/server";
import { connectorError, getConnectorContext } from "@/lib/integrations/connectors";
import { dispatchSocialPost } from "@/lib/social/publisher";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const context = await getConnectorContext();
  if (!context) return connectorError("Session et workspace CENTRIX requis.", 401);
  const body = await request.json().catch(() => null) as { postId?: string } | null;
  if (!body?.postId) return connectorError("Publication requise.");

  const { data: post, error } = await context.supabase
    .from("marketing_posts")
    .select("id, accountIds, content, hashtags, mediaUrls, workspace_id")
    .eq("id", body.postId)
    .eq("workspace_id", context.workspaceId)
    .single();
  if (error || !post) return connectorError("Publication introuvable.", 404);

  try {
    return Response.json({ ok: true, ...(await dispatchSocialPost(context.supabase, post)) });
  } catch (publishError) {
    return connectorError(publishError instanceof Error ? publishError.message : "Publication impossible.", 502);
  }
}
