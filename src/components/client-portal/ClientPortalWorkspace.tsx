"use client";

import { Bell, CalendarDays, CheckCircle2, CreditCard, Download, FileCheck2, FileText, FolderOpen, MessageSquare, Plus, Save, ShieldCheck, Signature, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { formatClientPortalCurrency, formatClientPortalDate } from "@/lib/client-portal/format";
import { downloadJsonFile, downloadTextFile } from "@/lib/download";
import {
  createClientActivity,
  createClientAppointment,
  createClientDocument,
  createClientMessage,
  createClientNotification,
  createClientSignature,
  getClientPortalDashboard
} from "@/services/client-portal/calculations";
import { useClientPortalData } from "@/hooks/client-portal/useClientPortalData";
import { ClientPortalKpiCard } from "@/ui/client-portal/ClientPortalKpiCard";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Skeleton } from "@/ui/Skeleton";
import { Toast } from "@/ui/Toast";
import type { ClientInvoice } from "@/types/client-portal";

const views = ["dashboard", "billing", "projects", "support", "documents", "appointments", "messages", "signatures", "profile"] as const;
type View = (typeof views)[number];
type Data = ReturnType<typeof useClientPortalData>["data"];
type Mutate = ReturnType<typeof useClientPortalData>["mutate"];

const viewLabels: Record<View, string> = {
  dashboard: "Dashboard",
  billing: "Facturation",
  projects: "Projets",
  support: "Support",
  documents: "Documents",
  appointments: "Agenda",
  messages: "Messages",
  signatures: "Signatures",
  profile: "Profil"
};

export function ClientPortalWorkspace() {
  const { data, loading, mode, toast, mutate, sync } = useClientPortalData();
  const [view, setView] = useState<View>("dashboard");
  const dashboard = useMemo(() => getClientPortalDashboard(data), [data]);
  const portal = data.portals[0];

  function sendMessage(content = "Merci, j'ai bien recu la mise a jour.") {
    if (!portal) return;
    const message = createClientMessage(portal.id, content);
    mutate(
      (current) => ({
        ...current,
        messages: [...current.messages, message],
        activityLogs: [createClientActivity(portal.id, "Nouveau message client envoye", "Messagerie"), ...current.activityLogs]
      }),
      { title: "Message envoye", detail: "La conversation client est sauvegardee." }
    );
  }

  function markAllNotificationsRead() {
    if (!portal) return;
    mutate(
      (current) => ({
        ...current,
        notifications: current.notifications.map((notification) => (notification.portalId === portal.id ? { ...notification, read: true } : notification)),
        activityLogs: [createClientActivity(portal.id, "Notifications marquees comme lues", "Notifications"), ...current.activityLogs]
      }),
      { title: "Notifications lues", detail: "Le centre de notifications client est a jour." }
    );
  }

  function exportPortal() {
    if (!portal) return;
    downloadJsonFile(`centrix-portail-client-${portal.id}.json`, { portal, data, exportedAt: new Date().toISOString() });
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
        <Skeleton className="h-36" />
        <section className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((item) => <Skeleton key={item} className="h-28" />)}
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
            <Badge tone="cyan">Client Portal</Badge>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">Portail Client CENTRIX</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
              Espace securise pour factures, devis, projets, support, documents, rendez-vous, messagerie et signatures.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => sendMessage()}><Plus size={17} /> Message</Button>
            <Button onClick={markAllNotificationsRead} variant="ghost"><CheckCircle2 size={17} /> Tout lire</Button>
            <Button onClick={exportPortal} variant="ghost"><Download size={17} /> Export</Button>
            <Button onClick={sync} variant="primary"><Save size={17} /> Sync {mode}</Button>
          </div>
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
        {views.map((item) => (
          <button key={item} className={`h-10 shrink-0 rounded-[12px] px-3 text-sm font-semibold transition-all ${view === item ? "bg-blue-600 text-white shadow-[0_12px_28px_rgba(37,99,235,0.22)]" : "text-slate-500 hover:bg-blue-50 hover:text-blue-700"}`} onClick={() => setView(item)}>
            {viewLabels[item]}
          </button>
        ))}
      </div>

      {view === "dashboard" ? <Dashboard data={data} /> : null}
      {view === "billing" ? <Billing data={data} mutate={mutate} /> : null}
      {view === "projects" ? <Projects data={data} mutate={mutate} /> : null}
      {view === "support" ? <Support data={data} onMessage={sendMessage} /> : null}
      {view === "documents" ? <Documents data={data} mutate={mutate} /> : null}
      {view === "appointments" ? <Appointments data={data} mutate={mutate} /> : null}
      {view === "messages" ? <Messages data={data} onMessage={sendMessage} /> : null}
      {view === "signatures" ? <Signatures data={data} mutate={mutate} /> : null}
      {view === "profile" ? <Profile portal={portal} /> : null}
    </div>
  );
}

function Dashboard({ data }: { data: Data }) {
  return (
    <section className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
      <Card className="p-5">
        <h2 className="font-black text-slate-950">Timeline activite</h2>
        <div className="mt-5 space-y-3">
          {data.activityLogs.map((item) => (
            <div key={item.id} className="rounded-[14px] border border-slate-200 bg-white/70 p-4">
              <p className="font-bold text-slate-950">{item.label}</p>
              <p className="mt-1 text-sm text-slate-500">{item.module} - {formatClientPortalDate(item.createdAt)}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-5">
        <h2 className="font-black text-slate-950">Acces rapides</h2>
        <div className="mt-5 grid gap-3">
          {["Payer une facture", "Telecharger un contrat", "Ouvrir un ticket", "Reserver un rendez-vous"].map((item) => (
            <div key={item} className="rounded-[14px] border border-slate-200 bg-blue-50 p-4 font-semibold text-blue-800">{item}</div>
          ))}
        </div>
      </Card>
    </section>
  );
}

function Billing({ data, mutate }: { data: Data; mutate: Mutate }) {
  function payInvoice(invoice: ClientInvoice) {
    mutate(
      (current) => ({
        ...current,
        invoices: current.invoices.map((item) => (item.id === invoice.id ? { ...item, status: "paid" } : item)),
        notifications: [createClientNotification(invoice.portalId, "Paiement confirme", `${invoice.number} est marquee comme payee.`), ...current.notifications],
        activityLogs: [createClientActivity(invoice.portalId, `${invoice.number} payee depuis le portail`, "Facturation"), ...current.activityLogs]
      }),
      { title: "Paiement enregistre", detail: `${invoice.number} est maintenant payee.` }
    );
  }

  return (
    <Card className="p-5">
      <h2 className="font-black text-slate-950">Facturation & paiements</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {data.invoices.map((invoice) => (
          <Card key={invoice.id} interactive className="p-4">
            <Badge tone={invoice.status === "paid" ? "emerald" : invoice.status === "overdue" ? "rose" : "cyan"}>{invoice.status}</Badge>
            <p className="mt-3 font-bold text-slate-950">{invoice.number}</p>
            <p className="text-sm text-slate-500">{invoice.title}</p>
            <p className="mt-3 text-2xl font-black text-blue-700">{formatClientPortalCurrency(invoice.amount)}</p>
            <p className="mt-1 text-xs text-slate-400">Echeance {formatClientPortalDate(invoice.dueAt)}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button className="h-9 px-3" onClick={() => downloadJsonFile(`${invoice.number}.json`, invoice)}><Download size={15} /> Telecharger</Button>
              {invoice.status !== "paid" ? <Button className="h-9 px-3" onClick={() => payInvoice(invoice)} variant="primary"><CreditCard size={15} /> Payer</Button> : null}
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}

function Projects({ data, mutate }: { data: Data; mutate: Mutate }) {
  function advanceProject(projectId: string) {
    mutate((current) => ({
      ...current,
      projects: current.projects.map((project) => (project.id === projectId ? { ...project, progress: Math.min(100, project.progress + 10), status: project.progress + 10 >= 100 ? "completed" : "active" } : project))
    }));
  }

  return (
    <Card className="p-5">
      <h2 className="font-black text-slate-950">Suivi projets</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {data.projects.map((project) => (
          <Card key={project.id} interactive className="p-4">
            <Badge tone={project.status === "completed" ? "emerald" : "cyan"}>{project.status}</Badge>
            <p className="mt-3 font-bold text-slate-950">{project.title}</p>
            <p className="text-sm text-slate-500">{project.description}</p>
            <div className="mt-4 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400" style={{ width: `${project.progress}%` }} /></div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-slate-400">Deadline {formatClientPortalDate(project.deadline)}</p>
              <Button className="h-9 px-3" onClick={() => advanceProject(project.id)} variant="ghost">Avancer</Button>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}

function Support({ data, onMessage }: { data: Data; onMessage: (content?: string) => void }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-black text-slate-950">Support & centre aide</h2>
        <Button onClick={() => onMessage("Bonjour, j'ai besoin d'aide sur mon dossier.")}><Plus size={15} /> Ouvrir demande</Button>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {["Creer un ticket", "Consulter la FAQ", "Suivre une demande"].map((item) => (
          <Card key={item} interactive className="p-4">
            <MessageSquare className="text-blue-600" size={18} />
            <p className="mt-3 font-bold text-slate-950">{item}</p>
            <p className="mt-2 text-sm text-slate-500">Historique, pieces jointes et notifications temps reel.</p>
          </Card>
        ))}
      </div>
      <Messages data={data} onMessage={onMessage} />
    </Card>
  );
}

function Documents({ data, mutate }: { data: Data; mutate: Mutate }) {
  function addDocument() {
    const portalId = data.portals[0]?.id;
    if (!portalId) return;
    const document = createClientDocument(portalId);
    mutate(
      (current) => ({
        ...current,
        documents: [document, ...current.documents],
        activityLogs: [createClientActivity(portalId, `${document.name} partage`, "Documents"), ...current.activityLogs]
      }),
      { title: "Document ajoute", detail: `${document.name} est disponible cote client.` }
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-black text-slate-950">Documents clients</h2>
        <Button onClick={addDocument} variant="primary"><Plus size={15} /> Ajouter</Button>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {data.documents.map((doc) => (
          <Card key={doc.id} interactive className="p-4">
            <FileCheck2 className="text-blue-600" size={18} />
            <p className="mt-3 font-bold text-slate-950">{doc.name}</p>
            <p className="text-sm text-slate-500">{doc.category} - {doc.sizeMb} MB</p>
            <Button className="mt-4 h-9 px-3" onClick={() => downloadTextFile(doc.name, `Document CENTRIX\nCategorie: ${doc.category}\nTaille: ${doc.sizeMb} MB\nIdentifiant: ${doc.id}`)}><Download size={15} /> Telecharger</Button>
          </Card>
        ))}
      </div>
    </Card>
  );
}

function Appointments({ data, mutate }: { data: Data; mutate: Mutate }) {
  function addAppointment() {
    const portalId = data.portals[0]?.id;
    if (!portalId) return;
    const appointment = createClientAppointment(portalId);
    mutate(
      (current) => ({
        ...current,
        appointments: [...current.appointments, appointment],
        notifications: [createClientNotification(portalId, "Rendez-vous demande", appointment.title), ...current.notifications]
      }),
      { title: "Rendez-vous cree", detail: "La demande est visible dans l'agenda client." }
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-black text-slate-950">Rendez-vous & agenda</h2>
        <Button onClick={addAppointment} variant="primary"><Plus size={15} /> Nouveau</Button>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {data.appointments.map((apt) => (
          <div key={apt.id} className="rounded-[14px] border border-slate-200 bg-white/70 p-4">
            <CalendarDays className="text-blue-600" size={18} />
            <p className="mt-3 font-bold text-slate-950">{apt.title}</p>
            <p className="text-sm text-slate-500">{apt.type} - {apt.status} - {formatClientPortalDate(apt.startsAt)}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Messages({ data, onMessage }: { data: Data; onMessage: (content?: string) => void }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-black text-slate-950">Messagerie client</h2>
        <Button onClick={() => onMessage()}><Plus size={15} /> Repondre</Button>
      </div>
      <div className="mt-5 space-y-3">
        {data.messages.map((msg) => (
          <div key={msg.id} className={`max-w-2xl rounded-[14px] border p-4 ${msg.role === "client" ? "border-blue-100 bg-blue-50" : "ml-auto border-slate-200 bg-white"}`}>
            <p className="font-semibold text-slate-950">{msg.author}</p>
            <p className="mt-1 text-sm text-slate-600">{msg.content}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Signatures({ data, mutate }: { data: Data; mutate: Mutate }) {
  function addSignature() {
    const portalId = data.portals[0]?.id;
    if (!portalId) return;
    const signature = createClientSignature(portalId);
    mutate((current) => ({ ...current, signatures: [signature, ...current.signatures] }), { title: "Signature demandee", detail: signature.documentName });
  }

  function signDocument(signatureId: string) {
    mutate((current) => ({
      ...current,
      signatures: current.signatures.map((signature) => (signature.id === signatureId ? { ...signature, status: "signed", signedAt: new Date().toISOString() } : signature))
    }));
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-black text-slate-950">Signatures electroniques</h2>
        <Button onClick={addSignature} variant="primary"><Plus size={15} /> Demander</Button>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {data.signatures.map((sig) => (
          <div key={sig.id} className="rounded-[14px] border border-slate-200 bg-white/70 p-4">
            <Signature className="text-blue-600" size={18} />
            <p className="mt-3 font-bold text-slate-950">{sig.documentName}</p>
            <Badge tone={sig.status === "signed" ? "emerald" : sig.status === "expired" ? "rose" : "violet"}>{sig.status}</Badge>
            {sig.status !== "signed" ? <Button className="mt-4 h-9 px-3" onClick={() => signDocument(sig.id)} variant="ghost">Signer</Button> : null}
          </div>
        ))}
      </div>
    </Card>
  );
}

function Profile({ portal }: { portal?: Data["portals"][number] }) {
  if (!portal) return null;
  return (
    <Card className="p-5">
      <h2 className="font-black text-slate-950">Profil client</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <Card className="p-4">
          <UserRound className="text-blue-600" size={20} />
          <p className="mt-3 font-bold text-slate-950">{portal.clientName}</p>
          <p className="text-sm text-slate-500">{portal.companyName} - {portal.plan}</p>
          <p className="mt-3 text-sm text-slate-500">{portal.email}<br />{portal.phone}</p>
        </Card>
        <Card className="p-4">
          <ShieldCheck className="text-emerald-600" size={20} />
          <p className="mt-3 font-bold text-slate-950">Securite compte</p>
          <p className="text-sm text-slate-500">Preferences notifications, acces securise et historique activite.</p>
        </Card>
      </div>
    </Card>
  );
}
