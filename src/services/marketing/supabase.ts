import { getSupabaseSyncResult } from "@/services/supabaseSync";
import { marketingFallbackData } from "@/data/marketing";
import { getSupabaseClient } from "@/lib/supabase";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";
import type { MarketingActivity, MarketingData, SocialAccount, SocialPost } from "@/types/marketing";

const storageKey = "centrix-marketing-data-v1";

function readLocal(): MarketingData {
  if (typeof window === "undefined") return marketingFallbackData;
  const local = window.localStorage.getItem(storageKey);
  return local ? JSON.parse(local) : marketingFallbackData;
}

function writeLocal(data: MarketingData) {
  if (typeof window === "undefined") return;
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

  if (!accounts.data?.length && !campaigns.data?.length) {
    await ensureMarketingBootstrap(workspace.workspaceId);
  }

  return {
    data: {
      accounts: accounts.data?.length ? (accounts.data ?? []).map((row) => ({ ...row, providerAccountId: row.provider_account_id ?? null })) : marketingFallbackData.accounts,
      posts: posts.data?.length ? (posts.data ?? []).map((row) => ({ ...row, publicationError: row.publication_error ?? null })) : marketingFallbackData.posts,
      campaigns: campaigns.data?.length ? campaigns.data : marketingFallbackData.campaigns,
      media: media.data?.length ? media.data : marketingFallbackData.media,
      activities: activities.data?.length ? activities.data : marketingFallbackData.activities,
      reports: reports.data?.length ? reports.data : marketingFallbackData.reports
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
    ...data.reports.map((row) => supabase.from("marketing_reports").upsert(withWorkspace(row), { onConflict: "workspace_id,month" }))
  ]);

  return getSupabaseSyncResult(results);
}

export async function upsertMarketingPost(post: SocialPost, activity?: MarketingActivity) {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: null, mode: "local" as const };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { error: "Workspace introuvable.", mode: "local" as const };
  await ensureMarketingBootstrap(workspace.workspaceId);

  const payload = toPostRow(post, workspace.workspaceId);
  const results = await Promise.all([
    supabase.from("marketing_posts").upsert(payload, { onConflict: "id" }),
    activity ? supabase.from("marketing_activities").upsert({ ...activity, workspace_id: workspace.workspaceId }, { onConflict: "id" }) : Promise.resolve({ error: null })
  ]);

  return getSupabaseSyncResult(results);
}

export async function upsertMarketingAccount(account: SocialAccount, activity?: MarketingActivity) {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: null, mode: "local" as const };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { error: "Workspace introuvable.", mode: "local" as const };

  const results = await Promise.all([
    supabase.from("marketing_social_accounts").upsert(toAccountRow(account, workspace.workspaceId), { onConflict: "id" }),
    activity ? supabase.from("marketing_activities").upsert({ ...activity, workspace_id: workspace.workspaceId }, { onConflict: "id" }) : Promise.resolve({ error: null })
  ]);

  return getSupabaseSyncResult(results);
}

export async function deleteMarketingPost(postId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: null, mode: "local" as const };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { error: "Workspace introuvable.", mode: "local" as const };
  const { error } = await supabase.from("marketing_posts").delete().eq("id", postId).eq("workspace_id", workspace.workspaceId);
  return { error: error?.message ?? null, mode: error ? "local" as const : "supabase" as const };
}

async function ensureMarketingBootstrap(workspaceId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  await Promise.all([
    ...marketingFallbackData.accounts.map((row) => supabase.from("marketing_social_accounts").upsert(toAccountRow(row, workspaceId), { onConflict: "id" })),
    ...marketingFallbackData.campaigns.map((row) => supabase.from("marketing_campaigns").upsert({ ...row, workspace_id: workspaceId }, { onConflict: "id" })),
    ...marketingFallbackData.media.map((row) => supabase.from("marketing_media_assets").upsert({ ...row, workspace_id: workspaceId }, { onConflict: "id" })),
    ...marketingFallbackData.reports.map((row) => supabase.from("marketing_reports").upsert({ ...row, workspace_id: workspaceId }, { onConflict: "workspace_id,month" }))
  ]);
}

function toPostRow(post: SocialPost, workspaceId: string) {
  const payload = { ...post };
  delete payload.publicationError;
  return { ...payload, publication_error: post.publicationError ?? null, workspace_id: workspaceId };
}

function toAccountRow(account: SocialAccount, workspaceId: string) {
  return { ...account, provider_account_id: account.providerAccountId ?? null, workspace_id: workspaceId };
}
