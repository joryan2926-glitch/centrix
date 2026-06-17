import type { NextRequest } from "next/server";
import { connectorError, getConnectorContext } from "@/lib/integrations/connectors";
import { getDocuSignAuthUrl, hasDocuSignOAuthConfig } from "@/lib/integrations/docusign";
import { getTrustedAppOrigin } from "@/lib/integrations/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const context = await getConnectorContext();
  if (!context) return connectorError("Session et workspace CENTRIX requis.", 401);
  if (!hasDocuSignOAuthConfig()) return connectorError("Configurez DOCUSIGN_INTEGRATION_KEY et DOCUSIGN_CLIENT_SECRET dans Vercel.", 503);

  const origin = getTrustedAppOrigin(request);
  const returnTo = request.nextUrl.searchParams.get("returnTo") ?? "/documents";
  const state = Buffer.from(JSON.stringify({ returnTo, workspaceId: context.workspaceId })).toString("base64url");

  return Response.redirect(getDocuSignAuthUrl(origin, state), 302);
}
