"use client";

import dynamic from "next/dynamic";
import { BarChart3, Building2, CheckCircle2, Globe2, KeyRound, Landmark, Network, Plus, Save, Search, Settings2, ShieldCheck, Store, UsersRound, WalletCards } from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { formatEnterpriseCurrency, formatEnterpriseDate, formatEnterpriseNumber } from "@/lib/entreprises/format";
import { companyStatusLabels, createEnterpriseActivity, createEnterpriseCompany, franchisePerformance, franchiseStatusLabels, getMultiEnterpriseDashboard, statusTone } from "@/services/entreprises/calculations";
import { useMultiEnterpriseData } from "@/hooks/entreprises/useMultiEnterpriseData";
import type { CompanyWorkspace, EnterpriseCompany, EnterpriseRole } from "@/types/entreprises";
import { EnterpriseKpiCard } from "@/ui/entreprises/EnterpriseKpiCard";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { EmptyState } from "@/ui/EmptyState";
import { Modal } from "@/ui/Modal";
import { Skeleton } from "@/ui/Skeleton";
import { Toast } from "@/ui/Toast";

const EnterpriseCharts = dynamic(() => import("@/components/entreprises/EnterpriseCharts").then((module) => module.EnterpriseCharts), {
  loading: () => <Skeleton className="h-80" />,
  ssr: false
});

const views = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "companies", label: "Societes", icon: Building2 },
  { id: "workspaces", label: "Workspaces", icon: Globe2 },
  { id: "franchises", label: "Franchises", icon: Network },
  { id: "users", label: "Utilisateurs", icon: UsersRound },
  { id: "permissions", label: "Permissions", icon: KeyRound }
] as const;

type View = (typeof views)[number]["id"];

type CompanyDraft = Pick<EnterpriseCompany, "name" | "siret" | "vatNumber" | "address" | "iban" | "industry">;

const roleLabels: Record<EnterpriseRole, string> = {
  super_admin: "Administrateur CENTRIX",
  company_admin: "Responsable d'entreprise",
  manager: "Responsable d'equipe",
  employee: "Collaborateur",
  viewer: "Lecture seule"
};

export function MultiEnterpriseWorkspace({ initialView = "dashboard" }: { initialView?: View }) {
  const { data, loading, mode, toast, mutate, sync } = useMultiEnterpriseData();
  const [view, setView] = useState<View>(initialView);
  const [query, setQuery] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState(data.companies[0]?.id ?? "");
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<CompanyDraft>({
    name: "Nouvelle filiale",
    siret: "000 000 000 00000",
    vatNumber: "FR00000000000",
    address: "Adresse siege social",
    iban: "FR76 XXXX XXXX XXXX",
    industry: "Services"
  });

  const dashboard = useMemo(() => getMultiEnterpriseDashboard(data), [data]);
  const selectedCompany = data.companies.find((company) => company.id === selectedCompanyId) ?? data.companies[0] ?? null;
  const selectedWorkspace = data.workspaces.find((workspace) => workspace.companyId === selectedCompany?.id) ?? null;
  const companyFranchises = data.franchises.filter((franchise) => franchise.companyId === selectedCompany?.id);
  const companyUsers = data.users.filter((user) => user.companyId === selectedCompany?.id || user.companyId === null);
  const filteredCompanies = data.companies.filter((company) => company.name.toLowerCase().includes(query.toLowerCase()) || company.siret.includes(query));

  function createCompany(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const company = createEnterpriseCompany(draft);
    const workspace: CompanyWorkspace = {
      id: `ws-${crypto.randomUUID()}`,
      companyId: company.id,
      name: `${company.name} Workspace`,
      primaryColor: company.brandColor,
      accentColor: "#8b5cf6",
      logoUrl: null,
      modules: ["crm", "billing", "support", "documents"],
      preferences: { locale: "fr-FR" as const, currency: "EUR" as const, timezone: "Europe/Paris" },
      isolatedData: true,
      updatedAt: new Date().toISOString()
    };

    mutate(
      (current) => ({
        ...current,
        companies: [company, ...current.companies],
        workspaces: [workspace, ...current.workspaces],
        activities: [createEnterpriseActivity(company.id, "Entreprise creee", `${company.name} dispose d'un workspace isole.`, "success"), ...current.activities]
      }),
      { title: "Entreprise creee", detail: `${company.name} est ajoutee au portefeuille.` }
    );
    setSelectedCompanyId(company.id);
    setModalOpen(false);
    setView("companies");
  }

  function quickSwitch(companyId: string) {
    setSelectedCompanyId(companyId);
    mutate((current) => ({
      ...current,
      activities: [createEnterpriseActivity(companyId, "Workspace actif", "Changement rapide d'entreprise effectue.", "info"), ...current.activities]
    }));
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
        <Skeleton className="h-36" />
        <section className="grid gap-4 md:grid-cols-4">{[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-28" />)}</section>
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
            <Badge tone="violet">Enterprise network OS</Badge>
            <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Multi-Entreprises & Franchises</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              Pilotez societes, filiales, franchises, workspaces isoles, utilisateurs, permissions et revenus consolides dans une console enterprise unique.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setModalOpen(true)}><Plus size={17} /> Nouvelle entreprise</Button>
            <Button onClick={sync} variant="primary"><Save size={17} /> Sync {mode}</Button>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <EnterpriseKpiCard delta="portefeuille" icon={<Building2 size={19} />} label="Entreprises" value={String(dashboard.companies)} />
        <EnterpriseKpiCard delta="global" icon={<WalletCards size={19} />} label="CA global" tone="emerald" value={formatEnterpriseCurrency(dashboard.globalRevenue)} />
        <EnterpriseKpiCard delta="actifs" icon={<UsersRound size={19} />} label="Utilisateurs" value={String(dashboard.activeUsers)} />
        <EnterpriseKpiCard delta="reseau" icon={<Store size={19} />} label="Franchises actives" tone="violet" value={String(dashboard.activeFranchises)} />
        <EnterpriseKpiCard delta="moyenne" icon={<CheckCircle2 size={19} />} label="Performance filiales" tone="emerald" value={`${dashboard.subsidiaryPerformance}%`} />
        <EnterpriseKpiCard delta="consolide" icon={<Landmark size={19} />} label="Revenus consolides" value={formatEnterpriseCurrency(dashboard.consolidatedRevenue)} />
      </section>

      <div className="flex gap-2 overflow-x-auto rounded-[8px] border border-white/10 bg-white/[0.045] p-1">
        {views.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.id} className={`flex h-10 shrink-0 items-center gap-2 rounded-[8px] px-3 text-sm transition-all duration-200 ${view === item.id ? "bg-white/12 text-white" : "text-slate-400 hover:bg-white/8 hover:text-white"}`} onClick={() => setView(item.id)}>
              <Icon size={16} /> {item.label}
            </button>
          );
        })}
      </div>

      <section className="grid gap-4 xl:grid-cols-[320px_1fr]">
        <Card className="p-4">
          <div className="flex h-10 items-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-sm text-slate-400">
            <Search size={16} />
            <input className="w-full bg-transparent outline-none placeholder:text-slate-500" placeholder="Rechercher entreprise" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <div className="mt-4 space-y-2">
            {filteredCompanies.map((company) => (
              <button key={company.id} className={`w-full rounded-[8px] border p-3 text-left transition-all duration-200 ${selectedCompany?.id === company.id ? "border-cyan-200/35 bg-cyan-300/10" : "border-white/10 bg-white/[0.035] hover:bg-white/[0.07]"}`} onClick={() => quickSwitch(company.id)}>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: company.brandColor }} />
                    <span className="truncate text-sm font-medium text-white">{company.name}</span>
                  </span>
                  <Badge tone={statusTone(company.status)}>{companyStatusLabels[company.status]}</Badge>
                </div>
                <p className="mt-2 text-xs text-slate-500">{company.siret} - {company.industry}</p>
              </button>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          {view === "dashboard" ? (
            <>
              <EnterpriseCharts metrics={data.metrics} />
              <Card className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-white">Activite recente</h2>
                  <Badge tone="cyan">Realtime</Badge>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {data.activities.slice(0, 6).map((activity) => (
                    <div key={activity.id} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4">
                      <Badge tone={activity.severity === "warning" ? "rose" : activity.severity === "success" ? "emerald" : "cyan"}>{activity.severity}</Badge>
                      <p className="mt-3 font-medium text-white">{activity.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{activity.detail}</p>
                      <p className="mt-3 text-xs text-slate-500">{formatEnterpriseDate(activity.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          ) : null}

          {view === "companies" ? (
            <Card className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div><p className="text-sm text-slate-400">Profil entreprise</p><h2 className="text-lg font-semibold text-white">{selectedCompany?.name}</h2></div>
                {selectedCompany ? <Badge tone={statusTone(selectedCompany.status)}>{companyStatusLabels[selectedCompany.status]}</Badge> : null}
              </div>
              {selectedCompany ? (
                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <Metric label="SIRET" value={selectedCompany.siret} />
                  <Metric label="TVA" value={selectedCompany.vatNumber} />
                  <Metric label="IBAN" value={selectedCompany.iban} />
                  <Metric label="Adresse" value={selectedCompany.address} />
                  <Metric label="CA" value={formatEnterpriseCurrency(selectedCompany.revenue)} />
                  <Metric label="Utilisateurs actifs" value={formatEnterpriseNumber(selectedCompany.activeUsers)} />
                </div>
              ) : <EmptyState icon={<Building2 size={20} />} title="Aucune entreprise" detail="Creez votre premiere societe." />}
            </Card>
          ) : null}

          {view === "workspaces" ? (
            <Card className="p-5">
              <div className="flex items-center gap-2"><Settings2 size={18} className="text-cyan-100" /><h2 className="text-lg font-semibold text-white">Workspace entreprise</h2></div>
              {selectedWorkspace ? (
                <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_300px]">
                  <div className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-sm text-slate-400">Branding</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{selectedWorkspace.name}</p>
                    <div className="mt-4 flex gap-3">
                      <span className="h-12 w-12 rounded-[8px]" style={{ backgroundColor: selectedWorkspace.primaryColor }} />
                      <span className="h-12 w-12 rounded-[8px]" style={{ backgroundColor: selectedWorkspace.accentColor }} />
                    </div>
                    <p className="mt-4 text-sm text-slate-400">Isolation donnees: {selectedWorkspace.isolatedData ? "active" : "partagee"}</p>
                  </div>
                  <div className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-sm font-semibold text-white">Modules actifs</p>
                    <div className="mt-3 flex flex-wrap gap-2">{selectedWorkspace.modules.map((module) => <Badge key={module} tone="cyan">{module}</Badge>)}</div>
                  </div>
                </div>
              ) : <EmptyState icon={<Globe2 size={20} />} title="Workspace manquant" detail="Selectionnez une entreprise configuree." />}
            </Card>
          ) : null}

          {view === "franchises" ? (
            <Card className="p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-white">Reseau franchises</h2>
                <Badge tone="violet">{companyFranchises.length} unites</Badge>
              </div>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.16em] text-slate-500"><tr><th className="pb-3">Franchise</th><th className="pb-3">Zone</th><th className="pb-3">CA mensuel</th><th className="pb-3">Performance</th><th className="pb-3">Statut</th></tr></thead>
                  <tbody className="divide-y divide-white/10">
                    {companyFranchises.map((franchise) => (
                      <tr key={franchise.id}>
                        <td className="py-3 text-white">{franchise.name}<p className="text-xs text-slate-500">{franchise.franchiseeName}</p></td>
                        <td className="py-3 text-slate-400">{franchise.zone}</td>
                        <td className="py-3 text-slate-300">{formatEnterpriseCurrency(franchise.monthlyRevenue)}</td>
                        <td className="py-3 text-slate-300">{franchisePerformance(franchise)}%</td>
                        <td className="py-3"><Badge tone={statusTone(franchise.status)}>{franchiseStatusLabels[franchise.status]}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : null}

          {view === "users" ? (
            <Card className="p-5">
              <div className="flex items-center gap-2"><UsersRound size={18} className="text-cyan-100" /><h2 className="text-lg font-semibold text-white">Utilisateurs & equipes</h2></div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {companyUsers.map((user) => (
                  <div key={user.id} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-white">{user.name}</p>
                      <span className={`h-2.5 w-2.5 rounded-full ${user.active ? "bg-emerald-300" : "bg-slate-500"}`} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{user.email}</p>
                    <p className="mt-3 text-sm text-slate-300">{roleLabels[user.role]}</p>
                    <div className="mt-3 flex flex-wrap gap-2">{user.modules.slice(0, 4).map((module) => <Badge key={module} tone="cyan">{module}</Badge>)}</div>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}

          {view === "permissions" ? (
            <Card className="p-5">
              <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-cyan-100" /><h2 className="text-lg font-semibold text-white">Roles & permissions avancees</h2></div>
              <div className="mt-5 grid gap-3 lg:grid-cols-2">
                {data.policies.map((policy) => (
                  <div key={policy.id} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4">
                    <p className="font-semibold text-white">{policy.label}</p>
                    <div className="mt-3 flex flex-wrap gap-2">{policy.modules.map((module) => <Badge key={module} tone="violet">{module}</Badge>)}</div>
                    <div className="mt-4 grid gap-2 text-xs text-slate-400">
                      <span>Gestion utilisateurs: {policy.canManageUsers ? "oui" : "non"}</span>
                      <span>Billing: {policy.canManageBilling ? "oui" : "non"}</span>
                      <span>Reporting consolide: {policy.canViewConsolidatedReports ? "oui" : "non"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}
        </div>
      </section>

      <Modal open={modalOpen} title="Creer une entreprise" onClose={() => setModalOpen(false)}>
        <form className="space-y-3" onSubmit={createCompany}>
          <input className="h-11 w-full rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-sm text-white outline-none" value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} />
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="h-11 rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-sm text-white outline-none" value={draft.siret} onChange={(event) => setDraft((current) => ({ ...current, siret: event.target.value }))} />
            <input className="h-11 rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-sm text-white outline-none" value={draft.vatNumber} onChange={(event) => setDraft((current) => ({ ...current, vatNumber: event.target.value }))} />
          </div>
          <input className="h-11 w-full rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-sm text-white outline-none" value={draft.address} onChange={(event) => setDraft((current) => ({ ...current, address: event.target.value }))} />
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="h-11 rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-sm text-white outline-none" value={draft.iban} onChange={(event) => setDraft((current) => ({ ...current, iban: event.target.value }))} />
            <input className="h-11 rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-sm text-white outline-none" value={draft.industry} onChange={(event) => setDraft((current) => ({ ...current, industry: event.target.value }))} />
          </div>
          <Button className="w-full" type="submit" variant="primary">Creer workspace</Button>
        </form>
      </Modal>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 truncate text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
