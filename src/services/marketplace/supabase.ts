import { getSupabaseSyncResult } from "@/services/supabaseSync";
import { marketplaceFallbackData } from "@/data/marketplace";
import { getSupabaseClient } from "@/lib/supabase";
import type { MarketplaceData } from "@/types/marketplace";

const storageKey = "centrix-marketplace-data-v1";

function readLocal(): MarketplaceData {
  if (typeof window === "undefined") return marketplaceFallbackData;
  const local = window.localStorage.getItem(storageKey);
  return local ? JSON.parse(local) : marketplaceFallbackData;
}

function writeLocal(data: MarketplaceData) {
  if (typeof window !== "undefined") window.localStorage.setItem(storageKey, JSON.stringify(data));
}

export async function loadMarketplaceData(): Promise<{ data: MarketplaceData; mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: readLocal(), mode: "local" };
  const [services, categories, providers, reviews, orders, messages, payouts, notifications, portfolios] = await Promise.all([
    supabase.from("marketplace_services").select("*").order("updatedAt", { ascending: false }),
    supabase.from("service_categories").select("*"),
    supabase.from("providers").select("*"),
    supabase.from("provider_reviews").select("*").order("createdAt", { ascending: false }),
    supabase.from("marketplace_orders").select("*").order("createdAt", { ascending: false }),
    supabase.from("order_messages").select("*").order("createdAt", { ascending: true }),
    supabase.from("payouts").select("*").order("createdAt", { ascending: false }),
    supabase.from("marketplace_notifications").select("*").order("createdAt", { ascending: false }),
    supabase.from("provider_portfolios").select("*").order("createdAt", { ascending: false })
  ]);
  if ([services, categories, providers, reviews, orders, messages, payouts, notifications, portfolios].some((result) => result.error)) return { data: readLocal(), mode: "local" };
  return {
    data: {
      services: services.data ?? [],
      categories: categories.data ?? [],
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
  const results = await Promise.all([
    ...data.categories.map((row) => supabase.from("service_categories").upsert(row, { onConflict: "id" })),
    ...data.providers.map((row) => supabase.from("providers").upsert(row, { onConflict: "id" })),
    ...data.services.map((row) => supabase.from("marketplace_services").upsert(row, { onConflict: "id" })),
    ...data.reviews.map((row) => supabase.from("provider_reviews").upsert(row, { onConflict: "id" })),
    ...data.orders.map((row) => supabase.from("marketplace_orders").upsert(row, { onConflict: "id" })),
    ...data.messages.map((row) => supabase.from("order_messages").upsert(row, { onConflict: "id" })),
    ...data.payouts.map((row) => supabase.from("payouts").upsert(row, { onConflict: "id" })),
    ...data.notifications.map((row) => supabase.from("marketplace_notifications").upsert(row, { onConflict: "id" })),
    ...data.portfolios.map((row) => supabase.from("provider_portfolios").upsert(row, { onConflict: "id" }))
  ]);
  return getSupabaseSyncResult(results);
}
