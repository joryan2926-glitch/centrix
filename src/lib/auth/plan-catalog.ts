export type PlanCode = "free" | "starter" | "premium" | "business" | "enterprise";

export const planRank: Record<PlanCode, number> = {
  free: 0,
  starter: 1,
  premium: 2,
  business: 3,
  enterprise: 4
};

export type PlanQuota = {
  userLimit: number | null;
  storageLimitMb: number | null;
  clientLimit: number | null;
  monthlyQuoteLimit: number | null;
  monthlyInvoiceLimit: number | null;
};

export const planQuotas: Record<PlanCode, PlanQuota> = {
  free: {
    clientLimit: 10,
    monthlyInvoiceLimit: 5,
    monthlyQuoteLimit: 5,
    storageLimitMb: 500,
    userLimit: 1
  },
  starter: {
    clientLimit: null,
    monthlyInvoiceLimit: null,
    monthlyQuoteLimit: null,
    storageLimitMb: 5 * 1024,
    userLimit: 3
  },
  premium: {
    clientLimit: null,
    monthlyInvoiceLimit: null,
    monthlyQuoteLimit: null,
    storageLimitMb: 50 * 1024,
    userLimit: 10
  },
  business: {
    clientLimit: null,
    monthlyInvoiceLimit: null,
    monthlyQuoteLimit: null,
    storageLimitMb: 200 * 1024,
    userLimit: null
  },
  enterprise: {
    clientLimit: null,
    monthlyInvoiceLimit: null,
    monthlyQuoteLimit: null,
    storageLimitMb: null,
    userLimit: null
  }
};

export const moduleMinimumPlan = {
  dashboard: "free",
  profile: "free",
  "company-profile": "free",
  notes: "free",
  agenda: "free",
  "personal-agenda": "free",
  "help-center": "free",
  notifications: "free",

  crm: "starter",
  clients: "starter",
  prospects: "starter",
  billing: "starter",
  quotes: "starter",
  invoices: "starter",
  payments: "starter",
  tasks: "starter",
  documents: "starter",
  "basic-documents": "starter",
  "electronic-signature": "starter",

  projects: "premium",
  "advanced-documents": "premium",
  workflows: "premium",
  automations: "premium",
  ai: "premium",
  analytics: "premium",
  reports: "premium",
  "custom-dashboards": "premium",
  support: "premium",

  hr: "business",
  recruiting: "business",
  "team-management": "business",
  finance: "business",
  bank: "business",
  treasury: "business",
  marketing: "business",
  emailing: "business",
  social: "business",
  integrations: "business",
  api: "business",

  marketplace: "enterprise",
  academy: "enterprise",
  legal: "business",
  security: "business",
  "multi-company": "enterprise",
  franchises: "enterprise",
  "white-label": "enterprise",
  settings: "enterprise",
  administration: "enterprise",
  "microsoft-sso": "enterprise",
  "google-sso": "enterprise",
  "custom-ai": "enterprise",
  "dedicated-hosting": "enterprise"
} as const satisfies Record<string, PlanCode>;

export function getRequiredPlanForModule(moduleKey: string): PlanCode {
  return moduleMinimumPlan[moduleKey as keyof typeof moduleMinimumPlan] ?? "enterprise";
}
