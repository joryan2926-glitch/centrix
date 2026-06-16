import { createHmac, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

type StripeObject = {
  id?: string;
  amount_total?: number;
  customer?: string;
  customer_email?: string | null;
  customer_details?: { email?: string | null };
  mode?: string;
  payment_intent?: string;
  subscription?: string;
  status?: string;
  cancel_at_period_end?: boolean;
  current_period_end?: number;
  metadata?: Record<string, string>;
  items?: { data?: Array<{ price?: { id?: string } }> };
};

type StripeEvent = {
  id?: string;
  type?: string;
  data?: { object?: StripeObject };
};

function verifyStripeSignature(payload: string, signatureHeader: string, secret: string) {
  const timestamp = signatureHeader.split(",").find((part) => part.startsWith("t="))?.slice(2);
  const signatures = signatureHeader.split(",").filter((part) => part.startsWith("v1=")).map((part) => part.slice(3));
  if (!timestamp || !signatures.length) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return signatures.some((signature) => {
    const actualBuffer = Buffer.from(signature, "hex");
    return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
  });
}

async function getStripeSubscription(subscriptionId: string) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  const response = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
    cache: "no-store"
  });
  return response.ok ? await response.json() as StripeObject : null;
}

function toCentrixStatus(status?: string) {
  if (status === "active") return "active";
  if (status === "trialing") return "trialing";
  if (status === "past_due" || status === "unpaid") return "past_due";
  if (status === "canceled" || status === "incomplete_expired") return "canceled";
  return "suspended";
}

async function syncSubscription(object: StripeObject) {
  const admin = createSupabaseAdminClient();
  if (!admin) throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante.");

  const stripeSubscription = object.subscription ? await getStripeSubscription(object.subscription) : object;
  if (!stripeSubscription?.id) throw new Error("Abonnement Stripe introuvable.");

  const metadata = { ...stripeSubscription.metadata, ...object.metadata };
  const workspaceId = metadata.workspace_id;
  const userId = metadata.user_id;
  const stripePriceId = stripeSubscription.items?.data?.[0]?.price?.id;
  if (!workspaceId || !userId || !stripePriceId) throw new Error("Metadonnees Stripe CENTRIX incompletes.");

  const { data: plan, error: planError } = await admin
    .from("subscription_plans")
    .select("id,code,monthlyPrice")
    .eq("stripePriceId", stripePriceId)
    .single();
  if (planError || !plan) throw new Error("Plan CENTRIX introuvable pour le tarif Stripe.");

  const customerId = `billing-${workspaceId}`;
  const customerEmail = object.customer_details?.email ?? object.customer_email ?? "";
  const now = new Date().toISOString();
  const periodEnd = new Date((stripeSubscription.current_period_end ?? Math.floor(Date.now() / 1000)) * 1000).toISOString();

  const { error: customerError } = await admin.from("billing_customers").upsert({
    id: customerId,
    workspace_id: workspaceId,
    companyId: workspaceId,
    name: "Workspace CENTRIX",
    email: customerEmail,
    stripeCustomerId: stripeSubscription.customer ?? object.customer ?? null,
    premium: plan.code !== "free",
    createdAt: now
  }, { onConflict: "id" });
  if (customerError) throw customerError;

  const { error: subscriptionError } = await admin.from("subscriptions").upsert({
    workspace_id: workspaceId,
    created_by: userId,
    companyId: workspaceId,
    customerId,
    plan: plan.code,
    planId: plan.id,
    stripeSubscriptionId: stripeSubscription.id,
    status: toCentrixStatus(stripeSubscription.status),
    seats: 1,
    usedSeats: 1,
    monthlyPrice: plan.monthlyPrice,
    renewalAt: periodEnd,
    currentPeriodEnd: periodEnd,
    autoRenew: !stripeSubscription.cancel_at_period_end,
    updatedAt: now
  }, { onConflict: "stripeSubscriptionId" });
  if (subscriptionError) throw subscriptionError;

  const effectivePlan = toCentrixStatus(stripeSubscription.status) === "canceled" ? "starter" : plan.code;
  await admin.from("workspaces").update({ plan: effectivePlan, updated_at: now }).eq("id", workspaceId);
  await admin.from("users").update({ abonnement: effectivePlan, updated_at: now }).eq("id", userId);
}

async function syncInvoicePayment(object: StripeObject) {
  const admin = createSupabaseAdminClient();
  if (!admin) throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante.");

  const invoiceId = object.metadata?.invoice_id;
  if (!invoiceId) throw new Error("invoice_id manquant dans les metadonnees Stripe.");
  const paidAmount = typeof object.amount_total === "number" ? object.amount_total / 100 : undefined;
  const now = new Date().toISOString();

  const update: Record<string, unknown> = {
    paid_at: now,
    status: "paid",
    stripe_payment_intent_id: object.payment_intent ?? null,
    updated_at: now
  };
  if (paidAmount !== undefined) update.paid_amount = paidAmount;

  const { error } = await admin.from("invoices").update(update).eq("id", invoiceId);
  if (error) throw error;
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return Response.json({ error: "STRIPE_WEBHOOK_SECRET manquant." }, { status: 503 });

  const signature = request.headers.get("stripe-signature");
  const payload = await request.text();
  if (!signature || !verifyStripeSignature(payload, signature, webhookSecret)) {
    return Response.json({ error: "Signature Stripe invalide." }, { status: 400 });
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(payload) as StripeEvent;
  } catch {
    return Response.json({ error: "Payload Stripe invalide." }, { status: 400 });
  }
  if (!event.id || !event.type) return Response.json({ error: "Evenement Stripe incomplet." }, { status: 400 });

  const admin = createSupabaseAdminClient();
  if (!admin) return Response.json({ error: "SUPABASE_SERVICE_ROLE_KEY manquante." }, { status: 503 });

  const syncEvents = ["checkout.session.completed", "customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"];
  const handled = syncEvents.includes(event.type) || ["invoice.payment_succeeded", "invoice.payment_failed", "charge.refunded"].includes(event.type);

  try {
    if (syncEvents.includes(event.type) && event.data?.object) {
      const object = event.data.object;
      if (event.type === "checkout.session.completed" && object.mode === "payment") {
        await syncInvoicePayment(object);
      } else {
        await syncSubscription(object);
      }
    }

    const { error } = await admin.from("stripe_events").upsert({
      id: event.id,
      stripeEventId: event.id,
      type: event.type,
      status: handled ? "processed" : "ignored",
      payload: event,
      createdAt: new Date().toISOString()
    }, { onConflict: "stripeEventId" });
    if (error) throw error;
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Synchronisation Stripe impossible." }, { status: 500 });
  }

  return Response.json({ received: true, handled, eventId: event.id, type: event.type });
}
