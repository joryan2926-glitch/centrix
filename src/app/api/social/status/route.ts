import { getConnectorContext } from "@/lib/integrations/connectors";
import { socialProviderStatus } from "@/lib/social/providers";

export const runtime = "nodejs";

export async function GET() {
  const context = await getConnectorContext();
  if (!context) return Response.json({ error: "Session et workspace requis." }, { status: 401 });
  return Response.json({ providers: socialProviderStatus() }, { headers: { "Cache-Control": "no-store" } });
}
