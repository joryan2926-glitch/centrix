"use client";

import {
  BellRing,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDollarSign,
  Filter,
  GripVertical,
  History,
  Mail,
  Plus,
  Search,
  Sparkles,
  StickyNote,
  Table2,
  UserRound,
  UsersRound
} from "lucide-react";
import type { DragEvent, FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import { crmStages } from "@/data/crm";
import { useCrmData } from "@/hooks/useCrmData";
import {
  buildClientFromLead,
  buildNewLead,
  buildNote,
  buildTask,
  createActivity,
  createCrmId,
  filterClients,
  filterLeads,
  formatCrmCurrency,
  formatCrmDate,
  getCrmDashboard,
  priorityLabels,
  priorityTone,
  statusLabels,
  statusTone
} from "@/services/crm";
import type { CrmClient, CrmFilters, CrmLead, CrmSelection, CrmStatus } from "@/types/crm";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { EmptyState } from "@/ui/EmptyState";
import { Modal } from "@/ui/Modal";
import { Skeleton } from "@/ui/Skeleton";
import { Toast } from "@/ui/Toast";

const crmSidebar = [
  { id: "pipeline", label: "Pipeline", icon: GripVertical },
  { id: "clients", label: "Clients", icon: UsersRound },
  { id: "table", label: "Tableau", icon: Table2 }
] as const;

type CrmView = (typeof crmSidebar)[number]["id"];

type Draft = {
  name: string;
  company: string;
  email: string;
  phone: string;
  amount: number;
  tags: string;
};

const emptyDraft: Draft = {
  name: "Contact principal",
  company: "Nouvelle entreprise",
  email: "contact@client.fr",
  phone: "+33 6 00 00 00 00",
  amount: 18000,
  tags: "A qualifier, SaaS"
};

function isLead(selection: CrmSelection | null): selection is { type: "lead"; id: string } {
  return selection?.type === "lead";
}

export function CrmWorkspace({ initialView = "pipeline" }: { initialView?: CrmView }) {
  const { data, loading, mode, toast, mutate, sync } = useCrmData();
  const [view, setView] = useState<CrmView>(initialView);
  const [selection, setSelection] = useState<CrmSelection | null>({ type: "lead", id: "lead-novacore" });
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [noteDraft, setNoteDraft] = useState("");
  const [taskDraft, setTaskDraft] = useState("");
  const [filters, setFilters] = useState<CrmFilters>({ query: "", status: "all", priority: "all" });

  const filteredLeads = useMemo(() => filterLeads(data.leads, filters), [data.leads, filters]);
  const filteredClients = useMemo(() => filterClients(data.clients, filters.query), [data.clients, filters.query]);
  const dashboard = useMemo(() => getCrmDashboard(data), [data]);

  const selectedLead = isLead(selection) ? data.leads.find((lead) => lead.id === selection.id) ?? null : null;
  const selectedClient = selection?.type === "client" ? data.clients.find((client) => client.id === selection.id) ?? null : null;
  const selectedEntity = selectedLead ?? selectedClient;
  const selectedLeadId = selectedLead?.id ?? selectedClient?.leadId ?? null;
  const selectedClientId = selectedClient?.id ?? null;
  const selectedNotes = data.notes.filter((note) => note.leadId === selectedLeadId || note.clientId === selectedClientId);
  const selectedTasks = data.tasks.filter((task) => task.leadId === selectedLeadId || task.clientId === selectedClientId);
  const selectedActivities = data.activities.filter((activity) => activity.leadId === selectedLeadId || activity.clientId === selectedClientId);

  function openLeadModal() {
    setDraft(emptyDraft);
    setLeadModalOpen(true);
  }

  function openClientModal() {
    setDraft({ ...emptyDraft, company: "Nouveau client", tags: "Client, Onboarding" });
    setClientModalOpen(true);
  }

  function createLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const lead = {
      ...buildNewLead(data.leads.length),
      name: draft.name,
      company: draft.company,
      email: draft.email,
      phone: draft.phone,
      potentialAmount: Number(draft.amount),
      tags: draft.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
    };

    mutate(
      (current) => ({
        ...current,
        leads: [lead, ...current.leads],
        activities: [
          createActivity({ leadId: lead.id, clientId: null, type: "status", title: "Prospect cree", detail: "Creation depuis la modale CRM." }),
          ...current.activities
        ]
      }),
      { title: "Prospect cree", detail: `${lead.company} est ajoute au pipeline.` }
    );
    setSelection({ type: "lead", id: lead.id });
    setLeadModalOpen(false);
  }

  function createClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const now = new Date().toISOString();
    const client: CrmClient = {
      id: createCrmId("client"),
      leadId: null,
      name: draft.name,
      company: draft.company,
      email: draft.email,
      phone: draft.phone,
      tags: draft.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      lifetimeValue: Number(draft.amount),
      status: "active",
      createdAt: now,
      updatedAt: now
    };

    mutate(
      (current) => ({
        ...current,
        clients: [client, ...current.clients],
        activities: [
          createActivity({ leadId: null, clientId: client.id, type: "client", title: "Client cree", detail: "Creation directe depuis CENTRIX CRM." }),
          ...current.activities
        ]
      }),
      { title: "Client cree", detail: `${client.company} est ajoute a la base clients.` }
    );
    setSelection({ type: "client", id: client.id });
    setClientModalOpen(false);
  }

  function moveLead(status: CrmStatus) {
    if (!draggedLeadId) return;

    mutate(
      (current) => ({
        ...current,
        leads: current.leads.map((lead) =>
          lead.id === draggedLeadId ? { ...lead, status, updatedAt: new Date().toISOString() } : lead
        ),
        activities: [
          createActivity({
            leadId: draggedLeadId,
            clientId: null,
            type: "status",
            title: "Pipeline mis a jour",
            detail: `Statut commercial passe a ${statusLabels[status]}.`
          }),
          ...current.activities
        ]
      }),
      { title: "Pipeline mis a jour", detail: `Statut: ${statusLabels[status]}` }
    );
    setSelection({ type: "lead", id: draggedLeadId });
    setDraggedLeadId(null);
  }

  function convertSelectedLead() {
    if (!selectedLead) return;
    const client = buildClientFromLead(selectedLead);

    mutate(
      (current) => ({
        ...current,
        leads: current.leads.map((lead) => (lead.id === selectedLead.id ? { ...lead, status: "won", updatedAt: new Date().toISOString() } : lead)),
        clients: [client, ...current.clients],
        activities: [
          createActivity({ leadId: selectedLead.id, clientId: client.id, type: "client", title: "Conversion client", detail: `${selectedLead.company} converti en client.` }),
          ...current.activities
        ]
      }),
      { title: "Client cree", detail: `${client.company} est maintenant client.` }
    );
    setSelection({ type: "client", id: client.id });
  }

  function addNote() {
    if (!selectedEntity || !noteDraft.trim()) return;
    const note = buildNote(selectedLeadId, selectedClientId, noteDraft.trim());

    mutate(
      (current) => ({
        ...current,
        notes: [note, ...current.notes],
        activities: [
          createActivity({ leadId: selectedLeadId, clientId: selectedClientId, type: "note", title: "Note ajoutee", detail: note.body }),
          ...current.activities
        ]
      }),
      { title: "Note ajoutee", detail: "La fiche a ete mise a jour." }
    );
    setNoteDraft("");
  }

  function addTask() {
    if (!selectedEntity || !taskDraft.trim()) return;
    const task = buildTask(selectedLeadId, selectedClientId, taskDraft.trim());

    mutate(
      (current) => ({
        ...current,
        tasks: [task, ...current.tasks],
        activities: [
          createActivity({ leadId: selectedLeadId, clientId: selectedClientId, type: "task", title: "Rappel ajoute", detail: task.title }),
          ...current.activities
        ]
      }),
      { title: "Rappel ajoute", detail: task.title }
    );
    setTaskDraft("");
  }

  function toggleTask(taskId: string) {
    mutate((current) => ({
      ...current,
      tasks: current.tasks.map((task) => (task.id === taskId ? { ...task, done: !task.done } : task))
    }));
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
        <Skeleton className="h-36" />
        <section className="grid gap-4 md:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-28" />
          ))}
        </section>
        <Skeleton className="h-[520px]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      {toast ? <Toast title={toast.title} detail={toast.detail} /> : null}

      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.06] px-3 py-2 text-xs uppercase tracking-[0.18em] text-cyan-200">
            <Sparkles size={14} />
            CRM SaaS
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-normal text-white sm:text-5xl">CRM</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Pipeline commercial, prospects, clients, notes, rappels et activites temps reel dans une experience premium.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={openLeadModal} variant="primary">
            <Plus size={17} />
            Prospect
          </Button>
          <Button onClick={openClientModal}>
            <UsersRound size={17} />
            Client
          </Button>
          <Button onClick={sync}>
            <CheckCircle2 size={17} />
            {mode === "supabase" ? "Sync Supabase" : "Sauver local"}
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CrmStat label="Pipeline ouvert" value={formatCrmCurrency(dashboard.pipelineValue)} icon={<BriefcaseBusiness size={19} />} />
        <CrmStat label="Forecast pondere" value={formatCrmCurrency(dashboard.weighted)} icon={<CircleDollarSign size={19} />} />
        <CrmStat label="Revenu gagne" value={formatCrmCurrency(dashboard.won)} icon={<CheckCircle2 size={19} />} />
        <CrmStat label="Rappels actifs" value={String(dashboard.activeTasks)} icon={<BellRing size={19} />} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[220px_1fr]">
        <Card className="h-fit p-3">
          <nav className="space-y-1">
            {crmSidebar.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`flex h-11 w-full items-center gap-3 rounded-[8px] px-3 text-sm font-medium transition-all duration-200 ${
                    view === item.id ? "bg-white/12 text-white shadow-glow" : "text-slate-400 hover:bg-white/8 hover:text-white"
                  }`}
                  onClick={() => setView(item.id)}
                >
                  <Icon size={17} />
                  {item.label}
                </button>
              );
            })}
          </nav>
          <div className="mt-4 rounded-[8px] border border-cyan-200/20 bg-cyan-300/10 p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-100">Realtime</p>
            <p className="mt-1 text-sm text-slate-300">{mode === "supabase" ? "Connecte Supabase" : "Mode local fallback"}</p>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-4">
            <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px]">
              <label className="flex h-11 items-center gap-3 rounded-[8px] border border-white/10 bg-white/[0.06] px-3 text-sm text-slate-400">
                <Search size={17} />
                <input
                  className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                  placeholder="Recherche dynamique: nom, entreprise, email, tags..."
                  value={filters.query}
                  onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
                />
              </label>
              <label className="flex h-11 items-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.06] px-3 text-sm text-slate-400">
                <Filter size={16} />
                <select
                  className="w-full bg-slate-950/80 text-white outline-none"
                  value={filters.status}
                  onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as CrmFilters["status"] }))}
                >
                  <option value="all">Tous statuts</option>
                  {crmStages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </label>
              <select
                className="h-11 rounded-[8px] border border-white/10 bg-slate-950/80 px-3 text-sm text-white outline-none"
                value={filters.priority}
                onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value as CrmFilters["priority"] }))}
              >
                <option value="all">Toutes priorites</option>
                <option value="high">Haute</option>
                <option value="medium">Moyenne</option>
                <option value="low">Faible</option>
              </select>
            </div>
          </Card>

          {view === "pipeline" ? (
            <PipelineView
              draggedLeadId={draggedLeadId}
              leads={filteredLeads}
              selectedLeadId={selectedLead?.id ?? ""}
              setDraggedLeadId={setDraggedLeadId}
              moveLead={moveLead}
              selectLead={(id) => setSelection({ type: "lead", id })}
            />
          ) : null}

          {view === "clients" ? (
            <ClientsView clients={filteredClients} selectClient={(id) => setSelection({ type: "client", id })} selectedClientId={selectedClient?.id ?? ""} />
          ) : null}

          {view === "table" ? (
            <LeadsTable leads={filteredLeads} selectLead={(id) => setSelection({ type: "lead", id })} />
          ) : null}

          <DetailPanel
            activities={selectedActivities}
            addNote={addNote}
            addTask={addTask}
            client={selectedClient}
            convertLead={convertSelectedLead}
            lead={selectedLead}
            noteDraft={noteDraft}
            notes={selectedNotes}
            setNoteDraft={setNoteDraft}
            setTaskDraft={setTaskDraft}
            taskDraft={taskDraft}
            tasks={selectedTasks}
            toggleTask={toggleTask}
          />
        </div>
      </section>

      <CreateEntityModal draft={draft} open={leadModalOpen} setDraft={setDraft} title="Creer un prospect" onClose={() => setLeadModalOpen(false)} onSubmit={createLead} />
      <CreateEntityModal draft={draft} open={clientModalOpen} setDraft={setDraft} title="Creer un client" onClose={() => setClientModalOpen(false)} onSubmit={createClient} />
    </div>
  );
}

function CrmStat({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <Card className="p-5" interactive>
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{label}</p>
        <span className="grid h-9 w-9 place-items-center rounded-[8px] bg-cyan-300/10 text-cyan-100">{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
    </Card>
  );
}

function PipelineView({
  leads,
  selectedLeadId,
  setDraggedLeadId,
  moveLead,
  selectLead
}: {
  draggedLeadId: string | null;
  leads: CrmLead[];
  selectedLeadId: string;
  setDraggedLeadId: (id: string | null) => void;
  moveLead: (status: CrmStatus) => void;
  selectLead: (id: string) => void;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-6">
      {crmStages.map((stage) => {
        const stageLeads = leads.filter((lead) => lead.status === stage.id);
        const stageValue = stageLeads.reduce((sum, lead) => sum + lead.potentialAmount, 0);

        return (
          <Card
            key={stage.id}
            className="min-h-[300px] p-3"
            onDragOver={(event: DragEvent<HTMLElement>) => event.preventDefault()}
            onDrop={() => moveLead(stage.id)}
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-white">{stage.label}</h2>
                <p className="mt-1 text-xs text-slate-500">{stage.hint}</p>
              </div>
              <Badge tone={statusTone(stage.id)}>{stageLeads.length}</Badge>
            </div>
            <p className="mb-3 text-xs font-semibold text-cyan-100">{formatCrmCurrency(stageValue)}</p>
            <div className="space-y-3">
              {stageLeads.length ? (
                stageLeads.map((lead) => (
                  <button
                    key={lead.id}
                    draggable
                    className={`w-full rounded-[8px] border p-3 text-left transition-all duration-200 ${
                      lead.id === selectedLeadId
                        ? "border-cyan-200/50 bg-cyan-300/10 shadow-glow"
                        : "border-white/10 bg-white/[0.045] hover:-translate-y-0.5 hover:bg-white/[0.08]"
                    }`}
                    onClick={() => selectLead(lead.id)}
                    onDragEnd={() => setDraggedLeadId(null)}
                    onDragStart={() => setDraggedLeadId(lead.id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-white">{lead.company}</span>
                      <Badge tone={priorityTone(lead.priority)}>{priorityLabels[lead.priority]}</Badge>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">{lead.name}</p>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="font-semibold text-cyan-100">{formatCrmCurrency(lead.potentialAmount)}</span>
                      <span className="text-slate-500">{lead.probability}%</span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-gradient-to-r from-cyan-200 via-violet-300 to-emerald-200" style={{ width: `${lead.probability}%` }} />
                    </div>
                  </button>
                ))
              ) : (
                <EmptyState icon={<BriefcaseBusiness size={18} />} title="Aucun deal" detail="Glissez un prospect ici." />
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function ClientsView({ clients, selectedClientId, selectClient }: { clients: CrmClient[]; selectedClientId: string; selectClient: (id: string) => void }) {
  if (!clients.length) {
    return <EmptyState icon={<UsersRound size={18} />} title="Aucun client" detail="Creez un client ou convertissez un prospect gagne." />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {clients.map((client) => (
        <Card key={client.id} className={`p-5 ${client.id === selectedClientId ? "border-cyan-200/40" : ""}`} interactive>
          <button className="w-full text-left" onClick={() => selectClient(client.id)}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white">{client.company}</h3>
                <p className="mt-1 text-sm text-slate-400">{client.name}</p>
              </div>
              <Badge tone={client.status === "at_risk" ? "rose" : "emerald"}>{client.status}</Badge>
            </div>
            <p className="mt-4 text-2xl font-semibold text-cyan-100">{formatCrmCurrency(client.lifetimeValue)}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {client.tags.map((tag) => (
                <Badge key={tag} tone="violet">
                  {tag}
                </Badge>
              ))}
            </div>
          </button>
        </Card>
      ))}
    </div>
  );
}

function LeadsTable({ leads, selectLead }: { leads: CrmLead[]; selectLead: (id: string) => void }) {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.16em] text-slate-500">
            <tr>
              <th className="px-5 py-4 font-medium">Entreprise</th>
              <th className="px-5 py-4 font-medium">Contact</th>
              <th className="px-5 py-4 font-medium">Statut</th>
              <th className="px-5 py-4 font-medium">Montant</th>
              <th className="px-5 py-4 font-medium">Owner</th>
              <th className="px-5 py-4 font-medium">Tags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-slate-300">
            {leads.map((lead) => (
              <tr key={lead.id} className="cursor-pointer transition-colors hover:bg-white/[0.045]" onClick={() => selectLead(lead.id)}>
                <td className="px-5 py-4 font-semibold text-white">{lead.company}</td>
                <td className="px-5 py-4">{lead.name}</td>
                <td className="px-5 py-4">
                  <Badge tone={statusTone(lead.status)}>{statusLabels[lead.status]}</Badge>
                </td>
                <td className="px-5 py-4">{formatCrmCurrency(lead.potentialAmount)}</td>
                <td className="px-5 py-4">{lead.owner}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1">
                    {lead.tags.map((tag) => (
                      <span key={tag} className="rounded-[6px] bg-white/[0.06] px-2 py-1 text-xs text-slate-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function DetailPanel({
  lead,
  client,
  notes,
  tasks,
  activities,
  noteDraft,
  taskDraft,
  setNoteDraft,
  setTaskDraft,
  addNote,
  addTask,
  toggleTask,
  convertLead
}: {
  lead: CrmLead | null;
  client: CrmClient | null;
  notes: ReturnType<typeof buildNote>[];
  tasks: ReturnType<typeof buildTask>[];
  activities: ReturnType<typeof createActivity>[];
  noteDraft: string;
  taskDraft: string;
  setNoteDraft: (value: string) => void;
  setTaskDraft: (value: string) => void;
  addNote: () => void;
  addTask: () => void;
  toggleTask: (id: string) => void;
  convertLead: () => void;
}) {
  const entity = lead ?? client;

  if (!entity) {
    return <EmptyState icon={<UserRound size={18} />} title="Aucune fiche selectionnee" detail="Selectionnez un prospect ou client." />;
  }

  return (
    <Card className="p-5">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">{entity.company}</h2>
              <p className="mt-1 text-sm text-slate-400">{entity.name}</p>
            </div>
            {lead ? <Badge tone={statusTone(lead.status)}>{statusLabels[lead.status]}</Badge> : <Badge tone="emerald">Client</Badge>}
          </div>

          <div className="mt-5 grid gap-3 text-sm text-slate-300">
            <span className="flex items-center gap-3">
              <Mail size={17} className="text-cyan-200" />
              {entity.email}
            </span>
            <span className="flex items-center gap-3">
              <UserRound size={17} className="text-cyan-200" />
              {entity.phone}
            </span>
            <span className="flex items-center gap-3">
              <CircleDollarSign size={17} className="text-cyan-200" />
              {formatCrmCurrency(lead ? lead.potentialAmount : client?.lifetimeValue ?? 0)}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {entity.tags.map((tag) => (
              <Badge key={tag} tone="violet">
                {tag}
              </Badge>
            ))}
          </div>

          {lead ? (
            <Button className="mt-5 w-full" onClick={convertLead} variant="primary">
              <UsersRound size={17} />
              Convertir en client
            </Button>
          ) : null}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <PanelSection icon={<StickyNote size={17} />} title="Notes">
            <div className="flex gap-2">
              <input className="h-10 min-w-0 flex-1 rounded-[8px] border border-white/10 bg-white/[0.06] px-3 text-sm text-white outline-none" placeholder="Note interne..." value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} />
              <Button className="h-10 px-3" onClick={addNote}>
                <Plus size={16} />
              </Button>
            </div>
            <div className="mt-3 space-y-2">
              {notes.length ? notes.map((note) => <MiniItem key={note.id} title={note.body} detail={formatCrmDate(note.createdAt)} />) : <p className="text-sm text-slate-500">Aucune note.</p>}
            </div>
          </PanelSection>

          <PanelSection icon={<BellRing size={17} />} title="Rappels">
            <div className="flex gap-2">
              <input className="h-10 min-w-0 flex-1 rounded-[8px] border border-white/10 bg-white/[0.06] px-3 text-sm text-white outline-none" placeholder="Rappel..." value={taskDraft} onChange={(event) => setTaskDraft(event.target.value)} />
              <Button className="h-10 px-3" onClick={addTask}>
                <Plus size={16} />
              </Button>
            </div>
            <div className="mt-3 space-y-2">
              {tasks.length ? (
                tasks.map((task) => (
                  <button key={task.id} className="w-full text-left" onClick={() => toggleTask(task.id)}>
                    <MiniItem detail={formatCrmDate(task.dueDate)} title={task.done ? `${task.title} · fait` : task.title} />
                  </button>
                ))
              ) : (
                <p className="text-sm text-slate-500">Aucun rappel.</p>
              )}
            </div>
          </PanelSection>

          <div className="lg:col-span-2">
            <PanelSection icon={<History size={17} />} title="Historique interactions">
              <div className="space-y-2">
                {activities.length ? (
                  activities.map((activity) => <MiniItem key={activity.id} title={activity.title} detail={`${formatCrmDate(activity.createdAt)} · ${activity.detail}`} />)
                ) : (
                  <p className="text-sm text-slate-500">Aucune interaction.</p>
                )}
              </div>
            </PanelSection>
          </div>
        </div>
      </div>
    </Card>
  );
}

function PanelSection({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="rounded-[8px] border border-white/10 bg-white/[0.035] p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
        <span className="text-cyan-200">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function MiniItem({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-[8px] border border-white/10 bg-white/[0.045] p-3">
      <p className="text-sm text-slate-200">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function CreateEntityModal({
  title,
  open,
  draft,
  setDraft,
  onSubmit,
  onClose
}: {
  title: string;
  open: boolean;
  draft: Draft;
  setDraft: (draft: Draft) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Nom" value={draft.name} onChange={(value) => setDraft({ ...draft, name: value })} />
          <Input label="Entreprise" value={draft.company} onChange={(value) => setDraft({ ...draft, company: value })} />
          <Input label="Email" value={draft.email} onChange={(value) => setDraft({ ...draft, email: value })} />
          <Input label="Telephone" value={draft.phone} onChange={(value) => setDraft({ ...draft, phone: value })} />
          <Input label="Montant potentiel" type="number" value={String(draft.amount)} onChange={(value) => setDraft({ ...draft, amount: Number(value) })} />
          <Input label="Tags" value={draft.tags} onChange={(value) => setDraft({ ...draft, tags: value })} />
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={onClose} type="button" variant="ghost">
            Annuler
          </Button>
          <Button type="submit" variant="primary">
            Creer
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; type?: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-2">
      <span className="text-xs text-slate-500">{label}</span>
      <input
        className="h-10 w-full rounded-[8px] border border-white/10 bg-white/[0.06] px-3 text-sm text-white outline-none transition focus:border-cyan-200/50"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
