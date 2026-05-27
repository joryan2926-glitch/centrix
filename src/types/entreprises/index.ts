export type CompanyStatus = "active" | "pending" | "suspended";
export type FranchiseStatus = "active" | "onboarding" | "at_risk" | "paused";
export type EnterpriseRole = "super_admin" | "company_admin" | "manager" | "employee" | "viewer";
export type ModuleAccess = "crm" | "billing" | "finance" | "hr" | "agenda" | "marketing" | "support" | "documents" | "ai";

export type EnterpriseCompany = {
  id: string;
  name: string;
  siret: string;
  vatNumber: string;
  address: string;
  iban: string;
  logoUrl: string | null;
  industry: string;
  status: CompanyStatus;
  revenue: number;
  activeUsers: number;
  brandColor: string;
  workspaceSlug: string;
  createdAt: string;
  updatedAt: string;
};

export type CompanyWorkspace = {
  id: string;
  companyId: string;
  name: string;
  primaryColor: string;
  accentColor: string;
  logoUrl: string | null;
  modules: ModuleAccess[];
  preferences: {
    locale: "fr-FR" | "en-US";
    currency: "EUR" | "USD" | "GBP";
    timezone: string;
  };
  isolatedData: boolean;
  updatedAt: string;
};

export type FranchiseUnit = {
  id: string;
  companyId: string;
  name: string;
  franchiseeName: string;
  zone: string;
  city: string;
  status: FranchiseStatus;
  monthlyRevenue: number;
  targetRevenue: number;
  satisfaction: number;
  openedAt: string;
};

export type EnterpriseUser = {
  id: string;
  companyId: string | null;
  name: string;
  email: string;
  role: EnterpriseRole;
  team: string;
  active: boolean;
  modules: ModuleAccess[];
  lastSeenAt: string;
};

export type EnterpriseTeam = {
  id: string;
  companyId: string;
  name: string;
  members: number;
  modules: ModuleAccess[];
};

export type PermissionPolicy = {
  id: string;
  role: EnterpriseRole;
  label: string;
  modules: ModuleAccess[];
  canManageBilling: boolean;
  canManageUsers: boolean;
  canViewConsolidatedReports: boolean;
};

export type EnterpriseActivity = {
  id: string;
  companyId: string | null;
  title: string;
  detail: string;
  severity: "info" | "success" | "warning";
  createdAt: string;
};

export type ConsolidatedMetric = {
  month: string;
  revenue: number;
  expenses: number;
  users: number;
  franchises: number;
};

export type MultiEnterpriseData = {
  companies: EnterpriseCompany[];
  workspaces: CompanyWorkspace[];
  franchises: FranchiseUnit[];
  users: EnterpriseUser[];
  teams: EnterpriseTeam[];
  policies: PermissionPolicy[];
  activities: EnterpriseActivity[];
  metrics: ConsolidatedMetric[];
};
