"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Activity, ArrowUpRight, Bot, CalendarDays, CheckCircle2, CircleDollarSign, Clock3, Sparkles, Target, UsersRound, Zap } from "lucide-react";
import { CentrixLogo, DataTable } from "@/components/ui";
import { InteractiveChart } from "@/components/saas/InteractiveChart";
import { acquisitionSeries, revenueSeries } from "@/data/charts";
import { liveAutomations, pipeline, quickStats } from "@/data/dashboard";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { MetricCard } from "@/ui/MetricCard";

const recentTasks = [
  { id: "task-1", task: "Relancer NovaCore", owner: "CRM", priority: "Haute", status: "Aujourd'hui" },
  { id: "task-2", task: "Verifier TVA mensuelle", owner: "Finance", priority: "Moyenne", status: "En cours" },
  { id: "task-3", task: "Publier campagne LinkedIn", owner: "Marketing", priority: "Normale", status: "Planifie" },
  { id: "task-4", task: "Valider onboarding Blue Atlas", owner: "CS", priority: "Haute", status: "Demain" }
];

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

export function DashboardHome() {
  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[30px] bg-[#050b18] p-6 text-white shadow-[0_34px_110px_rgba(15,23,42,0.26)] sm:p-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(37,99,235,0.32),transparent_36%),radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.18),transparent_34%)]" />
        <div className="absolute right-10 top-8 hidden h-44 w-44 rounded-full border border-blue-200/20 lg:block" />
        <div className="absolute right-20 top-16 hidden h-24 w-24 rounded-full border border-cyan-200/20 lg:block" />
        <div className="relative z-10 grid gap-8 xl:grid-cols-[1fr_420px] xl:items-end">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.08] px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-blue-100">
              <CentrixLogo compact inverse />
              Executive command center
            </div>
            <h1 className="mt-7 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
              Pilotez CENTRIX comme une startup IA haut de gamme.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-blue-50/72">
              Vue globale, KPI, analytics, activite recente, pipeline, revenus, performance equipe et recommandations IA dans un cockpit enterprise premium.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="primary">
                Analyse IA
                <Sparkles size={17} />
              </Button>
              <Button className="border-white/15 bg-white/10 text-white hover:bg-white/15 hover:text-white">
                Rapport executive
                <ArrowUpRight size={17} />
              </Button>
            </div>
          </div>

          <Card className="border-white/10 bg-white/[0.08] p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-50/70">Business health</p>
                <p className="mt-2 text-6xl font-black">91</p>
              </div>
              <div className="grid h-16 w-16 place-items-center rounded-[20px] bg-blue-500/20 text-cyan-100">
                <Zap size={28} />
              </div>
            </div>
            <div className="mt-6 h-3 rounded-full bg-white/10">
              <motion.div initial={{ width: 0 }} animate={{ width: "91%" }} transition={{ duration: 0.8 }} className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-300 to-violet-300" />
            </div>
            <p className="mt-4 text-sm leading-6 text-blue-50/64">Pipeline fort, marge saine, vigilance sur deux comptes enterprise.</p>
          </Card>
        </div>
      </motion.section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickStats.map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <MetricCard metric={stat} />
          </motion.div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.55fr]">
        <InteractiveChart data={revenueSeries} subtitle="MRR, expansion comptes, cashflow et previsionnel sur 7 mois" title="Analytics business global" valueSuffix="K EUR" />
        <Card className="p-5" interactive>
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

      <section className="grid gap-6 xl:grid-cols-[0.95fr_0.95fr_0.7fr]">
        <Card>
          <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4">
            <h2 className="text-base font-black text-slate-950">Pipeline CRM</h2>
            <Target size={19} className="text-blue-600" />
          </div>
          <div className="divide-y divide-slate-100">
            {pipeline.map((deal) => (
              <div key={deal.company} className="grid gap-4 px-5 py-4 sm:grid-cols-[1fr_110px] sm:items-center">
                <div>
                  <p className="font-semibold text-slate-950">{deal.company}</p>
                  <p className="mt-1 text-sm text-slate-500">{deal.stage} · {deal.value}</p>
                  <div className="mt-3 h-2 rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400" style={{ width: deal.progress }} />
                  </div>
                </div>
                <Badge tone="cyan">{deal.progress}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <DataTable
          title="Taches recentes"
          rows={recentTasks}
          getRowKey={(row) => row.id}
          columns={[
            { key: "task", header: "Tache" },
            { key: "owner", header: "Module", render: (row) => <Badge tone="cyan">{row.owner}</Badge> },
            { key: "status", header: "Statut", render: (row) => <span className="font-semibold text-slate-950">{row.status}</span> }
          ]}
        />

        <Card className="p-5" interactive>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-950">Calendrier</h2>
            <CalendarDays size={19} className="text-blue-600" />
          </div>
          <div className="mt-5 space-y-3">
            {["Comite revenus - 10:30", "Demo client - 14:00", "Revue securite - 16:15"].map((event) => (
              <div key={event} className="rounded-[16px] border border-slate-200 bg-white/76 p-4 text-sm font-semibold text-slate-700">
                {event}
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_0.8fr_1fr]">
        <Card className="p-5" interactive>
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-[16px] bg-blue-600 text-white">
              <Bot size={22} />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-950">Analytics IA</h2>
              <p className="text-sm text-slate-500">Insights temps reel</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {aiInsights.map((insight) => (
              <div key={insight} className="flex items-start gap-3 rounded-[16px] border border-slate-200 bg-white/78 p-4">
                <Sparkles size={17} className="mt-0.5 text-blue-600" />
                <span className="text-sm font-medium leading-6 text-slate-700">{insight}</span>
              </div>
            ))}
          </div>
        </Card>

        <InteractiveChart data={acquisitionSeries} subtitle="Canaux les plus performants par contribution business" title="Acquisition" type="bar" valueSuffix="%" />

        <Card className="p-5" interactive>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-950">Performance equipe</h2>
            <UsersRound size={20} className="text-blue-600" />
          </div>
          <div className="mt-5 space-y-4">
            {teamPerformance.map((team) => (
              <div key={team.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">{team.label}</span>
                  <span className="font-black text-slate-950">{team.value}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 to-violet-500" style={{ width: `${team.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.7fr]">
        <Card className="p-5" interactive>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-950">Activite recente</h2>
            <Activity size={19} className="text-blue-600" />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {["Facture Stripe synchronisee", "Lead IA score 92", "Document signe", "Webhook Slack execute"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-[16px] border border-slate-200 bg-white/76 p-4">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <span className="text-sm font-semibold text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5" interactive>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-950">Automatisations live</h2>
            <Clock3 size={19} className="text-blue-600" />
          </div>
          <div className="mt-5 space-y-3">
            {liveAutomations.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-[16px] border border-slate-200 bg-white/70 p-3 transition-colors duration-200 hover:bg-blue-50">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <span className="text-sm font-medium text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>
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
