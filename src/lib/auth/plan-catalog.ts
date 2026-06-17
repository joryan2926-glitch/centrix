export type PlanCode = "free" | "starter" | "premium" | "business" | "enterprise";

export const planRank: Record<PlanCode, number> = {
  free: 0,
  starter: 1,
  premium: 2,
  business: 3,
  enterprise: 4
};

export const moduleMinimumPlan = {
  dashboard: "free",
  crm: "starter",
  clients: "starter",
  billing: "starter",
  agenda: "starter",
  notifications: "free",
  finance: "business",
  marketing: "premium",
  social: "premium",
  ai: "premium",
  analytics: "premium",
  workflows: "premium",
  support: "business",
  projects: "business",
  hr: "business",
  documents: "business",
  integrations: "business",
  marketplace: "business",
  academy: "business",
  legal: "business",
  security: "business",
  "multi-company": "enterprise",
  franchises: "enterprise",
  "white-label": "enterprise",
  settings: "enterprise"
} as const satisfies Record<string, PlanCode>;

export function getRequiredPlanForModule(moduleKey: string): PlanCode {
  return moduleMinimumPlan[moduleKey as keyof typeof moduleMinimumPlan] ?? "enterprise";
}
