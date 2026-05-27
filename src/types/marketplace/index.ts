export type MarketplaceCategory = "marketing" | "design" | "development" | "legal" | "accounting" | "hr" | "ai_automation" | "coaching" | "training";
export type OrderStatus = "pending" | "accepted" | "in_progress" | "delivered" | "completed" | "canceled";

export type ServiceCategory = {
  id: string;
  slug: MarketplaceCategory;
  name: string;
  color: string;
};

export type Provider = {
  id: string;
  name: string;
  companyName: string;
  email: string;
  stripeAccountId: string | null;
  verified: boolean;
  premium: boolean;
  level: "new" | "pro" | "expert" | "top_rated";
  availability: "available" | "busy" | "offline";
  skills: string[];
  rating: number;
  completedOrders: number;
  revenue: number;
  createdAt: string;
};

export type MarketplaceService = {
  id: string;
  providerId: string;
  categoryId: string;
  title: string;
  description: string;
  price: number;
  deliveryDays: number;
  status: "draft" | "published" | "featured";
  mediaUrls: string[];
  options: Array<{ label: string; price: number }>;
  sales: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
};

export type ProviderReview = {
  id: string;
  providerId: string;
  orderId: string;
  clientName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  createdAt: string;
};

export type MarketplaceOrder = {
  id: string;
  serviceId: string;
  providerId: string;
  clientName: string;
  clientEmail: string;
  status: OrderStatus;
  amount: number;
  commissionAmount: number;
  dueAt: string;
  deliveredAt: string | null;
  stripePaymentIntentId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrderMessage = {
  id: string;
  orderId: string;
  authorType: "client" | "provider" | "system";
  authorName: string;
  content: string;
  attachments: string[];
  createdAt: string;
};

export type Payout = {
  id: string;
  providerId: string;
  amount: number;
  status: "pending" | "paid" | "failed";
  stripeTransferId: string | null;
  createdAt: string;
};

export type MarketplaceNotification = {
  id: string;
  title: string;
  detail: string;
  severity: "info" | "success" | "warning";
  createdAt: string;
};

export type ProviderPortfolio = {
  id: string;
  providerId: string;
  title: string;
  description: string;
  mediaUrl: string | null;
  createdAt: string;
};

export type MarketplaceData = {
  services: MarketplaceService[];
  categories: ServiceCategory[];
  providers: Provider[];
  reviews: ProviderReview[];
  orders: MarketplaceOrder[];
  messages: OrderMessage[];
  payouts: Payout[];
  notifications: MarketplaceNotification[];
  portfolios: ProviderPortfolio[];
};
