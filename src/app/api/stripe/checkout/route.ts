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

  const body = (await request.json().catch(() => null)) as { priceId?: string; customerEmail?: string; successUrl?: string; cancelUrl?: string } | null;
  if (!body?.priceId) {
    return Response.json({ error: "priceId Stripe requis." }, { status: 400 });
  }

  const origin = getTrustedAppOrigin(request);
  const params = new URLSearchParams({
    mode: "subscription",
    "line_items[0][price]": body.priceId,
    "line_items[0][quantity]": "1",
    success_url: getTrustedRedirectUrl(body.successUrl, "/billing?checkout=success", origin),
    cancel_url: getTrustedRedirectUrl(body.cancelUrl, "/billing?checkout=cancel", origin),
    allow_promotion_codes: "true"
  });
  const customerEmail = body.customerEmail ?? user.email;
  if (customerEmail) params.set("customer_email", customerEmail);

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params
  });

  const payload = await stripeResponse.json();
  if (!stripeResponse.ok) {
    return Response.json({ error: payload.error?.message ?? "Erreur Stripe Checkout." }, { status: stripeResponse.status });
  }

  return Response.json({ url: payload.url, id: payload.id });
}
