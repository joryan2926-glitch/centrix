import type { MarketplaceData } from "@/types/marketplace";

export const marketplaceFallbackData: MarketplaceData = {
  categories: [
    { id: "cat-mkt", slug: "marketing", name: "Marketing", color: "#5ee7ff" },
    { id: "cat-design", slug: "design", name: "Design", color: "#8b5cf6" },
    { id: "cat-dev", slug: "development", name: "Developpement", color: "#34d399" },
    { id: "cat-legal", slug: "legal", name: "Juridique", color: "#d946ef" },
    { id: "cat-accounting", slug: "accounting", name: "Comptabilite", color: "#f59e0b" },
    { id: "cat-hr", slug: "hr", name: "RH", color: "#38bdf8" },
    { id: "cat-ai", slug: "ai_automation", name: "Automatisation IA", color: "#a78bfa" },
    { id: "cat-coaching", slug: "coaching", name: "Coaching", color: "#fb7185" },
    { id: "cat-training", slug: "training", name: "Formation", color: "#22c55e" }
  ],
  providers: [
    { id: "prov-ops", name: "Sarah Martin", companyName: "Ops Studio", email: "sarah@opsstudio.fr", stripeAccountId: "acct_demo_ops", verified: true, premium: true, level: "top_rated", availability: "available", skills: ["CRM", "Automatisation", "Support"], rating: 4.9, completedOrders: 86, revenue: 68400, createdAt: "2026-02-12T08:00:00.000Z" },
    { id: "prov-design", name: "Yanis Perrin", companyName: "Linear Brand Lab", email: "yanis@brandlab.fr", stripeAccountId: "acct_demo_design", verified: true, premium: false, level: "expert", availability: "busy", skills: ["UI", "Branding", "Design system"], rating: 4.8, completedOrders: 54, revenue: 39200, createdAt: "2026-03-01T08:00:00.000Z" },
    { id: "prov-legal", name: "Nora Chen", companyName: "Legal Scale", email: "nora@legalscale.fr", stripeAccountId: null, verified: false, premium: false, level: "pro", availability: "available", skills: ["Contrats", "SAS", "RGPD"], rating: 4.7, completedOrders: 31, revenue: 21600, createdAt: "2026-04-18T08:00:00.000Z" }
  ],
  services: [
    { id: "svc-automation", providerId: "prov-ops", categoryId: "cat-ai", title: "Workflow IA de relance commerciale", description: "Audit, setup Make/Zapier et prompts commerciaux connectes a CENTRIX CRM.", price: 1200, deliveryDays: 7, status: "featured", mediaUrls: [], options: [{ label: "Audit CRM", price: 350 }, { label: "Dashboard KPI", price: 500 }], sales: 34, rating: 4.9, createdAt: "2026-04-01T08:00:00.000Z", updatedAt: "2026-05-26T08:00:00.000Z" },
    { id: "svc-brand", providerId: "prov-design", categoryId: "cat-design", title: "Design system SaaS premium", description: "Kit UI, composants Tailwind et guidelines pour plateforme B2B.", price: 1800, deliveryDays: 12, status: "published", mediaUrls: [], options: [{ label: "Prototype Figma", price: 700 }], sales: 18, rating: 4.8, createdAt: "2026-03-20T08:00:00.000Z", updatedAt: "2026-05-25T08:00:00.000Z" },
    { id: "svc-legal", providerId: "prov-legal", categoryId: "cat-legal", title: "Pack contrats SaaS", description: "CGV, contrat SaaS, DPA et clauses support a valider juridiquement.", price: 950, deliveryDays: 10, status: "draft", mediaUrls: [], options: [{ label: "Relecture DPA", price: 250 }], sales: 9, rating: 4.7, createdAt: "2026-05-01T08:00:00.000Z", updatedAt: "2026-05-24T08:00:00.000Z" }
  ],
  orders: [
    { id: "ord-1", serviceId: "svc-automation", providerId: "prov-ops", clientName: "Nova Retail", clientEmail: "ops@novaretail.fr", status: "in_progress", amount: 1200, commissionAmount: 180, dueAt: "2026-06-02T08:00:00.000Z", deliveredAt: null, stripePaymentIntentId: "pi_demo_market_1", createdAt: "2026-05-22T08:00:00.000Z", updatedAt: "2026-05-26T08:00:00.000Z" },
    { id: "ord-2", serviceId: "svc-brand", providerId: "prov-design", clientName: "Orion Services", clientEmail: "hello@orion.fr", status: "delivered", amount: 1800, commissionAmount: 270, dueAt: "2026-05-28T08:00:00.000Z", deliveredAt: "2026-05-26T08:00:00.000Z", stripePaymentIntentId: "pi_demo_market_2", createdAt: "2026-05-14T08:00:00.000Z", updatedAt: "2026-05-26T08:00:00.000Z" },
    { id: "ord-3", serviceId: "svc-legal", providerId: "prov-legal", clientName: "Blue Atlas", clientEmail: "legal@blueatlas.io", status: "pending", amount: 950, commissionAmount: 142.5, dueAt: "2026-06-06T08:00:00.000Z", deliveredAt: null, stripePaymentIntentId: null, createdAt: "2026-05-26T08:00:00.000Z", updatedAt: "2026-05-26T08:00:00.000Z" }
  ],
  reviews: [
    { id: "rev-1", providerId: "prov-ops", orderId: "ord-1", clientName: "Nova Retail", rating: 5, comment: "Workflow clair, mesurable et tres bien documente.", createdAt: "2026-05-24T08:00:00.000Z" },
    { id: "rev-2", providerId: "prov-design", orderId: "ord-2", clientName: "Orion Services", rating: 5, comment: "Design system premium, rapide a integrer.", createdAt: "2026-05-26T08:00:00.000Z" }
  ],
  messages: [
    { id: "msg-market-1", orderId: "ord-1", authorType: "client", authorName: "Nova Retail", content: "Peut-on ajouter une notification Slack au workflow ?", attachments: [], createdAt: "2026-05-25T09:00:00.000Z" },
    { id: "msg-market-2", orderId: "ord-1", authorType: "provider", authorName: "Sarah Martin", content: "Oui, je l'ajoute dans la livraison intermediaire.", attachments: ["workflow-map.png"], createdAt: "2026-05-25T09:20:00.000Z" }
  ],
  payouts: [
    { id: "payout-1", providerId: "prov-ops", amount: 1020, status: "pending", stripeTransferId: null, createdAt: "2026-05-26T08:00:00.000Z" },
    { id: "payout-2", providerId: "prov-design", amount: 1530, status: "paid", stripeTransferId: "tr_demo_1", createdAt: "2026-05-26T08:00:00.000Z" }
  ],
  notifications: [
    { id: "market-notif-1", title: "Commande livree", detail: "Design system SaaS premium attend validation client.", severity: "success", createdAt: "2026-05-26T08:00:00.000Z" },
    { id: "market-notif-2", title: "Onboarding Stripe Connect", detail: "Legal Scale doit terminer la verification prestataire.", severity: "warning", createdAt: "2026-05-25T08:00:00.000Z" }
  ],
  portfolios: [
    { id: "port-1", providerId: "prov-design", title: "Dashboard fintech", description: "Refonte UI pour SaaS finance B2B.", mediaUrl: null, createdAt: "2026-04-10T08:00:00.000Z" },
    { id: "port-2", providerId: "prov-ops", title: "Automation revenue ops", description: "Pipeline CRM, scoring IA et relances automatisees.", mediaUrl: null, createdAt: "2026-04-18T08:00:00.000Z" }
  ]
};
