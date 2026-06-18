import type { SaaSBillingData } from "@/types/billing";

export const saasBillingFallbackData: SaaSBillingData = {
  plans: [
    { id: "plan-free", code: "free", name: "Free", description: "Pour demarrer avec le cockpit CENTRIX et les limites d'essai.", monthlyPrice: 0, yearlyPrice: 0, stripePriceId: null, userLimit: 1, storageLimitGb: 0.5, modules: ["dashboard", "profile", "notes", "agenda", "help-center"], features: ["1 utilisateur", "500 Mo stockage", "10 clients", "5 devis/mois", "5 factures/mois"], highlighted: false },
    { id: "plan-starter", code: "starter", name: "Starter", description: "Pour gerer les premiers clients, devis, factures et documents basiques.", monthlyPrice: 29, yearlyPrice: 290, stripePriceId: "price_1TiQlX1KedcFY0WPn6DtDsYn", userLimit: 3, storageLimitGb: 5, modules: ["dashboard", "crm", "clients", "prospects", "billing", "payments", "agenda", "tasks", "notes", "documents", "electronic-signature"], features: ["3 utilisateurs", "5 Go stockage", "CRM", "Factures et paiements", "Signature electronique"], highlighted: false },
    { id: "plan-premium", code: "premium", name: "Premium", description: "Pour automatiser avec IA, workflows, support et analytics.", monthlyPrice: 79, yearlyPrice: 790, stripePriceId: "price_1TiQn41KedcFY0WPHEP8zv9b", userLimit: 10, storageLimitGb: 50, modules: ["crm", "billing", "projects", "documents", "workflows", "ai", "support", "analytics", "reports", "custom-dashboards"], features: ["10 utilisateurs", "50 Go stockage", "IA CENTRIX", "Automatisations", "Rapports"], highlighted: true },
    { id: "plan-business", code: "business", name: "Business", description: "Pour les equipes avec RH, banque, marketing, API et integrations avancees.", monthlyPrice: 149, yearlyPrice: 1490, stripePriceId: "price_1TiQoP1KedcFY0WPqZGlq0DE", userLimit: 0, storageLimitGb: 200, modules: ["all-premium", "hr", "recruiting", "team-management", "finance", "bank", "treasury", "marketing", "emailing", "social", "api", "integrations"], features: ["Utilisateurs illimites", "200 Go stockage", "RH", "Banque", "Marketing et reseaux sociaux", "API"], highlighted: false },
    { id: "plan-enterprise", code: "enterprise", name: "Enterprise", description: "Pour groupes, filiales, marketplace complete et accompagnement dedie.", monthlyPrice: 499, yearlyPrice: 4990, stripePriceId: "price_1TiQpM1KedcFY0WPYQ9A1f2R", userLimit: 0, storageLimitGb: 0, modules: ["all"], features: ["Tous les modules", "Stockage illimite", "White Label", "Multi-societes", "Marketplace", "SSO Google/Microsoft", "IA personnalisee"], highlighted: false }
  ],
  customers: [
    { id: "cus-centrix", companyId: "company-centrix", name: "CENTRIX SAS", email: "billing@centrix.local", stripeCustomerId: "cus_demo_centrix", premium: true, createdAt: "2026-01-10T08:00:00.000Z" },
    { id: "cus-nova", companyId: "company-nova", name: "Nova Retail", email: "finance@novaretail.fr", stripeCustomerId: "cus_demo_nova", premium: true, createdAt: "2026-03-10T08:00:00.000Z" },
    { id: "cus-orion", companyId: "company-orion", name: "Orion Services", email: "ops@orion.fr", stripeCustomerId: null, premium: false, createdAt: "2026-05-02T08:00:00.000Z" }
  ],
  subscriptions: [
    { id: "sub-centrix", companyId: "company-centrix", customerId: "cus-centrix", plan: "enterprise", planId: "plan-enterprise", stripeSubscriptionId: "sub_demo_enterprise", status: "active", seats: 150, usedSeats: 128, trialEndsAt: null, currentPeriodEnd: "2026-06-26T10:00:00.000Z", autoRenew: true, createdAt: "2026-01-10T08:00:00.000Z", updatedAt: "2026-05-26T08:00:00.000Z" },
    { id: "sub-nova", companyId: "company-nova", customerId: "cus-nova", plan: "business", planId: "plan-business", stripeSubscriptionId: "sub_demo_business", status: "active", seats: 60, usedSeats: 42, trialEndsAt: null, currentPeriodEnd: "2026-06-18T10:00:00.000Z", autoRenew: true, createdAt: "2026-03-10T08:00:00.000Z", updatedAt: "2026-05-25T08:00:00.000Z" },
    { id: "sub-orion", companyId: "company-orion", customerId: "cus-orion", plan: "starter", planId: "plan-starter", stripeSubscriptionId: null, status: "trialing", seats: 5, usedSeats: 3, trialEndsAt: "2026-06-05T10:00:00.000Z", currentPeriodEnd: "2026-06-05T10:00:00.000Z", autoRenew: true, createdAt: "2026-05-22T08:00:00.000Z", updatedAt: "2026-05-26T08:00:00.000Z" }
  ],
  invoices: [
    { id: "inv-sub-2048", subscriptionId: "sub-centrix", customerId: "cus-centrix", number: "INV-SUB-2048", amount: 2490, vatAmount: 498, status: "paid", pdfUrl: null, dueAt: "2026-05-25T10:00:00.000Z", paidAt: "2026-05-25T11:00:00.000Z", createdAt: "2026-05-25T10:00:00.000Z" },
    { id: "inv-sub-2049", subscriptionId: "sub-nova", customerId: "cus-nova", number: "INV-SUB-2049", amount: 1490, vatAmount: 298, status: "paid", pdfUrl: null, dueAt: "2026-05-18T10:00:00.000Z", paidAt: "2026-05-18T11:00:00.000Z", createdAt: "2026-05-18T10:00:00.000Z" },
    { id: "inv-sub-2050", subscriptionId: "sub-orion", customerId: "cus-orion", number: "INV-SUB-2050", amount: 29, vatAmount: 5.8, status: "pending", pdfUrl: null, dueAt: "2026-06-05T10:00:00.000Z", paidAt: null, createdAt: "2026-05-26T10:00:00.000Z" }
  ],
  payments: [
    { id: "pay-1", invoiceId: "inv-sub-2048", customerId: "cus-centrix", stripePaymentIntentId: "pi_demo_1", cardBrand: "visa", cardLast4: "4242", amount: 2490, status: "paid", createdAt: "2026-05-25T11:00:00.000Z" },
    { id: "pay-2", invoiceId: "inv-sub-2049", customerId: "cus-nova", stripePaymentIntentId: "pi_demo_2", cardBrand: "mastercard", cardLast4: "4444", amount: 1490, status: "paid", createdAt: "2026-05-18T11:00:00.000Z" },
    { id: "pay-3", invoiceId: "inv-sub-2047", customerId: "cus-centrix", stripePaymentIntentId: "pi_demo_failed", cardBrand: "visa", cardLast4: "3184", amount: 2490, status: "failed", createdAt: "2026-04-25T11:00:00.000Z" }
  ],
  coupons: [
    { id: "coupon-launch", code: "LAUNCH30", discountPercent: 30, active: true, redemptionCount: 42, expiresAt: "2026-07-01T00:00:00.000Z" },
    { id: "coupon-franchise", code: "FRANCHISE15", discountPercent: 15, active: true, redemptionCount: 18, expiresAt: null }
  ],
  usageLimits: [
    { id: "usage-users", subscriptionId: "sub-centrix", metric: "users", used: 128, limit: 150 },
    { id: "usage-storage", subscriptionId: "sub-centrix", metric: "storage", used: 356, limit: 5000 },
    { id: "usage-ai", subscriptionId: "sub-centrix", metric: "ai_tokens", used: 184000, limit: 500000 },
    { id: "usage-documents", subscriptionId: "sub-nova", metric: "documents", used: 1280, limit: 10000 }
  ],
  notifications: [
    { id: "bill-notif-1", customerId: "cus-orion", title: "Essai gratuit bientot termine", detail: "Orion Services termine son essai le 5 juin 2026.", severity: "warning", createdAt: "2026-05-26T09:00:00.000Z" },
    { id: "bill-notif-2", customerId: "cus-centrix", title: "Paiement reussi", detail: "INV-SUB-2048 a ete payee par carte Visa.", severity: "success", createdAt: "2026-05-25T11:00:00.000Z" }
  ],
  stripeEvents: [
    { id: "evt-log-1", stripeEventId: "evt_demo_paid", type: "invoice.payment_succeeded", status: "processed", payload: { invoice: "INV-SUB-2048" }, createdAt: "2026-05-25T11:00:00.000Z" },
    { id: "evt-log-2", stripeEventId: "evt_demo_failed", type: "invoice.payment_failed", status: "processed", payload: { invoice: "INV-SUB-2047" }, createdAt: "2026-04-25T11:00:00.000Z" }
  ]
};
