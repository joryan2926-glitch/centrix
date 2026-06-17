"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Bot,
  BrainCircuit,
  Download,
  FileText,
  Goal,
  LineChart,
  Plus,
  Radar,
  Save,
  Sparkles,
  Target,
  TrendingUp,
  WalletCards
} from "lucide-react";
import { formatBiCurrency, formatBiDate, formatBiPercent } from "@/lib/business-intelligence/format";
import { downloadJsonFile } from "@/lib/download";
import { createInsight, getBiDashboard, priorityLabels, priorityTone } from "@/services/business-intelligence/calculations";
import { useBusinessIntelligenceData } from "@/hooks/business-intelligence/useBusinessIntelligenceData";
import { BiKpiCard } from "@/ui/business-intelligence/BiKpiCard";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Skeleton } from "@/ui/Skeleton";
import { Toast } from "@/ui/Toast";
import type { AiInsight, AnalyticsAlert, BusinessIntelligenceData } from "@/types/business-intelligence";

const BiCharts = dynamic(() => import("@/components/business-intelligence/BiCharts").then((module) => module.BiCharts), {
  loading: () => <Skeleton className="h-80" />,
  ssr: false
});

const views = ["dashboard", "predictive", "ai", "scoring", "reports", "modules", "alerts", "goals"] as const;
type View = (typeof views)[number];

const viewLabels: Record<View, string> = {
  dashboard: "Dashboard",
  predictive: "Predictif",
  ai: "IA Business",
  scoring: "Scoring",
  reports: "Reporting",
  modules: "Multi-modules",
  alerts: "Alertes",
  goals: "Objectifs"
};

export function BusinessIntelligenceWorkspace({ initialView = "dashboard" }: { initialView?: View }) {
  const { data, loading, mode, toast, mutate, sync, notify } = useBusinessIntelligenceData();
  const [view, setView] = useState<View>(initialView);
  const [generating, setGenerating] = useState(false);
  const dashboard = useMemo(() => getBiDashboard(data), [data]);

  function addInsight() {
    const insight = createInsight();
    mutate((current) => ({ ...current, insights: [insight, ...current.insights] }), {
      title: "Insight ajoute",
      detail: "Nouvelle recommandation predictive ajoutee."
    });
  }

  async function generateAiReport() {
    setGenerating(true);
    try {
      const response = await fetch("/api/business-intelligence/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metrics: data.predictiveMetrics, alerts: data.alerts })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      mutate((current) => ({
        ...current,
        insights: [
          { ...createInsight(), title: payload.title, summary: payload.summary, recommendation: payload.recommendation },
          ...current.insights
        ]
      }), { title: "Rapport IA genere", detail: "Insight analytics ajoute au dashboard." });
    } catch (error) {
      notify("Mistral non configure", error instanceof Error ? error.message : "Ajoutez MISTRAL_API_KEY pour activer les insights IA.");
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
        <Skeleton className="h-36" />
        <Skeleton className="h-[560px]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      {toast ? <Toast {...toast} /> : null}
      <Hero mode={mode} generating={generating} onAddInsight={addInsight} onGenerate={generateAiReport} onSync={sync} />
      <KpiGrid dashboard={dashboard} />
      <Tabs value={view} onChange={setView} />
      <ViewContent data={data} view={view} />
    </div>
  );
}

function Hero({ mode, generating, onAddInsight, onGenerate, onSync }: {
  mode: string;
  generating: boolean;
  onAddInsight: () => void;
  onGenerate: () => void;
  onSync: () => void;
}) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <Badge tone="cyan">CENTRIX Intelligence</Badge>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Business Intelligence & IA Predictive
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
            Analytics avancee, previsions, scoring, alertes intelligentes et rapports IA pour piloter l&apos;entreprise en temps reel.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onAddInsight}><Plus size={17} /> Insight</Button>
          <Button onClick={onGenerate} variant="surface"><Bot size={17} /> {generating ? "Generation..." : "Rapport IA"}</Button>
          <Button onClick={onSync} variant="primary"><Save size={17} /> Sync {mode}</Button>
        </div>
      </div>
    </Card>
  );
}

function KpiGrid({ dashboard }: { dashboard: ReturnType<typeof getBiDashboard> }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <BiKpiCard delta={formatBiPercent(dashboard.estimatedGrowth)} icon={<TrendingUp size={19} />} label="Revenus predictifs" value={formatBiCurrency(dashboard.predictiveRevenue)} />
      <BiKpiCard delta="risque" icon={<AlertTriangle size={19} />} label="Churn clients" tone="rose" value={`${dashboard.churn.toFixed(1)}%`} />
      <BiKpiCard delta="score" icon={<BrainCircuit size={19} />} label="Scoring business" tone="violet" value={String(Math.round(dashboard.businessScore))} />
      <BiKpiCard delta="cashflow" icon={<WalletCards size={19} />} label="Cashflow predictif" tone="emerald" value={formatBiCurrency(dashboard.predictiveCashflow)} />
      <BiKpiCard delta="equipes" icon={<Target size={19} />} label="Performances equipes" value={formatBiPercent(dashboard.teamPerformance)} />
      <BiKpiCard delta="marketing" icon={<Radar size={19} />} label="ROI marketing" tone="emerald" value={`${dashboard.marketingRoi.toFixed(1)}x`} />
      <BiKpiCard delta="sales" icon={<LineChart size={19} />} label="Perf commerciales" value={formatBiPercent(dashboard.salesPerformance)} />
      <BiKpiCard delta="models" icon={<Sparkles size={19} />} label="Modeles actifs" tone="violet" value={String(dashboard.activeModels)} />
    </section>
  );
}

function Tabs({ value, onChange }: { value: View; onChange: (view: View) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto rounded-[14px] border border-slate-200 bg-white/70 p-1 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
      {views.map((item) => (
        <button
          key={item}
          className={`h-10 shrink-0 rounded-[12px] px-3 text-sm font-semibold transition-all ${value === item ? "bg-blue-600 text-white shadow-[0_12px_28px_rgba(37,99,235,0.22)]" : "text-slate-500 hover:bg-blue-50 hover:text-blue-700"}`}
          onClick={() => onChange(item)}
        >
          {viewLabels[item]}
        </button>
      ))}
    </div>
  );
}

function ViewContent({ data, view }: { data: BusinessIntelligenceData; view: View }) {
  if (view === "dashboard") return <><BiCharts data={data} /><InsightGrid insights={data.insights} /></>;
  if (view === "predictive") return <PredictiveView data={data} />;
  if (view === "ai") return <AiView insights={data.insights} />;
  if (view === "scoring") return <ScoringView data={data} />;
  if (view === "reports") return <ReportsView data={data} />;
  if (view === "modules") return <ModulesView data={data} />;
  if (view === "alerts") return <AlertsView alerts={data.alerts} />;
  return <GoalsView data={data} />;
}

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return <div className="flex items-center gap-2 text-slate-950">{icon}<h2 className="text-lg font-black">{title}</h2></div>;
}

function PredictiveView({ data }: { data: BusinessIntelligenceData }) {
  return (
    <Card className="p-5">
      <SectionTitle icon={<TrendingUp size={18} />} title="Analytics predictifs" />
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {data.predictiveMetrics.map((metric) => (
          <Card key={metric.id} interactive className="p-4">
            <Badge tone={metric.trend === "up" ? "emerald" : metric.trend === "down" ? "rose" : "cyan"}>{metric.module}</Badge>
            <p className="mt-4 font-bold text-slate-950">{metric.label}</p>
            <p className="mt-2 text-sm text-slate-500">Actuel {metric.currentValue} - predit {metric.predictedValue}</p>
            <div className="mt-4 h-2 rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400" style={{ width: `${metric.confidence}%` }} />
            </div>
            <p className="mt-2 text-xs font-semibold text-slate-500">Confiance {metric.confidence}% - {metric.period}</p>
          </Card>
        ))}
      </div>
    </Card>
  );
}

function AiView({ insights }: { insights: AiInsight[] }) {
  return <Card className="p-5"><SectionTitle icon={<Bot size={18} />} title="Assistant IA analytics" /><div className="mt-5 grid gap-3">{insights.map((insight) => <InsightCard key={insight.id} insight={insight} />)}</div></Card>;
}

function ScoringView({ data }: { data: BusinessIntelligenceData }) {
  return (
    <Card className="p-5">
      <SectionTitle icon={<BrainCircuit size={18} />} title="Scoring entreprise" />
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {data.scores.map((score) => (
          <Card key={score.id} interactive className="p-4">
            <p className="text-sm font-semibold text-slate-500">#{score.rank} {score.category}</p>
            <p className="mt-3 font-bold text-slate-950">{score.entity}</p>
            <p className="mt-3 text-4xl font-black text-blue-700">{score.score}</p>
            <Badge tone={score.change >= 0 ? "emerald" : "rose"}>{score.change >= 0 ? "+" : ""}{score.change} pts</Badge>
          </Card>
        ))}
      </div>
    </Card>
  );
}

function ReportsView({ data }: { data: BusinessIntelligenceData }) {
  return (
    <Card className="p-5">
      <SectionTitle icon={<FileText size={18} />} title="Reporting avance" />
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.16em] text-slate-500">
            <tr><th className="pb-3">Rapport</th><th className="pb-3">Template</th><th className="pb-3">Owner</th><th className="pb-3">Statut</th><th className="pb-3">Export</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.reports.map((report) => (
              <tr key={report.id}>
                <td className="py-3 font-semibold text-slate-950">{report.title}</td>
                <td className="py-3 text-slate-600">{report.template}</td>
                <td className="py-3 text-slate-600">{report.owner}</td>
                <td className="py-3"><Badge tone={report.status === "published" ? "emerald" : report.status === "scheduled" ? "cyan" : "violet"}>{report.status}</Badge></td>
                <td className="py-3"><Button className="h-9 px-3" onClick={() => downloadJsonFile(`centrix-rapport-${report.id}.json`, report)} variant="surface"><Download size={15} /> Export</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function ModulesView({ data }: { data: BusinessIntelligenceData }) {
  return (
    <Card className="p-5">
      <SectionTitle icon={<BarChart3 size={18} />} title="Analytics multi-modules" />
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {data.performanceMetrics.map((metric) => (
          <div key={metric.id} className="rounded-[14px] border border-slate-200 bg-white/70 p-4">
            <p className="font-bold text-slate-950">{metric.module}</p>
            <p className="mt-1 text-sm text-slate-500">{metric.label} - {metric.month}</p>
            <p className="mt-3 text-2xl font-black text-blue-700">{metric.value}</p>
            <p className="text-xs text-slate-500">Benchmark {metric.benchmark}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function AlertsView({ alerts }: { alerts: AnalyticsAlert[] }) {
  return (
    <Card className="p-5">
      <SectionTitle icon={<AlertTriangle size={18} />} title="Alertes intelligentes" />
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {alerts.map((alert) => (
          <div key={alert.id} className="rounded-[14px] border border-slate-200 bg-white/70 p-4">
            <Badge tone={priorityTone(alert.priority)}>{priorityLabels[alert.priority]}</Badge>
            <p className="mt-3 font-bold text-slate-950">{alert.title}</p>
            <p className="mt-2 text-sm text-slate-500">{alert.detail}</p>
            <p className="mt-3 text-xs text-slate-400">{alert.module} - {formatBiDate(alert.createdAt)}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function GoalsView({ data }: { data: BusinessIntelligenceData }) {
  return (
    <Card className="p-5">
      <SectionTitle icon={<Goal size={18} />} title="Objectifs & KPI" />
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {data.goals.map((goal) => {
          const progress = Math.min(100, (goal.current / goal.target) * 100);
          return (
            <Card key={goal.id} interactive className="p-4">
              <p className="font-bold text-slate-950">{goal.title}</p>
              <p className="mt-1 text-sm text-slate-500">{goal.owner} - echeance {formatBiDate(goal.dueAt)}</p>
              <div className="mt-4 h-2 rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-500" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-700">{formatBiPercent(progress)} atteint</p>
            </Card>
          );
        })}
      </div>
    </Card>
  );
}

function InsightGrid({ insights }: { insights: AiInsight[] }) {
  return <section className="grid gap-3 md:grid-cols-3">{insights.map((insight) => <InsightCard key={insight.id} insight={insight} />)}</section>;
}

function InsightCard({ insight }: { insight: AiInsight }) {
  return (
    <Card interactive className="p-4">
      <Badge tone={priorityTone(insight.priority)}>{priorityLabels[insight.priority]}</Badge>
      <p className="mt-4 font-bold text-slate-950">{insight.title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{insight.summary}</p>
      <p className="mt-3 rounded-[14px] bg-blue-50 p-3 text-sm font-medium text-blue-800">{insight.recommendation}</p>
      <p className="mt-3 text-xs text-slate-400">{insight.source} - impact {insight.impactScore} - {formatBiDate(insight.createdAt)}</p>
    </Card>
  );
}
