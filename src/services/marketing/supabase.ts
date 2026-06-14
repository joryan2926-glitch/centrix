import { getSupabaseSyncResult } from "@/services/supabaseSync";
import { marketingFallbackData } from "@/data/marketing";
import { getSupabaseClient } from "@/lib/supabase";
import type { MarketingData } from "@/types/marketing";

const storageKey = "centrix-marketing-data-v1";

function readLocal(): MarketingData {
  if (typeof window === "undefined") return marketingFallbackData;
  const local = window.localStorage.getItem(storageKey);
  return local ? JSON.parse(local) : marketingFallbackData;
}

function writeLocal(data: MarketingData) {
  window.localStorage.setItem(storageKey, JSON.stringify(data));
}

export async function loadMarketingData(): Promise<{ data: MarketingData; mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: readLocal(), mode: "local" };

  const [accounts, posts, campaigns, media, activities, reports] = await Promise.all([
    supabase.from("marketing_social_accounts").select("*"),
    supabase.from("marketing_posts").select("*").order("scheduledAt", { ascending: true }),
    supabase.from("marketing_campaigns").select("*").order("startsAt", { ascending: false }),
    supabase.from("marketing_media_assets").select("*").order("createdAt", { ascending: false }),
    supabase.from("marketing_activities").select("*").order("createdAt", { ascending: false }),
    supabase.from("marketing_reports").select("*")
  ]);

  if ([accounts, posts, campaigns, media, activities, reports].some((result) => result.error)) {
    return { data: readLocal(), mode: "local" };
  }

  return {
    data: {
      accounts: accounts.data ?? [],
      posts: posts.data ?? [],
      campaigns: campaigns.data ?? [],
      media: media.data ?? [],
      activities: activities.data ?? [],
      reports: reports.data ?? []
    },
    mode: "supabase"
  };
}

export async function saveMarketingData(data: MarketingData) {
  writeLocal(data);
}

export async function syncMarketingData(data: MarketingData) {
  writeLocal(data);
  const supabase = getSupabaseClient();
  if (!supabase) return { mode: "local" as const };

  const results = await Promise.all([
    ...data.accounts.map((row) => supabase.from("marketing_social_accounts").upsert(row, { onConflict: "id" })),
    ...data.posts.map((row) => supabase.from("marketing_posts").upsert(row, { onConflict: "id" })),
    ...data.campaigns.map((row) => supabase.from("marketing_campaigns").upsert(row, { onConflict: "id" })),
    ...data.media.map((row) => supabase.from("marketing_media_assets").upsert(row, { onConflict: "id" })),
    ...data.activities.map((row) => supabase.from("marketing_activities").upsert(row, { onConflict: "id" })),
    ...data.reports.map((row) => supabase.from("marketing_reports").upsert(row, { onConflict: "month" }))
  ]);

  return getSupabaseSyncResult(results);
}
