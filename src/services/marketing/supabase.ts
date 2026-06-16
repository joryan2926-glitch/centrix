import { getSupabaseSyncResult } from "@/services/supabaseSync";
import { marketingFallbackData } from "@/data/marketing";
import { getSupabaseClient } from "@/lib/supabase";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";
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
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { data: readLocal(), mode: "local" };

  const [accounts, posts, campaigns, media, activities, reports] = await Promise.all([
    supabase.from("marketing_social_accounts").select("*").eq("workspace_id", workspace.workspaceId),
    supabase.from("marketing_posts").select("*").eq("workspace_id", workspace.workspaceId).order("scheduledAt", { ascending: true }),
    supabase.from("marketing_campaigns").select("*").eq("workspace_id", workspace.workspaceId).order("startsAt", { ascending: false }),
    supabase.from("marketing_media_assets").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false }),
    supabase.from("marketing_activities").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false }),
    supabase.from("marketing_reports").select("*").eq("workspace_id", workspace.workspaceId)
  ]);

  if ([accounts, posts, campaigns, media, activities, reports].some((result) => result.error)) {
    return { data: readLocal(), mode: "local" };
  }

  return {
    data: {
      accounts: (accounts.data ?? []).map((row) => ({ ...row, providerAccountId: row.provider_account_id ?? null })),
      posts: (posts.data ?? []).map((row) => ({ ...row, publicationError: row.publication_error ?? null })),
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
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { mode: "local" as const };
  const withWorkspace = <T extends object>(row: T) => ({ ...row, workspace_id: workspace.workspaceId });

  const results = await Promise.all([
    ...data.accounts.map((row) => supabase.from("marketing_social_accounts").upsert(withWorkspace({ ...row, provider_account_id: row.providerAccountId ?? null }), { onConflict: "id" })),
    ...data.posts.map((row) => {
      const payload = { ...row };
      delete payload.publicationError;
      return supabase.from("marketing_posts").upsert(withWorkspace(payload), { onConflict: "id" });
    }),
    ...data.campaigns.map((row) => supabase.from("marketing_campaigns").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.media.map((row) => supabase.from("marketing_media_assets").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.activities.map((row) => supabase.from("marketing_activities").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.reports.map((row) => supabase.from("marketing_reports").upsert(withWorkspace(row), { onConflict: "month" }))
  ]);

  return getSupabaseSyncResult(results);
}
