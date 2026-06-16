export type LegalFormCode = "SASU" | "SAS" | "EURL" | "SARL" | "EI" | "MICRO" | "SCI" | "ASSOCIATION";

export type LegalForm = {
  id: string;
  code: LegalFormCode;
  name: string;
  description: string;
  liability: string;
  socialRegime: string;
  taxRegime: string;
  minCapital: number;
  bestFor: string[];
  complexity: "simple" | "standard" | "advanced";
};

export type Company = {
  id: string;
  name: string;
  legalFormId: string;
  status: "draft" | "in_review" | "submitted" | "registered";
  activity: string;
  city: string;
  capitalAmount: number;
  capitalDeposited: number;
  progress: number;
  siren: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Shareholder = {
  id: string;
  companyId: string;
  name: string;
  role: "founder" | "president" | "manager" | "partner" | "beneficiary";
  shares: number;
  contribution: number;
  email: string;
};

export type CompanyStep = {
  id: string;
  companyId: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done" | "blocked";
  dueAt: string;
  order: number;
};

export type LegalDocument = {
  id: string;
  companyId: string;
  type: "statuts" | "pv" | "capital_certificate" | "beneficiaries" | "headquarters" | "contract";
  title: string;
  status: "draft" | "generated" | "signed" | "archived";
  url: string | null;
  generatedAt: string | null;
  updatedAt: string;
};

export type LegalAnnouncement = {
  id: string;
  companyId: string;
  title: string;
  journal: string;
  department: string;
  price: number;
  status: "draft" | "validated" | "published";
  content: string;
  publishedAt: string | null;
};

export type CapitalDeposit = {
  id: string;
  companyId: string;
  bankName: string;
  iban: string;
  amount: number;
  status: "pending" | "documents_sent" | "deposited" | "certificate_received";
  certificateUrl: string | null;
  createdAt: string;
};

export type CompanySettings = {
  companyId: string;
  legalAddress: string;
  accountingCurrency: "EUR" | "USD" | "GBP";
  fiscalYearEnd: string;
  vatRegime: "franchise" | "real_simplified" | "real_normal";
  logoUrl: string | null;
};

export type LegalNotification = {
  id: string;
  companyId: string;
  title: string;
  detail: string;
  severity: "info" | "success" | "warning";
  createdAt: string;
};

export type CompanyDevelopmentPlan = {
  id: string;
  companyId: string;
  title: string;
  area: "product" | "sales" | "finance" | "operations" | "legal";
  objective: string;
  owner: string;
  progress: number;
  priority: "low" | "medium" | "high" | "critical";
  dueAt: string;
  status: "planned" | "in_progress" | "done" | "blocked";
  createdAt: string;
  updatedAt: string;
};

export type AdvisorySession = {
  id: string;
  companyId: string;
  expertName: string;
  topic: string;
  recommendation: string;
  status: "requested" | "scheduled" | "completed";
  scheduledAt: string;
  createdAt: string;
};

export type EnterpriseLegalData = {
  companies: Company[];
  legalForms: LegalForm[];
  legalDocuments: LegalDocument[];
  legalAnnouncements: LegalAnnouncement[];
  shareholders: Shareholder[];
  companySteps: CompanyStep[];
  companySettings: CompanySettings[];
  capitalDeposits: CapitalDeposit[];
  legalNotifications: LegalNotification[];
  developmentPlans: CompanyDevelopmentPlan[];
  advisorySessions: AdvisorySession[];
};
