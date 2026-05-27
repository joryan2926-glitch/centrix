"use client";

import { Bell, CalendarDays, CreditCard, Download, FileCheck2, FileText, FolderOpen, MessageSquare, Plus, Save, ShieldCheck, Signature, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { formatClientPortalCurrency, formatClientPortalDate } from "@/lib/client-portal/format";
import { createClientMessage, getClientPortalDashboard } from "@/services/client-portal/calculations";
import { useClientPortalData } from "@/hooks/client-portal/useClientPortalData";
import { ClientPortalKpiCard } from "@/ui/client-portal/ClientPortalKpiCard";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Skeleton } from "@/ui/Skeleton";
import { Toast } from "@/ui/Toast";

const views = ["dashboard", "billing", "projects", "support", "documents", "appointments", "messages", "signatures", "profile"] as const;
type View = (typeof views)[number];

export function ClientPortalWorkspace() {
  const { data, loading, mode, toast, mutate, sync } = useClientPortalData();
  const [view, setView] = useState<View>("dashboard");
  const dashboard = useMemo(() => getClientPortalDashboard(data), [data]);
  const portal = data.portals[0];

  function sendMessage() {
    if (!portal) return;
    const message = createClientMessage(portal.id, "Merci, j'ai bien recu la mise a jour.");
    mutate((current) => ({ ...current, messages: [...current.messages, message] }), { title: "Message envoye", detail: "La conversation client est sauvegardee." });
  }

  if (loading) return <div className="mx-auto max-w-7xl space-y-6 animate-fade-in"><Skeleton className="h-36" /><Skeleton className="h-[560px]" /></div>;

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      {toast ? <Toast {...toast} /> : null}
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div><Badge tone="cyan">Client Portal</Badge><h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">Portail Client CENTRIX</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">Espace sécurisé pour factures, projets, support, documents, rendez-vous, messages et signatures.</p></div>
          <div className="flex flex-wrap gap-2"><Button onClick={sendMessage}><Plus size={17} /> Message</Button><Button onClick={sync} variant="primary"><Save size={17} /> Sync {mode}</Button></div>
        </div>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <ClientPortalKpiCard delta="paiement" icon={<CreditCard size={19} />} label="Factures attente" value={String(dashboard.pendingInvoices)} />
        <ClientPortalKpiCard delta="live" icon={<FolderOpen size={19} />} label="Projets actifs" value={String(dashboard.activeProjects)} />
        <ClientPortalKpiCard delta="support" icon={<MessageSquare size={19} />} label="Tickets support" value={String(dashboard.supportTickets)} />
        <ClientPortalKpiCard delta="agenda" icon={<CalendarDays size={19} />} label="Rendez-vous" value={String(dashboard.appointments)} />
        <ClientPortalKpiCard delta="cloud" icon={<FileText size={19} />} label="Documents" value={String(dashboard.documents)} />
        <ClientPortalKpiCard delta="timeline" icon={<Bell size={19} />} label="Activite" value={String(dashboard.activity)} />
      </section>

      <div className="flex gap-2 overflow-x-auto rounded-[14px] border border-slate-200 bg-white/70 p-1 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
        {views.map((item) => <button key={item} className={`h-10 shrink-0 rounded-[12px] px-3 text-sm font-semibold capitalize transition-all ${view === item ? "bg-blue-600 text-white shadow-[0_12px_28px_rgba(37,99,235,0.22)]" : "text-slate-500 hover:bg-blue-50 hover:text-blue-700"}`} onClick={() => setView(item)}>{item}</button>)}
      </div>

      {view === "dashboard" ? <Dashboard data={data} /> : null}
      {view === "billing" ? <Billing data={data} /> : null}
      {view === "projects" ? <Projects data={data} /> : null}
      {view === "support" ? <Support data={data} /> : null}
      {view === "documents" ? <Documents data={data} /> : null}
      {view === "appointments" ? <Appointments data={data} /> : null}
      {view === "messages" ? <Messages data={data} /> : null}
      {view === "signatures" ? <Signatures data={data} /> : null}
      {view === "profile" ? <Profile portal={portal} /> : null}
    </div>
  );
}

type Data = ReturnType<typeof useClientPortalData>["data"];

function Dashboard({ data }: { data: Data }) {
  return <section className="grid gap-4 xl:grid-cols-[1fr_0.8fr]"><Card className="p-5"><h2 className="font-black text-slate-950">Timeline activité</h2><div className="mt-5 space-y-3">{data.activityLogs.map((item) => <div key={item.id} className="rounded-[14px] border border-slate-200 bg-white/70 p-4"><p className="font-bold text-slate-950">{item.label}</p><p className="mt-1 text-sm text-slate-500">{item.module} - {formatClientPortalDate(item.createdAt)}</p></div>)}</div></Card><Card className="p-5"><h2 className="font-black text-slate-950">Accès rapides</h2><div className="mt-5 grid gap-3">{["Payer une facture", "Télécharger un contrat", "Ouvrir un ticket", "Réserver un rendez-vous"].map((item) => <div key={item} className="rounded-[14px] border border-slate-200 bg-blue-50 p-4 font-semibold text-blue-800">{item}</div>)}</div></Card></section>;
}

function Billing({ data }: { data: Data }) {
  return <Card className="p-5"><h2 className="font-black text-slate-950">Facturation & paiements</h2><div className="mt-5 grid gap-3 md:grid-cols-3">{data.invoices.map((invoice) => <Card key={invoice.id} interactive className="p-4"><Badge tone={invoice.status === "paid" ? "emerald" : invoice.status === "overdue" ? "rose" : "cyan"}>{invoice.status}</Badge><p className="mt-3 font-bold text-slate-950">{invoice.number}</p><p className="text-sm text-slate-500">{invoice.title}</p><p className="mt-3 text-2xl font-black text-blue-700">{formatClientPortalCurrency(invoice.amount)}</p><Button className="mt-4 h-9 px-3"><Download size={15} /> PDF</Button></Card>)}</div></Card>;
}

function Projects({ data }: { data: Data }) {
  return <Card className="p-5"><h2 className="font-black text-slate-950">Suivi projets</h2><div className="mt-5 grid gap-3 md:grid-cols-2">{data.projects.map((project) => <Card key={project.id} interactive className="p-4"><Badge tone="cyan">{project.status}</Badge><p className="mt-3 font-bold text-slate-950">{project.title}</p><p className="text-sm text-slate-500">{project.description}</p><div className="mt-4 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400" style={{ width: `${project.progress}%` }} /></div><p className="mt-2 text-xs text-slate-400">Deadline {formatClientPortalDate(project.deadline)}</p></Card>)}</div></Card>;
}

function Support({ data }: { data: Data }) {
  return <Card className="p-5"><h2 className="font-black text-slate-950">Support & centre aide</h2><div className="mt-5 grid gap-3 md:grid-cols-3">{["Créer un ticket", "Consulter la FAQ", "Suivre une demande"].map((item) => <Card key={item} interactive className="p-4"><MessageSquare className="text-blue-600" size={18} /><p className="mt-3 font-bold text-slate-950">{item}</p><p className="mt-2 text-sm text-slate-500">Historique, pièces jointes et notifications temps réel.</p></Card>)}</div><Messages data={data} /></Card>;
}

function Documents({ data }: { data: Data }) {
  return <Card className="p-5"><h2 className="font-black text-slate-950">Documents clients</h2><div className="mt-5 grid gap-3 md:grid-cols-3">{data.documents.map((doc) => <Card key={doc.id} interactive className="p-4"><FileCheck2 className="text-blue-600" size={18} /><p className="mt-3 font-bold text-slate-950">{doc.name}</p><p className="text-sm text-slate-500">{doc.category} - {doc.sizeMb} MB</p><Button className="mt-4 h-9 px-3"><Download size={15} /> Télécharger</Button></Card>)}</div></Card>;
}

function Appointments({ data }: { data: Data }) {
  return <Card className="p-5"><h2 className="font-black text-slate-950">Rendez-vous & agenda</h2><div className="mt-5 grid gap-3 md:grid-cols-2">{data.appointments.map((apt) => <div key={apt.id} className="rounded-[14px] border border-slate-200 bg-white/70 p-4"><CalendarDays className="text-blue-600" size={18} /><p className="mt-3 font-bold text-slate-950">{apt.title}</p><p className="text-sm text-slate-500">{apt.type} - {apt.status} - {formatClientPortalDate(apt.startsAt)}</p></div>)}</div></Card>;
}

function Messages({ data }: { data: Data }) {
  return <Card className="p-5"><h2 className="font-black text-slate-950">Messagerie client</h2><div className="mt-5 space-y-3">{data.messages.map((msg) => <div key={msg.id} className={`max-w-2xl rounded-[14px] border p-4 ${msg.role === "client" ? "border-blue-100 bg-blue-50" : "ml-auto border-slate-200 bg-white"}`}><p className="font-semibold text-slate-950">{msg.author}</p><p className="mt-1 text-sm text-slate-600">{msg.content}</p></div>)}</div></Card>;
}

function Signatures({ data }: { data: Data }) {
  return <Card className="p-5"><h2 className="font-black text-slate-950">Signatures électroniques</h2><div className="mt-5 grid gap-3 md:grid-cols-2">{data.signatures.map((sig) => <div key={sig.id} className="rounded-[14px] border border-slate-200 bg-white/70 p-4"><Signature className="text-blue-600" size={18} /><p className="mt-3 font-bold text-slate-950">{sig.documentName}</p><Badge tone={sig.status === "signed" ? "emerald" : sig.status === "expired" ? "rose" : "violet"}>{sig.status}</Badge></div>)}</div></Card>;
}

function Profile({ portal }: { portal?: Data["portals"][number] }) {
  if (!portal) return null;
  return <Card className="p-5"><h2 className="font-black text-slate-950">Profil client</h2><div className="mt-5 grid gap-3 md:grid-cols-2"><Card className="p-4"><UserRound className="text-blue-600" size={20} /><p className="mt-3 font-bold text-slate-950">{portal.clientName}</p><p className="text-sm text-slate-500">{portal.companyName} - {portal.plan}</p><p className="mt-3 text-sm text-slate-500">{portal.email}<br />{portal.phone}</p></Card><Card className="p-4"><ShieldCheck className="text-emerald-600" size={20} /><p className="mt-3 font-bold text-slate-950">Sécurité compte</p><p className="text-sm text-slate-500">Préférences notifications, accès sécurisé et historique activité.</p></Card></div></Card>;
}
