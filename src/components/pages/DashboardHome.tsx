"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, ArrowDown, ArrowUp, ArrowUpRight, Bot, CalendarDays, CheckCircle2, CircleDollarSign, Clock3, GripVertical, Sparkles, UsersRound, Zap } from "lucide-react";
import { CentrixLogo, DataTable } from "@/components/ui";
import { InteractiveChart } from "@/components/saas/InteractiveChart";
import { useSaasCoreDashboard } from "@/hooks/saas-core/useSaasCoreDashboard";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { MetricCard } from "@/ui/MetricCard";
import { Skeleton } from "@/ui/Skeleton";
import { Toast } from "@/ui/Toast";

const aiInsights = [
  "Probabilite de signature NovaCore: 78%",
  "Risque churn detecte sur 2 comptes premium",
  "Cashflow juin au-dessus du previsionnel de 9,7%"
];

const teamPerformance = [
  { label: "Sales", value: 86 },
  { label: "Finance", value: 74 },
  { label: "Support", value: 92 },
  { label: "Marketing", value: 68 }
];

const defaultWidgetOrder = ["pipeline", "tasks", "calendar", "ai", "acquisition", "team", "activity", "automations"] as const;
type DashboardWidgetId = (typeof defaultWidgetOrder)[number];

export function DashboardHome() {
  const { data, snapshot, loading, mode, toast, sync } = useSaasCoreDashboard();
  const revenueSeries = data.analytics.map((point) => ({ label: point.label, value: point.revenue }));
  const acquisitionSeries = data.analytics.map((point) => ({ label: point.label, value: point.leads }));
  const recentTasks = data.tasks.map((task) => ({
    id: task.id,
    task: task.title,
    owner: task.module.toUpperCase(),
    priority: task.priority,
    status: task.status
  }));
  const activeConnections = data.connections.filter((connection) => connection.active);
  const activeModules = data.modules.filter((module) => module.status === "active").length;
  const businessHealth = Math.min(98, Math.round((activeModules / Math.max(data.modules.length, 1)) * 100));
  const workspaceLabel = snapshot?.workspace?.workspaceName ?? "CENTRIX Workspace";
  const crmPipeline = data.analytics.map((point) => ({
    company: point.label,
    stage: point.leads > 0 ? "Pipeline actif" : "Analyse",
    value: `${point.revenue.toFixed(1)}K EUR`,
    progress: `${Math.min(96, Math.max(18, Math.round(point.revenue * 9 + point.leads * 4)))}%`
  }));
  const calendarItems = useMemo(
    () =>
      snapshot?.meetingsUpcoming
        ? [`${snapshot.meetingsUpcoming} rendez-vous a venir`, `${snapshot.tasksOpen} taches ouvertes`, `${snapshot.supportOpen} tickets support ouverts`]
        : ["Comite revenus - 10:30", "Demo client - 14:00", "Revue securite - 16:15"],
    [snapshot?.meetingsUpcoming, snapshot?.supportOpen, snapshot?.tasksOpen]
  );
  const [widgetOrder, setWidgetOrder] = useState<DashboardWidgetId[]>(() => {
    if (typeof window === "undefined") return [...defaultWidgetOrder];
    const saved = window.localStorage.getItem("centrix-dashboard-widget-order");
    if (!saved) return [...defaultWidgetOrder];
    try {
      const parsed = JSON.parse(saved) as DashboardWidgetId[];
      return parsed.filter((id) => defaultWidgetOrder.includes(id));
    } catch {
      return [...defaultWidgetOrder];
    }
  });
  const moveWidget = (id: DashboardWidgetId, direction: -1 | 1) => {
    setWidgetOrder((current) => {
      const index = current.indexOf(id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      window.localStorage.setItem("centrix-dashboard-widget-order", JSON.stringify(next));
      return next;
    });
  };
  const widgets = useMemo<Record<DashboardWidgetId, ReactNode>>(
    () => ({
      pipeline: (
        <Card>
          <WidgetToolbar id="pipeline" moveWidget={moveWidget} title="Pipeline CRM" />
          <div className="divide-y divide-slate-100">
            {crmPipeline.map((deal) => (
              <div key={deal.company} className="grid gap-4 px-6 py-5 sm:grid-cols-[1fr_110px] sm:items-center">
                <div>
                  <p className="font-semibold text-slate-950">{deal.company}</p>
                  <p className="mt-1 text-sm text-slate-500">{deal.stage} - {deal.value}</p>
                  <div className="mt-3 h-2 rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-blue-600" style={{ width: deal.progress }} />
                  </div>
                </div>
                <Badge tone="cyan">{deal.progress}</Badge>
              </div>
            ))}
          </div>
        </Card>
      ),
      tasks: (
        <div>
          <WidgetToolbar id="tasks" moveWidget={moveWidget} title="Taches recentes" compact />
          <DataTable
            rows={recentTasks}
            getRowKey={(row) => row.id}
            columns={[
              { key: "task", header: "Tache" },
              { key: "owner", header: "Module", render: (row) => <Badge tone="cyan">{row.owner}</Badge> },
              { key: "status", header: "Statut", render: (row) => <span className="font-semibold text-slate-950">{row.status}</span> }
            ]}
          />
        </div>
      ),
      calendar: (
        <Card className="p-6" interactive>
          <WidgetToolbar id="calendar" moveWidget={moveWidget} title="Calendrier" icon={<CalendarDays size={19} className="text-blue-600" />} />
          <div className="mt-5 space-y-3">
            {calendarItems.map((event) => (
              <div key={event} className="rounded-[16px] border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-700">
                {event}
              </div>
            ))}
          </div>
        </Card>
      ),
      ai: (
        <Card className="p-6" interactive>
          <WidgetToolbar id="ai" moveWidget={moveWidget} title="Analytics IA" icon={<Bot size={18} className="text-blue-600" />} />
          <div className="mt-5 space-y-3">
            {aiInsights.map((insight) => (
              <div key={insight} className="flex items-start gap-3 rounded-[16px] border border-slate-200 bg-white p-4">
                <Sparkles size={17} className="mt-0.5 text-blue-600" />
                <span className="text-sm font-medium leading-6 text-slate-700">{insight}</span>
              </div>
            ))}
          </div>
        </Card>
      ),
      acquisition: <InteractiveChart data={acquisitionSeries} subtitle="Leads et acquisition consolides par le socle SaaS" title="Acquisition" type="bar" valueSuffix="" />,
      team: (
        <Card className="p-6" interactive>
          <WidgetToolbar id="team" moveWidget={moveWidget} title="Performance equipe" icon={<UsersRound size={20} className="text-blue-600" />} />
          <div className="mt-5 space-y-4">
            {teamPerformance.map((team) => (
              <div key={team.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">{team.label}</span>
                  <span className="font-black text-slate-950">{team.value}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${team.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      ),
      activity: (
        <Card className="p-6" interactive>
          <WidgetToolbar id="activity" moveWidget={moveWidget} title="Activite recente" icon={<Activity size={19} className="text-blue-600" />} />
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {data.events.slice(0, 4).map((event) => (
              <div key={event.id} className="flex items-center gap-3 rounded-[16px] border border-slate-200 bg-white p-4">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <span className="text-sm font-semibold text-slate-700">{event.title}</span>
              </div>
            ))}
          </div>
        </Card>
      ),
      automations: (
        <Card className="p-6" interactive>
          <WidgetToolbar id="automations" moveWidget={moveWidget} title="Automatisations live" icon={<Clock3 size={19} className="text-blue-600" />} />
          <div className="mt-5 space-y-3">
            {activeConnections.slice(0, 4).map((connection) => (
              <div key={connection.id} className="flex items-center gap-3 rounded-[16px] border border-slate-200 bg-white p-3 transition-colors duration-200 hover:bg-blue-50">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <span className="text-sm font-medium text-slate-700">{`${connection.trigger} -> ${connection.action}`}</span>
              </div>
            ))}
          </div>
        </Card>
      )
    }),
    [activeConnections, acquisitionSeries, calendarItems, crmPipeline, data.events, recentTasks]
  );

  return (
    <div className="mx-auto max-w-[1540px] space-y-7">
      {toast ? <Toast title={toast.title} detail={toast.detail} /> : null}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white p-6 text-slate-950 shadow-[0_24px_70px_rgba(15,23,42,0.12),0_0_0_1px_rgba(255,255,255,0.86)_inset] sm:p-9"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(37,99,235,0.16),transparent_34%),linear-gradient(135deg,rgba(37,99,235,0.08),transparent_44%)]" />
        <div className="absolute -right-24 -top-24 hidden h-72 w-72 rounded-full bg-blue-500/14 blur-3xl lg:block" />
        <div className="absolute right-10 top-8 hidden h-48 w-48 rounded-full border border-blue-200 lg:block" />
        <div className="relative z-10 grid gap-10 xl:grid-cols-[1fr_430px] xl:items-end">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-blue-700">
              <CentrixLogo compact />
              {workspaceLabel} - {mode}
            </div>
            <h1 className="mt-8 max-w-4xl text-4xl font-black tracking-[-0.055em] text-slate-950 sm:text-6xl">
              Pilotez CENTRIX comme une startup IA haut de gamme.
            </h1>
            <p className="mt-5 max-w-3xl text-base font-bold leading-8 text-slate-600">
              Vue globale connectee a Supabase: clients, prospects, factures, projets, agenda, support, notifications et analytics en temps reel.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button onClick={sync} variant="primary">
                Analyse IA
                <Sparkles size={17} />
              </Button>
              <Button className="border-slate-200 bg-white text-slate-800 hover:border-blue-300 hover:text-blue-700">
                Rapport executive
                <ArrowUpRight size={17} />
              </Button>
            </div>
          </div>

          <Card className="p-6 text-slate-950 shadow-[0_20px_54px_rgba(37,99,235,0.14)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-600">Business health</p>
                <p className="mt-2 text-6xl font-black text-slate-950">{businessHealth}</p>
              </div>
              <div className="grid h-16 w-16 place-items-center rounded-[18px] bg-blue-50 text-blue-600">
                <Zap size={28} />
              </div>
            </div>
            <div className="mt-6 h-3 rounded-full bg-slate-100">
              <motion.div initial={{ width: 0 }} animate={{ width: `${businessHealth}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#0B7CFF] shadow-[0_0_18px_rgba(37,99,235,0.34)]" />
            </div>
            <p className="mt-4 text-sm font-medium leading-6 text-slate-600">
              {snapshot ? `${snapshot.clientsCount} clients, ${snapshot.projectsActive} projets actifs, ${snapshot.invoicesPending} factures en attente.` : `${activeModules} modules actifs, realtime et connexions inter-modules prepares.`}
            </p>
          </Card>
        </div>
      </motion.section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? [0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-40" />) : data.metrics.map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.055, duration: 0.38 }}>
            <MetricCard metric={stat} />
          </motion.div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.55fr]">
        <InteractiveChart data={revenueSeries} subtitle="MRR, expansion comptes, cashflow et previsionnel synchronises" title="Analytics business global" valueSuffix="K EUR" />
        <Card className="p-6" interactive>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-950">Revenus</h2>
              <p className="mt-1 text-sm text-slate-500">MRR + abonnements</p>
            </div>
            <CircleDollarSign size={22} className="text-emerald-600" />
          </div>
          <p className="mt-6 text-5xl font-black text-slate-950">84.2K</p>
          <p className="mt-2 text-sm font-semibold text-emerald-600">+18.4% ce mois-ci</p>
          <div className="mt-6 space-y-3">
            {["Starter", "Business", "Enterprise"].map((plan, index) => (
              <div key={plan} className="grid grid-cols-[90px_1fr_48px] items-center gap-3 text-sm">
                <span className="font-semibold text-slate-600">{plan}</span>
                <span className="h-2 rounded-full bg-slate-100">
                  <span className="block h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400" style={{ width: `${52 + index * 16}%` }} />
                </span>
                <span className="text-right font-black text-blue-700">{52 + index * 16}%</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        {widgetOrder.map((id) => (
          <motion.div key={id} layout className={id === "activity" || id === "automations" ? "xl:col-span-3 2xl:col-span-1" : ""}>
            {widgets[id]}
          </motion.div>
        ))}
      </section>
    </div>
  );
}

function WidgetToolbar({ compact, icon, id, moveWidget, title }: { compact?: boolean; icon?: ReactNode; id: DashboardWidgetId; moveWidget: (id: DashboardWidgetId, direction: -1 | 1) => void; title: string }) {
  return (
    <div className={compact ? "mb-3 flex items-center justify-between rounded-[18px] border border-slate-200 bg-white px-4 py-3 shadow-[0_10px_26px_rgba(15,23,42,0.06)]" : "flex items-center justify-between border-b border-slate-200/70 px-6 py-5"}>
      <div className="flex items-center gap-2">
        <GripVertical size={16} className="text-slate-300" />
        <h2 className="text-base font-black text-slate-950">{title}</h2>
        {icon}
      </div>
      <div className="flex items-center gap-1">
        <button className="grid h-8 w-8 place-items-center rounded-[10px] text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600" onClick={() => moveWidget(id, -1)} type="button" aria-label={`Monter ${title}`}>
          <ArrowUp size={15} />
        </button>
        <button className="grid h-8 w-8 place-items-center rounded-[10px] text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600" onClick={() => moveWidget(id, 1)} type="button" aria-label={`Descendre ${title}`}>
          <ArrowDown size={15} />
        </button>
      </div>
    </div>
  );
}

export function MiniStat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-slate-200 bg-white/72 p-3">
      <div className="flex items-center gap-2 text-blue-600">
        {icon}
        <span className="text-xs font-bold uppercase tracking-[0.12em]">{label}</span>
      </div>
      <p className="mt-2 text-xl font-black text-slate-950">{value}</p>
    </div>
  );
}
