import type { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

type StripeSubscription = {
  id?: string;
  customer?: string;
  status?: string;
  cancel_at_period_end?: boolean;
  current_period_end?: number;
  metadata?: Record<string, string>;
  items?: { data?: Array<{ price?: { id?: string } }> };
};

type StripeCheckoutSession = {
  client_reference_id?: string;
  customer?: string;
  customer_details?: { email?: string | null };
  metadata?: Record<string, string>;
  payment_status?: string;
  subscription?: StripeSubscription | string;
};

function toCentrixStatus(status?: string) {
  if (status === "active") return "active";
  if (status === "trialing") return "trialing";
  if (status === "past_due" || status === "unpaid") return "past_due";
  if (status === "canceled" || status === "incomplete_expired") return "canceled";
  return "suspended";
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: authData } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
  const user = authData.user;
  if (!supabase || !user) return Response.json({ error: "Session CENTRIX requise." }, { status: 401 });

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return Response.json({ error: "STRIPE_SECRET_KEY manquante." }, { status: 503 });

  const body = (await request.json().catch(() => null)) as { sessionId?: string } | null;
  if (!body?.sessionId?.startsWith("cs_")) return Response.json({ error: "Session Checkout invalide." }, { status: 400 });

  const stripeResponse = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(body.sessionId)}?expand[]=subscription`, {
    headers: { Authorization: `Bearer ${secretKey}` },
    cache: "no-store"
  });
  const session = await stripeResponse.json() as StripeCheckoutSession & { error?: { message?: string } };
  if (!stripeResponse.ok) return Response.json({ error: session.error?.message ?? "Session Stripe introuvable." }, { status: stripeResponse.status });
  if (session.client_reference_id !== user.id) return Response.json({ error: "Cette session Stripe appartient a un autre utilisateur." }, { status: 403 });

  const subscription = typeof session.subscription === "object" ? session.subscription : null;
  const workspaceId = subscription?.metadata?.workspace_id ?? session.metadata?.workspace_id;
  const stripePriceId = subscription?.items?.data?.[0]?.price?.id;
  if (!subscription?.id || !workspaceId || !stripePriceId) return Response.json({ error: "Donnees abonnement Stripe incompletes." }, { status: 409 });

  const [{ data: profile }, { data: plan }] = await Promise.all([
    supabase.from("profiles").select("workspace_id").eq("id", user.id).single(),
    supabase.from("subscription_plans").select("id,code,monthlyPrice").eq("stripePriceId", stripePriceId).single()
  ]);
  if (String(profile?.workspace_id) !== workspaceId || !plan) return Response.json({ error: "Workspace ou plan CENTRIX invalide." }, { status: 403 });

  const now = new Date().toISOString();
  const periodEnd = new Date((subscription.current_period_end ?? Math.floor(Date.now() / 1000)) * 1000).toISOString();
  const customerId = `billing-${workspaceId}`;

  const { error: customerError } = await supabase.from("billing_customers").upsert({
    id: customerId,
    workspace_id: workspaceId,
    companyId: workspaceId,
    name: "Workspace CENTRIX",
    email: session.customer_details?.email ?? user.email ?? "",
    stripeCustomerId: subscription.customer ?? session.customer ?? null,
    premium: plan.code !== "free",
    createdAt: now
  }, { onConflict: "id" });
  if (customerError) return Response.json({ error: customerError.message }, { status: 500 });

  const { error: subscriptionError } = await supabase.from("subscriptions").upsert({
    workspace_id: workspaceId,
    created_by: user.id,
    companyId: workspaceId,
    customerId,
    plan: plan.code,
    planId: plan.id,
    stripeSubscriptionId: subscription.id,
    status: toCentrixStatus(subscription.status),
    seats: 1,
    usedSeats: 1,
    monthlyPrice: plan.monthlyPrice,
    renewalAt: periodEnd,
    currentPeriodEnd: periodEnd,
    autoRenew: !subscription.cancel_at_period_end,
    updatedAt: now
  }, { onConflict: "stripeSubscriptionId" });
  if (subscriptionError) return Response.json({ error: subscriptionError.message }, { status: 500 });

  await Promise.all([
    supabase.from("workspaces").update({ plan: plan.code, updated_at: now }).eq("id", workspaceId),
    supabase.from("users").update({ abonnement: plan.code, updated_at: now }).eq("id", user.id)
  ]);

  return Response.json({ ok: true, paymentStatus: session.payment_status, plan: plan.code, subscriptionId: subscription.id });
}
