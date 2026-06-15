"use client";

import { Archive, Bot, Download, FileDown, Filter, History, Pencil, Plus, Search, Sparkles, Trash2, Upload } from "lucide-react";
import { cloneElement, type ChangeEvent, type FormEvent, type ReactElement } from "react";
import { useMemo, useRef, useState } from "react";
import { downloadCsvFile } from "@/lib/download";
import { useOperationalModule } from "@/hooks/operations/useOperationalModule";
import type { OperationalModuleConfig, OperationalRecord, OperationalRecordDraft, OperationalStatus } from "@/types/operations";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { EmptyState } from "@/ui/EmptyState";
import { MetricCard } from "@/ui/MetricCard";
import { Modal } from "@/ui/Modal";
import { Skeleton } from "@/ui/Skeleton";
import { Toast } from "@/ui/Toast";

const emptyDraft: OperationalRecordDraft = {
  amount: 0,
  description: "",
  due_at: null,
  owner_name: "",
  priority: "medium",
  record_type: "",
  status: "active",
  tags: [],
  title: ""
};

const statusLabels: Record<OperationalStatus, string> = {
  active: "Actif",
  archived: "Archive",
  completed: "Termine",
  draft: "Brouillon",
  pending: "En attente"
};

export function OperationalModuleWorkspace({ config }: { config: OperationalModuleConfig }) {
  const { create, history, loading, message, mode, records, remove, update } = useOperationalModule(config.key);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OperationalStatus | "all">("all");
  const [draft, setDraft] = useState<OperationalRecordDraft>({ ...emptyDraft, record_type: config.recordTypes[0] ?? "General" });
  const [editing, setEditing] = useState<OperationalRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return records.filter((record) => {
      const matchesQuery = !normalized || [record.title, record.description, record.record_type, record.owner_name, ...record.tags].join(" ").toLowerCase().includes(normalized);
      return matchesQuery && (status === "all" || record.status === status);
    });
  }, [query, records, status]);
  const active = records.filter((record) => record.status === "active").length;
  const urgent = records.filter((record) => record.priority === "critical" || record.priority === "high").length;
  const total = records.reduce((sum, record) => sum + Number(record.amount || 0), 0);

  function openCreate() {
    setEditing(null);
    setDraft({ ...emptyDraft, record_type: config.recordTypes[0] ?? "General" });
    setModalOpen(true);
  }

  function openEdit(record: OperationalRecord) {
    setEditing(record);
    setDraft({
      amount: record.amount,
      description: record.description,
      due_at: record.due_at,
      owner_name: record.owner_name,
      priority: record.priority,
      record_type: record.record_type,
      status: record.status,
      tags: record.tags,
      title: record.title
    });
    setModalOpen(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.title.trim()) return;
    if (editing) await update(editing.id, draft);
    else await create(draft);
    setModalOpen(false);
  }

  function exportRows() {
    downloadCsvFile(`${config.key}-${new Date().toISOString().slice(0, 10)}.csv`, [
      ["Titre", "Type", "Statut", "Priorite", "Responsable", "Echeance", "Montant", "Tags", "Description"],
      ...filtered.map((record) => [record.title, record.record_type, record.status, record.priority, record.owner_name, record.due_at, record.amount, record.tags.join(","), record.description])
    ]);
  }

  async function importCsv(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const lines = (await file.text()).split(/\r?\n/).filter(Boolean);
    const separator = lines[0]?.includes(";") ? ";" : ",";
    for (const line of lines.slice(1)) {
      const cells = line.split(separator).map((cell) => cell.replace(/^"|"$/g, "").trim());
      if (!cells[0]) continue;
      await create({
        amount: Number(cells[6] ?? 0),
        description: cells[8] ?? "",
        due_at: cells[5] || null,
        owner_name: cells[4] ?? "",
        priority: ["low", "medium", "high", "critical"].includes(cells[3]) ? cells[3] as OperationalRecordDraft["priority"] : "medium",
        record_type: cells[1] || config.recordTypes[0] || "General",
        status: ["draft", "active", "pending", "completed", "archived"].includes(cells[2]) ? cells[2] as OperationalStatus : "active",
        tags: cells[7] ? cells[7].split(",").map((tag) => tag.trim()).filter(Boolean) : [],
        title: cells[0]
      });
    }
    event.target.value = "";
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      {message ? <Toast detail={message} title={config.title} /> : null}
      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.15em] text-blue-700">
            <Sparkles size={14} />
            {config.eyebrow}
          </div>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl">{config.title}</h1>
          <p className="mt-3 max-w-3xl text-base font-medium leading-7 text-slate-600">{config.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input accept=".csv,text/csv" className="hidden" onChange={importCsv} ref={importRef} type="file" />
          <Button onClick={() => importRef.current?.click()}><Upload size={17} /> Import CSV</Button>
          <Button onClick={exportRows}><Download size={17} /> Export Excel</Button>
          <Button onClick={() => window.print()}><FileDown size={17} /> Export PDF</Button>
          <Button onClick={openCreate} variant="primary"><Plus size={17} /> Ajouter</Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard metric={{ delta: mode === "supabase" ? "Cloud" : "Local", label: "Elements", tone: "cyan", value: String(records.length) }} />
        <MetricCard metric={{ delta: "En cours", label: "Actifs", tone: "emerald", value: String(active) }} />
        <MetricCard metric={{ delta: "A traiter", label: "Prioritaires", tone: "rose", value: String(urgent) }} />
        <MetricCard metric={{ delta: "Valeur suivie", label: "Montant", tone: "violet", value: new Intl.NumberFormat("fr-FR", { notation: "compact", style: "currency", currency: "EUR" }).format(total) }} />
      </section>

      <section className="grid gap-6 2xl:grid-cols-[1fr_340px]">
        <Card className="min-w-0">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row">
            <label className="flex h-11 flex-1 items-center gap-2 rounded-[13px] border border-slate-200 bg-white px-3 text-slate-500 focus-within:border-blue-400">
              <Search size={17} />
              <input className="w-full border-0 bg-transparent text-sm font-semibold text-slate-900 outline-none" onChange={(event) => setQuery(event.target.value)} placeholder={`Rechercher un ${config.recordLabel}...`} value={query} />
            </label>
            <label className="flex h-11 items-center gap-2 rounded-[13px] border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600">
              <Filter size={16} />
              <select className="border-0 bg-transparent outline-none" onChange={(event) => setStatus(event.target.value as OperationalStatus | "all")} value={status}>
                <option value="all">Tous les statuts</option>
                {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
          </div>
          {loading ? <div className="space-y-3 p-5"><Skeleton className="h-16" /><Skeleton className="h-16" /><Skeleton className="h-16" /></div> : null}
          {!loading && !filtered.length ? <div className="p-5"><EmptyState detail={`Ajoutez votre premier ${config.recordLabel} pour commencer.`} icon={<Archive size={20} />} title="Aucune donnee" /></div> : null}
          {!loading && filtered.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                  <tr><th className="px-5 py-4">Element</th><th className="px-5 py-4">Type</th><th className="px-5 py-4">Responsable</th><th className="px-5 py-4">Statut</th><th className="px-5 py-4">Echeance</th><th className="px-5 py-4 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((record) => (
                    <tr className="transition-colors hover:bg-blue-50/60" key={record.id}>
                      <td className="px-5 py-4"><p className="font-black text-slate-950">{record.title}</p><p className="mt-1 max-w-sm truncate text-xs font-medium text-slate-500">{record.description || "Aucune description"}</p></td>
                      <td className="px-5 py-4 font-semibold text-slate-600">{record.record_type}</td>
                      <td className="px-5 py-4 font-semibold text-slate-600">{record.owner_name || "Non assigne"}</td>
                      <td className="px-5 py-4"><Badge tone={record.status === "completed" ? "emerald" : record.priority === "critical" ? "rose" : "cyan"}>{statusLabels[record.status]}</Badge></td>
                      <td className="px-5 py-4 font-semibold text-slate-600">{record.due_at ? new Intl.DateTimeFormat("fr-FR").format(new Date(record.due_at)) : "A definir"}</td>
                      <td className="px-5 py-4"><div className="flex justify-end gap-1"><Button aria-label="Modifier" className="h-9 w-9 px-0" onClick={() => openEdit(record)} variant="ghost"><Pencil size={16} /></Button><Button aria-label="Supprimer" className="h-9 w-9 px-0 text-rose-600" onClick={() => void remove(record)} variant="ghost"><Trash2 size={16} /></Button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </Card>

        <div className="space-y-5">
          <Card className="p-5">
            <div className="flex items-center gap-2"><Bot className="text-blue-600" size={19} /><h2 className="font-black text-slate-950">IA CENTRIX</h2></div>
            <div className="mt-4 space-y-3">
              {config.suggestions.map((suggestion, index) => <div className="rounded-[14px] border border-blue-100 bg-blue-50 p-3" key={suggestion}><p className="text-xs font-black uppercase tracking-[0.12em] text-blue-600">Recommandation {index + 1}</p><p className="mt-1 text-sm font-bold leading-5 text-slate-800">{suggestion}</p></div>)}
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-2"><History className="text-blue-600" size={19} /><h2 className="font-black text-slate-950">Historique</h2></div>
            <div className="mt-4 space-y-3">
              {history.slice(0, 6).map((item) => <div className="border-l-2 border-blue-200 pl-3" key={item.id}><p className="text-sm font-bold text-slate-800">{item.detail}</p><p className="mt-1 text-xs font-semibold text-slate-500">{new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(new Date(item.created_at))}</p></div>)}
              {!history.length ? <p className="text-sm font-semibold text-slate-500">Les prochaines actions apparaitront ici.</p> : null}
            </div>
          </Card>
        </div>
      </section>

      <Modal onClose={() => setModalOpen(false)} open={modalOpen} title={editing ? `Modifier le ${config.recordLabel}` : `Ajouter un ${config.recordLabel}`}>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
          <Field label="Titre"><input required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></Field>
          <Field label="Type"><select value={draft.record_type} onChange={(event) => setDraft({ ...draft, record_type: event.target.value })}>{config.recordTypes.map((type) => <option key={type}>{type}</option>)}</select></Field>
          <Field label="Statut"><select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as OperationalStatus })}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
          <Field label="Priorite"><select value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value as OperationalRecordDraft["priority"] })}><option value="low">Faible</option><option value="medium">Moyenne</option><option value="high">Haute</option><option value="critical">Critique</option></select></Field>
          <Field label="Responsable"><input value={draft.owner_name} onChange={(event) => setDraft({ ...draft, owner_name: event.target.value })} /></Field>
          <Field label="Echeance"><input type="date" value={draft.due_at ?? ""} onChange={(event) => setDraft({ ...draft, due_at: event.target.value || null })} /></Field>
          <Field label="Montant"><input min="0" step="0.01" type="number" value={draft.amount} onChange={(event) => setDraft({ ...draft, amount: Number(event.target.value) })} /></Field>
          <Field label="Tags"><input value={draft.tags.join(", ")} onChange={(event) => setDraft({ ...draft, tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean) })} /></Field>
          <Field className="sm:col-span-2" label="Description"><textarea rows={4} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></Field>
          <div className="flex justify-end gap-2 sm:col-span-2"><Button onClick={() => setModalOpen(false)} type="button">Annuler</Button><Button type="submit" variant="primary">{editing ? "Enregistrer" : "Ajouter"}</Button></div>
        </form>
      </Modal>
    </div>
  );
}

function Field({ children, className = "", label }: { children: ReactElement<{ className?: string }>; className?: string; label: string }) {
  const controlClass = `w-full rounded-[13px] border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 ${children.props.className ?? ""}`;
  return <label className={`grid gap-2 text-sm font-black text-slate-700 ${className}`}><span>{label}</span>{cloneElement(children, { className: controlClass })}</label>;
}
