import type { NextRequest } from "next/server";
import { getTrustedAppOrigin, getTrustedRedirectUrl, requireExternalApiUser, unauthorizedExternalApiResponse } from "@/lib/integrations/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const user = await requireExternalApiUser();
  if (!user) return unauthorizedExternalApiResponse();

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return Response.json({ error: "STRIPE_SECRET_KEY manquante cote serveur." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as { priceId?: string; successUrl?: string; cancelUrl?: string } | null;
  if (!body?.priceId) {
    return Response.json({ error: "priceId Stripe requis." }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const [{ data: profile }, { data: plan }] = await Promise.all([
    supabase?.from("profiles").select("workspace_id").eq("id", user.id).maybeSingle() ?? Promise.resolve({ data: null }),
    supabase?.from("subscription_plans").select("id,code").eq("stripePriceId", body.priceId).maybeSingle() ?? Promise.resolve({ data: null })
  ]);
  if (!profile?.workspace_id) {
    return Response.json({ error: "Workspace CENTRIX introuvable." }, { status: 409 });
  }
  if (!plan?.id) {
    return Response.json({ error: "Ce tarif Stripe ne correspond a aucun plan CENTRIX actif." }, { status: 400 });
  }

  const origin = getTrustedAppOrigin(request);
  const params = new URLSearchParams({
    mode: "subscription",
    "line_items[0][price]": body.priceId,
    "line_items[0][quantity]": "1",
    success_url: body.successUrl
      ? getTrustedRedirectUrl(body.successUrl, "/billing?checkout=success", origin)
      : `${origin}/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: getTrustedRedirectUrl(body.cancelUrl, "/billing?checkout=cancel", origin),
    allow_promotion_codes: "true",
    client_reference_id: user.id,
    "metadata[user_id]": user.id,
    "metadata[workspace_id]": String(profile.workspace_id),
    "metadata[plan_id]": String(plan.id),
    "subscription_data[metadata][user_id]": user.id,
    "subscription_data[metadata][workspace_id]": String(profile.workspace_id),
    "subscription_data[metadata][plan_id]": String(plan.id)
  });
  if (user.email) params.set("customer_email", user.email);

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
