import { BarChart3, TrendingUp, Users, WalletCards } from "lucide-react";
import { InteractiveChart } from "@/components/saas/InteractiveChart";
import { acquisitionSeries, revenueSeries } from "@/data/charts";
import { Card } from "@/ui/Card";
import { MetricCard } from "@/ui/MetricCard";

const metrics = [
  { label: "Revenus suivis", value: "428K EUR", delta: "+24%", tone: "cyan" as const },
  { label: "Clients actifs", value: "1 284", delta: "+11%", tone: "emerald" as const },
  { label: "Conversion", value: "18.7%", delta: "+3.2 pts", tone: "violet" as const }
];

export default function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Card className="p-6">
          <div className="flex items-center gap-3 text-blue-600"><BarChart3 size={20} /><span className="text-sm font-bold uppercase tracking-[0.18em]">CENTRIX Analytics</span></div>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950">Pilotage business consolide</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">Vue executive sur les revenus, la croissance, les clients et la performance commerciale.</p>
        </Card>
        <Card className="p-5">
          <WalletCards className="text-blue-600" size={22} />
          <p className="mt-4 text-sm text-slate-500">Score plateforme</p>
          <p className="mt-2 text-5xl font-black text-slate-950">94</p>
          <p className="mt-3 text-sm text-slate-500">Croissance saine, pipeline solide et activation modules elevee.</p>
        </Card>
      </section>
      <section className="grid gap-4 md:grid-cols-3">{metrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}</section>
      <section className="grid gap-6 xl:grid-cols-2">
        <InteractiveChart data={revenueSeries} subtitle="Revenus consolides par mois" title={"Evolution chiffre d'affaires"} valueSuffix="K EUR" />
        <InteractiveChart data={acquisitionSeries} subtitle={"Canaux d'acquisition et performance"} title="Acquisition clients" type="bar" valueSuffix="%" />
      </section>
      <Card className="p-5">
        <div className="grid gap-3 md:grid-cols-3">
          {["Pipeline commercial", "Activite temps reel", "Previsions IA"].map((item, index) => (
            <div key={item} className="rounded-[14px] border border-slate-200 bg-white/70 p-4">
              {index === 0 ? <TrendingUp className="text-blue-600" size={19} /> : <Users className="text-blue-600" size={19} />}
              <p className="mt-3 font-semibold text-slate-950">{item}</p>
              <p className="mt-1 text-sm text-slate-500">Widget analytics pret pour extension enterprise.</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
