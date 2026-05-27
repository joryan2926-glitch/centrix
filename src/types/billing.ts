export type FrenchVatRate = 0 | 2.1 | 5.5 | 10 | 20;

export type BillingStatus = "draft" | "pending" | "paid";

export type BillingLine = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: FrenchVatRate;
};

export type BillingDocument = {
  id: string;
  number: string;
  type: "quote" | "invoice";
  status: BillingStatus;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  issueDate: string;
  dueDate: string;
  notes: string;
  lines: BillingLine[];
  history: BillingHistoryEntry[];
  createdAt: string;
  updatedAt: string;
};

export type BillingHistoryEntry = {
  id: string;
  at: string;
  label: string;
  detail: string;
};

export type BillingTotals = {
  subtotal: number;
  vatByRate: Array<{
    rate: FrenchVatRate;
    amount: number;
  }>;
  vatTotal: number;
  total: number;
};

export type SubscriptionPlanCode = "free" | "starter" | "premium" | "business" | "enterprise";
export type SubscriptionStatus = "active" | "trialing" | "suspended" | "canceled" | "past_due";
export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";

export type SubscriptionPlan = {
  id: string;
  code: SubscriptionPlanCode;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  stripePriceId: string | null;
  userLimit: number;
  storageLimitGb: number;
  modules: string[];
  features: string[];
  highlighted: boolean;
};

export type BillingCustomer = {
  id: string;
  companyId: string;
  name: string;
  email: string;
  stripeCustomerId: string | null;
  premium: boolean;
  createdAt: string;
};

export type SaaSSubscription = {
  id: string;
  companyId: string;
  customerId: string;
  plan: Exclude<SubscriptionPlanCode, "free">;
  planId: string;
  stripeSubscriptionId: string | null;
  status: SubscriptionStatus;
  seats: number;
  usedSeats: number;
  trialEndsAt: string | null;
  currentPeriodEnd: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SubscriptionInvoice = {
  id: string;
  subscriptionId: string;
  customerId: string;
  number: string;
  amount: number;
  vatAmount: number;
  status: PaymentStatus;
  pdfUrl: string | null;
  dueAt: string;
  paidAt: string | null;
  createdAt: string;
};

export type SubscriptionPayment = {
  id: string;
  invoiceId: string;
  customerId: string;
  stripePaymentIntentId: string | null;
  cardBrand: string;
  cardLast4: string;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
};

export type Coupon = {
  id: string;
  code: string;
  discountPercent: number;
  active: boolean;
  redemptionCount: number;
  expiresAt: string | null;
};

export type UsageLimit = {
  id: string;
  subscriptionId: string;
  metric: "users" | "storage" | "ai_tokens" | "documents" | "workflows";
  used: number;
  limit: number;
};

export type BillingNotification = {
  id: string;
  customerId: string | null;
  title: string;
  detail: string;
  severity: "info" | "success" | "warning";
  createdAt: string;
};

export type StripeEventLog = {
  id: string;
  stripeEventId: string;
  type: string;
  status: "processed" | "failed" | "ignored";
  payload: Record<string, unknown>;
  createdAt: string;
};

export type SaaSBillingData = {
  plans: SubscriptionPlan[];
  customers: BillingCustomer[];
  subscriptions: SaaSSubscription[];
  invoices: SubscriptionInvoice[];
  payments: SubscriptionPayment[];
  coupons: Coupon[];
  usageLimits: UsageLimit[];
  notifications: BillingNotification[];
  stripeEvents: StripeEventLog[];
};
