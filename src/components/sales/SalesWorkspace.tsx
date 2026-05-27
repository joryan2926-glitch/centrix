"use client";

import dynamic from "next/dynamic";
import { Bell, Bot, BriefcaseBusiness, CheckCircle2, CircleDollarSign, FileText, Mail, Plus, Save, Search, Target, TrendingUp, UsersRound, WalletCards } from "lucide-react";
import { useMemo, useState } from "react";
import { formatSalesCurrency, formatSalesDate } from "@/lib/sales/format";
import { createLead, getSalesDashboard, stageLabels } from "@/services/sales/calculations";
import { useSalesData } from "@/hooks/sales/useSalesData";
import { SalesKpiCard } from "@/ui/sales/SalesKpiCard";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Skeleton } from "@/ui/Skeleton";
import { Toast } from "@/ui/Toast";
import type { SalesLead, SalesStage } from "@/types/sales";

const SalesCharts = dynamic(() => import("@/components/sales/SalesCharts").then((module) => module.SalesCharts), { loading: () => <Skeleton className="h-80" />, ssr: false });

const views = ["dashboard", "pipeline", "leads", "opportunities", "quotes", "team", "automations", "notifications"] as const;
type View = (typeof views)[number];

export function SalesWorkspace({ initialView = "dashboard" }: { initialView?: View }) {
  const { data, loading, mode, toast, mutate, sync } = useSalesData();
  const [view, setView] = useState<View>(initialView);
  const [query, setQuery] = useState("");
  const dashboard = useMemo(() => getSalesDashboard(data), [data]);
  const filteredLeads = data.leads.filter((lead) => [lead.name, lead.company, lead.email, lead.sector].join(" ").toLowerCase().includes(query.toLowerCase()));

  function addLead() {
    const lead = createLead();
    mutate((current) => ({ ...current, leads: [lead, ...current.leads] }), { title: "Lead cree", detail: "Nouveau prospect ajoute au pipeline." });
  }

  function moveLead(leadId: string, stage: SalesStage) {
    mutate((current) => ({ ...current, leads: current.leads.map((lead) => lead.id === leadId ? { ...lead, stage } : lead), activities: [{ id: `act-${Date.now()}`, leadId, type: "task", title: `Statut passe a ${stageLabels[stage]}`, owner: "CENTRIX", createdAt: new Date().toISOString() }, ...current.activities] }));
  }

  if (loading) return <div className="mx-auto max-w-7xl space-y-6 animate-fade-in"><Skeleton className="h-36" /><Skeleton className="h-[560px]" /></div>;

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      {toast ? <Toast {...toast} /> : null}
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div><Badge tone="cyan">Sales Command Center</Badge><h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">Vente & Pipeline Commercial</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">Pipeline, opportunites, devis, objectifs commerciaux, activite equipe et analytics ventes dans une experience premium type Hubspot/Salesforce.</p></div>
          <div className="flex flex-wrap gap-2"><Button onClick={addLead}><Plus size={17} /> Lead</Button><Button onClick={sync} variant="primary"><Save size={17} /> Sync {mode}</Button></div>
        </div>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SalesKpiCard delta="ventes" icon={<CircleDollarSign size={19} />} label="Chiffre ventes" value={formatSalesCurrency(dashboard.revenue)} />
        <SalesKpiCard delta="actifs" icon={<UsersRound size={19} />} label="Prospects actifs" value={String(dashboard.activeLeads)} />
        <SalesKpiCard delta="conversion" icon={<TrendingUp size={19} />} label="Taux conversion" value={`${dashboard.conversionRate}%`} />
        <SalesKpiCard delta="closes" icon={<CheckCircle2 size={19} />} label="Ventes conclues" value={String(dashboard.closedSales)} />
        <SalesKpiCard delta="pipeline" icon={<BriefcaseBusiness size={19} />} label="Pipeline global" value={formatSalesCurrency(dashboard.pipelineValue)} />
        <SalesKpiCard delta="objectif" icon={<Target size={19} />} label="Objectifs commerciaux" value={`${dashboard.targetProgress}%`} />
        <SalesKpiCard delta="team" icon={<UsersRound size={19} />} label="Commerciaux actifs" value={String(dashboard.activeSellers)} />
        <SalesKpiCard delta="forecast" icon={<WalletCards size={19} />} label="Revenus mensuels" value={formatSalesCurrency(dashboard.monthlyRevenue)} />
      </section>

      <div className="flex gap-2 overflow-x-auto rounded-[14px] border border-slate-200 bg-white/70 p-1 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
        {views.map((item) => <button key={item} className={`h-10 shrink-0 rounded-[12px] px-3 text-sm font-semibold capitalize transition-all ${view === item ? "bg-blue-600 text-white shadow-[0_12px_28px_rgba(37,99,235,0.22)]" : "text-slate-500 hover:bg-blue-50 hover:text-blue-700"}`} onClick={() => setView(item)}>{item}</button>)}
      </div>

      {view === "dashboard" ? <><SalesCharts data={data} /><ActivityGrid data={data} /></> : null}
      {view === "pipeline" ? <PipelineView data={data} moveLead={moveLead} /> : null}
      {view === "leads" ? <LeadsView leads={filteredLeads} query={query} setQuery={setQuery} /> : null}
      {view === "opportunities" ? <OpportunitiesView data={data} /> : null}
      {view === "quotes" ? <QuotesView data={data} /> : null}
      {view === "team" ? <TeamView data={data} /> : null}
      {view === "automations" ? <AutomationView /> : null}
      {view === "notifications" ? <NotificationsView data={data} /> : null}
    </div>
  );
}

function PipelineView({ data, moveLead }: { data: ReturnType<typeof useSalesData>["data"]; moveLead: (leadId: string, stage: SalesStage) => void }) {
  return <section className="grid gap-3 xl:grid-cols-7">{data.pipeline.map((stage) => <Card key={stage.id} className="p-3"><h2 className="text-sm font-black text-slate-950">{stage.label}</h2><p className="mt-1 text-xs text-slate-400">{stage.probability}% proba.</p><div className="mt-4 space-y-3">{data.leads.filter((lead) => lead.stage === stage.id).map((lead) => <LeadCard key={lead.id} lead={lead} stages={data.pipeline.map((item) => item.id)} moveLead={moveLead} />)}</div></Card>)}</section>;
}

function LeadCard({ lead, stages, moveLead }: { lead: SalesLead; stages: SalesStage[]; moveLead: (leadId: string, stage: SalesStage) => void }) {
  return <div className="rounded-[14px] border border-slate-200 bg-white/80 p-3 shadow-sm"><Badge tone={lead.priority === "urgent" ? "rose" : lead.priority === "high" ? "violet" : "cyan"}>{lead.score}/100</Badge><p className="mt-3 font-bold text-slate-950">{lead.company}</p><p className="text-sm text-slate-500">{lead.name}</p><p className="mt-2 text-sm font-semibold text-blue-700">{formatSalesCurrency(lead.potentialValue)}</p><div className="mt-3 flex flex-wrap gap-1">{stages.map((stage) => <button key={stage} className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500 hover:bg-blue-50 hover:text-blue-700" onClick={() => moveLead(lead.id, stage)}>{stageLabels[stage]}</button>)}</div></div>;
}

function LeadsView({ leads, query, setQuery }: { leads: SalesLead[]; query: string; setQuery: (value: string) => void }) {
  return <Card className="p-5"><div className="flex h-11 max-w-md items-center gap-2 rounded-[14px] border border-slate-200 bg-white px-3 text-sm text-slate-500"><Search size={16} /><input className="w-full bg-transparent outline-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher leads" /></div><div className="mt-5 grid gap-3 md:grid-cols-3">{leads.map((lead) => <Card key={lead.id} interactive className="p-4"><Badge tone="cyan">{lead.source}</Badge><p className="mt-3 font-bold text-slate-950">{lead.name}</p><p className="text-sm text-slate-500">{lead.company} - {lead.sector}</p><p className="mt-3 text-sm text-slate-500">{lead.email}<br />{lead.phone}</p><p className="mt-3 font-bold text-blue-700">{formatSalesCurrency(lead.potentialValue)}</p></Card>)}</div></Card>;
}

function OpportunitiesView({ data }: { data: ReturnType<typeof useSalesData>["data"] }) {
  return <Card className="p-5"><h2 className="font-black text-slate-950">Opportunites & previsions</h2><div className="mt-5 grid gap-3 md:grid-cols-3">{data.opportunities.map((opportunity) => <Card key={opportunity.id} interactive className="p-4"><Badge tone="violet">{stageLabels[opportunity.status]}</Badge><p className="mt-3 font-bold text-slate-950">{opportunity.title}</p><p className="mt-2 text-sm text-slate-500">Deadline {formatSalesDate(opportunity.deadline)}</p><p className="mt-3 text-2xl font-black text-blue-700">{formatSalesCurrency(opportunity.amount)}</p><div className="mt-3 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400" style={{ width: `${opportunity.probability}%` }} /></div></Card>)}</div></Card>;
}

function QuotesView({ data }: { data: ReturnType<typeof useSalesData>["data"] }) {
  return <Card className="p-5"><h2 className="font-black text-slate-950">Devis & propositions</h2><div className="mt-5 grid gap-3 md:grid-cols-3">{data.quotes.map((quote) => <Card key={quote.id} interactive className="p-4"><FileText className="text-blue-600" size={18} /><p className="mt-3 font-bold text-slate-950">{quote.title}</p><p className="text-sm text-slate-500">{quote.status} - ouvert {quote.openedCount} fois</p><p className="mt-3 font-black text-blue-700">{formatSalesCurrency(quote.amount)}</p></Card>)}</div></Card>;
}

function TeamView({ data }: { data: ReturnType<typeof useSalesData>["data"] }) {
  return <Card className="p-5"><h2 className="font-black text-slate-950">Commerciaux & equipes</h2><div className="mt-5 grid gap-3 md:grid-cols-3">{data.teams.map((seller) => <Card key={seller.id} interactive className="p-4"><Badge tone={seller.active ? "emerald" : "rose"}>{seller.role}</Badge><p className="mt-3 font-bold text-slate-950">{seller.name}</p><p className="text-sm text-slate-500">{seller.activities} activites</p><p className="mt-3 font-black text-blue-700">{formatSalesCurrency(seller.closedRevenue)}</p><div className="mt-3 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400" style={{ width: `${Math.min(100, (seller.closedRevenue / seller.quota) * 100)}%` }} /></div></Card>)}</div></Card>;
}

function AutomationView() {
  return <Card className="p-5"><h2 className="font-black text-slate-950">Automatisations commerciales</h2><div className="mt-5 grid gap-3 md:grid-cols-3">{["Relance automatique devis", "Rappel closing", "Email nurturing IA", "Creation tache pipeline", "Alerte objectif", "Scoring intelligent"].map((item) => <Card key={item} interactive className="p-4"><Bot className="text-blue-600" size={18} /><p className="mt-3 font-bold text-slate-950">{item}</p><p className="mt-2 text-sm text-slate-500">Workflow commercial pret pour activation.</p></Card>)}</div></Card>;
}

function NotificationsView({ data }: { data: ReturnType<typeof useSalesData>["data"] }) {
  return <Card className="p-5"><h2 className="font-black text-slate-950">Notifications ventes</h2><div className="mt-5 grid gap-3 md:grid-cols-2">{data.notifications.map((notification) => <div key={notification.id} className="rounded-[14px] border border-slate-200 bg-white/70 p-4"><Bell className="text-blue-600" size={18} /><p className="mt-3 font-bold text-slate-950">{notification.title}</p><p className="mt-2 text-sm text-slate-500">{notification.detail}</p></div>)}</div></Card>;
}

function ActivityGrid({ data }: { data: ReturnType<typeof useSalesData>["data"] }) {
  return <section className="grid gap-3 md:grid-cols-3">{data.activities.map((activity) => <Card key={activity.id} interactive className="p-4"><Mail className="text-blue-600" size={18} /><p className="mt-3 font-bold text-slate-950">{activity.title}</p><p className="mt-2 text-sm text-slate-500">{activity.owner} - {activity.type}</p><p className="mt-3 text-xs text-slate-400">{formatSalesDate(activity.createdAt)}</p></Card>)}</section>;
}
