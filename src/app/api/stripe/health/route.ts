import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PriceCheck = {
  plan: string;
  priceId: string | null;
  exists: boolean;
  liveMode: boolean;
  active: boolean;
  recurring: boolean;
  monthly: boolean;
  valid: boolean;
  error: string | null;
};

const requiredWebhookEvents = [
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted"
] as const;

const recommendedWebhookEvents = [
  "customer.subscription.created",
  "invoice.payment_succeeded",
  "invoice.payment_failed"
] as const;

export async function GET() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const stripeConfigured = Boolean(stripeSecretKey);
  const webhookConfigured = Boolean(process.env.STRIPE_WEBHOOK_SECRET);
  const admin = createSupabaseAdminClient();

  let supabaseAdminConfigured = Boolean(admin);
  let catalogConnected = false;
  let planCount = 0;
  let stripePricesValid = false;
  let stripeReachablePriceCount = 0;
  let stripeActivePriceCount = 0;
  let stripeRecurringPriceCount = 0;
  let activeSubscriptionCount = 0;
  let processedEventCount = 0;
  let webhookEventsValid = false;
  let webhookEvents: string[] = [];
  let prices: PriceCheck[] = [];

  if (admin) {
    const [{ data: plans, count, error }, subscriptions, events] = await Promise.all([
      admin
      .from("subscription_plans")
      .select("code,stripePriceId", { count: "exact" })
      .not("stripePriceId", "is", null),
      admin.from("subscriptions").select("id", { count: "exact", head: true }).in("status", ["active", "trialing"]),
      admin.from("stripe_events").select("id", { count: "exact", head: true }).eq("status", "processed")
    ]);
    supabaseAdminConfigured = !error;
    catalogConnected = !error;
    planCount = count ?? 0;
    activeSubscriptionCount = subscriptions.count ?? 0;
    processedEventCount = events.count ?? 0;

    if (stripeSecretKey && plans?.length) {
      prices = await Promise.all(
        plans.map(async (plan) => {
          const base = {
            plan: String(plan.code),
            priceId: plan.stripePriceId,
            exists: false,
            liveMode: false,
            active: false,
            recurring: false,
            monthly: false,
            valid: false,
            error: null
          } satisfies PriceCheck;
          const response = await fetch(`https://api.stripe.com/v1/prices/${plan.stripePriceId}`, {
            headers: { Authorization: `Bearer ${stripeSecretKey}` },
            cache: "no-store"
          });
          if (!response.ok) {
            const payload = await response.json().catch(() => null) as { error?: { code?: string } } | null;
            return { ...base, error: payload?.error?.code ?? `stripe_http_${response.status}` };
          }
          const price = await response.json() as { active?: boolean; livemode?: boolean; recurring?: { interval?: string } | null };
          const liveMode = Boolean(price.livemode);
          const active = Boolean(price.active);
          const recurring = Boolean(price.recurring);
          const monthly = price.recurring?.interval === "month";
          stripeReachablePriceCount += 1;
          if (active) stripeActivePriceCount += 1;
          if (recurring) stripeRecurringPriceCount += 1;
          return { ...base, exists: true, liveMode, active, recurring, monthly, valid: liveMode && active && recurring && monthly };
        })
      );
      stripePricesValid = prices.length >= 4 && prices.every((price) => price.valid);
    }
  }

  if (stripeSecretKey) {
    const response = await fetch("https://api.stripe.com/v1/webhook_endpoints?limit=100", {
      headers: { Authorization: `Bearer ${stripeSecretKey}` },
      cache: "no-store"
    });
    if (response.ok) {
      const payload = await response.json() as { data?: Array<{ enabled_events?: string[]; status?: string; url?: string }> };
      const endpoint = payload.data?.find((item) => item.status === "enabled" && item.url?.includes("/api/stripe/webhook"));
      webhookEvents = endpoint?.enabled_events ?? [];
      webhookEventsValid = webhookEvents.includes("*") || requiredWebhookEvents.every((event) => webhookEvents.includes(event));
    }
  }

  const ready = stripeConfigured && webhookConfigured && webhookEventsValid && supabaseAdminConfigured && catalogConnected && planCount >= 4 && stripePricesValid;

  return Response.json(
    {
      ready,
      checks: {
        stripeConfigured,
        webhookConfigured,
        webhookEventsValid,
        requiredWebhookEvents,
        recommendedWebhookEvents,
        webhookEvents,
        supabaseAdminConfigured,
        catalogConnected,
        planCount,
        stripePricesValid,
        stripeReachablePriceCount,
        stripeActivePriceCount,
        stripeRecurringPriceCount,
        activeSubscriptionCount,
        processedEventCount,
        prices
      }
    },
    {
      status: ready ? 200 : 503,
      headers: { "Cache-Control": "no-store" }
    }
  );
}
