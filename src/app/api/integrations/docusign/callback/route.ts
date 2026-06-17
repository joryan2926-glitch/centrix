import type { NextRequest } from "next/server";
import { connectorError, getConnectorContext } from "@/lib/integrations/connectors";
import { storeDocuSignConnection } from "@/lib/integrations/docusign";
import { getTrustedAppOrigin } from "@/lib/integrations/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const context = await getConnectorContext();
  const origin = getTrustedAppOrigin(request);
  const fallback = new URL("/documents?docusign=error", origin);
  if (!context) return Response.redirect(fallback, 302);

  const error = request.nextUrl.searchParams.get("error");
  if (error) return Response.redirect(new URL(`/documents?docusign=${encodeURIComponent(error)}`, origin), 302);

  const code = request.nextUrl.searchParams.get("code");
  if (!code) return connectorError("Code OAuth DocuSign manquant.", 400);

  const state = parseState(request.nextUrl.searchParams.get("state"));
  try {
    await storeDocuSignConnection(context, code, origin);
    const returnTo = state.returnTo?.startsWith("/") ? state.returnTo : "/documents";
    return Response.redirect(new URL(`${returnTo}?docusign=connected`, origin), 302);
  } catch (authError) {
    const message = authError instanceof Error ? authError.message : "Connexion DocuSign impossible.";
    return Response.redirect(new URL(`/documents?docusign=${encodeURIComponent(message)}`, origin), 302);
  }
}

function parseState(value: string | null) {
  if (!value) return { returnTo: "/documents" };
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as { returnTo?: string; workspaceId?: string };
  } catch {
    return { returnTo: "/documents" };
  }
}
