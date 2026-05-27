import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return Response.json({ error: "STRIPE_SECRET_KEY manquante cote serveur." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as { priceId?: string; customerEmail?: string; successUrl?: string; cancelUrl?: string } | null;
  if (!body?.priceId) {
    return Response.json({ error: "priceId Stripe requis." }, { status: 400 });
  }

  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const params = new URLSearchParams({
    mode: "subscription",
    "line_items[0][price]": body.priceId,
    "line_items[0][quantity]": "1",
    success_url: body.successUrl ?? `${origin}/billing?checkout=success`,
    cancel_url: body.cancelUrl ?? `${origin}/billing?checkout=cancel`,
    allow_promotion_codes: "true"
  });
  if (body.customerEmail) params.set("customer_email", body.customerEmail);

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
