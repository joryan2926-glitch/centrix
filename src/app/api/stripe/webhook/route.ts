import { createHmac, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

function verifyStripeSignature(payload: string, signatureHeader: string, secret: string) {
  const timestamp = signatureHeader.split(",").find((part) => part.startsWith("t="))?.slice(2);
  const signatures = signatureHeader.split(",").filter((part) => part.startsWith("v1=")).map((part) => part.slice(3));
  if (!timestamp || !signatures.length) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const expected = createHmac("sha256", secret).update(signedPayload).digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return signatures.some((signature) => {
    const actualBuffer = Buffer.from(signature, "hex");
    return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
  });
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return Response.json({ error: "STRIPE_WEBHOOK_SECRET manquant." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  const payload = await request.text();
  if (!signature || !verifyStripeSignature(payload, signature, webhookSecret)) {
    return Response.json({ error: "Signature Stripe invalide." }, { status: 400 });
  }

  let event: { id?: string; type?: string };
  try {
    event = JSON.parse(payload) as { id?: string; type?: string };
  } catch {
    return Response.json({ error: "Payload Stripe invalide." }, { status: 400 });
  }
  if (!event.id || !event.type) {
    return Response.json({ error: "Evenement Stripe incomplet." }, { status: 400 });
  }

  const handled = [
    "invoice.payment_succeeded",
    "invoice.payment_failed",
    "customer.subscription.deleted",
    "customer.subscription.updated",
    "charge.refunded"
  ].includes(event.type);

  const supabase = await createServerSupabaseClient();
  if (supabase) {
    const { error } = await supabase.from("stripe_events").upsert({
      id: event.id,
      stripeEventId: event.id,
      type: event.type,
      status: handled ? "processed" : "ignored",
      payload: event,
      createdAt: new Date().toISOString()
    }, { onConflict: "stripeEventId" });

    if (error) {
      return Response.json({ error: "Evenement Stripe valide mais journalisation impossible." }, { status: 500 });
    }
  }

  return Response.json({ received: true, handled, eventId: event.id, type: event.type });
}
