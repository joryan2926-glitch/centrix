import { getSupabaseSyncResult } from "@/services/supabaseSync";
import { saasBillingFallbackData } from "@/data/billingSaas";
import { getSupabaseClient } from "@/lib/supabase";
import type { SaaSBillingData } from "@/types/billing";

const storageKey = "centrix-saas-billing-data-v1";

function readLocal(): SaaSBillingData {
  if (typeof window === "undefined") return saasBillingFallbackData;
  const local = window.localStorage.getItem(storageKey);
  return local ? JSON.parse(local) : saasBillingFallbackData;
}

function writeLocal(data: SaaSBillingData) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey, JSON.stringify(data));
  }
}

export async function loadSaaSBillingData(): Promise<{ data: SaaSBillingData; mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: readLocal(), mode: "local" };

  const [plans, customers, subscriptions, invoices, payments, coupons, usageLimits, notifications, stripeEvents] = await Promise.all([
    supabase.from("subscription_plans").select("*"),
    supabase.from("billing_customers").select("*"),
    supabase.from("subscriptions").select("*").order("updatedAt", { ascending: false }),
    supabase.from("invoices").select("*").order("created_at", { ascending: false }),
    supabase.from("payments").select("*").order("createdAt", { ascending: false }),
    supabase.from("coupons").select("*"),
    supabase.from("usage_limits").select("*"),
    supabase.from("billing_notifications").select("*").order("createdAt", { ascending: false }),
    supabase.from("stripe_events").select("*").order("createdAt", { ascending: false })
  ]);

  if ([plans, customers, subscriptions, invoices, payments, coupons, usageLimits, notifications, stripeEvents].some((result) => result.error)) {
    return { data: readLocal(), mode: "local" };
  }

  return {
    data: {
      plans: plans.data?.length ? plans.data : saasBillingFallbackData.plans,
      customers: customers.data ?? [],
      subscriptions: subscriptions.data ?? [],
      invoices: invoices.data ?? [],
      payments: payments.data ?? [],
      coupons: coupons.data ?? [],
      usageLimits: usageLimits.data ?? [],
      notifications: notifications.data ?? [],
      stripeEvents: stripeEvents.data ?? []
    },
    mode: "supabase"
  };
}

export async function saveSaaSBillingData(data: SaaSBillingData) {
  writeLocal(data);
}

export async function syncSaaSBillingData(data: SaaSBillingData) {
  writeLocal(data);
  const supabase = getSupabaseClient();
  if (!supabase) return { mode: "local" as const };

  const results = await Promise.all([
    ...data.plans.map((row) => supabase.from("subscription_plans").upsert(row, { onConflict: "id" })),
    ...data.customers.map((row) => supabase.from("billing_customers").upsert(row, { onConflict: "id" })),
    ...data.subscriptions.map((row) => supabase.from("subscriptions").upsert(row, { onConflict: "id" })),
    ...data.invoices.map((row) => supabase.from("invoices").upsert(row, { onConflict: "id" })),
    ...data.payments.map((row) => supabase.from("payments").upsert(row, { onConflict: "id" })),
    ...data.coupons.map((row) => supabase.from("coupons").upsert(row, { onConflict: "id" })),
    ...data.usageLimits.map((row) => supabase.from("usage_limits").upsert(row, { onConflict: "id" })),
    ...data.notifications.map((row) => supabase.from("billing_notifications").upsert(row, { onConflict: "id" })),
    ...data.stripeEvents.map((row) => supabase.from("stripe_events").upsert(row, { onConflict: "id" }))
  ]);

  return getSupabaseSyncResult(results);
}
