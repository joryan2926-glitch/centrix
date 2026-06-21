"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { BarChart3, CreditCard, FileText, Gift, KeyRound, Link2, Loader2, Receipt, RefreshCcw, Save, ShieldCheck, Sparkles, TrendingDown, TrendingUp, UsersRound, WalletCards, XCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatSaasCurrency, formatSaasDate, formatSaasPercent } from "@/lib/billing/format";
import { downloadJsonFile } from "@/lib/download";
import { createBillingNotification, getSaaSBillingDashboard, planLabels, subscriptionStatusLabels, subscriptionTone } from "@/services/billing";
import { useSaaSBillingData } from "@/hooks/billing/useSaaSBillingData";
import type { SaaSSubscription, SubscriptionPlan } from "@/types/billing";
import { BillingKpiCard } from "@/ui/billing/BillingKpiCard";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { EmptyState } from "@/ui/EmptyState";
import { Skeleton } from "@/ui/Skeleton";
import { Toast } from "@/ui/Toast";

const SaaSBillingCharts = dynamic(() => import("@/components/billing/SaaSBillingCharts").then((module) => module.SaaSBillingCharts), {
  loading: () => <Skeleton className="h-80" />,
  ssr: false
});

const views = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "plans", label: "Plans", icon: Sparkles },
  { id: "subscriptions", label: "Abonnements", icon: RefreshCcw },
  { id: "payments", label: "Paiements", icon: CreditCard },
  { id: "invoices", label: "Factures", icon: Receipt },
  { id: "promotions", label: "Promos", icon: Gift },
  { id: "licenses", label: "Licences", icon: KeyRound },
  { id: "webhooks", label: "Webhooks", icon: Link2 }
] as const;

type View = (typeof views)[number]["id"];

export function SaaSBillingWorkspace({ initialView = "dashboard" }: { initialView?: View }) {
  const { data, loading, mode, toast, mutate, sync, notify, refresh } = useSaaSBillingData();
  const searchParams = useSearchParams();
  const confirmedSession = useRef<string | null>(null);
  const [view, setView] = useState<View>(initialView);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState(data.subscriptions[0]?.id ?? "");

  const dashboard = useMemo(() => getSaaSBillingDashboard(data), [data]);
  const selectedSubscription = data.subscriptions.find((subscription) => subscription.id === selectedSubscriptionId) ?? data.subscriptions[0] ?? null;
  const selectedCustomer = data.customers.find((customer) => customer.id === selectedSubscription?.customerId) ?? null;

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (searchParams.get("checkout") !== "success" || !sessionId || confirmedSession.current === sessionId) return;
    confirmedSession.current = sessionId;
    setLoadingAction("confirm-checkout");
    fetch("/api/stripe/checkout/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId })
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Synchronisation Stripe impossible.");
        await refresh();
        notify("Abonnement active", `Le plan ${payload.plan} est synchronise avec CENTRIX.`);
      })
      .catch((error) => notify("Retour Stripe incomplet", error instanceof Error ? error.message : "Synchronisation impossible."))
      .finally(() => setLoadingAction(null));
  }, [notify, refresh, searchParams]);

  async function startCheckout(plan: SubscriptionPlan) {
    if (!plan.stripePriceId) {
      notify("Plan gratuit", "Aucun checkout requis pour le plan Free.");
      return;
    }
    if (!selectedCustomer?.email) {
      notify("Client requis", "Selectionnez un client avec une adresse email avant d'ouvrir Stripe Checkout.");
      return;
    }
    setLoadingAction(plan.id);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: plan.stripePriceId, customerEmail: selectedCustomer.email })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Checkout indisponible.");
      window.location.href = payload.url;
    } catch (error) {
      notify("Checkout indisponible", error instanceof Error ? error.message : "Configurez STRIPE_SECRET_KEY pour activer Stripe Checkout.");
    } finally {
      setLoadingAction(null);
    }
  }

  async function openPortal() {
    if (!selectedCustomer?.stripeCustomerId) {
      notify("Portail indisponible", "Ce client n'a pas encore d'identifiant Stripe.");
      return;
    }
    setLoadingAction("portal");
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: selectedCustomer.stripeCustomerId })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Portail indisponible.");
      window.location.href = payload.url;
    } catch (error) {
      notify("Portail Stripe indisponible", error instanceof Error ? error.message : "Configurez STRIPE_SECRET_KEY pour activer le portail client.");
    } finally {
      setLoadingAction(null);
    }
  }

  function changeSubscription(subscription: SaaSSubscription, patch: Partial<SaaSSubscription>) {
    mutate(
      (current) => ({
        ...current,
        subscriptions: current.subscriptions.map((item) => item.id === subscription.id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item),
        notifications: [createBillingNotification(subscription.customerId, "Abonnement mis a jour", "Le changement est historise et pret pour synchronisation Stripe.", "success"), ...current.notifications]
      }),
      { title: "Abonnement mis a jour", detail: "Le changement est applique localement." }
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
        <Skeleton className="h-36" />
        <section className="grid gap-4 md:grid-cols-4">{[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-28" />)}</section>
        <Skeleton className="h-[560px]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      {toast ? <Toast {...toast} /> : null}

      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Badge tone="cyan">Stripe Billing OS</Badge>
            <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Abonnements, Paiements & Billing</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              Monétisation SaaS avec plans, subscriptions, Stripe Checkout, portail client, factures, TVA, coupons, licences, webhooks et analytics.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={openPortal}><CreditCard size={17} /> Portail Stripe</Button>
            <Button onClick={sync} variant="primary"><Save size={17} /> Sync {mode}</Button>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-7">
        <BillingKpiCard delta="MRR" icon={<TrendingUp size={19} />} label="Revenus recurrents" value={formatSaasCurrency(dashboard.mrr)} />
        <BillingKpiCard delta="actifs" icon={<RefreshCcw size={19} />} label="Abonnements actifs" tone="emerald" value={String(dashboard.activeSubscriptions)} />
        <BillingKpiCard delta="total" icon={<WalletCards size={19} />} label="Revenus totaux" value={formatSaasCurrency(dashboard.totalRevenue)} />
        <BillingKpiCard delta="churn" icon={<TrendingDown size={19} />} label="Churn rate" tone="violet" value={formatSaasPercent(dashboard.churnRate)} />
        <BillingKpiCard delta="trials" icon={<Sparkles size={19} />} label="Essais gratuits" value={String(dashboard.trials)} />
        <BillingKpiCard delta="risque" icon={<XCircle size={19} />} label="Paiements echoues" tone="rose" value={String(dashboard.failedPayments)} />
        <BillingKpiCard delta="premium" icon={<UsersRound size={19} />} label="Clients premium" tone="emerald" value={String(dashboard.premiumCustomers)} />
      </section>

      <div className="flex gap-2 overflow-x-auto rounded-[8px] border border-white/10 bg-white/[0.045] p-1">
        {views.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.id} className={`flex h-10 shrink-0 items-center gap-2 rounded-[8px] px-3 text-sm transition-all duration-200 ${view === item.id ? "bg-white/12 text-white" : "text-slate-400 hover:bg-white/8 hover:text-white"}`} onClick={() => setView(item.id)}>
              <Icon size={16} /> {item.label}
            </button>
          );
        })}
      </div>

      {view === "dashboard" ? (
        <div className="space-y-4">
          <SaaSBillingCharts data={data} />
          <ActivityGrid notifications={data.notifications} />
        </div>
      ) : null}

      {view === "plans" ? (
        <div className="grid gap-4 xl:grid-cols-5">
          {data.plans.map((plan) => (
            <Card key={plan.id} interactive className={`p-5 ${plan.highlighted ? "border-cyan-200/35 bg-cyan-300/10" : ""}`}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-white">{plan.name}</h2>
                {plan.highlighted ? <Badge tone="cyan">Populaire</Badge> : null}
              </div>
              <p className="mt-3 min-h-16 text-sm leading-6 text-slate-400">{plan.description}</p>
              <p className="mt-5 text-3xl font-semibold text-white">{formatSaasCurrency(plan.monthlyPrice)}<span className="text-sm text-slate-500">/mois</span></p>
              <div className="mt-5 space-y-2 text-sm text-slate-300">{plan.features.map((feature) => <p key={feature}>- {feature}</p>)}</div>
              <div className="mt-5 grid gap-2 text-xs text-slate-500">
                <span>{plan.userLimit ? `${plan.userLimit} utilisateurs` : "Utilisateurs illimites"}</span>
                <span>{plan.storageLimitGb ? `${plan.storageLimitGb} Go stockage` : "Stockage illimite"}</span>
                <span>{plan.modules.includes("all") ? "Tous modules" : plan.modules.join(", ")}</span>
              </div>
              <Button className="mt-5 w-full" disabled={loadingAction === plan.id} onClick={() => startCheckout(plan)} variant={plan.highlighted ? "primary" : "surface"}>
                {loadingAction === plan.id ? <Loader2 className="animate-spin" size={17} /> : <CreditCard size={17} />} Checkout
              </Button>
            </Card>
          ))}
        </div>
      ) : null}

      {view === "subscriptions" ? (
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-white">Gestion abonnements</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.16em] text-slate-500"><tr><th className="pb-3">Client</th><th className="pb-3">Plan</th><th className="pb-3">Statut</th><th className="pb-3">Sieges</th><th className="pb-3">Renouvellement</th><th className="pb-3" /></tr></thead>
              <tbody className="divide-y divide-white/10">
                {data.subscriptions.map((subscription) => {
                  const customer = data.customers.find((item) => item.id === subscription.customerId);
                  return (
                    <tr key={subscription.id}>
                      <td className="py-3 text-white">{customer?.name}<p className="text-xs text-slate-500">{customer?.email}</p></td>
                      <td className="py-3 text-slate-300">{planLabels[subscription.plan]}</td>
                      <td className="py-3"><Badge tone={subscriptionTone(subscription.status)}>{subscriptionStatusLabels[subscription.status]}</Badge></td>
                      <td className="py-3 text-slate-300">{subscription.usedSeats}/{subscription.seats}</td>
                      <td className="py-3 text-slate-500">{formatSaasDate(subscription.currentPeriodEnd)}</td>
                      <td className="py-3 text-right"><Button className="h-9 px-3" onClick={() => { setSelectedSubscriptionId(subscription.id); changeSubscription(subscription, { status: subscription.status === "canceled" ? "active" : "canceled", autoRenew: false }); }} variant="ghost">{subscription.status === "canceled" ? "Reactiver" : "Annuler"}</Button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {view === "payments" ? (
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-white">Paiements Stripe</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.payments.map((payment) => (
              <div key={payment.id} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center justify-between gap-3"><p className="font-medium text-white">{formatSaasCurrency(payment.amount)}</p><Badge tone={payment.status === "paid" ? "emerald" : payment.status === "failed" ? "rose" : "cyan"}>{payment.status}</Badge></div>
                <p className="mt-2 text-sm text-slate-400">{payment.cardBrand} **** {payment.cardLast4}</p>
                <p className="mt-2 text-xs text-slate-500">{formatSaasDate(payment.createdAt)}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {view === "invoices" ? (
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-white">Facturation abonnements</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.invoices.map((invoice) => (
              <div key={invoice.id} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center justify-between gap-3"><p className="font-semibold text-white">{invoice.number}</p><Badge tone={invoice.status === "paid" ? "emerald" : invoice.status === "failed" ? "rose" : "cyan"}>{invoice.status}</Badge></div>
                <p className="mt-3 text-2xl font-semibold text-white">{formatSaasCurrency(invoice.amount)}</p>
                <p className="mt-1 text-sm text-slate-400">TVA {formatSaasCurrency(invoice.vatAmount)} - echeance {formatSaasDate(invoice.dueAt)}</p>
                <Button className="mt-4 h-9 px-3" onClick={() => downloadJsonFile(`centrix-recu-${invoice.number}.json`, invoice)} variant="ghost"><FileText size={15} /> Télécharger reçu</Button>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {view === "promotions" ? (
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-white">Essais gratuits & offres</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.coupons.map((coupon) => (
              <div key={coupon.id} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4">
                <Badge tone={coupon.active ? "emerald" : "rose"}>{coupon.active ? "actif" : "off"}</Badge>
                <p className="mt-3 text-xl font-semibold text-white">{coupon.code}</p>
                <p className="mt-2 text-sm text-slate-400">{coupon.discountPercent}% de remise - {coupon.redemptionCount} conversions</p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {view === "licenses" ? (
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-white">Licences & quotas dynamiques</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {data.usageLimits.map((usage) => {
              const percent = Math.round((usage.used / Math.max(1, usage.limit)) * 100);
              return (
                <div key={usage.id} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center justify-between gap-3"><p className="font-medium text-white">{usage.metric}</p><span className="text-sm text-slate-400">{usage.used}/{usage.limit}</span></div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-electric to-violet" style={{ width: `${Math.min(100, percent)}%` }} /></div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : null}

      {view === "webhooks" ? (
        <Card className="p-5">
          <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-cyan-100" /><h2 className="text-lg font-semibold text-white">Webhooks Stripe securises</h2></div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {data.stripeEvents.map((event) => (
              <div key={event.id} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4">
                <Badge tone={event.status === "processed" ? "emerald" : event.status === "failed" ? "rose" : "cyan"}>{event.status}</Badge>
                <p className="mt-3 font-medium text-white">{event.type}</p>
                <p className="mt-2 text-xs text-slate-500">{event.stripeEventId} - {formatSaasDate(event.createdAt)}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {!selectedSubscription ? <EmptyState icon={<RefreshCcw size={20} />} title="Aucun abonnement" detail="Creez un checkout ou synchronisez Stripe." /> : null}
    </div>
  );
}

function ActivityGrid({ notifications }: { notifications: Array<{ id: string; title: string; detail: string; severity: "info" | "success" | "warning"; createdAt: string }> }) {
  return (
    <Card className="p-5">
      <h2 className="text-lg font-semibold text-white">Activite billing recente</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {notifications.map((notification) => (
          <div key={notification.id} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4">
            <Badge tone={notification.severity === "warning" ? "rose" : notification.severity === "success" ? "emerald" : "cyan"}>{notification.severity}</Badge>
            <p className="mt-3 font-medium text-white">{notification.title}</p>
            <p className="mt-2 text-sm text-slate-400">{notification.detail}</p>
            <p className="mt-3 text-xs text-slate-500">{formatSaasDate(notification.createdAt)}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
