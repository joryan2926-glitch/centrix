"use client";

import { BarChart3, CircleDollarSign, Target, Users, WalletCards } from "lucide-react";
import { InteractiveChart } from "@/components/saas/InteractiveChart";
import { useSaasCoreDashboard } from "@/hooks/saas-core/useSaasCoreDashboard";
import { Card } from "@/ui/Card";
import { DataState } from "@/ui/DataState";
import { MetricCard } from "@/ui/MetricCard";

const euro = new Intl.NumberFormat("fr-FR", {
  currency: "EUR",
  maximumFractionDigits: 0,
  style: "currency"
});

export default function AnalyticsPage() {
  const { data, snapshot, loading, refresh } = useSaasCoreDashboard();
  const revenueSeries = snapshot?.revenueSeries ?? [];
  const acquisitionSeries = snapshot?.leadSeries ?? [];
  const hasRevenue = revenueSeries.some((point) => point.value > 0);
  const hasAcquisition = acquisitionSeries.some((point) => point.value > 0);
  const score = snapshot ? Math.round(((snapshot.conversionRate || 0) + (snapshot.profitability || 0) + Math.min(snapshot.projectsActive * 5, 100)) / 3) : 0;
  const metrics = [
    { label: "Revenus suivis", value: euro.format(snapshot?.paidRevenue ?? 0), delta: `${(snapshot?.growthRate ?? 0).toFixed(1)}% croissance`, tone: "cyan" as const },
    { label: "Clients actifs", value: String(snapshot?.clientsCount ?? 0), delta: `${snapshot?.prospectsCount ?? 0} prospects`, tone: "emerald" as const },
    { label: "Conversion", value: `${(snapshot?.conversionRate ?? 0).toFixed(1)}%`, delta: `${snapshot?.pendingQuotes ?? 0} devis en attente`, tone: "violet" as const }
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Card className="p-6">
          <div className="flex items-center gap-3 text-blue-600"><BarChart3 size={20} /><span className="text-sm font-bold uppercase tracking-[0.18em]">CENTRIX Analytics</span></div>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950">Pilotage business consolide</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Toutes les metriques proviennent des tables Supabase reelles. Aucun chiffre fictif n&apos;est affiche.
          </p>
        </Card>
        <Card className="p-5">
          <WalletCards className="text-blue-600" size={22} />
          <p className="mt-4 text-sm text-slate-500">Score plateforme</p>
          <p className="mt-2 text-5xl font-black text-slate-950">{score}</p>
          <p className="mt-3 text-sm text-slate-500">Calcule depuis conversion, rentabilite et projets actifs Supabase.</p>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">{metrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}</section>

      <section className="grid gap-6 xl:grid-cols-2">
        <DataState actionHref="/facturation" actionLabel="Creer une facture" loading={loading} empty={!hasRevenue} emptyTitle="Aucun revenu disponible" emptyDetail="Creez une facture, un paiement ou une transaction de revenu pour alimenter ce graphique." onRetry={refresh}>
          <InteractiveChart data={revenueSeries} subtitle="Revenus consolides depuis Supabase" title="Evolution chiffre d'affaires" valueSuffix="K EUR" />
        </DataState>
        <DataState actionHref="/crm" actionLabel="Ajouter un prospect" loading={loading} empty={!hasAcquisition} emptyTitle="Aucune acquisition disponible" emptyDetail="Ajoutez des prospects ou leads CRM pour alimenter ce graphique." onRetry={refresh}>
          <InteractiveChart data={acquisitionSeries} subtitle="Prospects et clients crees depuis Supabase" title="Acquisition clients" type="bar" valueSuffix="" />
        </DataState>
      </section>

      <Card className="p-5">
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { label: "Pipeline commercial", value: snapshot?.businessPipeline.length ?? 0, icon: Target },
            { label: "Activite temps reel", value: data.events.length, icon: Users },
            { label: "Previsions IA", value: euro.format(snapshot?.forecastRevenue ?? 0), icon: CircleDollarSign }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-[14px] border border-slate-200 bg-white/70 p-4">
                <Icon className="text-blue-600" size={19} />
                <p className="mt-3 font-semibold text-slate-950">{item.label}</p>
                <p className="mt-1 text-sm font-black text-slate-600">{item.value}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
