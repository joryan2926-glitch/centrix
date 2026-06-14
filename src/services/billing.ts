import type { BillingDocument, BillingLine, BillingNotification, BillingStatus, BillingTotals, FrenchVatRate, SaaSBillingData, SaaSSubscription, SubscriptionPlanCode } from "@/types/billing";

export function createBillingId(prefix = "doc") {
  void prefix;
  return crypto.randomUUID();
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2
  }).format(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export function calculateBillingTotals(lines: BillingLine[]): BillingTotals {
  const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
  const rates = new Map<FrenchVatRate, number>();

  lines.forEach((line) => {
    const base = line.quantity * line.unitPrice;
    const amount = base * (line.vatRate / 100);
    rates.set(line.vatRate, (rates.get(line.vatRate) ?? 0) + amount);
  });

  const vatByRate = Array.from(rates.entries())
    .map(([rate, amount]) => ({ rate, amount }))
    .sort((a, b) => a.rate - b.rate);
  const vatTotal = vatByRate.reduce((sum, item) => sum + item.amount, 0);

  return {
    subtotal,
    vatByRate,
    vatTotal,
    total: subtotal + vatTotal
  };
}

export function buildDocumentNumber(type: BillingDocument["type"], count: number) {
  const prefix = type === "quote" ? "DEV" : "INV";
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${String(count + 1).padStart(3, "0")}`;
}

export function nextStatus(status: BillingStatus): BillingStatus {
  if (status === "paid") {
    return "pending";
  }

  return "paid";
}

export function statusLabel(status: BillingStatus) {
  const labels: Record<BillingStatus, string> = {
    draft: "Brouillon",
    pending: "En attente",
    paid: "Paye"
  };

  return labels[status];
}

export function createHistory(label: string, detail: string) {
  return {
    id: createBillingId("history"),
    at: new Date().toISOString(),
    label,
    detail
  };
}

export const subscriptionStatusLabels: Record<SaaSSubscription["status"], string> = {
  active: "Actif",
  trialing: "Essai",
  suspended: "Suspendu",
  canceled: "Annule",
  past_due: "Impaye"
};

export const planLabels: Record<SubscriptionPlanCode, string> = {
  free: "Free",
  starter: "Starter",
  premium: "Premium",
  business: "Business",
  enterprise: "Enterprise"
};

export function getSaaSBillingDashboard(data: SaaSBillingData) {
  const activeSubscriptions = data.subscriptions.filter((subscription) => subscription.status === "active");
  const mrr = activeSubscriptions.reduce((sum, subscription) => {
    const plan = data.plans.find((item) => item.id === subscription.planId);
    return sum + (plan?.monthlyPrice ?? 0);
  }, 0);
  const totalRevenue = data.payments.filter((payment) => payment.status === "paid").reduce((sum, payment) => sum + payment.amount, 0);
  const churnRate = data.subscriptions.length ? (data.subscriptions.filter((subscription) => subscription.status === "canceled").length / data.subscriptions.length) * 100 : 0;

  return {
    mrr,
    activeSubscriptions: activeSubscriptions.length,
    totalRevenue,
    churnRate,
    trials: data.subscriptions.filter((subscription) => subscription.status === "trialing").length,
    failedPayments: data.payments.filter((payment) => payment.status === "failed").length,
    premiumCustomers: data.customers.filter((customer) => customer.premium).length
  };
}

export function createBillingNotification(customerId: string | null, title: string, detail: string, severity: BillingNotification["severity"] = "info"): BillingNotification {
  return {
    id: createBillingId("bill-notif"),
    customerId,
    title,
    detail,
    severity,
    createdAt: new Date().toISOString()
  };
}

export function subscriptionTone(status: SaaSSubscription["status"]) {
  if (status === "active") return "emerald" as const;
  if (status === "trialing") return "cyan" as const;
  if (status === "past_due" || status === "suspended") return "rose" as const;
  return "violet" as const;
}
