import type { Company, CompanyStep, EnterpriseLegalData, LegalDocument, LegalForm, LegalNotification } from "@/types/entreprise";

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

export function getEnterpriseDashboard(data: EnterpriseLegalData) {
  const activeDossiers = data.companies.filter((company) => company.status !== "registered").length;
  const generatedDocuments = data.legalDocuments.filter((document) => document.status === "generated" || document.status === "signed").length;
  const announcements = data.legalAnnouncements.length;
  const capitalDeposited = data.capitalDeposits.reduce((sum, deposit) => sum + deposit.amount, 0);
  const finalizedSteps = data.companySteps.filter((step) => step.status === "done").length;
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

export function legalStatusTone(status: CompanyStep["status"] | Company["status"] | LegalDocument["status"]) {
  if (status === "done" || status === "registered" || status === "signed" || status === "generated") return "emerald" as const;
  if (status === "blocked") return "rose" as const;
  if (status === "in_progress" || status === "in_review" || status === "submitted") return "cyan" as const;
  return "violet" as const;
}
