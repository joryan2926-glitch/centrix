export type SocialNetwork = "facebook" | "instagram" | "linkedin" | "tiktok" | "x" | "youtube";
export type SocialPostStatus = "draft" | "scheduled" | "published" | "error";
export type CampaignType = "email" | "social" | "paid" | "launch";
export type MediaType = "image" | "video" | "template";

export type SocialAccount = {
  id: string;
  network: SocialNetwork;
  handle: string;
  displayName: string;
  followers: number;
  engagementRate: number;
  reach: number;
  connected: boolean;
  color: string;
  createdAt: string;
};

export type MarketingCampaign = {
  id: string;
  name: string;
  type: CampaignType;
  objective: string;
  status: "active" | "paused" | "completed";
  budget: number;
  spent: number;
  revenue: number;
  leads: number;
  startsAt: string;
  endsAt: string;
  color: string;
};

export type SocialPost = {
  id: string;
  campaignId: string | null;
  accountIds: string[];
  title: string;
  content: string;
  status: SocialPostStatus;
  scheduledAt: string;
  publishedAt: string | null;
  hashtags: string[];
  mentions: string[];
  mediaUrls: string[];
  category: "education" | "product" | "brand" | "community" | "ads";
  metrics: {
    impressions: number;
    engagement: number;
    clicks: number;
    leads: number;
  };
  createdAt: string;
  updatedAt: string;
};

export type MediaAsset = {
  id: string;
  type: MediaType;
  title: string;
  url: string;
  tags: string[];
  createdAt: string;
};

export type MarketingActivity = {
  id: string;
  title: string;
  detail: string;
  createdAt: string;
  tone: "info" | "success" | "warning";
};

export type MarketingReportPoint = {
  month: string;
  reach: number;
  engagement: number;
  clicks: number;
  leads: number;
};

export type MarketingData = {
  accounts: SocialAccount[];
  posts: SocialPost[];
  campaigns: MarketingCampaign[];
  media: MediaAsset[];
  activities: MarketingActivity[];
  reports: MarketingReportPoint[];
};

export type MarketingFilters = {
  query: string;
  network: "all" | SocialNetwork;
  status: "all" | SocialPostStatus;
};
