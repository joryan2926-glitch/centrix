import { getExternalIntegrationsStatus, requireExternalApiUser, unauthorizedExternalApiResponse } from "@/lib/integrations/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireExternalApiUser();
  if (!user) return unauthorizedExternalApiResponse();

  return Response.json(await getExternalIntegrationsStatus(), {
    headers: { "Cache-Control": "private, max-age=60" }
  });
}
