import type { NextRequest } from "next/server";
import { getTrustedAppOrigin, getTrustedRedirectUrl, requireExternalApiUser, unauthorizedExternalApiResponse } from "@/lib/integrations/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const user = await requireExternalApiUser();
  if (!user) return unauthorizedExternalApiResponse();

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return Response.json({ error: "STRIPE_SECRET_KEY manquante cote serveur." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as { customerId?: string; returnUrl?: string } | null;
  if (!body?.customerId) {
    return Response.json({ error: "customerId Stripe requis." }, { status: 400 });
  }

  const origin = getTrustedAppOrigin(request);
  const params = new URLSearchParams({
    customer: body.customerId,
    return_url: getTrustedRedirectUrl(body.returnUrl, "/billing", origin)
  });

  const stripeResponse = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params
  });

  const payload = await stripeResponse.json();
  if (!stripeResponse.ok) {
    return Response.json({ error: payload.error?.message ?? "Erreur Stripe Portal." }, { status: stripeResponse.status });
  }

  return Response.json({ url: payload.url });
}
