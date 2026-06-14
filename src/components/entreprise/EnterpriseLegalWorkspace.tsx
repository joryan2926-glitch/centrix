"use client";

import { Banknote, BookOpenCheck, BriefcaseBusiness, Building2, CheckCircle2, ClipboardCheck, Download, FileSignature, FileText, Landmark, Library, Plus, Save, Search, ShieldCheck, Sparkles, Upload } from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { formatLegalCurrency, formatLegalDate } from "@/lib/entreprise/format";
import { downloadJsonFile } from "@/lib/download";
import {
  companyStatusLabels,
  createLegalDocument,
  createLegalNotification,
  documentTypeLabels,
  estimateAnnouncementPrice,
  estimateMonthlyCharges,
  getEnterpriseDashboard,
  legalStatusTone,
  stepStatusLabels
} from "@/services/entreprise/calculations";
import { useEnterpriseLegalData } from "@/hooks/entreprise/useEnterpriseLegalData";
import type { Company, LegalDocument } from "@/types/entreprise";
import { LegalKpiCard } from "@/ui/entreprise/LegalKpiCard";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { EmptyState } from "@/ui/EmptyState";
import { Skeleton } from "@/ui/Skeleton";
import { Toast } from "@/ui/Toast";

const views = [
  { id: "dashboard", label: "Dashboard", icon: Building2 },
  { id: "creation", label: "Creation", icon: Sparkles },
  { id: "dossier", label: "Dossier", icon: ClipboardCheck },
  { id: "annonces", label: "Annonces", icon: FileSignature },
  { id: "capital", label: "Capital", icon: Landmark },
  { id: "documents", label: "Documents", icon: Library },
  { id: "aide", label: "Aide", icon: BookOpenCheck }
] as const;

type View = (typeof views)[number]["id"];

type CompanyDraft = {
  name: string;
  legalFormId: string;
  activity: string;
  city: string;
  capitalAmount: number;
};

export function EnterpriseLegalWorkspace() {
  const { data, loading, mode, toast, mutate, sync } = useEnterpriseLegalData();
  const [view, setView] = useState<View>("dashboard");
  const [selectedCompanyId, setSelectedCompanyId] = useState(data.companies[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [monthlyRevenue, setMonthlyRevenue] = useState(8500);
  const [draft, setDraft] = useState<CompanyDraft>({
    name: "Nouvelle societe",
    legalFormId: "form-sasu",
    activity: "Conseil et edition de logiciels",
    city: "Paris",
    capitalAmount: 5000
  });

  const dashboard = useMemo(() => getEnterpriseDashboard(data), [data]);
  const selectedCompany = data.companies.find((company) => company.id === selectedCompanyId) ?? data.companies[0] ?? null;
  const selectedForm = data.legalForms.find((form) => form.id === (selectedCompany?.legalFormId ?? draft.legalFormId)) ?? null;
  const filteredCompanies = data.companies.filter((company) => company.name.toLowerCase().includes(query.toLowerCase()));
  const steps = data.companySteps.filter((step) => step.companyId === selectedCompany?.id).sort((a, b) => a.order - b.order);
  const documents = data.legalDocuments.filter((document) => document.companyId === selectedCompany?.id);
  const announcement = data.legalAnnouncements.find((item) => item.companyId === selectedCompany?.id) ?? null;
  const deposit = data.capitalDeposits.find((item) => item.companyId === selectedCompany?.id) ?? null;
  const shareholders = data.shareholders.filter((item) => item.companyId === selectedCompany?.id);
  const notifications = data.legalNotifications.filter((item) => item.companyId === selectedCompany?.id);
  const announcementPrice = estimateAnnouncementPrice(selectedCompany, selectedForm);

  function createCompany(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const now = new Date().toISOString();
    const company: Company = {
      id: `company-${crypto.randomUUID()}`,
      name: draft.name,
      legalFormId: draft.legalFormId,
      status: "draft",
      activity: draft.activity,
      city: draft.city,
      capitalAmount: draft.capitalAmount,
      capitalDeposited: 0,
      progress: 18,
      siren: null,
      createdAt: now,
      updatedAt: now
    };

    mutate(
      (current) => ({
        ...current,
        companies: [company, ...current.companies],
        companySteps: [
          { id: `step-${crypto.randomUUID()}`, companyId: company.id, title: "Identite entreprise", description: "Renseigner les informations legales de base.", status: "in_progress", dueAt: now, order: 1 },
          { id: `step-${crypto.randomUUID()}`, companyId: company.id, title: "Associes et dirigeants", description: "Ajouter les roles, apports et beneficiaires.", status: "todo", dueAt: now, order: 2 },
          { id: `step-${crypto.randomUUID()}`, companyId: company.id, title: "Documents juridiques", description: "Generer les statuts et pieces du dossier.", status: "todo", dueAt: now, order: 3 },
          ...current.companySteps
        ],
        companySettings: [
          { companyId: company.id, legalAddress: "", accountingCurrency: "EUR", fiscalYearEnd: "12-31", vatRegime: "franchise", logoUrl: null },
          ...current.companySettings
        ],
        legalNotifications: [createLegalNotification(company.id, "Dossier cree", "Le workflow de creation est initialise.", "success"), ...current.legalNotifications]
      }),
      { title: "Entreprise creee", detail: `${company.name} est ajoutee au tableau de bord.` }
    );
    setSelectedCompanyId(company.id);
    setView("dossier");
  }

  function toggleStep(stepId: string) {
    mutate(
      (current) => ({
        ...current,
        companySteps: current.companySteps.map((step) => (step.id === stepId ? { ...step, status: step.status === "done" ? "in_progress" : "done" } : step)),
        companies: current.companies.map((company) =>
          company.id === selectedCompany?.id
            ? {
                ...company,
                progress: Math.min(100, Math.round((current.companySteps.filter((step) => step.companyId === company.id && (step.id === stepId ? step.status !== "done" : step.status === "done")).length / Math.max(1, current.companySteps.filter((step) => step.companyId === company.id).length)) * 100)),
                updatedAt: new Date().toISOString()
              }
            : company
        )
      }),
      { title: "Checklist mise a jour", detail: "La progression du dossier a ete recalculée." }
    );
  }

  function generateDocument(type: LegalDocument["type"]) {
    if (!selectedCompany) return;
    const document = createLegalDocument(selectedCompany.id, type);
    mutate(
      (current) => ({
        ...current,
        legalDocuments: [document, ...current.legalDocuments],
        legalNotifications: [createLegalNotification(selectedCompany.id, "Document genere", `${document.title} est pret pour relecture.`, "success"), ...current.legalNotifications]
      }),
      { title: "Document genere", detail: document.title }
    );
  }

  function uploadDocument(document: LegalDocument) {
    const input = window.document.createElement("input");
    input.accept = ".pdf,.doc,.docx,.png,.jpg,.jpeg";
    input.type = "file";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => mutate(
        (current) => ({
          ...current,
          legalDocuments: current.legalDocuments.map((item) => item.id === document.id ? { ...item, status: "generated", updatedAt: new Date().toISOString(), url: String(reader.result) } : item)
        }),
        { title: "Document importe", detail: `${file.name} est rattache au dossier juridique.` }
      );
      reader.readAsDataURL(file);
    };
    input.click();
  }

  function publishAnnouncement() {
    if (!selectedCompany) return;
    mutate(
      (current) => ({
        ...current,
        legalAnnouncements: current.legalAnnouncements.map((item) =>
          item.companyId === selectedCompany.id ? { ...item, status: "published", price: announcementPrice, publishedAt: new Date().toISOString() } : item
        ),
        legalNotifications: [createLegalNotification(selectedCompany.id, "Annonce publiee", "L'annonce legale est marquee comme publiee.", "success"), ...current.legalNotifications]
      }),
      { title: "Annonce publiee", detail: "Le dossier de formalites peut continuer." }
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
        <Skeleton className="h-36" />
        <section className="grid gap-4 md:grid-cols-4">
          {[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-28" />)}
        </section>
        <Skeleton className="h-[560px]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      {toast ? <Toast {...toast} /> : null}

      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Badge tone="violet">LegalTech OS</Badge>
            <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Creation entreprise & juridique</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              Assistant de creation, dossier juridique, annonces legales, depot de capital, documents et suivi multi-societes dans une experience SaaS premium.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setView("creation")}><Plus size={17} /> Nouveau dossier</Button>
            <Button onClick={sync} variant="primary"><Save size={17} /> Sync {mode}</Button>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <LegalKpiCard delta={`${dashboard.averageProgress}% avg`} icon={<Building2 size={19} />} label="Entreprises creees" value={String(dashboard.companiesCreated)} />
        <LegalKpiCard delta="actifs" icon={<BriefcaseBusiness size={19} />} label="Dossiers en cours" tone="violet" value={String(dashboard.activeDossiers)} />
        <LegalKpiCard delta="generes" icon={<FileText size={19} />} label="Documents" tone="emerald" value={String(dashboard.generatedDocuments)} />
        <LegalKpiCard delta="JAL" icon={<FileSignature size={19} />} label="Annonces legales" value={String(dashboard.announcements)} />
        <LegalKpiCard delta="capital" icon={<Banknote size={19} />} label="Capital depose" tone="emerald" value={formatLegalCurrency(dashboard.capitalDeposited)} />
        <LegalKpiCard delta="checklist" icon={<CheckCircle2 size={19} />} label="Etapes finalisees" tone="cyan" value={String(dashboard.finalizedSteps)} />
      </section>

      <div className="flex gap-2 overflow-x-auto rounded-[8px] border border-white/10 bg-white/[0.045] p-1">
        {views.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.id} className={`flex h-10 shrink-0 items-center gap-2 rounded-[8px] px-3 text-sm transition-all duration-200 ${view === item.id ? "bg-white/12 text-white" : "text-slate-400 hover:bg-white/8 hover:text-white"}`} onClick={() => setView(item.id)}>
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
      </div>

      <section className="grid gap-4 xl:grid-cols-[300px_1fr]">
        <Card className="p-4">
          <div className="flex h-10 items-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-sm text-slate-400">
            <Search size={16} />
            <input className="w-full bg-transparent outline-none placeholder:text-slate-500" placeholder="Rechercher societe" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <div className="mt-4 space-y-2">
            {filteredCompanies.map((company) => {
              const form = data.legalForms.find((item) => item.id === company.legalFormId);
              return (
                <button key={company.id} className={`w-full rounded-[8px] border p-3 text-left transition-all duration-200 ${selectedCompany?.id === company.id ? "border-cyan-200/35 bg-cyan-300/10" : "border-white/10 bg-white/[0.035] hover:bg-white/[0.07]"}`} onClick={() => setSelectedCompanyId(company.id)}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium text-white">{company.name}</p>
                    <Badge tone={legalStatusTone(company.status)}>{companyStatusLabels[company.status]}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{form?.code} - {company.city}</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-electric to-violet" style={{ width: `${company.progress}%` }} />
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {view === "dashboard" ? (
          <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
            <Card className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-400">Timeline creation</p>
                  <h2 className="text-lg font-semibold text-white">{selectedCompany?.name ?? "Aucun dossier"}</h2>
                </div>
                <Badge tone="cyan">{selectedCompany?.progress ?? 0}%</Badge>
              </div>
              <div className="mt-6 space-y-3">
                {steps.map((step) => (
                  <button key={step.id} className="flex w-full items-start gap-3 rounded-[8px] border border-white/10 bg-white/[0.04] p-3 text-left transition-all duration-200 hover:bg-white/[0.08]" onClick={() => toggleStep(step.id)}>
                    <span className={`mt-1 h-3 w-3 rounded-full ${step.status === "done" ? "bg-emerald-300" : step.status === "blocked" ? "bg-rose-300" : "bg-cyan-300"}`} />
                    <span className="flex-1">
                      <span className="block text-sm font-medium text-white">{step.title}</span>
                      <span className="mt-1 block text-xs leading-5 text-slate-400">{step.description}</span>
                    </span>
                    <Badge tone={legalStatusTone(step.status)}>{stepStatusLabels[step.status]}</Badge>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <p className="text-sm font-semibold text-white">Activite recente</p>
              <div className="mt-4 space-y-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className="rounded-[8px] border border-white/10 bg-white/[0.045] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-white">{notification.title}</p>
                      <Badge tone={notification.severity === "warning" ? "rose" : notification.severity === "success" ? "emerald" : "cyan"}>{notification.severity}</Badge>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-400">{notification.detail}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ) : null}

        {view === "creation" ? (
          <div className="space-y-4">
            <Card className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-400">Assistant creation</p>
                  <h2 className="text-lg font-semibold text-white">Choisir la bonne structure</h2>
                </div>
                <Badge tone="violet">IA future</Badge>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {data.legalForms.map((form) => (
                  <button key={form.id} className={`rounded-[8px] border p-4 text-left transition-all duration-200 ${draft.legalFormId === form.id ? "border-cyan-200/35 bg-cyan-300/10" : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"}`} onClick={() => setDraft((current) => ({ ...current, legalFormId: form.id }))}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-white">{form.code}</p>
                      <Badge tone={form.complexity === "simple" ? "emerald" : form.complexity === "advanced" ? "rose" : "cyan"}>{form.complexity}</Badge>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-400">{form.description}</p>
                    <p className="mt-3 text-xs text-slate-500">Capital min. {formatLegalCurrency(form.minCapital)}</p>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <form className="grid gap-4 lg:grid-cols-[1fr_320px]" onSubmit={createCompany}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-sm text-slate-300">Nom societe<input className="mt-2 h-11 w-full rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-white outline-none" value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} /></label>
                  <label className="text-sm text-slate-300">Ville<input className="mt-2 h-11 w-full rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-white outline-none" value={draft.city} onChange={(event) => setDraft((current) => ({ ...current, city: event.target.value }))} /></label>
                  <label className="text-sm text-slate-300 sm:col-span-2">Activite<input className="mt-2 h-11 w-full rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-white outline-none" value={draft.activity} onChange={(event) => setDraft((current) => ({ ...current, activity: event.target.value }))} /></label>
                  <label className="text-sm text-slate-300">Capital<input className="mt-2 h-11 w-full rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-white outline-none" min={0} type="number" value={draft.capitalAmount} onChange={(event) => setDraft((current) => ({ ...current, capitalAmount: Number(event.target.value) }))} /></label>
                  <label className="text-sm text-slate-300">CA mensuel simule<input className="mt-2 h-11 w-full rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-white outline-none" min={0} type="number" value={monthlyRevenue} onChange={(event) => setMonthlyRevenue(Number(event.target.value))} /></label>
                </div>
                <div className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-sm font-semibold text-white">Simulation indicative</p>
                  <p className="mt-4 text-xs text-slate-400">Forme retenue</p>
                  <p className="text-xl font-semibold text-white">{data.legalForms.find((form) => form.id === draft.legalFormId)?.code}</p>
                  <p className="mt-4 text-xs text-slate-400">Charges estimees</p>
                  <p className="text-xl font-semibold text-white">{formatLegalCurrency(estimateMonthlyCharges(data.legalForms.find((form) => form.id === draft.legalFormId) ?? null, monthlyRevenue))}</p>
                  <Button className="mt-5 w-full" type="submit" variant="primary"><Plus size={17} /> Creer dossier</Button>
                </div>
              </form>
            </Card>
          </div>
        ) : null}

        {view === "dossier" ? (
          <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
            <Card className="p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-white">Checklist administrative</h2>
                <Badge tone="cyan">{steps.filter((step) => step.status === "done").length}/{steps.length}</Badge>
              </div>
              <div className="mt-5 grid gap-3">
                {steps.map((step) => (
                  <button key={step.id} className="flex items-center gap-3 rounded-[8px] border border-white/10 bg-white/[0.04] p-4 text-left hover:bg-white/[0.08]" onClick={() => toggleStep(step.id)}>
                    <CheckCircle2 className={step.status === "done" ? "text-emerald-300" : "text-slate-500"} size={20} />
                    <span className="flex-1">
                      <span className="block text-sm font-medium text-white">{step.title}</span>
                      <span className="mt-1 block text-xs text-slate-500">Echeance {formatLegalDate(step.dueAt)}</span>
                    </span>
                    <Badge tone={legalStatusTone(step.status)}>{stepStatusLabels[step.status]}</Badge>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <p className="text-sm font-semibold text-white">Associes & dirigeants</p>
              <div className="mt-4 space-y-3">
                {shareholders.map((shareholder) => (
                  <div key={shareholder.id} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-3">
                    <p className="font-medium text-white">{shareholder.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{shareholder.role} - {formatLegalCurrency(shareholder.contribution)}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ) : null}

        {view === "annonces" ? (
          <Card className="p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm text-slate-400">Annonce legale</p>
                <h2 className="text-lg font-semibold text-white">{announcement?.title ?? "Aucune annonce"}</h2>
                <p className="mt-3 max-w-3xl rounded-[8px] border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-slate-300">{announcement?.content ?? "Selectionnez un dossier pour generer une annonce."}</p>
              </div>
              <div className="w-full rounded-[8px] border border-white/10 bg-white/[0.04] p-4 lg:w-72">
                <p className="text-sm text-slate-400">Prix estime</p>
                <p className="mt-1 text-3xl font-semibold text-white">{formatLegalCurrency(announcementPrice)}</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">Estimation indicative a valider selon departement, journal et tarif officiel applicable.</p>
                <Button className="mt-5 w-full" onClick={publishAnnouncement} variant="primary">Publier</Button>
              </div>
            </div>
          </Card>
        ) : null}

        {view === "capital" ? (
          <Card className="p-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <div>
                <p className="text-sm text-slate-400">Depot de capital</p>
                <h2 className="text-lg font-semibold text-white">{deposit?.bankName ?? "Banque a configurer"}</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <Metric label="Capital social" value={formatLegalCurrency(selectedCompany?.capitalAmount ?? 0)} />
                  <Metric label="Capital depose" value={formatLegalCurrency(deposit?.amount ?? 0)} />
                  <Metric label="IBAN" value={deposit?.iban ?? "A definir"} />
                </div>
              </div>
              <div className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4">
                <Badge tone={deposit?.status === "certificate_received" ? "emerald" : "cyan"}>{deposit?.status ?? "pending"}</Badge>
                <p className="mt-4 text-sm leading-6 text-slate-400">Workflow bancaire: collecte pieces, transmission banque, depot des fonds, attestation et rattachement au dossier juridique.</p>
              </div>
            </div>
          </Card>
        ) : null}

        {view === "documents" ? (
          <Card className="p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-400">Bibliotheque documents</p>
                <h2 className="text-lg font-semibold text-white">Generation, stockage et signature future</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => generateDocument("statuts")}><FileText size={17} /> Statuts</Button>
                <Button onClick={() => generateDocument("contract")}><FileSignature size={17} /> Contrat</Button>
              </div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {documents.length ? documents.map((document) => (
                <div key={document.id} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-white">{document.title}</p>
                    <Badge tone={legalStatusTone(document.status)}>{document.status}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{documentTypeLabels[document.type]} - {document.generatedAt ? formatLegalDate(document.generatedAt) : "Non genere"}</p>
                  <div className="mt-4 flex gap-2">
                    <Button className="h-9 px-3" onClick={() => downloadJsonFile(`centrix-juridique-${document.id}.json`, { company: selectedCompany, document })} variant="ghost"><Download size={15} /> Télécharger</Button>
                    <Button className="h-9 px-3" onClick={() => uploadDocument(document)} variant="ghost"><Upload size={15} /> Upload</Button>
                  </div>
                </div>
              )) : <EmptyState icon={<FileText size={20} />} title="Aucun document" detail="Generez les premiers documents du dossier." />}
            </div>
          </Card>
        ) : null}

        {view === "aide" ? (
          <div className="grid gap-4 xl:grid-cols-3">
            {[
              ["Choisir son statut", "Comparez responsabilite, fiscalite, regime social et gouvernance avant de lancer le dossier."],
              ["Checklist lancement", "Nom, siege, activite, associes, capital, documents, annonce legale puis depot formalites."],
              ["Centre aide", "FAQ entrepreneur, recommandations intelligentes et accompagnement futur par IA."],
              ["Multi-societes", "Centralisez societes, parametres legaux, dirigeants, capital et documents dans un seul espace."],
              ["Documents securises", "Preparez generation PDF, upload, partage et signature electronique future."],
              ["Conformite", "Gardez une piste d'audit claire pour chaque etape et chaque document."]
            ].map(([title, detail]) => (
              <Card key={title} interactive className="p-5">
                <ShieldCheck size={20} className="text-cyan-100" />
                <p className="mt-4 font-semibold text-white">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{detail}</p>
              </Card>
            ))}
          </div>
        ) : null}
      </section>

      <Card className="p-4">
        <p className="text-xs leading-5 text-slate-500">
          Les simulations et contenus juridiques de CENTRIX sont des aides operationnelles indicatives. Les decisions definitives doivent etre validees avec un professionnel habilite.
        </p>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-white/10 bg-white/[0.045] p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 truncate text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
