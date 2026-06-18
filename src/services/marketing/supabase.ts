import { getSupabaseSyncResult } from "@/services/supabaseSync";
import { marketingFallbackData } from "@/data/marketing";
import { getSupabaseClient } from "@/lib/supabase";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";
import type { MarketingActivity, MarketingData, SocialAccount, SocialPost } from "@/types/marketing";

function readLocal(): MarketingData {
  if (typeof window === "undefined") return marketingFallbackData;
  return marketingFallbackData;
}

function writeLocal(data: MarketingData) {
  void data;
}

export async function loadMarketingData(): Promise<{ data: MarketingData; mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: readLocal(), mode: "local" };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { data: readLocal(), mode: "local" };

  const [accounts, posts, campaigns, media, activities, reports, publicationLogs] = await Promise.all([
    supabase.from("marketing_social_accounts").select("*").eq("workspace_id", workspace.workspaceId),
    supabase.from("marketing_posts").select("*").eq("workspace_id", workspace.workspaceId).order("scheduledAt", { ascending: true }),
    supabase.from("marketing_campaigns").select("*").eq("workspace_id", workspace.workspaceId).order("startsAt", { ascending: false }),
    supabase.from("marketing_media_assets").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false }),
    supabase.from("marketing_activities").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false }),
    supabase.from("marketing_reports").select("*").eq("workspace_id", workspace.workspaceId),
    supabase.from("social_publication_logs").select("*").eq("workspace_id", workspace.workspaceId).order("created_at", { ascending: false }).limit(60)
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
      reports: reports.data?.length ? reports.data : marketingFallbackData.reports,
      publicationLogs: publicationLogs.error ? [] : (publicationLogs.data ?? []).map((row) => ({
        accountId: row.account_id ?? null,
        createdAt: row.created_at,
        errorMessage: row.error_message ?? null,
        externalId: row.external_id ?? null,
        id: row.id,
        network: row.network,
        postId: row.post_id,
        publishedAt: row.published_at ?? null,
        status: row.status
      }))
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
    ...data.accounts.map((row) => supabase.from("marketing_social_accounts").upsert(toAccountRow(row, workspace.workspaceId), { onConflict: "id" })),
    ...data.posts.map((row) => supabase.from("marketing_posts").upsert(toPostRow(row, workspace.workspaceId), { onConflict: "id" })),
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
  return {
    accountIds: post.accountIds,
    campaignId: post.campaignId,
    category: post.category,
    content: post.content,
    createdAt: post.createdAt,
    hashtags: post.hashtags,
    id: post.id,
    mediaUrls: post.mediaUrls,
    mentions: post.mentions,
    metrics: post.metrics,
    publication_error: post.publicationError ?? null,
    publishedAt: post.publishedAt,
    scheduledAt: post.scheduledAt,
    status: post.status,
    title: post.title,
    updatedAt: post.updatedAt,
    workspace_id: workspaceId
  };
}

function toAccountRow(account: SocialAccount, workspaceId: string) {
  return {
    color: account.color,
    connected: account.connected,
    createdAt: account.createdAt,
    displayName: account.displayName,
    engagementRate: account.engagementRate,
    followers: account.followers,
    handle: account.handle,
    id: account.id,
    network: account.network,
    provider_account_id: account.providerAccountId ?? null,
    reach: account.reach,
    workspace_id: workspaceId
  };
}
