import type { MarketplaceData, MarketplaceNotification, MarketplaceService, OrderStatus } from "@/types/marketplace";

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "En attente",
  accepted: "Accepte",
  in_progress: "En cours",
  delivered: "Livre",
  completed: "Termine",
  canceled: "Annule"
};

export function getMarketplaceDashboard(data: MarketplaceData) {
  return {
    publishedServices: data.services.filter((service) => service.status === "published" || service.status === "featured").length,
    sales: data.orders.filter((order) => order.status === "completed" || order.status === "delivered" || order.status === "in_progress").length,
    activeProviders: data.providers.filter((provider) => provider.availability !== "offline").length,
    revenue: data.orders.reduce((sum, order) => sum + order.amount, 0),
    activeOrders: data.orders.filter((order) => !["completed", "canceled"].includes(order.status)).length,
    commissions: data.orders.reduce((sum, order) => sum + order.commissionAmount, 0)
  };
}

export function createMarketplaceService(providerId: string, categoryId: string): MarketplaceService {
  const now = new Date().toISOString();
  return {
    id: `svc-${crypto.randomUUID()}`,
    providerId,
    categoryId,
    title: "Nouveau service CENTRIX",
    description: "Decrivez une offre claire, livrable et mesurable pour les entreprises CENTRIX.",
    price: 500,
    deliveryDays: 7,
    status: "draft",
    mediaUrls: [],
    options: [],
    sales: 0,
    rating: 0,
    createdAt: now,
    updatedAt: now
  };
}

export function createMarketplaceNotification(title: string, detail: string, severity: MarketplaceNotification["severity"] = "info"): MarketplaceNotification {
  return {
    id: `market-notif-${crypto.randomUUID()}`,
    title,
    detail,
    severity,
    createdAt: new Date().toISOString()
  };
}

export function orderTone(status: OrderStatus) {
  if (status === "completed" || status === "delivered") return "emerald" as const;
  if (status === "canceled") return "rose" as const;
  if (status === "pending") return "violet" as const;
  return "cyan" as const;
}
