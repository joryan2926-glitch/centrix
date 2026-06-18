"use client";

import dynamic from "next/dynamic";
import { BadgeCheck, BriefcaseBusiness, CreditCard, Filter, MessageSquare, PackageCheck, Plus, Save, Search, ShieldCheck, Sparkles, Star, Store, UsersRound, WalletCards } from "lucide-react";
import { useMemo, useState } from "react";
import { formatMarketplaceCurrency, formatMarketplaceDate, formatMarketplaceRating } from "@/lib/marketplace/format";
import { createMarketplaceNotification, createMarketplaceService, getMarketplaceDashboard, orderStatusLabels, orderTone } from "@/services/marketplace/calculations";
import { useMarketplaceData } from "@/hooks/marketplace/useMarketplaceData";
import { MarketplaceKpiCard } from "@/ui/marketplace/MarketplaceKpiCard";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Skeleton } from "@/ui/Skeleton";
import { Toast } from "@/ui/Toast";

const MarketplaceCharts = dynamic(() => import("@/components/marketplace/MarketplaceCharts").then((module) => module.MarketplaceCharts), {
  loading: () => <Skeleton className="h-80" />,
  ssr: false
});

const views = ["dashboard", "services", "providers", "orders", "payments", "reviews", "messages", "premium"] as const;
type View = (typeof views)[number];

export function MarketplaceWorkspace({ initialView = "dashboard" }: { initialView?: View }) {
  const { data, loading, mode, toast, mutate, sync, notify } = useMarketplaceData();
  const [view, setView] = useState<View>(initialView);
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const dashboard = useMemo(() => getMarketplaceDashboard(data), [data]);
  const services = data.services.filter((service) => {
    const provider = data.providers.find((item) => item.id === service.providerId);
    const matchesQuery = !query || service.title.toLowerCase().includes(query.toLowerCase()) || provider?.name.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = categoryId === "all" || service.categoryId === categoryId;
    return matchesQuery && matchesCategory;
  });

  function addService() {
    const service = createMarketplaceService(data.providers[0]?.id ?? "prov-ops", data.categories[0]?.id ?? "cat-mkt");
    mutate((current) => ({ ...current, services: [service, ...current.services], notifications: [createMarketplaceNotification("Service cree", service.title, "success"), ...current.notifications] }), { title: "Service cree", detail: "Brouillon ajoute au marketplace." });
  }

  async function onboardProvider(providerId: string) {
    const provider = data.providers.find((item) => item.id === providerId);
    try {
      const response = await fetch("/api/stripe/connect/onboarding", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accountId: provider?.stripeAccountId, email: provider?.email }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      window.location.href = payload.url;
    } catch (error) {
      notify("Stripe Connect indisponible", error instanceof Error ? error.message : "Configurez STRIPE_SECRET_KEY pour activer Connect.");
    }
  }

  if (loading) return <div className="mx-auto max-w-7xl space-y-6 animate-fade-in"><Skeleton className="h-36" /><Skeleton className="h-[560px]" /></div>;

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      {toast ? <Toast {...toast} /> : null}
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div><Badge tone="violet">CENTRIX Ecosystem</Badge><h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Marketplace Services</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">Plateforme marketplace pour vendre services, missions, formations, automatisations et expertise directement dans l&apos;ecosysteme CENTRIX.</p></div>
          <div className="flex flex-wrap gap-2"><Button onClick={addService}><Plus size={17} /> Service</Button><Button onClick={sync} variant="primary"><Save size={17} /> Sync {mode}</Button></div>
        </div>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <MarketplaceKpiCard delta="publies" icon={<Store size={19} />} label="Services" value={String(dashboard.publishedServices)} />
        <MarketplaceKpiCard delta="missions" icon={<PackageCheck size={19} />} label="Ventes realisees" tone="emerald" value={String(dashboard.sales)} />
        <MarketplaceKpiCard delta="freelances" icon={<UsersRound size={19} />} label="Prestataires actifs" value={String(dashboard.activeProviders)} />
        <MarketplaceKpiCard delta="GMV" icon={<WalletCards size={19} />} label="Revenus marketplace" tone="emerald" value={formatMarketplaceCurrency(dashboard.revenue)} />
        <MarketplaceKpiCard delta="pipeline" icon={<BriefcaseBusiness size={19} />} label="Commandes en cours" value={String(dashboard.activeOrders)} />
        <MarketplaceKpiCard delta="CENTRIX" icon={<CreditCard size={19} />} label="Commissions" tone="violet" value={formatMarketplaceCurrency(dashboard.commissions)} />
      </section>

      <div className="flex gap-2 overflow-x-auto rounded-[8px] border border-white/10 bg-white/[0.045] p-1">
        {views.map((item) => <button key={item} className={`h-10 shrink-0 rounded-[8px] px-3 text-sm capitalize transition-all ${view === item ? "bg-white/12 text-white" : "text-slate-400 hover:bg-white/8 hover:text-white"}`} onClick={() => setView(item)}>{item}</button>)}
      </div>

      {view === "dashboard" ? <><MarketplaceCharts data={data} /><NotificationGrid items={data.notifications} /></> : null}

      {view === "services" ? (
        <section className="grid gap-4 xl:grid-cols-[260px_1fr]">
          <Card className="p-4"><div className="flex h-10 items-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-sm text-slate-400"><Search size={16} /><input className="w-full bg-transparent outline-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher" /></div><div className="mt-4 space-y-2"><button className="flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-sm text-slate-300 hover:bg-white/8" onClick={() => setCategoryId("all")}><Filter size={15} /> Toutes</button>{data.categories.map((category) => <button key={category.id} className={`flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-sm ${categoryId === category.id ? "bg-white/12 text-white" : "text-slate-400 hover:bg-white/8"}`} onClick={() => setCategoryId(category.id)}><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: category.color }} />{category.name}</button>)}</div></Card>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{services.map((service) => { const provider = data.providers.find((item) => item.id === service.providerId); return <Card key={service.id} interactive className="p-4"><div className="flex items-center justify-between"><Badge tone={service.status === "featured" ? "violet" : service.status === "published" ? "emerald" : "cyan"}>{service.status}</Badge><span className="text-sm text-slate-400">{formatMarketplaceCurrency(service.price)}</span></div><p className="mt-4 font-semibold text-white">{service.title}</p><p className="mt-2 text-sm leading-6 text-slate-400">{service.description}</p><p className="mt-3 text-xs text-slate-500">{provider?.name} - {service.deliveryDays} jours - {formatMarketplaceRating(service.rating)}/5</p></Card>; })}</div>
        </section>
      ) : null}

      {view === "providers" ? <Card className="p-5"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{data.providers.map((provider) => <Card key={provider.id} interactive className="p-4"><div className="flex items-center justify-between"><p className="font-semibold text-white">{provider.name}</p><Badge tone={provider.verified ? "emerald" : "rose"}>{provider.verified ? "verifie" : "onboarding"}</Badge></div><p className="mt-1 text-sm text-slate-400">{provider.companyName}</p><div className="mt-3 flex flex-wrap gap-2">{provider.skills.map((skill) => <Badge key={skill} tone="cyan">{skill}</Badge>)}</div><p className="mt-3 text-sm text-slate-300">{formatMarketplaceRating(provider.rating)}/5 - {provider.completedOrders} missions</p><Button className="mt-4 h-9 px-3" onClick={() => onboardProvider(provider.id)}><ShieldCheck size={15} /> Stripe Connect</Button></Card>)}</div></Card> : null}

      {view === "orders" ? <Card className="p-5"><h2 className="text-lg font-semibold text-white">Commandes & missions</h2><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="text-xs uppercase tracking-[0.16em] text-slate-500"><tr><th className="pb-3">Client</th><th className="pb-3">Service</th><th className="pb-3">Montant</th><th className="pb-3">Statut</th><th className="pb-3">Deadline</th></tr></thead><tbody className="divide-y divide-white/10">{data.orders.map((order) => <tr key={order.id}><td className="py-3 text-white">{order.clientName}</td><td className="py-3 text-slate-300">{data.services.find((service) => service.id === order.serviceId)?.title}</td><td className="py-3 text-slate-300">{formatMarketplaceCurrency(order.amount)}</td><td className="py-3"><Badge tone={orderTone(order.status)}>{orderStatusLabels[order.status]}</Badge></td><td className="py-3 text-slate-500">{formatMarketplaceDate(order.dueAt)}</td></tr>)}</tbody></table></div></Card> : null}

      {view === "payments" ? <Card className="p-5"><h2 className="text-lg font-semibold text-white">Paiements & payouts</h2><div className="mt-5 grid gap-3 md:grid-cols-2">{data.payouts.map((payout) => <div key={payout.id} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4"><Badge tone={payout.status === "paid" ? "emerald" : payout.status === "failed" ? "rose" : "cyan"}>{payout.status}</Badge><p className="mt-3 text-xl font-semibold text-white">{formatMarketplaceCurrency(payout.amount)}</p><p className="mt-1 text-sm text-slate-400">{data.providers.find((provider) => provider.id === payout.providerId)?.name}</p></div>)}</div></Card> : null}

      {view === "reviews" ? <Card className="p-5"><h2 className="text-lg font-semibold text-white">Avis & reputation</h2><div className="mt-5 grid gap-3 md:grid-cols-2">{data.reviews.map((review) => <div key={review.id} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4"><Star className="text-amber-300" size={18} /><p className="mt-3 font-semibold text-white">{review.rating}/5 - {review.clientName}</p><p className="mt-2 text-sm text-slate-400">{review.comment}</p></div>)}</div></Card> : null}

      {view === "messages" ? <Card className="p-5"><h2 className="text-lg font-semibold text-white">Messagerie mission</h2><div className="mt-5 space-y-3">{data.messages.map((message) => <div key={message.id} className={`max-w-2xl rounded-[8px] border p-4 ${message.authorType === "provider" ? "ml-auto border-cyan-200/25 bg-cyan-300/10" : "border-white/10 bg-white/[0.04]"}`}><p className="text-sm text-white">{message.content}</p><p className="mt-2 text-xs text-slate-500">{message.authorName}</p></div>)}</div></Card> : null}

      {view === "premium" ? <Card className="p-5"><div className="flex items-center gap-2"><Sparkles size={18} className="text-cyan-100" /><h2 className="text-lg font-semibold text-white">Abonnements & mise en avant premium</h2></div><div className="mt-5 grid gap-3 md:grid-cols-3">{["Badge premium", "Services sponsorises", "Analytics avances", "Commissions optimisees", "Priorite recherche", "Portfolio enrichi"].map((item) => <div key={item} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4"><BadgeCheck className="text-emerald-300" size={18} /><p className="mt-3 text-sm font-medium text-white">{item}</p></div>)}</div></Card> : null}
    </div>
  );
}

function NotificationGrid({ items }: { items: Array<{ id: string; title: string; detail: string; severity: "info" | "success" | "warning"; createdAt: string }> }) {
  return <section className="grid gap-3 md:grid-cols-3">{items.map((item) => <Card key={item.id} interactive className="p-4"><MessageSquare size={18} className="text-cyan-100" /><p className="mt-3 font-semibold text-white">{item.title}</p><p className="mt-2 text-sm text-slate-400">{item.detail}</p><p className="mt-3 text-xs text-slate-500">{formatMarketplaceDate(item.createdAt)}</p></Card>)}</section>;
}
