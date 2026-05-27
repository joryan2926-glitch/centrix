import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return Response.json({ error: "STRIPE_SECRET_KEY manquante cote serveur." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as { customerId?: string; returnUrl?: string } | null;
  if (!body?.customerId) {
    return Response.json({ error: "customerId Stripe requis." }, { status: 400 });
  }

  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const params = new URLSearchParams({
    customer: body.customerId,
    return_url: body.returnUrl ?? `${origin}/billing`
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
