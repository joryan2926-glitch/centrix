import type { CompanyStatus, EnterpriseActivity, EnterpriseCompany, FranchiseStatus, MultiEnterpriseData } from "@/types/entreprises";

export const companyStatusLabels: Record<CompanyStatus, string> = {
  active: "Active",
  pending: "En attente",
  suspended: "Suspendue"
};

export const franchiseStatusLabels: Record<FranchiseStatus, string> = {
  active: "Active",
  onboarding: "Onboarding",
  at_risk: "A risque",
  paused: "En pause"
};

export function getMultiEnterpriseDashboard(data: MultiEnterpriseData) {
  const globalRevenue = data.companies.reduce((sum, company) => sum + company.revenue, 0);
  const activeUsers = data.users.filter((user) => user.active).length;
  const activeFranchises = data.franchises.filter((franchise) => franchise.status === "active").length;
  const consolidatedRevenue = data.metrics.at(-1)?.revenue ?? globalRevenue;
  const subsidiaryPerformance = data.franchises.length
    ? Math.round(data.franchises.reduce((sum, franchise) => sum + Math.min(130, (franchise.monthlyRevenue / Math.max(1, franchise.targetRevenue)) * 100), 0) / data.franchises.length)
    : 0;

  return {
    companies: data.companies.length,
    globalRevenue,
    activeUsers,
    activeFranchises,
    subsidiaryPerformance,
    consolidatedRevenue
  };
}

export function createEnterpriseCompany(input: Pick<EnterpriseCompany, "name" | "siret" | "vatNumber" | "address" | "iban" | "industry">): EnterpriseCompany {
  const now = new Date().toISOString();
  const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return {
    id: `ent-${crypto.randomUUID()}`,
    ...input,
    logoUrl: null,
    status: "pending",
    revenue: 0,
    activeUsers: 1,
    brandColor: "#5ee7ff",
    workspaceSlug: slug,
    createdAt: now,
    updatedAt: now
  };
}

export function createEnterpriseActivity(companyId: string | null, title: string, detail: string, severity: EnterpriseActivity["severity"] = "info"): EnterpriseActivity {
  return {
    id: `act-ent-${crypto.randomUUID()}`,
    companyId,
    title,
    detail,
    severity,
    createdAt: new Date().toISOString()
  };
}

export function statusTone(status: CompanyStatus | FranchiseStatus) {
  if (status === "active") return "emerald" as const;
  if (status === "at_risk" || status === "suspended") return "rose" as const;
  if (status === "pending" || status === "onboarding") return "violet" as const;
  return "cyan" as const;
}

export function franchisePerformance(franchise: { monthlyRevenue: number; targetRevenue: number }) {
  return Math.round((franchise.monthlyRevenue / Math.max(1, franchise.targetRevenue)) * 100);
}
