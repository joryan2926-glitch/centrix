import { getSupabaseSyncResult } from "@/services/supabaseSync";
import { saasBillingFallbackData } from "@/data/billingSaas";
import { getSupabaseClient } from "@/lib/supabase";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";
import type { SaaSBillingData, SaaSSubscription } from "@/types/billing";

function readLocal(): SaaSBillingData {
  if (typeof window === "undefined") return saasBillingFallbackData;
  return saasBillingFallbackData;
}

function writeLocal(data: SaaSBillingData) {
  void data;
}

export async function loadSaaSBillingData(): Promise<{ data: SaaSBillingData; mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: readLocal(), mode: "local" };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { data: readLocal(), mode: "local" };

  const [plans, customers, subscriptions, invoices, payments, coupons, usageLimits, notifications, stripeEvents] = await Promise.all([
    supabase.from("subscription_plans").select("*"),
    supabase.from("billing_customers").select("*").eq("workspace_id", workspace.workspaceId),
    supabase.from("subscriptions").select("*").eq("workspace_id", workspace.workspaceId).order("updatedAt", { ascending: false }),
    supabase.from("subscription_invoices").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false }),
    supabase.from("subscription_payments").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false }),
    supabase.from("coupons").select("*"),
    supabase.from("subscription_usage_limits").select("*").eq("workspace_id", workspace.workspaceId),
    supabase.from("billing_notifications").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false }),
    supabase.from("stripe_events").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false })
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
      coupons: coupons.data?.length ? coupons.data : saasBillingFallbackData.coupons,
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
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { mode: "local" as const };
  const withWorkspace = <T extends object>(row: T) => ({ ...row, workspace_id: workspace.workspaceId });
  const subscriptionWrites = data.subscriptions.map((row) => upsertSubscription(supabase, withWorkspace(row)));

  const results = await Promise.all([
    ...data.plans.map((row) => supabase.from("subscription_plans").upsert(row, { onConflict: "id" })),
    ...data.customers.map((row) => supabase.from("billing_customers").upsert(withWorkspace(row), { onConflict: "id" })),
    ...subscriptionWrites,
    ...data.invoices.map((row) => supabase.from("subscription_invoices").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.payments.map((row) => supabase.from("subscription_payments").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.coupons.map((row) => supabase.from("coupons").upsert(row, { onConflict: "id" })),
    ...data.usageLimits.map((row) => supabase.from("subscription_usage_limits").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.notifications.map((row) => supabase.from("billing_notifications").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.stripeEvents.map((row) => supabase.from("stripe_events").upsert(withWorkspace(row), { onConflict: "id" }))
  ]);

  return getSupabaseSyncResult(results);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function upsertSubscription(supabase: ReturnType<typeof getSupabaseClient>, row: SaaSSubscription & { workspace_id: string }) {
  if (!supabase) return { error: null };
  if (isUuid(row.id)) return supabase.from("subscriptions").upsert(row, { onConflict: "id" });
  const { id: _id, ...payload } = row;
  void _id;
  if (payload.stripeSubscriptionId) return supabase.from("subscriptions").upsert(payload, { onConflict: "stripeSubscriptionId" });
  return { error: null };
}
