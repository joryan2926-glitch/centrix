import { getSupabaseSyncResult } from "@/services/supabaseSync";
import { marketplaceFallbackData } from "@/data/marketplace";
import { getSupabaseClient } from "@/lib/supabase";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";
import type { MarketplaceData } from "@/types/marketplace";

function readLocal(): MarketplaceData {
  if (typeof window === "undefined") return marketplaceFallbackData;
  return marketplaceFallbackData;
}

function writeLocal(data: MarketplaceData) {
  void data;
}

export async function loadMarketplaceData(): Promise<{ data: MarketplaceData; mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: readLocal(), mode: "local" };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { data: readLocal(), mode: "local" };
  const [services, categories, providers, reviews, orders, messages, payouts, notifications, portfolios] = await Promise.all([
    supabase.from("marketplace_services").select("*").eq("workspace_id", workspace.workspaceId).order("updatedAt", { ascending: false }),
    supabase.from("service_categories").select("*"),
    supabase.from("providers").select("*").eq("workspace_id", workspace.workspaceId),
    supabase.from("provider_reviews").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false }),
    supabase.from("marketplace_orders").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false }),
    supabase.from("order_messages").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: true }),
    supabase.from("payouts").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false }),
    supabase.from("marketplace_notifications").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false }),
    supabase.from("provider_portfolios").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false })
  ]);
  if ([services, categories, providers, reviews, orders, messages, payouts, notifications, portfolios].some((result) => result.error)) return { data: readLocal(), mode: "local" };
  if (!services.data?.length && !providers.data?.length && !orders.data?.length) return { data: readLocal(), mode: "supabase" };
  return {
    data: {
      services: services.data ?? [],
      categories: categories.data?.length ? categories.data : marketplaceFallbackData.categories,
      providers: providers.data ?? [],
      reviews: reviews.data ?? [],
      orders: orders.data ?? [],
      messages: messages.data ?? [],
      payouts: payouts.data ?? [],
      notifications: notifications.data ?? [],
      portfolios: portfolios.data ?? []
    },
    mode: "supabase"
  };
}

export async function saveMarketplaceData(data: MarketplaceData) {
  writeLocal(data);
}

export async function syncMarketplaceData(data: MarketplaceData) {
  writeLocal(data);
  const supabase = getSupabaseClient();
  if (!supabase) return { mode: "local" as const };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { mode: "local" as const };
  const withWorkspace = <T extends object>(row: T) => ({ ...row, workspace_id: workspace.workspaceId });
  const results = await Promise.all([
    ...data.categories.map((row) => supabase.from("service_categories").upsert(row, { onConflict: "id" })),
    ...data.providers.map((row) => supabase.from("providers").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.services.map((row) => supabase.from("marketplace_services").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.reviews.map((row) => supabase.from("provider_reviews").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.orders.map((row) => supabase.from("marketplace_orders").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.messages.map((row) => supabase.from("order_messages").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.payouts.map((row) => supabase.from("payouts").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.notifications.map((row) => supabase.from("marketplace_notifications").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.portfolios.map((row) => supabase.from("provider_portfolios").upsert(withWorkspace(row), { onConflict: "id" }))
  ]);
  return getSupabaseSyncResult(results);
}
