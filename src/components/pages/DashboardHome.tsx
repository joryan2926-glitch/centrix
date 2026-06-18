"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, ArrowDown, ArrowUp, ArrowUpRight, BellRing, Bot, CalendarDays, CheckCircle2, CircleDollarSign, Clock3, CreditCard, GripVertical, ReceiptText, ShieldCheck, Sparkles, Target, UserPlus, UsersRound, Zap } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CentrixLogo, DataTable } from "@/components/ui";
import { InteractiveChart } from "@/components/saas/InteractiveChart";
import { useLiveNotifications } from "@/hooks/useLiveNotifications";
import { useSaasCoreDashboard } from "@/hooks/saas-core/useSaasCoreDashboard";
import { downloadJsonFile } from "@/lib/download";
import { type DashboardWidgetId, useDashboardStore } from "@/stores/dashboardStore";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { MetricCard } from "@/ui/MetricCard";
import { Skeleton } from "@/ui/Skeleton";
import { Toast } from "@/ui/Toast";

type AnalyticsPeriod = "jour" | "semaine" | "mois" | "annee";

type PipelineCard = {
  id: string;
  amount: string;
  company: string;
  owner: string;
  score: number;
};

type PipelineColumn = {
  id: string;
  label: string;
  value: number;
  conversion: number;
  cards: PipelineCard[];
};

const euroCompact = new Intl.NumberFormat("fr-FR", {
  currency: "EUR",
  maximumFractionDigits: 0,
  notation: "compact",
  style: "currency"
});

function formatKiloCurrency(value: number) {
  return `${Math.round(value / 1000)}K EUR`;
}

export function DashboardHome() {
  const { data, snapshot, loading, toast, sync } = useSaasCoreDashboard();
  const { items: notifications, unreadCount } = useLiveNotifications();
  const { moveWidget } = useDashboardStore();
  const [period, setPeriod] = useState<AnalyticsPeriod>("mois");
  const [draggedDeal, setDraggedDeal] = useState<{ cardId: string; columnId: string } | null>(null);
  const acquisitionSeries = data.analytics.map((point) => ({ label: point.label, value: point.leads }));
  const cashflowSeries = snapshot?.cashflowSeries ?? data.analytics.map((point) => ({ label: point.label, value: point.revenue - point.expenses }));
  const forecastSeries = snapshot?.forecastSeries ?? data.analytics.map((point, index) => ({ label: point.label, value: point.revenue * (1 + index * 0.06) }));
  const recentTasks = data.tasks.map((task) => ({
    id: task.id,
    task: task.title,
    owner: task.module.toUpperCase(),
    priority: task.priority,
    status: task.status
  }));
  const activeConnections = data.connections.filter((connection) => connection.active);
  const operationalScore = Math.min(38, Math.round(((snapshot?.clientsCount ?? 0) + (snapshot?.projectsActive ?? 0) + (snapshot?.tasksOpen ?? 0)) / 2));
  const revenueScore = Math.min(34, Math.round(((snapshot?.monthlyRevenue ?? 0) / Math.max(snapshot?.forecastRevenue ?? 1, 1)) * 34));
  const conversionScore = Math.min(28, Math.round(snapshot?.conversionRate ?? 0));
  const businessHealth = snapshot ? Math.min(98, Math.max(0, operationalScore + revenueScore + conversionScore)) : 0;
  const workspaceLabel = snapshot?.workspace?.workspaceName ?? "CENTRIX Workspace";
  const teamPerformance = useMemo(
    () => [
      { label: "Sales", value: Math.round(snapshot?.conversionRate ?? 0) },
      { label: "Finance", value: Math.round(snapshot?.profitability ?? 0) },
      { label: "Support", value: snapshot?.supportOpen ? Math.max(0, 100 - snapshot.supportOpen * 8) : 0 },
      { label: "Marketing", value: Math.min(100, Math.round(((snapshot?.prospectsCount ?? 0) / Math.max(snapshot?.clientsCount ?? 1, 1)) * 100)) }
    ],
    [snapshot?.clientsCount, snapshot?.conversionRate, snapshot?.profitability, snapshot?.prospectsCount, snapshot?.supportOpen]
  );
  const crmPipeline = data.analytics.map((point) => ({
    company: point.label,
    stage: point.leads > 0 ? "Pipeline actif" : "Analyse",
    value: `${point.revenue.toFixed(1)}K EUR`,
    progress: `${Math.min(96, Math.max(0, Math.round(point.revenue * 9 + point.leads * 4)))}%`
  }));
  const calendarItems = useMemo(
    () =>
      snapshot?.meetingsUpcoming
        ? [`${snapshot.meetingsUpcoming} rendez-vous a venir`, `${snapshot.tasksOpen} taches ouvertes`, `${snapshot.supportOpen} tickets support ouverts`]
        : [],
    [snapshot?.meetingsUpcoming, snapshot?.supportOpen, snapshot?.tasksOpen]
  );
  const advancedAnalyticsData = useMemo(
    () =>
      data.analytics.map((point, index) => ({
        clients: point.leads,
        depenses: Number(point.expenses.toFixed(2)),
        label: point.label,
        prevision: Number((forecastSeries[index]?.value ?? 0).toFixed(2)),
        revenus: Number(point.revenue.toFixed(2))
      })),
    [data.analytics, forecastSeries]
  );
  const miniAnalytics = useMemo(
    () => [
      { icon: ArrowUpRight, label: "Croissance", tone: "text-emerald-600", value: `+${(snapshot?.growthRate ?? 0).toFixed(1)}%` },
      { icon: UserPlus, label: "Nouveaux clients", tone: "text-blue-600", value: String(snapshot?.clientsCount ?? data.analytics.reduce((total, point) => total + point.leads, 0)) },
      { icon: Target, label: "Conversion", tone: "text-violet-600", value: `${(snapshot?.conversionRate ?? 0).toFixed(1)}%` },
      { icon: CheckCircle2, label: "Taches terminees", tone: "text-emerald-600", value: String(data.tasks.filter((task) => task.status.toLowerCase().includes("done") || task.status.toLowerCase().includes("termine")).length) },
      { icon: UsersRound, label: "Equipe", tone: "text-cyan-600", value: `${Math.round(teamPerformance.reduce((total, team) => total + team.value, 0) / teamPerformance.length)}%` }
    ],
    [data.analytics, data.tasks, snapshot?.clientsCount, snapshot?.conversionRate, snapshot?.growthRate, teamPerformance]
  );
  const basePipelineColumns = useMemo<PipelineColumn[]>(
    () =>
      (snapshot?.businessPipeline ?? []).map((column) => ({
        ...column,
        cards: column.cards.map((card) => ({ ...card, amount: formatKiloCurrency(card.amount) }))
      })),
    [snapshot?.businessPipeline]
  );
  const [pipelineColumns, setPipelineColumns] = useState<PipelineColumn[]>(basePipelineColumns);

  useEffect(() => {
    setPipelineColumns(basePipelineColumns);
  }, [basePipelineColumns]);

  const movePipelineCard = useCallback((targetColumnId: string) => {
    if (!draggedDeal || draggedDeal.columnId === targetColumnId) {
      setDraggedDeal(null);
      return;
    }

    setPipelineColumns((columns) => {
      const sourceColumn = columns.find((column) => column.id === draggedDeal.columnId);
      const card = sourceColumn?.cards.find((item) => item.id === draggedDeal.cardId);
      if (!card) return columns;

      return columns.map((column) => {
        if (column.id === draggedDeal.columnId) {
          return { ...column, cards: column.cards.filter((item) => item.id !== draggedDeal.cardId) };
        }

        if (column.id === targetColumnId) {
          return { ...column, cards: [...column.cards, card] };
        }

        return column;
      });
    });
    setDraggedDeal(null);
  }, [draggedDeal]);
  const aiDashboardInsights = useMemo(
    () => [
      `${snapshot?.unpaidInvoices ?? 0} facture(s) a surveiller avant echeance.`,
      `Conversion estimee a ${(snapshot?.conversionRate ?? 0).toFixed(1)}%, relancer les prospects chauds.`,
      `Forecast revenu: ${Math.round((snapshot?.forecastRevenue ?? 0) / 1000)}K EUR sur tendance actuelle.`,
      `${snapshot?.supportOpen ?? 0} ticket(s) support ouvert(s), ${snapshot?.urgentTasks ?? 0} tache(s) urgente(s).`
    ],
    [snapshot?.conversionRate, snapshot?.forecastRevenue, snapshot?.supportOpen, snapshot?.unpaidInvoices, snapshot?.urgentTasks]
  );
  const widgets = useMemo<Record<DashboardWidgetId, ReactNode>>(
    () => ({
      advancedAnalytics: (
        <AdvancedAnalyticsWidget
          data={advancedAnalyticsData}
          miniAnalytics={miniAnalytics}
          period={period}
          setPeriod={setPeriod}
        />
      ),
      businessPipeline: (
        <BusinessPipelineWidget
          columns={pipelineColumns}
          movePipelineCard={movePipelineCard}
          setDraggedDeal={setDraggedDeal}
        />
      ),
      activityFeed: <ActivityFeedWidget events={data.events} />,
      quickAgenda: <QuickAgendaWidget items={calendarItems} tasks={data.tasks} />,
      notifications: <DashboardNotificationsWidget notifications={notifications} unreadCount={unreadCount} />,
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
            {aiDashboardInsights.map((insight) => (
              <div key={insight} className="flex items-start gap-3 rounded-[16px] border border-slate-200 bg-white p-4">
                <Sparkles size={17} className="mt-0.5 text-blue-600" />
                <span className="text-sm font-medium leading-6 text-slate-700">{insight}</span>
              </div>
            ))}
          </div>
        </Card>
      ),
      acquisition: <InteractiveChart data={acquisitionSeries} subtitle="Leads et acquisition consolides par le socle SaaS" title="Acquisition" type="bar" valueSuffix="" />,
      cashflow: <RechartsWidget data={cashflowSeries} subtitle="Encaissements, dépenses et marge operationnelle" title="Cashflow" type="area" valueSuffix="K EUR" />,
      forecast: <RechartsWidget data={forecastSeries} subtitle="Projection revenus basee sur pipeline, devis et tendance" title="Revenus previsionnels" type="bar" valueSuffix="K EUR" />,
      profitability: (
        <Card className="p-6" interactive>
          <WidgetToolbar id="profitability" moveWidget={moveWidget} title="Rentabilite" icon={<CircleDollarSign size={19} className="text-emerald-600" />} />
          <div className="mt-6 grid gap-5">
            <div>
              <p className="text-5xl font-black tracking-[-0.05em] text-slate-950">{Math.round(snapshot?.profitability ?? 0)}%</p>
              <p className="mt-2 text-sm font-bold text-slate-500">Marge estimee sur cashflow et revenus factures.</p>
            </div>
            <div className="h-3 rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 shadow-[0_0_18px_rgba(37,99,235,0.28)]" style={{ width: `${Math.min(100, Math.round(snapshot?.profitability ?? 0))}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MiniStat icon={<CircleDollarSign size={15} />} label="Cashflow" value={`${Math.round((snapshot?.cashflow ?? 0) / 1000)}K`} />
              <MiniStat icon={<Sparkles size={15} />} label="Forecast" value={`${Math.round((snapshot?.forecastRevenue ?? 0) / 1000)}K`} />
            </div>
          </div>
        </Card>
      ),
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
          <WidgetToolbar id="automations" moveWidget={moveWidget} title="Automatisations" icon={<Clock3 size={19} className="text-blue-600" />} />
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
    [activeConnections, acquisitionSeries, advancedAnalyticsData, aiDashboardInsights, calendarItems, cashflowSeries, crmPipeline, data.events, data.tasks, forecastSeries, miniAnalytics, movePipelineCard, moveWidget, notifications, period, pipelineColumns, recentTasks, snapshot?.cashflow, snapshot?.forecastRevenue, snapshot?.profitability, teamPerformance, unreadCount]
  );
  return (
    <div className="mx-auto max-w-[1480px] space-y-5">
      {toast ? <Toast title={toast.title} detail={toast.detail} /> : null}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[18px] border border-slate-200 bg-white p-5 text-slate-950 shadow-[0_1px_2px_rgba(15,23,42,0.035),0_12px_34px_rgba(15,23,42,0.07)] sm:p-6"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(37,99,235,0.10),transparent_34%),linear-gradient(135deg,rgba(37,99,235,0.05),transparent_44%)]" />
        <div className="absolute right-0 top-0 hidden h-40 w-40 rounded-full bg-blue-500/10 blur-3xl lg:block" />
        <div className="relative z-10 grid gap-5 xl:grid-cols-[1fr_340px] xl:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-blue-700 shadow-[0_1px_2px_rgba(15,23,42,0.035)]">
              <CentrixLogo compact />
              {workspaceLabel} - Donnees reelles
            </div>
            <h1 className="mt-4 max-w-4xl text-3xl font-black tracking-[-0.045em] text-slate-950 sm:text-4xl">
              Bonjour, bienvenue sur votre cockpit CENTRIX.
            </h1>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
              Vos indicateurs sont calcules depuis Supabase. Si aucune donnee n&apos;existe, CENTRIX affiche un etat vide professionnel.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button onClick={sync} variant="primary">
                Analyse IA
                <Sparkles size={17} />
              </Button>
              <Button
                className="border-slate-200 bg-white text-slate-800 hover:border-blue-300 hover:text-blue-700"
                onClick={() => downloadJsonFile(`centrix-rapport-executive-${new Date().toISOString().slice(0, 10)}.json`, { generatedAt: new Date().toISOString(), snapshot })}
              >
                Rapport
                <ArrowUpRight size={17} />
              </Button>
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              <MiniStat icon={<CircleDollarSign size={15} />} label="CA" value={`${Math.round((snapshot?.invoicesTotal ?? 0) / 1000)}K`} />
              <MiniStat icon={<UsersRound size={15} />} label="Conversion" value={`${(snapshot?.conversionRate ?? 0).toFixed(1)}%`} />
              <MiniStat icon={<Zap size={15} />} label="Urgent" value={String(snapshot?.urgentTasks ?? 0)} />
            </div>
          </div>

          <Card className="p-5 text-slate-950 shadow-[0_12px_34px_rgba(37,99,235,0.10)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-600">Business health</p>
                <p className="mt-1 text-5xl font-black tracking-[-0.05em] text-slate-950">{businessHealth}</p>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-[14px] bg-blue-50 text-blue-600">
                <Zap size={22} />
              </div>
            </div>
            <div className="mt-5 h-2 rounded-full bg-slate-100">
              <motion.div initial={{ width: 0 }} animate={{ width: `${businessHealth}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#0B7CFF] shadow-[0_0_18px_rgba(37,99,235,0.34)]" />
            </div>
            <p className="mt-4 text-sm font-medium leading-6 text-slate-600">
              {snapshot ? `${snapshot.clientsCount} clients, ${snapshot.projectsActive} projets actifs, ${snapshot.invoicesPending} factures en attente.` : "Aucune donnee disponible."}
            </p>
          </Card>
        </div>
      </motion.section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? [0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-40" />) : data.metrics.slice(0, 4).map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.055, duration: 0.38 }}>
            <MetricCard metric={stat} />
          </motion.div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.45fr_0.55fr]">
        {widgets.advancedAnalytics}
        <div className="grid gap-5">
          <Card className="p-5" interactive>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-[14px] bg-blue-600 text-white shadow-[0_14px_30px_rgba(37,99,235,0.24)]">
                <Bot size={18} />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-950">IA CENTRIX</h2>
                <p className="text-sm font-semibold text-slate-500">Recommandations basees sur vos donnees</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {aiDashboardInsights.map((insight) => (
                <div key={insight} className="rounded-[14px] border border-blue-100 bg-blue-50/70 p-3 text-sm font-bold leading-5 text-slate-700">
                  {insight}
                </div>
              ))}
            </div>
          </Card>
          {widgets.quickAgenda}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        {widgets.businessPipeline}
        <div className="grid gap-5">
          <Card className="p-5" interactive>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-950">Revenus</h2>
                <p className="mt-1 text-sm text-slate-500">Facturation et encaissements</p>
              </div>
              <CircleDollarSign size={22} className="text-emerald-600" />
            </div>
            <p className="mt-5 text-4xl font-black text-slate-950">{euroCompact.format(snapshot?.monthlyRevenue ?? 0)}</p>
            <p className="mt-2 text-sm font-semibold text-emerald-600">{`${(snapshot?.growthRate ?? 0).toFixed(1)}% ce mois-ci`}</p>
            <div className="mt-5 space-y-3">
              {[
                { label: "Encaisse", value: snapshot?.paidRevenue ?? 0 },
                { label: "Devis", value: snapshot?.quotesTotal ?? 0 },
                { label: "Forecast", value: snapshot?.forecastRevenue ?? 0 }
              ].map((plan) => {
                const width = Math.min(100, Math.round((plan.value / Math.max(snapshot?.forecastRevenue ?? 1, 1)) * 100));
                return (
                  <div key={plan.label} className="grid grid-cols-[78px_1fr_44px] items-center gap-3 text-sm">
                    <span className="font-semibold text-slate-600">{plan.label}</span>
                    <span className="h-2 rounded-full bg-slate-100">
                      <span className="block h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400" style={{ width: `${width}%` }} />
                    </span>
                    <span className="text-right font-black text-blue-700">{width}%</span>
                  </div>
                );
              })}
            </div>
          </Card>
          {widgets.notifications}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
        {widgets.activityFeed}
        {widgets.tasks}
      </section>
    </div>
  );
}

function AdvancedAnalyticsWidget({ data, miniAnalytics, period, setPeriod }: { data: Array<{ clients: number; depenses: number; label: string; prevision: number; revenus: number }>; miniAnalytics: Array<{ icon: typeof ArrowUpRight; label: string; tone: string; value: string }>; period: AnalyticsPeriod; setPeriod: (period: AnalyticsPeriod) => void }) {
  const periods: AnalyticsPeriod[] = ["jour", "semaine", "mois", "annee"];

  return (
    <Card className="overflow-hidden p-0" interactive>
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200/80 p-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-blue-700">
            <Activity size={14} />
            Analytics avancee
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-[-0.04em] text-slate-950">Cockpit revenus, clients, depenses et previsions IA</h2>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">Lecture multi-metrices avec courbes smooth, tooltips premium et projection intelligente.</p>
        </div>
        <div className="flex rounded-full border border-slate-200 bg-slate-50 p-1">
          {periods.map((item) => (
            <button key={item} className={`rounded-full px-4 py-2 text-xs font-black capitalize transition ${period === item ? "bg-blue-600 text-white shadow-[0_12px_24px_rgba(37,99,235,0.24)]" : "text-slate-500 hover:text-blue-700"}`} onClick={() => setPeriod(item)} type="button">
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 p-5 lg:grid-cols-5">
        {miniAnalytics.map((metric) => {
          const Icon = metric.icon;
          return (
            <motion.div key={metric.label} whileHover={{ y: -3 }} className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
              <div className={`inline-grid h-10 w-10 place-items-center rounded-[14px] bg-slate-50 ${metric.tone}`}>
                <Icon size={18} />
              </div>
              <p className="mt-4 text-2xl font-black tracking-[-0.04em] text-slate-950">{metric.value}</p>
              <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-slate-500">{metric.label}</p>
            </motion.div>
          );
        })}
      </div>

      <ClientOnlyChart className="h-[390px] px-3 pb-6 sm:px-6">
        <ResponsiveContainer height="100%" minWidth={0} width="100%">
          <ComposedChart data={data} margin={{ bottom: 8, left: 0, right: 10, top: 22 }}>
            <defs>
              <linearGradient id="centrixRevenueFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#2563EB" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(15,23,42,0.08)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#475569", fontSize: 12, fontWeight: 800 }} tickLine={false} />
            <YAxis tick={{ fill: "#475569", fontSize: 12, fontWeight: 800 }} tickLine={false} width={38} />
            <Tooltip contentStyle={{ border: "1px solid #dbeafe", borderRadius: 18, boxShadow: "0 24px 70px rgba(15,23,42,0.16)", fontWeight: 800 }} cursor={{ fill: "rgba(37,99,235,0.06)" }} />
            <Bar dataKey="depenses" fill="#CBD5E1" name="Depenses" radius={[10, 10, 3, 3]} />
            <Area dataKey="revenus" fill="url(#centrixRevenueFill)" name="Revenus" stroke="#2563EB" strokeWidth={3} type="monotone" />
            <Line dataKey="prevision" dot={false} name="Prevision IA" stroke="#0F172A" strokeDasharray="6 6" strokeWidth={3} type="monotone" />
            <Line dataKey="clients" name="Clients" stroke="#06B6D4" strokeWidth={3} type="monotone" />
          </ComposedChart>
        </ResponsiveContainer>
      </ClientOnlyChart>
    </Card>
  );
}

function BusinessPipelineWidget({ columns, movePipelineCard, setDraggedDeal }: { columns: PipelineColumn[]; movePipelineCard: (targetColumnId: string) => void; setDraggedDeal: (deal: { cardId: string; columnId: string } | null) => void }) {
  const totalValue = columns.reduce((total, column) => total + column.value, 0);

  return (
    <Card className="p-5" interactive>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-blue-700">
            <Target size={14} />
            Pipeline business
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-[-0.04em] text-slate-950">Pipeline commercial drag and drop</h2>
        </div>
        <div className="rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-right shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Valeur pipeline</p>
          <p className="mt-1 text-2xl font-black text-blue-700">{formatKiloCurrency(totalValue)}</p>
        </div>
      </div>
      {columns.length ? <div className="mt-5 grid gap-3 overflow-x-auto pb-2 lg:grid-cols-5">
        {columns.map((column) => (
          <div
            key={column.id}
            className="min-w-[230px] rounded-[22px] border border-slate-200 bg-slate-50 p-3"
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => movePipelineCard(column.id)}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-slate-950">{column.label}</p>
                <p className="mt-1 text-xs font-bold text-slate-500">{formatKiloCurrency(column.value)} - {column.conversion}%</p>
              </div>
              <Badge tone="cyan">{column.cards.length}</Badge>
            </div>
            <div className="space-y-3">
              {column.cards.map((card) => (
                <motion.div
                  key={card.id}
                  draggable
                  layout
                  onDragStart={() => setDraggedDeal({ cardId: card.id, columnId: column.id })}
                  whileHover={{ y: -2 }}
                  className="cursor-grab rounded-[18px] border border-white bg-white p-4 shadow-[0_16px_36px_rgba(15,23,42,0.08)] active:cursor-grabbing"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-black text-slate-950">{card.company}</p>
                    <Badge tone={card.score > 85 ? "emerald" : "cyan"}>{card.score}%</Badge>
                  </div>
                  <p className="mt-2 text-sm font-bold text-slate-500">{card.amount}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">{card.owner.slice(0, 1)}</span>
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-blue-700">IA score</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div> : <EmptyDashboardState title="Aucun pipeline Supabase" detail="Ajoutez des prospects CRM ou des opportunites commerciales pour alimenter cette vue." />}
    </Card>
  );
}

function ActivityFeedWidget({ events }: { events: Array<{ id: string; title: string; module?: string }> }) {
  const feed = events.slice(0, 7);

  return (
    <Card className="p-6" interactive>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black tracking-[-0.03em] text-slate-950">Activite temps reel</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">Timeline: clients, paiements, devis, equipe et automatisations.</p>
        </div>
        <Badge tone="emerald">{feed.length} events</Badge>
      </div>
      {feed.length ? <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {feed.map((event, index) => (
          <motion.div key={event.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="relative rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
            <div className="absolute left-4 top-4 h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_5px_rgba(16,185,129,0.12)]" />
            <div className="pl-6">
              <p className="text-sm font-black text-slate-950">{event.title}</p>
              <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-blue-700">{event.module ?? "CENTRIX"} - maintenant</p>
            </div>
          </motion.div>
        ))}
      </div> : <EmptyDashboardState title="Aucune activite Supabase" detail="Les prochaines actions clients, paiements, tickets ou workflows apparaitront ici." />}
    </Card>
  );
}

function QuickAgendaWidget({ items, tasks }: { items: string[]; tasks: Array<{ id: string; priority: string; title: string }> }) {
  return (
    <Card className="p-6" interactive>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-slate-950">Agenda rapide</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">Rendez-vous, rappels et deadlines critiques.</p>
        </div>
        <CalendarDays size={21} className="text-blue-600" />
      </div>
      <div className="mt-5 space-y-3">
        {items.slice(0, 3).map((item) => (
          <div key={item} className="rounded-[16px] border border-slate-200 bg-white p-4 text-sm font-black text-slate-800 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">{item}</div>
        ))}
        {tasks.slice(0, 2).map((task) => (
          <div key={task.id} className="flex items-center justify-between rounded-[16px] border border-blue-100 bg-blue-50 p-4 text-sm">
            <span className="font-black text-slate-800">{task.title}</span>
            <Badge tone={task.priority === "urgent" ? "rose" : "cyan"}>{task.priority}</Badge>
          </div>
        ))}
        {!items.length && !tasks.length ? <EmptyDashboardState title="Agenda vide" detail="Les rendez-vous et taches Supabase apparaitront ici." compact /> : null}
      </div>
    </Card>
  );
}

function DashboardNotificationsWidget({ notifications, unreadCount }: { notifications: ReturnType<typeof useLiveNotifications>["items"]; unreadCount: number }) {
  const icons = [BellRing, CreditCard, ReceiptText, ShieldCheck];

  return (
    <Card className="p-6" interactive>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-slate-950">Centre notifications</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">Rappels, paiements, support, securite et workflows.</p>
        </div>
        <Badge tone={unreadCount ? "rose" : "emerald"}>{unreadCount} non lues</Badge>
      </div>
      <div className="mt-5 space-y-3">
        {notifications.slice(0, 5).map((notification, index) => {
          const Icon = icons[index % icons.length];
          return (
            <motion.div key={notification.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.035 }} className="flex items-start gap-3 rounded-[18px] border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-blue-50 text-blue-600">
                <Icon size={18} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-950">{notification.title}</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{notification.body}</p>
              </div>
            </motion.div>
          );
        })}
        {!notifications.length ? <EmptyDashboardState title="Aucune notification" detail="Les alertes temps reel Supabase seront affichees ici." compact /> : null}
      </div>
    </Card>
  );
}

function EmptyDashboardState({ compact, detail, title }: { compact?: boolean; detail: string; title: string }) {
  return (
    <div className={compact ? "rounded-[16px] border border-dashed border-slate-200 bg-slate-50 p-4" : "mt-5 rounded-[20px] border border-dashed border-slate-200 bg-slate-50 p-6"}>
      <p className="text-sm font-black text-slate-800">{title}</p>
      <p className="mt-1 text-sm font-black leading-6 text-blue-700">Commencez par créer votre premier élément</p>
      <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">{detail}</p>
    </div>
  );
}

function RechartsWidget({ data, subtitle, title, type, valueSuffix }: { data: Array<{ label: string; value: number }>; subtitle: string; title: string; type: "area" | "bar"; valueSuffix: string }) {
  const formatted = data.map((point) => ({ ...point, value: Number(point.value.toFixed(2)) }));

  return (
    <Card className="p-6" interactive>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-slate-950">{title}</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">{subtitle}</p>
        </div>
        <Badge tone="cyan">{valueSuffix}</Badge>
      </div>
      <ClientOnlyChart className="mt-5 h-64">
        <ResponsiveContainer height="100%" minWidth={0} width="100%">
          {type === "area" ? (
            <AreaChart data={formatted}>
              <CartesianGrid stroke="rgba(15,23,42,0.08)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#475569", fontSize: 12, fontWeight: 700 }} tickLine={false} />
              <YAxis tick={{ fill: "#475569", fontSize: 12, fontWeight: 700 }} tickLine={false} width={34} />
              <Tooltip contentStyle={{ border: "1px solid #dbeafe", borderRadius: 14, boxShadow: "0 18px 44px rgba(15,23,42,0.14)" }} />
              <Area dataKey="value" fill="rgba(37,99,235,0.16)" stroke="#2563EB" strokeWidth={3} type="monotone" />
            </AreaChart>
          ) : (
            <BarChart data={formatted}>
              <CartesianGrid stroke="rgba(15,23,42,0.08)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#475569", fontSize: 12, fontWeight: 700 }} tickLine={false} />
              <YAxis tick={{ fill: "#475569", fontSize: 12, fontWeight: 700 }} tickLine={false} width={34} />
              <Tooltip contentStyle={{ border: "1px solid #dbeafe", borderRadius: 14, boxShadow: "0 18px 44px rgba(15,23,42,0.14)" }} />
              <Bar dataKey="value" fill="#2563EB" radius={[10, 10, 4, 4]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </ClientOnlyChart>
    </Card>
  );
}

function ClientOnlyChart({ children, className }: { children: ReactNode; className: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={className} aria-hidden="true" />;
  }

  return <div className={className}>{children}</div>;
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
