import type { SaaSBillingData } from "@/types/billing";

export const saasBillingFallbackData: SaaSBillingData = {
  plans: [
    { id: "plan-free", code: "free", name: "Free", description: "Pour tester CENTRIX avec les modules essentiels.", monthlyPrice: 0, yearlyPrice: 0, stripePriceId: null, userLimit: 2, storageLimitGb: 2, modules: ["crm", "agenda"], features: ["CRM basique", "Agenda", "Support communautaire"], highlighted: false },
    { id: "plan-starter", code: "starter", name: "Starter", description: "Pour independants et petites equipes.", monthlyPrice: 29, yearlyPrice: 290, stripePriceId: "price_1TiQlX1KedcFY0WPn6DtDsYn", userLimit: 5, storageLimitGb: 20, modules: ["crm", "billing", "documents"], features: ["Facturation", "Documents", "5 utilisateurs"], highlighted: false },
    { id: "plan-premium", code: "premium", name: "Premium", description: "Pour equipes qui veulent automatiser leurs operations.", monthlyPrice: 79, yearlyPrice: 790, stripePriceId: "price_1TiQn41KedcFY0WPHEP8zv9b", userLimit: 20, storageLimitGb: 100, modules: ["crm", "billing", "finance", "support", "documents"], features: ["Support prioritaire", "Finance", "Automatisations"], highlighted: true },
    { id: "plan-business", code: "business", name: "Business", description: "Pour PME multi-modules avec reporting avance.", monthlyPrice: 149, yearlyPrice: 1490, stripePriceId: "price_1TiQoP1KedcFY0WPqZGlq0DE", userLimit: 60, storageLimitGb: 500, modules: ["crm", "billing", "finance", "hr", "marketing", "support", "documents", "ai"], features: ["IA Business", "RH", "Marketing", "60 utilisateurs"], highlighted: false },
    { id: "plan-enterprise", code: "enterprise", name: "Enterprise", description: "Pour groupes, franchises et besoins securite avances.", monthlyPrice: 499, yearlyPrice: 4990, stripePriceId: "price_1TiQpM1KedcFY0WPYQ9A1f2R", userLimit: 500, storageLimitGb: 5000, modules: ["all"], features: ["SSO futur", "SLA dedie", "Multi-entreprises", "Quotas sur mesure"], highlighted: false }
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
