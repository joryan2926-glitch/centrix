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

  const body = (await request.json().catch(() => null)) as { amount?: number; customerEmail?: string; invoiceId?: string; invoiceNumber?: string; mode?: "payment" | "subscription"; priceId?: string; successUrl?: string; cancelUrl?: string } | null;
  if (!body) {
    return Response.json({ error: "Payload Stripe Checkout invalide." }, { status: 400 });
  }
  const checkoutMode = body?.mode ?? "subscription";
  if (checkoutMode === "subscription" && !body?.priceId) {
    return Response.json({ error: "priceId Stripe requis." }, { status: 400 });
  }
  if (checkoutMode === "payment" && (!body?.amount || body.amount <= 0 || !body.invoiceId)) {
    return Response.json({ error: "Montant et invoiceId requis pour un paiement Stripe." }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const [{ data: profile }, { data: plan }] = await Promise.all([
    supabase?.from("profiles").select("workspace_id").eq("id", user.id).maybeSingle() ?? Promise.resolve({ data: null }),
    checkoutMode === "subscription" && body?.priceId
      ? supabase?.from("subscription_plans").select("id,code").eq("stripePriceId", body.priceId).maybeSingle() ?? Promise.resolve({ data: null })
      : Promise.resolve({ data: null })
  ]);
  if (!profile?.workspace_id) {
    return Response.json({ error: "Workspace CENTRIX introuvable." }, { status: 409 });
  }
  if (checkoutMode === "subscription" && !plan?.id) {
    return Response.json({ error: "Ce tarif Stripe ne correspond a aucun plan CENTRIX actif." }, { status: 400 });
  }

  const origin = getTrustedAppOrigin(request);
  const params = new URLSearchParams({
    mode: checkoutMode,
    success_url: body.successUrl
      ? getTrustedRedirectUrl(body.successUrl, "/billing?checkout=success", origin)
      : checkoutMode === "payment"
        ? `${origin}/facturation?payment=success&session_id={CHECKOUT_SESSION_ID}`
        : `${origin}/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: getTrustedRedirectUrl(body.cancelUrl, checkoutMode === "payment" ? "/facturation?payment=cancel" : "/billing?checkout=cancel", origin),
    allow_promotion_codes: "true",
    client_reference_id: user.id,
    "metadata[user_id]": user.id,
    "metadata[workspace_id]": String(profile.workspace_id)
  });
  if (checkoutMode === "subscription" && body?.priceId && plan?.id) {
    params.set("line_items[0][price]", body.priceId);
    params.set("line_items[0][quantity]", "1");
    params.set("metadata[plan_id]", String(plan.id));
    params.set("subscription_data[metadata][user_id]", user.id);
    params.set("subscription_data[metadata][workspace_id]", String(profile.workspace_id));
    params.set("subscription_data[metadata][plan_id]", String(plan.id));
  }
  if (checkoutMode === "payment" && body?.amount && body.invoiceId) {
    params.set("line_items[0][price_data][currency]", "eur");
    params.set("line_items[0][price_data][product_data][name]", `Facture CENTRIX ${body.invoiceNumber ?? body.invoiceId}`);
    params.set("line_items[0][price_data][unit_amount]", String(Math.round(body.amount * 100)));
    params.set("line_items[0][quantity]", "1");
    params.set("metadata[invoice_id]", body.invoiceId);
    params.set("metadata[invoice_number]", body.invoiceNumber ?? "");
  }
  if (body?.customerEmail || user.email) params.set("customer_email", body?.customerEmail ?? user.email ?? "");

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
