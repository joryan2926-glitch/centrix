import type { NextRequest } from "next/server";
import { connectorError, getConnectorContext } from "@/lib/integrations/connectors";
import { getDocuSignConnection, hasDocuSignOAuthConfig, syncDocuSignEnvelopeStatus } from "@/lib/integrations/docusign";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const context = await getConnectorContext();
  if (!context) return connectorError("Session et workspace CENTRIX requis.", 401);

  const envelopeId = request.nextUrl.searchParams.get("envelopeId");
  if (envelopeId) {
    try {
      const signature = await syncDocuSignEnvelopeStatus(context, envelopeId);
      return Response.json({ ok: true, signature }, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
      return connectorError(error instanceof Error ? error.message : "Synchronisation DocuSign impossible.", 502);
    }
  }

  const connection = await getDocuSignConnection(context.supabase, context.workspaceId);
  const { data: signatures, error } = await context.supabase
    .from("docusign_signature_requests")
    .select("*")
    .eq("workspace_id", context.workspaceId)
    .order("updated_at", { ascending: false })
    .limit(50);
  if (error) return connectorError(error.message, 500);

  return Response.json({
    configured: hasDocuSignOAuthConfig(),
    connected: Boolean(connection),
    connection: connection ? {
      accountId: connection.account_id,
      baseUri: connection.base_uri,
      expiresAt: connection.expires_at
    } : null,
    signatures: signatures ?? []
  }, { headers: { "Cache-Control": "no-store" } });
}
