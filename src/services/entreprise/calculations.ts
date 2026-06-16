import type { AdvisorySession, Company, CompanyDevelopmentPlan, CompanyStep, EnterpriseLegalData, LegalDocument, LegalForm, LegalNotification } from "@/types/entreprise";

export const companyStatusLabels: Record<Company["status"], string> = {
  draft: "Brouillon",
  in_review: "En revue",
  submitted: "Depose",
  registered: "Immatricule"
};

export const stepStatusLabels: Record<CompanyStep["status"], string> = {
  todo: "A faire",
  in_progress: "En cours",
  done: "Termine",
  blocked: "Bloque"
};

export const documentTypeLabels: Record<LegalDocument["type"], string> = {
  statuts: "Statuts",
  pv: "Proces verbal",
  capital_certificate: "Attestation depot capital",
  beneficiaries: "Beneficiaires effectifs",
  headquarters: "Declaration siege social",
  contract: "Contrat"
};

export const developmentAreaLabels: Record<CompanyDevelopmentPlan["area"], string> = {
  product: "Produit",
  sales: "Commercial",
  finance: "Finance",
  operations: "Operations",
  legal: "Juridique"
};

export const advisoryStatusLabels: Record<AdvisorySession["status"], string> = {
  requested: "Demande",
  scheduled: "Planifie",
  completed: "Realise"
};

export function getEnterpriseDashboard(data: EnterpriseLegalData) {
  const activeDossiers = data.companies.filter((company) => company.status !== "registered").length;
  const generatedDocuments = data.legalDocuments.filter((document) => document.status === "generated" || document.status === "signed").length;
  const announcements = data.legalAnnouncements.length;
  const capitalDeposited = data.capitalDeposits.reduce((sum, deposit) => sum + deposit.amount, 0);
  const finalizedSteps = data.companySteps.filter((step) => step.status === "done").length;
  const activeDevelopmentPlans = data.developmentPlans.filter((plan) => plan.status !== "done").length;
  const advisorySessions = data.advisorySessions.filter((session) => session.status !== "completed").length;
  const averageProgress = data.companies.length
    ? Math.round(data.companies.reduce((sum, company) => sum + company.progress, 0) / data.companies.length)
    : 0;

  return {
    companiesCreated: data.companies.filter((company) => company.status === "registered").length,
    activeDossiers,
    generatedDocuments,
    announcements,
    capitalDeposited,
    finalizedSteps,
    activeDevelopmentPlans,
    advisorySessions,
    averageProgress
  };
}

export function estimateAnnouncementPrice(company: Company | null, form: LegalForm | null) {
  if (!company || !form) return 0;
  const base = form.complexity === "advanced" ? 220 : form.complexity === "standard" ? 185 : 120;
  const capitalFactor = Math.min(80, Math.round(company.capitalAmount / 1000) * 3);
  return base + capitalFactor;
}

export function estimateMonthlyCharges(form: LegalForm | null, monthlyRevenue: number) {
  if (!form) return 0;
  const rate = form.code === "MICRO" ? 0.22 : form.socialRegime === "TNS" ? 0.42 : form.code === "ASSOCIATION" ? 0.18 : 0.62;
  return Math.round(monthlyRevenue * rate);
}

export function createLegalDocument(companyId: string, type: LegalDocument["type"]): LegalDocument {
  const now = new Date().toISOString();
  return {
    id: `doc-${crypto.randomUUID()}`,
    companyId,
    type,
    title: documentTypeLabels[type],
    status: "generated",
    url: null,
    generatedAt: now,
    updatedAt: now
  };
}

export function createLegalNotification(companyId: string, title: string, detail: string, severity: LegalNotification["severity"] = "info"): LegalNotification {
  return {
    id: `legal-notif-${crypto.randomUUID()}`,
    companyId,
    title,
    detail,
    severity,
    createdAt: new Date().toISOString()
  };
}

export function createDevelopmentPlan(companyId: string, title = "Plan developpement"): CompanyDevelopmentPlan {
  const now = new Date().toISOString();
  return {
    id: `dev-plan-${crypto.randomUUID()}`,
    companyId,
    title,
    area: "operations",
    objective: "Transformer les prochaines actions en jalons mesurables pour accelerer le lancement.",
    owner: "Equipe CENTRIX",
    progress: 10,
    priority: "medium",
    dueAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: "planned",
    createdAt: now,
    updatedAt: now
  };
}

export function createAdvisorySession(companyId: string, topic = "Conseil strategique"): AdvisorySession {
  const now = new Date().toISOString();
  return {
    id: `advice-${crypto.randomUUID()}`,
    companyId,
    expertName: "Expert CENTRIX",
    topic,
    recommendation: "Analyser le dossier, prioriser les risques et transformer les recommandations en actions suivies.",
    status: "requested",
    scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: now
  };
}

export function legalStatusTone(status: CompanyStep["status"] | Company["status"] | LegalDocument["status"] | CompanyDevelopmentPlan["status"] | AdvisorySession["status"]) {
  if (status === "done" || status === "registered" || status === "signed" || status === "generated" || status === "completed") return "emerald" as const;
  if (status === "blocked") return "rose" as const;
  if (status === "in_progress" || status === "in_review" || status === "submitted" || status === "scheduled") return "cyan" as const;
  return "violet" as const;
}
