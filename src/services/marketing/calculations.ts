import type { MarketingData, MarketingFilters, SocialNetwork, SocialPost, SocialPostStatus } from "@/types/marketing";

export const networkLabels: Record<SocialNetwork, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  x: "X/Twitter",
  youtube: "YouTube"
};

export const postStatusLabels: Record<SocialPostStatus, string> = {
  draft: "Brouillon",
  scheduled: "Programme",
  published: "Publie",
  error: "Erreur"
};

export function statusTone(status: SocialPostStatus) {
  if (status === "published") return "emerald";
  if (status === "scheduled") return "cyan";
  if (status === "error") return "rose";
  return "violet";
}

export function getMarketingDashboard(data: MarketingData) {
  const scheduled = data.posts.filter((post) => post.status === "scheduled").length;
  const published = data.posts.filter((post) => post.status === "published");
  const engagement = published.reduce((sum, post) => sum + post.metrics.engagement, 0);
  const reach = data.accounts.reduce((sum, account) => sum + account.reach, 0);
  const followers = data.accounts.reduce((sum, account) => sum + account.followers, 0);
  const clicks = published.reduce((sum, post) => sum + post.metrics.clicks, 0);
  const leads = published.reduce((sum, post) => sum + post.metrics.leads, 0) + data.campaigns.reduce((sum, campaign) => sum + campaign.leads, 0);
  const activeCampaigns = data.campaigns.filter((campaign) => campaign.status === "active").length;
  const conversionRate = clicks ? (leads / clicks) * 100 : 0;

  return { scheduled, engagement, reach, followers, clicks, leads, activeCampaigns, conversionRate };
}

export function filterPosts(posts: SocialPost[], filters: MarketingFilters, accounts: MarketingData["accounts"]) {
  const query = filters.query.trim().toLowerCase();

  return posts.filter((post) => {
    const postAccounts = accounts.filter((account) => post.accountIds.includes(account.id));
    const matchesQuery =
      !query ||
      [
        post.title,
        post.content,
        post.category,
        ...post.hashtags,
        ...post.mentions,
        ...postAccounts.map((account) => `${account.handle} ${account.network}`)
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    const matchesNetwork = filters.network === "all" || postAccounts.some((account) => account.network === filters.network);
    const matchesStatus = filters.status === "all" || post.status === filters.status;

    return matchesQuery && matchesNetwork && matchesStatus;
  });
}

export function buildPost(input: {
  campaignId: string | null;
  accountIds: string[];
  title: string;
  content: string;
  scheduledAt: string;
  hashtags: string[];
  mentions: string[];
  category: SocialPost["category"];
}): SocialPost {
  const now = new Date().toISOString();

  return {
    id: `post-${crypto.randomUUID()}`,
    campaignId: input.campaignId,
    accountIds: input.accountIds,
    title: input.title,
    content: input.content,
    status: "scheduled",
    scheduledAt: input.scheduledAt,
    publishedAt: null,
    hashtags: input.hashtags,
    mentions: input.mentions,
    mediaUrls: [],
    category: input.category,
    metrics: { impressions: 0, engagement: 0, clicks: 0, leads: 0 },
    createdAt: now,
    updatedAt: now
  };
}

export function campaignRoi(spent: number, revenue: number) {
  if (!spent) return 0;
  return ((revenue - spent) / spent) * 100;
}
