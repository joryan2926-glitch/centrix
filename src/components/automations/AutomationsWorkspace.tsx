"use client";

import { Activity, Bot, CheckCircle2, GitBranch, Play, Plus, Save, Search, SlidersHorizontal, TimerReset, Zap } from "lucide-react";
import type { DragEvent } from "react";
import { useMemo, useState } from "react";
import { formatAiDate } from "@/lib/ia/format";
import { actionLabels, createAutomationWorkflow, getAiDashboard, triggerLabels } from "@/services/automations/calculations";
import { createNotification } from "@/services/ia/calculations";
import { useAutomationData } from "@/hooks/automations/useAutomationData";
import type { AutomationLog, WorkflowStep } from "@/types/ia";
import { AiKpiCard } from "@/ui/ia/AiKpiCard";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { EmptyState } from "@/ui/EmptyState";
import { Skeleton } from "@/ui/Skeleton";
import { Toast } from "@/ui/Toast";

export function AutomationsWorkspace() {
  const { data, loading, mode, toast, mutate, sync } = useAutomationData();
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(data.workflows[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [zoom, setZoom] = useState(1);
  const [draggedStepId, setDraggedStepId] = useState<string | null>(null);

  const dashboard = useMemo(() => getAiDashboard(data), [data]);
  const selectedWorkflow = data.workflows.find((workflow) => workflow.id === selectedWorkflowId) ?? data.workflows[0] ?? null;
  const steps = data.workflowSteps.filter((step) => step.workflowId === selectedWorkflow?.id).sort((a, b) => a.order - b.order);
  const filteredWorkflows = data.workflows.filter((workflow) => workflow.name.toLowerCase().includes(query.toLowerCase()));

  function toggleWorkflow(workflowId: string) {
    mutate(
      (current) => ({
        ...current,
        workflows: current.workflows.map((workflow) =>
          workflow.id === workflowId ? { ...workflow, active: !workflow.active, updatedAt: new Date().toISOString() } : workflow
        ),
        notifications: [createNotification("Workflow mis a jour", "Le statut du scenario a ete modifie.", "success"), ...current.notifications]
      }),
      { title: "Automatisation mise a jour", detail: "Le workflow est synchronisable avec Supabase." }
    );
  }

  function addWorkflow() {
    const { workflow, steps: workflowSteps } = createAutomationWorkflow();
    mutate(
      (current) => ({
        ...current,
        workflows: [workflow, ...current.workflows],
        workflowSteps: [...current.workflowSteps, ...workflowSteps],
        notifications: [createNotification("Workflow cree", "Un nouveau scenario IA est pret a configurer.", "success"), ...current.notifications]
      }),
      { title: "Workflow cree", detail: "Le scenario a ete ajoute au builder automatisations." }
    );
    setSelectedWorkflowId(workflow.id);
  }

  function runWorkflow() {
    if (!selectedWorkflow) return;
    const log: AutomationLog = {
      id: `log-${crypto.randomUUID()}`,
      workflowId: selectedWorkflow.id,
      status: "success",
      message: `${selectedWorkflow.name} execute avec succes.`,
      createdAt: new Date().toISOString()
    };
    mutate(
      (current) => ({
        ...current,
        workflows: current.workflows.map((workflow) =>
          workflow.id === selectedWorkflow.id ? { ...workflow, runs: workflow.runs + 1, updatedAt: new Date().toISOString() } : workflow
        ),
        automationLogs: [log, ...current.automationLogs]
      }),
      { title: "Workflow execute", detail: log.message }
    );
  }

  function moveStep(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (!draggedStepId) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const positionX = Math.max(24, Math.round((event.clientX - rect.left) / zoom - 88));
    const positionY = Math.max(24, Math.round((event.clientY - rect.top) / zoom - 28));
    mutate((current) => ({
      ...current,
      workflowSteps: current.workflowSteps.map((step) => (step.id === draggedStepId ? { ...step, positionX, positionY } : step))
    }));
    setDraggedStepId(null);
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
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge tone="cyan">No-code workflows</Badge>
            <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Automatisations</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              Builder visuel type Zapier/Make avec triggers, conditions, actions, logs, analytics, sauvegarde Supabase et execution pilotee par les donnees CENTRIX.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={addWorkflow} variant="surface"><Plus size={17} /> Nouveau workflow</Button>
            <Button onClick={runWorkflow}><Play size={17} /> Tester</Button>
            <Button onClick={sync} variant="primary"><Save size={17} /> Sync {mode}</Button>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AiKpiCard delta="actifs" icon={<GitBranch size={19} />} label="Workflows" tone="cyan" value={String(dashboard.activeWorkflows)} />
        <AiKpiCard delta={`${dashboard.successRate}% succes`} icon={<CheckCircle2 size={19} />} label="Fiabilite" tone="emerald" value={`${dashboard.runs}`} />
        <AiKpiCard delta="ce mois" icon={<TimerReset size={19} />} label="Temps gagne" tone="violet" value={`${dashboard.timeSaved}h`} />
        <AiKpiCard delta="IA" icon={<Bot size={19} />} label="Recommandations" tone="cyan" value={String(dashboard.notifications)} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[300px_1fr]">
        <Card className="p-4">
          <div className="flex h-10 items-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-sm text-slate-400">
            <Search size={16} />
            <input className="w-full bg-transparent outline-none placeholder:text-slate-500" placeholder="Rechercher workflow" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>

          <div className="mt-4 space-y-2">
            {filteredWorkflows.map((workflow) => (
              <button
                key={workflow.id}
                className={`w-full rounded-[8px] border p-3 text-left transition-all duration-200 ${
                  selectedWorkflow?.id === workflow.id ? "border-cyan-200/35 bg-cyan-300/10" : "border-white/10 bg-white/[0.035] hover:bg-white/[0.07]"
                }`}
                onClick={() => setSelectedWorkflowId(workflow.id)}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-medium text-white">{workflow.name}</p>
                  <span className={`h-2.5 w-2.5 rounded-full ${workflow.active ? "bg-emerald-300" : "bg-slate-500"}`} />
                </div>
                <p className="mt-1 text-xs text-slate-500">{triggerLabels[workflow.trigger]}</p>
              </button>
            ))}
          </div>

          <Button className="mt-4 w-full" onClick={() => selectedWorkflow && toggleWorkflow(selectedWorkflow.id)}>
            <Zap size={17} /> {selectedWorkflow?.active ? "Desactiver" : "Activer"}
          </Button>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-3 border-b border-white/10 pb-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-slate-400">Workflow builder</p>
              <h2 className="text-lg font-semibold text-white">{selectedWorkflow?.name ?? "Scenario"}</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button className="h-9 px-3" onClick={() => setZoom((value) => Math.max(0.8, value - 0.1))} variant="ghost">-</Button>
              <span className="rounded-[8px] border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-slate-300">{Math.round(zoom * 100)}%</span>
              <Button className="h-9 px-3" onClick={() => setZoom((value) => Math.min(1.25, value + 0.1))} variant="ghost">+</Button>
            </div>
          </div>

          <div
            className="relative min-h-[420px] overflow-auto rounded-[8px] border border-white/10 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.12)_1px,transparent_0)] bg-[length:28px_28px] p-4"
            onDragOver={(event) => event.preventDefault()}
            onDrop={moveStep}
          >
            <div className="relative h-[380px] min-w-[760px]" style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}>
              <svg className="pointer-events-none absolute inset-0 h-full w-full">
                {steps.slice(0, -1).map((step, index) => {
                  const next = steps[index + 1];
                  return (
                    <line
                      key={`${step.id}-${next.id}`}
                      x1={step.positionX + 170}
                      x2={next.positionX}
                      y1={step.positionY + 32}
                      y2={next.positionY + 32}
                      stroke="rgba(94,231,255,0.55)"
                      strokeDasharray="10 8"
                      strokeWidth="2"
                      className="animate-draw-line"
                    />
                  );
                })}
              </svg>

              {steps.length ? steps.map((step) => <WorkflowNode key={step.id} step={step} onDragStart={() => setDraggedStepId(step.id)} />) : (
                <EmptyState icon={<Plus size={20} />} title="Aucun bloc" detail="Ajoutez un trigger, une condition ou une action." />
              )}
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-400">Logs automatisations</p>
              <h3 className="text-lg font-semibold text-white">Historique execution</h3>
            </div>
            <Badge tone="emerald">Realtime</Badge>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.16em] text-slate-500">
                <tr>
                  <th className="pb-3">Workflow</th>
                  <th className="pb-3">Statut</th>
                  <th className="pb-3">Message</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {data.automationLogs.slice(0, 8).map((log) => (
                  <tr key={log.id}>
                    <td className="py-3 text-white">{data.workflows.find((workflow) => workflow.id === log.workflowId)?.name ?? "Workflow"}</td>
                    <td className="py-3"><Badge tone={log.status === "success" ? "emerald" : log.status === "running" ? "cyan" : "rose"}>{log.status}</Badge></td>
                    <td className="py-3 text-slate-400">{log.message}</td>
                    <td className="py-3 text-slate-500">{formatAiDate(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-white"><SlidersHorizontal size={16} /> Templates Make/Zapier</div>
          <div className="mt-4 space-y-3">
            {[
              "Nouveau lead -> scoring IA -> rappel commercial",
              "Facture payee -> mise a jour CRM -> notification finance",
              "Rendez-vous cree -> checklist -> resume post-meeting",
              "Email recu -> qualification -> creation tache"
            ].map((template) => (
              <button key={template} className="w-full rounded-[8px] border border-white/10 bg-white/[0.04] p-3 text-left text-sm text-slate-200 transition-all duration-200 hover:border-cyan-200/30 hover:bg-white/[0.08]">
                {template}
              </button>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}

function WorkflowNode({ step, onDragStart }: { step: WorkflowStep; onDragStart: () => void }) {
  const tone = step.type === "trigger" ? "cyan" : step.type === "condition" ? "violet" : "emerald";

  return (
    <div
      draggable
      className="absolute w-44 cursor-grab rounded-[8px] border border-white/10 bg-[#10162a]/92 p-3 shadow-halo backdrop-blur-xl transition-transform duration-200 hover:-translate-y-1"
      onDragStart={onDragStart}
      style={{ left: step.positionX, top: step.positionY }}
    >
      <div className="flex items-center justify-between gap-2">
        <Badge tone={tone}>{step.type}</Badge>
        <Activity size={15} className="text-slate-500" />
      </div>
      <p className="mt-3 text-sm font-semibold text-white">{step.label}</p>
      <p className="mt-1 text-xs text-slate-500">{step.action ? actionLabels[step.action] : "Declencheur"}</p>
    </div>
  );
}
