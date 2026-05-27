"use client";

import { BarChart3, Bell, BookOpen, Bot, CheckCircle2, Clock3, Headphones, LifeBuoy, MessageCircle, Plus, Save, Search, Send, ShieldAlert, Star, Ticket, UserCheck, WandSparkles } from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { formatSupportDate, formatSupportDuration, formatSupportPercent } from "@/lib/support/format";
import { createNotification, createTicket, filterTickets, getSupportDashboard, priorityLabels, priorityTone, statusLabels, statusTone } from "@/services/support/calculations";
import { useSupportData } from "@/hooks/support/useSupportData";
import type { SupportMessage, SupportTicket, TicketPriority, TicketStatus } from "@/types/support";
import { SupportKpiCard } from "@/ui/support/SupportKpiCard";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { EmptyState } from "@/ui/EmptyState";
import { Modal } from "@/ui/Modal";
import { Skeleton } from "@/ui/Skeleton";
import { Toast } from "@/ui/Toast";

const views = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "tickets", label: "Tickets", icon: Ticket },
  { id: "chat", label: "Chat", icon: MessageCircle },
  { id: "knowledge", label: "Base aide", icon: BookOpen },
  { id: "portal", label: "Portail client", icon: LifeBuoy },
  { id: "automations", label: "Automatisations", icon: Bot },
  { id: "quality", label: "Satisfaction", icon: Star }
] as const;

type View = (typeof views)[number]["id"];

type TicketDraft = {
  title: string;
  description: string;
  clientName: string;
  clientEmail: string;
  priority: TicketPriority;
  categoryId: string;
};

const quickReplies = [
  "Merci pour votre message, je prends en charge votre demande.",
  "Pouvez-vous nous envoyer une capture ou un exemple pour reproduire le probleme ?",
  "Le correctif est en cours de validation, je reviens vers vous avec une confirmation.",
  "Votre demande est resolue. N'hesitez pas a rouvrir le ticket si besoin."
];

export function SupportWorkspace() {
  const { data, loading, mode, toast, mutate, sync } = useSupportData();
  const [view, setView] = useState<View>("dashboard");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<TicketStatus | "all">("all");
  const [priority, setPriority] = useState<TicketPriority | "all">("all");
  const [selectedTicketId, setSelectedTicketId] = useState(data.tickets[0]?.id ?? "");
  const [createOpen, setCreateOpen] = useState(false);
  const [reply, setReply] = useState("");
  const [draft, setDraft] = useState<TicketDraft>({
    title: "Nouvelle demande support",
    description: "Decrivez le probleme rencontre et le resultat attendu.",
    clientName: "Client CENTRIX",
    clientEmail: "client@entreprise.fr",
    priority: "medium",
    categoryId: "cat-technical"
  });

  const dashboard = useMemo(() => getSupportDashboard(data), [data]);
  const tickets = useMemo(() => filterTickets(data, query, status, priority), [data, query, status, priority]);
  const selectedTicket = data.tickets.find((ticket) => ticket.id === selectedTicketId) ?? data.tickets[0] ?? null;
  const selectedMessages = selectedTicket ? data.messages.filter((message) => message.ticketId === selectedTicket.id) : [];
  const selectedComments = selectedTicket ? data.comments.filter((comment) => comment.ticketId === selectedTicket.id) : [];
  const selectedFeedback = selectedTicket ? data.feedback.find((item) => item.ticketId === selectedTicket.id) : null;

  function submitTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const ticket = createTicket(draft);
    mutate(
      (current) => ({
        ...current,
        tickets: [ticket, ...current.tickets],
        notifications: [createNotification(ticket.id, "Nouveau ticket", `${ticket.clientName} a cree une demande.`, ticket.priority === "urgent" ? "warning" : "info"), ...current.notifications]
      }),
      { title: "Ticket cree", detail: `${ticket.title} est ajoute a la file.` }
    );
    setSelectedTicketId(ticket.id);
    setCreateOpen(false);
    setView("tickets");
  }

  function updateTicket(ticketId: string, updates: Partial<SupportTicket>) {
    mutate((current) => ({
      ...current,
      tickets: current.tickets.map((ticket) => (ticket.id === ticketId ? { ...ticket, ...updates, updatedAt: new Date().toISOString() } : ticket))
    }));
  }

  function deleteTicket(ticketId: string) {
    mutate(
      (current) => ({
        ...current,
        tickets: current.tickets.filter((ticket) => ticket.id !== ticketId),
        messages: current.messages.filter((message) => message.ticketId !== ticketId),
        comments: current.comments.filter((comment) => comment.ticketId !== ticketId),
        feedback: current.feedback.filter((item) => item.ticketId !== ticketId)
      }),
      { title: "Ticket supprime", detail: "L'historique associe a ete retire." }
    );
  }

  function sendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTicket || !reply.trim()) return;
    const message: SupportMessage = {
      id: `support-msg-${crypto.randomUUID()}`,
      ticketId: selectedTicket.id,
      authorName: "Agent CENTRIX",
      authorType: "agent",
      content: reply.trim(),
      createdAt: new Date().toISOString()
    };
    mutate(
      (current) => ({
        ...current,
        messages: [...current.messages, message],
        tickets: current.tickets.map((ticket) => (ticket.id === selectedTicket.id ? { ...ticket, status: "in_progress", updatedAt: new Date().toISOString() } : ticket)),
        notifications: [createNotification(selectedTicket.id, "Reponse envoyee", "Le client a ete notifie dans le portail.", "success"), ...current.notifications]
      }),
      { title: "Message envoye", detail: "La conversation support est mise a jour." }
    );
    setReply("");
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
            <Badge tone="cyan">Customer care OS</Badge>
            <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Support Client & SAV</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              Tickets, chat temps reel, base de connaissance, portail client, automatisations SLA et satisfaction dans une experience premium inspiree Zendesk et Intercom.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setCreateOpen(true)}><Plus size={17} /> Nouveau ticket</Button>
            <Button onClick={sync} variant="primary"><Save size={17} /> Sync {mode}</Button>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <SupportKpiCard delta="live" icon={<Ticket size={19} />} label="Tickets ouverts" value={String(dashboard.open)} />
        <SupportKpiCard delta="resolus" icon={<CheckCircle2 size={19} />} label="Tickets fermes" tone="emerald" value={String(dashboard.closed)} />
        <SupportKpiCard delta="moyenne" icon={<Clock3 size={19} />} label="Temps reponse" tone="violet" value={formatSupportDuration(dashboard.averageResponseMinutes)} />
        <SupportKpiCard delta="CSAT" icon={<Star size={19} />} label="Satisfaction" tone="emerald" value={formatSupportPercent(dashboard.satisfaction)} />
        <SupportKpiCard delta="SLA" icon={<ShieldAlert size={19} />} label="Urgents" tone="rose" value={String(dashboard.urgent)} />
        <SupportKpiCard delta="online" icon={<UserCheck size={19} />} label="Agents actifs" value={String(dashboard.activeAgents)} />
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

      <section className="grid gap-4 xl:grid-cols-[320px_1fr_340px]">
        <Card className="p-4">
          <div className="flex h-10 items-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-sm text-slate-400">
            <Search size={16} />
            <input className="w-full bg-transparent outline-none placeholder:text-slate-500" placeholder="Recherche ticket, client, agent..." value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <select className="h-10 rounded-[8px] border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none" value={status} onChange={(event) => setStatus(event.target.value as TicketStatus | "all")}>
              <option value="all">Tous statuts</option>
              {Object.entries(statusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
            <select className="h-10 rounded-[8px] border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none" value={priority} onChange={(event) => setPriority(event.target.value as TicketPriority | "all")}>
              <option value="all">Priorites</option>
              {Object.entries(priorityLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </div>
          <div className="mt-4 space-y-2">
            {tickets.map((ticket) => {
              const agent = data.agents.find((item) => item.id === ticket.assignedAgentId);
              return (
                <button key={ticket.id} className={`w-full rounded-[8px] border p-3 text-left transition-all duration-200 ${selectedTicket?.id === ticket.id ? "border-cyan-200/35 bg-cyan-300/10" : "border-white/10 bg-white/[0.035] hover:bg-white/[0.07]"}`} onClick={() => setSelectedTicketId(ticket.id)}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="line-clamp-2 text-sm font-medium text-white">{ticket.title}</p>
                    <Badge tone={priorityTone(ticket.priority)}>{priorityLabels[ticket.priority]}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{ticket.clientName} - {agent?.name ?? "Non assigne"}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge tone={statusTone(ticket.status)}>{statusLabels[ticket.status]}</Badge>
                    <span className="text-xs text-slate-500">{formatSupportDate(ticket.updatedAt)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <MainSupportPanel
          data={data}
          deleteTicket={deleteTicket}
          messages={selectedMessages}
          priority={priority}
          quickReplies={quickReplies}
          reply={reply}
          selectedTicket={selectedTicket}
          sendReply={sendReply}
          setPriority={setPriority}
          setReply={setReply}
          setView={setView}
          updateTicket={updateTicket}
          view={view}
        />

        <Card className="p-4">
          {selectedTicket ? (
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-400">Fiche ticket</p>
                  <h2 className="mt-1 text-lg font-semibold text-white">{selectedTicket.clientName}</h2>
                </div>
                <Badge tone={priorityTone(selectedTicket.priority)}>{priorityLabels[selectedTicket.priority]}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Metric label="Statut" value={statusLabels[selectedTicket.status]} />
                <Metric label="Categorie" value={data.categories.find((item) => item.id === selectedTicket.categoryId)?.name ?? "Support"} />
                <Metric label="Pieces" value={String(selectedTicket.attachments.length)} />
                <Metric label="CSAT" value={selectedFeedback ? `${selectedFeedback.rating}/5` : "N/A"} />
              </div>
              <div className="mt-4 rounded-[8px] border border-white/10 bg-white/[0.04] p-3">
                <p className="text-sm font-semibold text-white">Commentaires internes</p>
                <div className="mt-3 space-y-2">
                  {selectedComments.length ? selectedComments.map((comment) => <p key={comment.id} className="text-xs leading-5 text-slate-400">{comment.content}</p>) : <p className="text-xs text-slate-500">Aucune note interne.</p>}
                </div>
              </div>
              <div className="mt-4 rounded-[8px] border border-white/10 bg-white/[0.04] p-3">
                <p className="text-sm font-semibold text-white">Agents actifs</p>
                <div className="mt-3 space-y-2">
                  {data.agents.map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-slate-300">{agent.name}</span>
                      <span className={`h-2.5 w-2.5 rounded-full ${agent.online ? "bg-emerald-300" : "bg-slate-500"}`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <EmptyState icon={<Ticket size={20} />} title="Aucun ticket" detail="Creez ou selectionnez un ticket support." />
          )}
        </Card>
      </section>

      <Modal open={createOpen} title="Creer un ticket support" onClose={() => setCreateOpen(false)}>
        <form className="space-y-3" onSubmit={submitTicket}>
          <input className="h-11 w-full rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-sm text-white outline-none" value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} />
          <textarea className="min-h-24 w-full rounded-[8px] border border-white/10 bg-white/[0.055] px-3 py-3 text-sm text-white outline-none" value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} />
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="h-11 rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-sm text-white outline-none" value={draft.clientName} onChange={(event) => setDraft((current) => ({ ...current, clientName: event.target.value }))} />
            <input className="h-11 rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-sm text-white outline-none" value={draft.clientEmail} onChange={(event) => setDraft((current) => ({ ...current, clientEmail: event.target.value }))} />
            <select className="h-11 rounded-[8px] border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none" value={draft.priority} onChange={(event) => setDraft((current) => ({ ...current, priority: event.target.value as TicketPriority }))}>
              {Object.entries(priorityLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
            <select className="h-11 rounded-[8px] border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none" value={draft.categoryId} onChange={(event) => setDraft((current) => ({ ...current, categoryId: event.target.value }))}>
              {data.categories.map((categoryItem) => <option key={categoryItem.id} value={categoryItem.id}>{categoryItem.name}</option>)}
            </select>
          </div>
          <Button className="w-full" type="submit" variant="primary">Creer le ticket</Button>
        </form>
      </Modal>
    </div>
  );
}

type MainSupportPanelProps = {
  data: ReturnType<typeof useSupportData>["data"];
  selectedTicket: SupportTicket | null;
  messages: SupportMessage[];
  view: View;
  reply: string;
  priority: TicketPriority | "all";
  quickReplies: string[];
  setReply: (value: string) => void;
  setPriority: (value: TicketPriority | "all") => void;
  setView: (value: View) => void;
  sendReply: (event: FormEvent<HTMLFormElement>) => void;
  updateTicket: (ticketId: string, updates: Partial<SupportTicket>) => void;
  deleteTicket: (ticketId: string) => void;
};

function MainSupportPanel({ data, selectedTicket, messages, view, reply, quickReplies, setReply, sendReply, updateTicket, deleteTicket }: MainSupportPanelProps) {
  if (view === "knowledge") {
    return (
      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div><p className="text-sm text-slate-400">Base de connaissance</p><h2 className="text-lg font-semibold text-white">FAQ, guides et articles</h2></div>
          <Badge tone="emerald">{data.articles.filter((article) => article.published).length} publies</Badge>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {data.articles.map((article) => (
            <Card key={article.id} interactive className="p-4">
              <BookOpen size={18} className="text-cyan-100" />
              <p className="mt-3 font-semibold text-white">{article.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">{article.excerpt}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500"><span>{article.views} vues</span><span>{article.likes} utiles</span></div>
            </Card>
          ))}
        </div>
      </Card>
    );
  }

  if (view === "automations") {
    return (
      <Card className="p-5">
        <div className="flex items-center gap-2"><WandSparkles size={18} className="text-cyan-100" /><h2 className="text-lg font-semibold text-white">Automatisations support</h2></div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {["Auto-assignation urgent -> Lead support", "Alerte SLA 2h avant retard", "Reponse automatique ticket facture", "Escalade tickets CSAT < 3", "Rappel client apres 48h sans reponse", "Priorite intelligente via mots cles"].map((rule) => (
            <div key={rule} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4">
              <p className="font-medium text-white">{rule}</p>
              <p className="mt-2 text-sm text-slate-400">Regle prete pour orchestration workflow CENTRIX.</p>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (view === "portal") {
    return (
      <Card className="p-5">
        <div className="flex items-center gap-2"><LifeBuoy size={18} className="text-cyan-100" /><h2 className="text-lg font-semibold text-white">Portail client premium</h2></div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <PortalCard icon={<Ticket size={18} />} label="Suivi tickets" value={`${data.tickets.length} demandes`} />
          <PortalCard icon={<BookOpen size={18} />} label="Centre aide" value={`${data.articles.length} articles`} />
          <PortalCard icon={<Bell size={18} />} label="Notifications" value="Temps reel" />
        </div>
        <div className="mt-5 rounded-[8px] border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-slate-400">
          Vue client preparee pour creation de ticket, historique demandes, aide contextuelle, notifications utilisateur et experience mobile.
        </div>
      </Card>
    );
  }

  if (view === "quality") {
    const ratings = [5, 4, 3, 2, 1].map((rating) => ({ rating, count: data.feedback.filter((item) => item.rating === rating).length }));
    return (
      <Card className="p-5">
        <div className="flex items-center gap-2"><Star size={18} className="text-cyan-100" /><h2 className="text-lg font-semibold text-white">Satisfaction client</h2></div>
        <div className="mt-5 space-y-3">
          {ratings.map((item) => (
            <div key={item.rating} className="grid grid-cols-[42px_1fr_40px] items-center gap-3">
              <span className="text-sm text-slate-400">{item.rating}/5</span>
              <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-electric to-violet" style={{ width: `${Math.max(8, item.count * 35)}%` }} /></div>
              <span className="text-right text-sm text-white">{item.count}</span>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex min-h-[660px] flex-col p-4 sm:p-5">
      {selectedTicket ? (
        <>
          <div className="flex flex-col gap-3 border-b border-white/10 pb-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm text-slate-400">{selectedTicket.id}</p>
              <h2 className="text-xl font-semibold text-white">{selectedTicket.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{selectedTicket.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button className="h-9 px-3" onClick={() => updateTicket(selectedTicket.id, { status: "resolved" })}><CheckCircle2 size={15} /> Resoudre</Button>
              <Button className="h-9 px-3 text-rose-200" onClick={() => deleteTicket(selectedTicket.id)} variant="ghost">Supprimer</Button>
            </div>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto py-5">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.authorType === "client" ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[86%] rounded-[8px] border p-4 text-sm leading-6 ${message.authorType === "client" ? "border-white/10 bg-white/[0.055] text-slate-200" : "border-cyan-200/25 bg-cyan-300/10 text-cyan-50"}`}>
                  <p>{message.content}</p>
                  <p className="mt-2 text-[11px] text-slate-500">{message.authorName} - {formatSupportDate(message.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mb-3 flex flex-wrap gap-2">
            {quickReplies.map((template) => <button key={template} className="rounded-[8px] border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-300 hover:bg-white/[0.08]" onClick={() => setReply(template)}>{template.slice(0, 42)}...</button>)}
          </div>
          <form className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row" onSubmit={sendReply}>
            <textarea className="min-h-11 flex-1 resize-none rounded-[8px] border border-white/10 bg-white/[0.055] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" placeholder="Repondre au client..." value={reply} onChange={(event) => setReply(event.target.value)} />
            <Button className="sm:h-auto" type="submit" variant="primary"><Send size={17} /> Envoyer</Button>
          </form>
        </>
      ) : (
        <EmptyState icon={<Headphones size={20} />} title="Aucun ticket" detail="Selectionnez un ticket ou creez une nouvelle demande." />
      )}
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[8px] border border-white/10 bg-white/[0.04] p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 truncate text-sm font-semibold text-white">{value}</p></div>;
}

function PortalCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4">{icon}<p className="mt-3 text-sm text-slate-400">{label}</p><p className="mt-1 font-semibold text-white">{value}</p></div>;
}
