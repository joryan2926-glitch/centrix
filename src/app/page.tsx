import { ArrowUpRight, CheckCircle2, CircleDollarSign, Clock3, Sparkles, Zap } from "lucide-react";
import { InteractiveChart } from "@/components/saas/InteractiveChart";
import { acquisitionSeries, revenueSeries } from "@/data/charts";
import { liveAutomations, pipeline, quickStats } from "@/data/dashboard";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { MetricCard } from "@/ui/MetricCard";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="min-h-[360px] p-6 sm:p-8" interactive>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-[8px] border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs uppercase tracking-[0.18em] text-cyan-100">
                <Sparkles size={14} />
                SaaS control tower
              </div>
              <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-normal text-white sm:text-6xl">
                Pilotez toute l&apos;entreprise depuis CENTRIX.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
                CRM, revenus, clients, operations, RH, marketing et IA business dans une interface premium concue pour aller vite.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {["Realtime CRM", "Forecast IA", "Finance sync"].map((item) => (
                  <div key={item} className="rounded-[8px] border border-white/10 bg-white/[0.045] px-3 py-2 text-sm text-slate-300 backdrop-blur-xl">
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <Button variant="primary">
              Lancer l&apos;analyse
              <ArrowUpRight size={17} />
            </Button>
          </div>
        </Card>

        <Card className="p-6 animate-float-soft" interactive>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Score business</p>
              <p className="mt-2 text-5xl font-semibold text-white">91</p>
            </div>
            <div className="grid h-14 w-14 place-items-center rounded-[8px] bg-violet-300/15 text-violet-100">
              <Zap size={25} />
            </div>
          </div>
          <div className="mt-6 h-3 rounded-full bg-white/10">
            <div className="h-full w-[91%] rounded-full bg-gradient-to-r from-electric via-violet to-fuchsia-400" />
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-400">Croissance stable, pipeline fort, vigilance sur deux comptes entreprise.</p>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <InteractiveChart
          data={revenueSeries}
          subtitle="MRR, pipeline et expansion comptes sur 7 mois"
          title="Revenus predictifs"
          valueSuffix="K EUR"
        />
        <InteractiveChart
          data={acquisitionSeries}
          subtitle="Canaux les plus performants en valeur business"
          title="Acquisition"
          type="bar"
          valueSuffix="%"
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickStats.map((stat) => (
          <MetricCard key={stat.label} metric={stat} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Card>
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <h2 className="text-base font-semibold text-white">Pipeline prioritaire</h2>
            <CircleDollarSign size={19} className="text-emerald-300" />
          </div>
          <div className="divide-y divide-white/10">
            {pipeline.map((deal) => (
              <div key={deal.company} className="grid gap-4 px-5 py-4 sm:grid-cols-[1fr_120px_110px] sm:items-center">
                <div>
                  <p className="font-medium text-white">{deal.company}</p>
                  <p className="mt-1 text-sm text-slate-400">{deal.stage}</p>
                </div>
                <p className="text-sm font-semibold text-cyan-100">{deal.value}</p>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-emerald-300" style={{ width: deal.progress }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5" interactive>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Automatisations live</h2>
            <Clock3 size={19} className="text-cyan-200" />
          </div>
          <div className="mt-5 space-y-3">
            {liveAutomations.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-[8px] border border-white/10 bg-white/[0.045] p-3 transition-colors duration-200 hover:bg-white/[0.07]">
                <CheckCircle2 size={18} className="text-emerald-300" />
                <span className="text-sm text-slate-200">{item}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
