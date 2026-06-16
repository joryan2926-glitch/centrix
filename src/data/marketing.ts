import type { MarketingData } from "@/types/marketing";

export const marketingFallbackData: MarketingData = {
  accounts: [
    { id: "acc-linkedin", network: "linkedin", handle: "@centrix", displayName: "CENTRIX LinkedIn", followers: 42800, engagementRate: 6.8, reach: 184000, connected: true, color: "#5ee7ff", createdAt: "2026-05-01T08:00:00.000Z" },
    { id: "acc-instagram", network: "instagram", handle: "@centrix.app", displayName: "CENTRIX Instagram", followers: 28600, engagementRate: 4.9, reach: 132000, connected: true, color: "#f472b6", createdAt: "2026-05-01T08:00:00.000Z" },
    { id: "acc-youtube", network: "youtube", handle: "@centrixOS", displayName: "CENTRIX YouTube", followers: 12400, engagementRate: 5.4, reach: 96000, connected: true, color: "#ef4444", createdAt: "2026-05-01T08:00:00.000Z" },
    { id: "acc-x", network: "x", handle: "@centrixhq", displayName: "CENTRIX X", followers: 18300, engagementRate: 3.2, reach: 74000, connected: true, color: "#94a3b8", createdAt: "2026-05-01T08:00:00.000Z" }
  ],
  campaigns: [
    { id: "camp-launch", name: "Launch Finance OS", type: "launch", objective: "Generer demandes demo", status: "active", budget: 18000, spent: 8400, revenue: 69000, leads: 342, startsAt: "2026-05-01", endsAt: "2026-06-15", color: "#5ee7ff" },
    { id: "camp-nurture", name: "Nurturing CRM", type: "email", objective: "Convertir essais", status: "active", budget: 6200, spent: 2800, revenue: 24000, leads: 188, startsAt: "2026-05-10", endsAt: "2026-06-30", color: "#8b5cf6" }
  ],
  posts: [
    {
      id: "post-1",
      campaignId: "camp-launch",
      accountIds: ["acc-linkedin", "acc-x"],
      title: "Annonce Finance OS",
      content: "CENTRIX lance un module Finance OS pour piloter cashflow, TVA et transactions en temps reel.",
      status: "scheduled",
      scheduledAt: "2026-05-27T09:00:00.000Z",
      publishedAt: null,
      hashtags: ["SaaS", "Finance", "Productivity"],
      mentions: ["@centrix"],
      mediaUrls: ["gradient-finance-cover"],
      category: "product",
      metrics: { impressions: 0, engagement: 0, clicks: 0, leads: 0 },
      createdAt: "2026-05-24T08:00:00.000Z",
      updatedAt: "2026-05-24T08:00:00.000Z"
    },
    {
      id: "post-2",
      campaignId: "camp-nurture",
      accountIds: ["acc-instagram"],
      title: "Carousel CRM",
      content: "5 automatisations CRM qui economisent 10h par semaine aux equipes commerciales.",
      status: "published",
      scheduledAt: "2026-05-24T11:00:00.000Z",
      publishedAt: "2026-05-24T11:00:00.000Z",
      hashtags: ["CRM", "Sales", "Automation"],
      mentions: [],
      mediaUrls: ["crm-carousel"],
      category: "education",
      metrics: { impressions: 28400, engagement: 1840, clicks: 612, leads: 74 },
      createdAt: "2026-05-22T08:00:00.000Z",
      updatedAt: "2026-05-24T11:00:00.000Z"
    }
  ],
  media: [
    { id: "media-finance", type: "image", title: "Cover Finance OS", url: "gradient-finance-cover", tags: ["finance", "launch"], createdAt: "2026-05-22T08:00:00.000Z" },
    { id: "media-template", type: "template", title: "Template carousel SaaS", url: "template-carousel", tags: ["carousel", "education"], createdAt: "2026-05-20T08:00:00.000Z" }
  ],
  activities: [
    { id: "act-1", title: "Post programme", detail: "Annonce Finance OS programmee sur LinkedIn et X.", tone: "success", createdAt: "2026-05-24T08:00:00.000Z" },
    { id: "act-2", title: "Lead magnet performant", detail: "Le carousel CRM a genere 74 leads.", tone: "info", createdAt: "2026-05-24T12:00:00.000Z" }
  ],
  reports: [
    { month: "Jan", reach: 84000, engagement: 4200, clicks: 1200, leads: 180 },
    { month: "Fev", reach: 96000, engagement: 5100, clicks: 1480, leads: 214 },
    { month: "Mar", reach: 112000, engagement: 6200, clicks: 1740, leads: 260 },
    { month: "Avr", reach: 138000, engagement: 7900, clicks: 2210, leads: 318 },
    { month: "Mai", reach: 184000, engagement: 10400, clicks: 3080, leads: 416 }
  ],
  publicationLogs: []
};
