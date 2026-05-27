"use client";

import dynamic from "next/dynamic";
import { AlertTriangle, Bot, CheckCircle2, GitBranch, Play, Plus, Save, Sparkles, TimerReset, Workflow, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { formatDuration, formatWorkflowDate } from "@/lib/workflows/format";
import { blockLabels, createBlock, createWorkflow, getWorkflowDashboard } from "@/services/workflows/calculations";
import { useWorkflowData } from "@/hooks/workflows/useWorkflowData";
import { WorkflowKpiCard } from "@/ui/workflows/WorkflowKpiCard";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Skeleton } from "@/ui/Skeleton";
import { Toast } from "@/ui/Toast";
import type { BlockType, WorkflowRun } from "@/types/workflows";

const WorkflowCanvas = dynamic(() => import("@/components/workflows/WorkflowCanvas").then((module) => module.WorkflowCanvas), {
  loading: () => <Skeleton className="h-[560px]" />,
  ssr: false
});
const WorkflowCharts = dynamic(() => import("@/components/workflows/WorkflowCharts").then((module) => module.WorkflowCharts), {
  loading: () => <Skeleton className="h-80" />,
  ssr: false
});

const blockTypes: BlockType[] = ["trigger", "action", "condition", "delay", "ai", "notification", "filter"];
const views = ["dashboard", "builder", "templates", "runs", "tasks", "alerts"] as const;
type View = (typeof views)[number];

export function WorkflowWorkspace({ initialView = "dashboard" }: { initialView?: View }) {
  const { data, loading, mode, toast, mutate, sync, notify } = useWorkflowData();
  const [view, setView] = useState<View>(initialView);
  const [selectedId, setSelectedId] = useState(data.workflows[0]?.id ?? "wf-1");
  const dashboard = useMemo(() => getWorkflowDashboard(data), [data]);
  const selected = data.workflows.find((workflow) => workflow.id === selectedId) ?? data.workflows[0];
  const blocks = data.blocks.filter((block) => block.workflowId === selected?.id);
  const connections = data.connections.filter((connection) => connection.workflowId === selected?.id);

  function addWorkflow() {
    const workflow = createWorkflow();
    mutate((current) => ({ ...current, workflows: [workflow, ...current.workflows] }), { title: "Workflow cree", detail: "Nouveau scenario ajoute au builder." });
    setSelectedId(workflow.id);
  }

  function addBlock(type: BlockType) {
    if (!selected) return;
    const block = createBlock(selected.id, type);
    mutate((current) => ({ ...current, blocks: [...current.blocks, block] }), { title: "Bloc ajoute", detail: `${blockLabels[type]} ajoute au canvas.` });
  }

  function runWorkflow() {
    if (!selected) return;
    const run: WorkflowRun = {
      id: `run-${crypto.randomUUID()}`,
      workflowId: selected.id,
      status: "success",
      durationMs: 1200 + Math.round(Math.random() * 1800),
      message: `${selected.name} execute avec succes.`,
      createdAt: new Date().toISOString()
    };
    mutate((current) => ({
      ...current,
      workflows: current.workflows.map((workflow) => workflow.id === selected.id ? { ...workflow, runs: workflow.runs + 1, updatedAt: new Date().toISOString() } : workflow),
      runs: [run, ...current.runs]
    }), { title: "Workflow execute", detail: run.message });
  }

  async function suggestAutomation() {
    try {
      const response = await fetch("/api/workflows/suggest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workflows: data.workflows, alerts: data.alerts }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      notify(payload.title ?? "Suggestion IA", payload.detail ?? "Nouvelle recommandation workflow disponible.");
    } catch (error) {
      notify("OpenAI non configure", error instanceof Error ? error.message : "Ajoutez OPENAI_API_KEY pour activer les suggestions IA.");
    }
  }

  if (loading) return <div className="mx-auto max-w-7xl space-y-6 animate-fade-in"><Skeleton className="h-36" /><Skeleton className="h-[560px]" /></div>;

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      {toast ? <Toast {...toast} /> : null}
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Badge tone="cyan">Workflow Automation</Badge>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">Automatisations & Productivite</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">Builder visuel React Flow pour orchestrer CRM, facturation, support, marketing, IA, notifications et processus enterprise.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={addWorkflow}><Plus size={17} /> Workflow</Button>
            <Button onClick={suggestAutomation} variant="surface"><Bot size={17} /> Suggestion IA</Button>
            <Button onClick={sync} variant="primary"><Save size={17} /> Sync {mode}</Button>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <WorkflowKpiCard delta="actifs" icon={<Workflow size={19} />} label="Workflows actifs" value={String(dashboard.activeWorkflows)} />
        <WorkflowKpiCard delta="runs" icon={<Play size={19} />} label="Executions" value={String(dashboard.runs)} />
        <WorkflowKpiCard delta="heures" icon={<TimerReset size={19} />} label="Temps gagne" value={`${dashboard.timeSaved}h`} />
        <WorkflowKpiCard delta="incidents" icon={<AlertTriangle size={19} />} label="Erreurs" value={String(dashboard.errors)} />
        <WorkflowKpiCard delta="taches" icon={<CheckCircle2 size={19} />} label="Taches automatisees" value={String(dashboard.automatedTasks)} />
        <WorkflowKpiCard delta="global" icon={<Zap size={19} />} label="Productivite" value={`${Math.round(dashboard.productivity)}%`} />
      </section>

      <div className="flex gap-2 overflow-x-auto rounded-[14px] border border-slate-200 bg-white/70 p-1 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
        {views.map((item) => <button key={item} className={`h-10 shrink-0 rounded-[12px] px-3 text-sm font-semibold capitalize transition-all ${view === item ? "bg-blue-600 text-white shadow-[0_12px_28px_rgba(37,99,235,0.22)]" : "text-slate-500 hover:bg-blue-50 hover:text-blue-700"}`} onClick={() => setView(item)}>{item}</button>)}
      </div>

      {view === "dashboard" ? <><WorkflowCharts data={data} /><ActivityGrid data={data} /></> : null}

      {view === "builder" ? (
        <section className="grid gap-4 xl:grid-cols-[280px_1fr]">
          <Card className="p-4">
            <h2 className="font-black text-slate-950">Workflows</h2>
            <div className="mt-4 space-y-2">{data.workflows.map((workflow) => <button key={workflow.id} className={`w-full rounded-[12px] px-3 py-2 text-left text-sm font-semibold transition ${selected?.id === workflow.id ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-blue-50"}`} onClick={() => setSelectedId(workflow.id)}>{workflow.name}</button>)}</div>
            <h3 className="mt-6 text-sm font-black uppercase tracking-[0.14em] text-slate-400">Blocs</h3>
            <div className="mt-3 grid gap-2">{blockTypes.map((type) => <Button key={type} className="justify-start" onClick={() => addBlock(type)} variant="surface"><GitBranch size={15} /> {blockLabels[type]}</Button>)}</div>
          </Card>
          <Card className="p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div><p className="font-black text-slate-950">{selected?.name}</p><p className="text-sm text-slate-500">{selected?.description}</p></div>
              <Button onClick={runWorkflow}><Play size={17} /> Tester</Button>
            </div>
            <WorkflowCanvas blocks={blocks} connections={connections} />
          </Card>
        </section>
      ) : null}

      {view === "templates" ? <TemplateGrid data={data} /> : null}
      {view === "runs" ? <RunsTable data={data} /> : null}
      {view === "tasks" ? <TasksGrid data={data} /> : null}
      {view === "alerts" ? <AlertsGrid data={data} /> : null}
    </div>
  );
}

function ActivityGrid({ data }: { data: ReturnType<typeof useWorkflowData>["data"] }) {
  return <section className="grid gap-3 md:grid-cols-3">{data.alerts.map((alert) => <Card key={alert.id} interactive className="p-4"><Sparkles size={18} className="text-blue-600" /><p className="mt-3 font-bold text-slate-950">{alert.title}</p><p className="mt-2 text-sm text-slate-500">{alert.detail}</p><p className="mt-3 text-xs text-slate-400">{formatWorkflowDate(alert.createdAt)}</p></Card>)}</section>;
}

function TemplateGrid({ data }: { data: ReturnType<typeof useWorkflowData>["data"] }) {
  return <Card className="p-5"><h2 className="font-black text-slate-950">Templates workflows</h2><div className="mt-5 grid gap-3 md:grid-cols-3">{data.templates.map((template) => <Card key={template.id} interactive className="p-4"><Badge tone="cyan">{template.category}</Badge><p className="mt-3 font-bold text-slate-950">{template.name}</p><p className="mt-2 text-sm text-slate-500">{template.description}</p><p className="mt-3 text-xs font-semibold text-slate-400">{template.blocks} blocs</p></Card>)}</div></Card>;
}

function RunsTable({ data }: { data: ReturnType<typeof useWorkflowData>["data"] }) {
  return <Card className="p-5"><h2 className="font-black text-slate-950">Historique executions</h2><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="text-xs uppercase tracking-[0.16em] text-slate-500"><tr><th className="pb-3">Workflow</th><th className="pb-3">Statut</th><th className="pb-3">Duree</th><th className="pb-3">Message</th><th className="pb-3">Date</th></tr></thead><tbody className="divide-y divide-slate-100">{data.runs.map((run) => <tr key={run.id}><td className="py-3 font-semibold text-slate-950">{data.workflows.find((workflow) => workflow.id === run.workflowId)?.name}</td><td className="py-3"><Badge tone={run.status === "success" ? "emerald" : run.status === "failed" ? "rose" : "cyan"}>{run.status}</Badge></td><td className="py-3 text-slate-600">{formatDuration(run.durationMs)}</td><td className="py-3 text-slate-600">{run.message}</td><td className="py-3 text-slate-400">{formatWorkflowDate(run.createdAt)}</td></tr>)}</tbody></table></div></Card>;
}

function TasksGrid({ data }: { data: ReturnType<typeof useWorkflowData>["data"] }) {
  return <Card className="p-5"><h2 className="font-black text-slate-950">Productivite automatisee</h2><div className="mt-5 grid gap-3 md:grid-cols-3">{data.tasks.map((task) => <Card key={task.id} interactive className="p-4"><Badge tone={task.automated ? "emerald" : "violet"}>{task.automated ? "automatisee" : "manuelle"}</Badge><p className="mt-3 font-bold text-slate-950">{task.title}</p><p className="mt-2 text-sm text-slate-500">{task.module}</p><p className="mt-3 text-xs font-semibold text-blue-700">{task.savedMinutes} min economisees</p></Card>)}</div></Card>;
}

function AlertsGrid({ data }: { data: ReturnType<typeof useWorkflowData>["data"] }) {
  return <Card className="p-5"><h2 className="font-black text-slate-950">Alertes workflows</h2><div className="mt-5 grid gap-3 md:grid-cols-2">{data.alerts.map((alert) => <div key={alert.id} className="rounded-[14px] border border-slate-200 bg-white/70 p-4"><Badge tone={alert.severity === "critical" ? "rose" : alert.severity === "warning" ? "violet" : "cyan"}>{alert.severity}</Badge><p className="mt-3 font-bold text-slate-950">{alert.title}</p><p className="mt-2 text-sm text-slate-500">{alert.detail}</p></div>)}</div></Card>;
}
