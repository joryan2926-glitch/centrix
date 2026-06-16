import type { SupabaseClient } from "@supabase/supabase-js";
import { publishSocialPost } from "@/lib/social/providers";

type PostRow = {
  id: string;
  accountIds: string[];
  content: string;
  hashtags: string[];
  mediaUrls: string[];
  workspace_id: string;
};

type AccountRow = {
  id: string;
  network: "facebook" | "instagram" | "linkedin" | "tiktok" | "x" | "youtube";
  provider_account_id: string | null;
};

export async function dispatchSocialPost(supabase: SupabaseClient, post: PostRow) {
  const content = [post.content, ...post.hashtags.map((tag) => `#${tag.replace(/^#/, "")}`)].join("\n\n");
  const { data: accounts, error } = await supabase
    .from("marketing_social_accounts")
    .select("id, network, provider_account_id")
    .eq("workspace_id", post.workspace_id)
    .in("id", post.accountIds);
  if (error) throw new Error(error.message);
  if (!accounts?.length) throw new Error("Aucun compte social connecte a cette publication.");

  const results = await Promise.allSettled((accounts as AccountRow[]).map((account) =>
    publishSocialPost(
      { network: account.network, providerAccountId: account.provider_account_id ?? "" },
      { content, mediaUrls: post.mediaUrls }
    )
  ));
  const failures = results.filter((result): result is PromiseRejectedResult => result.status === "rejected");
  const successes = results.filter((result): result is PromiseFulfilledResult<Awaited<ReturnType<typeof publishSocialPost>>> => result.status === "fulfilled");
  const now = new Date().toISOString();

  await supabase.from("social_publication_logs").insert(results.map((result, index) => ({
    workspace_id: post.workspace_id,
    post_id: post.id,
    account_id: (accounts as AccountRow[])[index].id,
    network: (accounts as AccountRow[])[index].network,
    status: result.status === "fulfilled" ? "published" : "failed",
    external_id: result.status === "fulfilled" ? result.value.externalId : null,
    error_message: result.status === "rejected" ? String(result.reason instanceof Error ? result.reason.message : result.reason) : null,
    published_at: result.status === "fulfilled" ? now : null
  })));

  await supabase.from("marketing_posts").update({
    status: failures.length ? "error" : "published",
    publishedAt: successes.length ? now : null,
    updatedAt: now,
    publication_error: failures.length ? failures.map((failure) => failure.reason instanceof Error ? failure.reason.message : String(failure.reason)).join(" | ") : null
  }).eq("id", post.id).eq("workspace_id", post.workspace_id);

  if (!successes.length) throw new Error(failures[0]?.reason instanceof Error ? failures[0].reason.message : "Publication impossible.");
  return { published: successes.length, failed: failures.length };
}
