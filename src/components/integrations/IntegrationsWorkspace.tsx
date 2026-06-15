"use client";

import dynamic from "next/dynamic";
import { Activity, AlertTriangle, Bot, Braces, Cable, CheckCircle2, Code2, CreditCard, FileJson, Globe2, KeyRound, Loader2, LockKeyhole, PlugZap, Plus, RefreshCcw, Save, Search, Server, ShieldCheck, Terminal, WalletCards, Webhook, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatIntegrationDate, formatIntegrationNumber, formatResponseTime } from "@/lib/integrations/format";
import type { ExternalIntegrationsStatus } from "@/lib/integrations/server";
import { createApiKey, createIntegrationNotification, createWebhook, getIntegrationDashboard, statusTone } from "@/services/integrations/calculations";
import { useIntegrationsData } from "@/hooks/integrations/useIntegrationsData";
import type { ExternalIntegration } from "@/types/integrations";
import { IntegrationKpiCard } from "@/ui/integrations/IntegrationKpiCard";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { EmptyState } from "@/ui/EmptyState";
import { Skeleton } from "@/ui/Skeleton";
import { Toast } from "@/ui/Toast";

const IntegrationCharts = dynamic(() => import("@/components/integrations/IntegrationCharts").then((module) => module.IntegrationCharts), {
  loading: () => <Skeleton className="h-80" />,
  ssr: false
});

const views = [
  { id: "dashboard", label: "Dashboard", icon: Activity },
  { id: "keys", label: "API Keys", icon: KeyRound },
  { id: "webhooks", label: "Webhooks", icon: Webhook },
  { id: "catalog", label: "Integrations", icon: PlugZap },
  { id: "rest", label: "REST API", icon: Braces },
  { id: "docs", label: "Docs", icon: FileJson },
  { id: "monitoring", label: "Monitoring", icon: Server },
  { id: "security", label: "Securite", icon: ShieldCheck }
] as const;

type View = (typeof views)[number]["id"];

const categories: Record<ExternalIntegration["category"], string> = {
  google: "Google",
  microsoft: "Microsoft",
  communication: "Communication",
  automation: "Automatisation",
  payments: "Paiements",
  crm_productivity: "CRM & Productivite"
};

export function IntegrationsWorkspace({ initialView = "dashboard" }: { initialView?: View }) {
  const { data, loading, mode, toast, mutate, sync, notify } = useIntegrationsData();
  const [view, setView] = useState<View>(initialView);
  const [query, setQuery] = useState("");
  const [playgroundLoading, setPlaygroundLoading] = useState(false);
  const [playgroundResponse, setPlaygroundResponse] = useState("{\n  \"ready\": true\n}");
  const [externalStatus, setExternalStatus] = useState<ExternalIntegrationsStatus | null>(null);

  const dashboard = useMemo(() => getIntegrationDashboard(data), [data]);
  const filteredIntegrations = data.integrations.filter((integration) => integration.name.toLowerCase().includes(query.toLowerCase()) || categories[integration.category].toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    fetch("/api/integrations/status")
      .then(async (response) => response.ok ? response.json() as Promise<ExternalIntegrationsStatus> : null)
      .then(setExternalStatus)
      .catch(() => setExternalStatus(null));
  }, []);

  function addApiKey() {
    const key = createApiKey("Nouvelle cle API");
    mutate(
      (current) => ({ ...current, apiKeys: [key, ...current.apiKeys], notifications: [createIntegrationNotification("Cle API generee", key.tokenPreview, "success"), ...current.notifications] }),
      { title: "Cle API creee", detail: "Copiez le secret complet au moment de creation en production." }
    );
  }

  function revokeKey(id: string) {
    mutate((current) => ({
      ...current,
      apiKeys: current.apiKeys.map((key) => key.id === id ? { ...key, revoked: true } : key),
      notifications: [createIntegrationNotification("Cle revoquee", "Les appels utilisant cette cle seront refuses.", "warning"), ...current.notifications]
    }));
  }

  function addWebhook() {
    const webhook = createWebhook("Nouveau webhook", "https://example.com/webhook/centrix");
    mutate(
      (current) => ({ ...current, webhooks: [webhook, ...current.webhooks], notifications: [createIntegrationNotification("Webhook cree", webhook.url, "success"), ...current.notifications] }),
      { title: "Webhook cree", detail: "Endpoint pret avec signature et retries." }
    );
  }

  function toggleIntegration(id: string) {
    mutate((current) => ({
      ...current,
      integrations: current.integrations.map((integration) => integration.id === id ? { ...integration, status: integration.status === "connected" ? "disconnected" : "connected", syncEnabled: integration.status !== "connected", lastSyncAt: new Date().toISOString() } : integration)
    }));
  }

  async function runPlayground() {
    setPlaygroundLoading(true);
    const response = await fetch("/api/v1/crm?limit=3", { headers: { Authorization: "Bearer demo" } });
    const payload = await response.json();
    setPlaygroundResponse(JSON.stringify(payload, null, 2));
    setPlaygroundLoading(false);
    notify("Playground execute", "Requete REST demo terminee.");
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
            <Badge tone="violet">Developer platform</Badge>
            <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">API & Integrations</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              Connectez CENTRIX a vos outils avec API REST securisee, API keys, webhooks signes, OAuth, monitoring, documentation et playground.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={addApiKey}><KeyRound size={17} /> Cle API</Button>
            <Button onClick={sync} variant="primary"><Save size={17} /> Sync {mode}</Button>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <IntegrationKpiCard delta="24h" icon={<Terminal size={19} />} label="Appels API" value={formatIntegrationNumber(dashboard.apiCalls)} />
        <IntegrationKpiCard delta="OAuth" icon={<PlugZap size={19} />} label="Integrations actives" tone="emerald" value={String(dashboard.activeIntegrations)} />
        <IntegrationKpiCard delta="events" icon={<Webhook size={19} />} label="Webhooks actifs" tone="violet" value={String(dashboard.activeWebhooks)} />
        <IntegrationKpiCard delta="monitoring" icon={<AlertTriangle size={19} />} label="Erreurs API" tone="rose" value={String(dashboard.apiErrors)} />
        <IntegrationKpiCard delta="avg" icon={<RefreshCcw size={19} />} label="Temps reponse" value={formatResponseTime(dashboard.avgResponse)} />
        <IntegrationKpiCard delta="externes" icon={<Globe2 size={19} />} label="Connexions" tone="emerald" value={String(dashboard.externalConnections)} />
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

      {view === "dashboard" ? <><ExternalStatusGrid status={externalStatus} /><IntegrationCharts data={data} /><NotificationGrid notifications={data.notifications} /></> : null}

      {view === "keys" ? (
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold text-white">API Keys</h2><Button onClick={addApiKey}><Plus size={17} /> Generer</Button></div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.apiKeys.map((key) => (
              <div key={key.id} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center justify-between gap-3"><p className="font-semibold text-white">{key.name}</p><Badge tone={key.revoked ? "rose" : "emerald"}>{key.revoked ? "revoquee" : "active"}</Badge></div>
                <code className="mt-3 block rounded-[8px] bg-black/30 p-3 text-xs text-cyan-100">{key.tokenPreview}</code>
                <div className="mt-3 flex flex-wrap gap-2">{key.scopes.map((scope) => <Badge key={scope} tone="cyan">{scope}</Badge>)}</div>
                <p className="mt-3 text-xs text-slate-500">Expire: {key.expiresAt ? formatIntegrationDate(key.expiresAt) : "Jamais"}</p>
                <Button className="mt-4 h-9 px-3" onClick={() => revokeKey(key.id)} variant="ghost">Revoquer</Button>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {view === "webhooks" ? (
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold text-white">Webhooks signes</h2><Button onClick={addWebhook}><Plus size={17} /> Endpoint</Button></div>
          <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_360px]">
            <div className="space-y-3">
              {data.webhooks.map((webhook) => (
                <div key={webhook.id} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center justify-between gap-3"><p className="font-semibold text-white">{webhook.name}</p><Badge tone={webhook.active ? "emerald" : "rose"}>{webhook.active ? "actif" : "off"}</Badge></div>
                  <p className="mt-2 text-sm text-slate-400">{webhook.url}</p>
                  <div className="mt-3 flex flex-wrap gap-2">{webhook.events.map((event) => <Badge key={event} tone="violet">{event}</Badge>)}</div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {data.webhookLogs.map((log) => <div key={log.id} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-3"><Badge tone={statusTone(log.status)}>{log.status}</Badge><p className="mt-2 text-sm text-white">{log.event}</p><p className="mt-1 text-xs text-slate-500">{log.statusCode} - {log.attempts} tentative(s)</p></div>)}
            </div>
          </div>
        </Card>
      ) : null}

      {view === "catalog" ? (
        <Card className="p-5">
          <div className="flex h-10 items-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-sm text-slate-400">
            <Search size={16} />
            <input className="w-full bg-transparent outline-none placeholder:text-slate-500" placeholder="Rechercher Google, Slack, Stripe..." value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredIntegrations.map((integration) => (
              <button key={integration.id} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4 text-left transition-all hover:-translate-y-1 hover:bg-white/[0.08]" onClick={() => toggleIntegration(integration.id)}>
                <div className="flex items-center justify-between gap-3"><p className="font-semibold text-white">{integration.name}</p><Badge tone={statusTone(integration.status)}>{integration.status}</Badge></div>
                <p className="mt-2 text-sm leading-6 text-slate-400">{integration.description}</p>
                <p className="mt-3 text-xs text-slate-500">{categories[integration.category]} - {integration.lastSyncAt ? formatIntegrationDate(integration.lastSyncAt) : "Non connecte"}</p>
              </button>
            ))}
          </div>
        </Card>
      ) : null}

      {view === "rest" || view === "docs" ? (
        <section className="grid gap-4 xl:grid-cols-[1fr_420px]">
          <Card className="p-5">
            <div className="flex items-center gap-2"><Code2 size={18} className="text-cyan-100" /><h2 className="text-lg font-semibold text-white">API REST CENTRIX v1</h2></div>
            <div className="mt-5 space-y-3">
              {["GET /api/v1/crm", "GET /api/v1/billing", "GET /api/v1/hr", "GET /api/v1/agenda", "GET /api/v1/marketing", "GET /api/v1/analytics", "GET /api/v1/support"].map((endpoint) => (
                <div key={endpoint} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4">
                  <code className="text-sm text-cyan-100">{endpoint}</code>
                  <p className="mt-2 text-sm text-slate-400">Pagination, filtres, recherche et authentification Bearer/JWT preparees.</p>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold text-white">Playground</h2><Button onClick={runPlayground}>{playgroundLoading ? <Loader2 className="animate-spin" size={17} /> : <Zap size={17} />} Tester</Button></div>
            <pre className="mt-5 max-h-[520px] overflow-auto rounded-[8px] border border-white/10 bg-black/30 p-4 text-xs leading-6 text-cyan-50">{playgroundResponse}</pre>
          </Card>
        </section>
      ) : null}

      {view === "monitoring" ? (
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-white">Logs API & monitoring</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.16em] text-slate-500"><tr><th className="pb-3">Methode</th><th className="pb-3">Endpoint</th><th className="pb-3">Status</th><th className="pb-3">Latence</th><th className="pb-3">IP</th></tr></thead>
              <tbody className="divide-y divide-white/10">{data.apiLogs.map((log) => <tr key={log.id}><td className="py-3 text-white">{log.method}</td><td className="py-3 text-slate-300">{log.endpoint}</td><td className="py-3"><Badge tone={log.statusCode >= 400 ? "rose" : "emerald"}>{log.statusCode}</Badge></td><td className="py-3 text-slate-400">{formatResponseTime(log.responseTimeMs)}</td><td className="py-3 text-slate-500">{log.ipAddress}</td></tr>)}</tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {view === "security" ? (
        <Card className="p-5">
          <div className="flex items-center gap-2"><LockKeyhole size={18} className="text-cyan-100" /><h2 className="text-lg font-semibold text-white">Securite API</h2></div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {["JWT Bearer", "Rate limiting", "Signatures webhooks", "Chiffrement tokens", "Validation requetes", "Logs securite", "Monitoring suspect", "Permissions scopes"].map((item) => (
              <div key={item} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4"><CheckCircle2 className="text-emerald-300" size={18} /><p className="mt-3 text-sm font-medium text-white">{item}</p></div>
            ))}
          </div>
        </Card>
      ) : null}

      {!data.integrations.length ? <EmptyState icon={<Cable size={20} />} title="Aucune integration" detail="Synchronisez Supabase ou connectez une app." /> : null}
    </div>
  );
}

function ExternalStatusGrid({ status }: { status: ExternalIntegrationsStatus | null }) {
  const providers = [
    { key: "supabase", label: "Supabase Cloud", icon: <Server size={18} /> },
    { key: "openai", label: "OpenAI", icon: <Bot size={18} /> },
    { key: "stripe", label: "Stripe Billing", icon: <CreditCard size={18} /> },
    { key: "stripeWebhook", label: "Stripe Webhooks", icon: <Webhook size={18} /> },
    { key: "stripeConnect", label: "Stripe Connect", icon: <PlugZap size={18} /> },
    { key: "bridge", label: "Bridge Open Banking", icon: <WalletCards size={18} /> },
    { key: "googleOAuth", label: "Google OAuth", icon: <Globe2 size={18} /> }
  ] as const;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Etat des connexions externes</h2>
          <p className="mt-1 text-sm text-slate-400">Diagnostic serveur sans exposition des cles secretes.</p>
        </div>
        <Badge tone={status && providers.every(({ key }) => status[key].configured) ? "emerald" : "cyan"}>
          {status ? `${providers.filter(({ key }) => status[key].configured).length}/${providers.length} actives` : "Verification"}
        </Badge>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {providers.map(({ key, label, icon }) => {
          const item = status?.[key];
          return (
            <div key={key} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center justify-between gap-3">
                <span className={item?.configured ? "text-emerald-300" : "text-slate-400"}>{icon}</span>
                <Badge tone={item?.configured ? "emerald" : "rose"}>{item?.configured ? "connecte" : item ? "a configurer" : "verification"}</Badge>
              </div>
              <p className="mt-3 font-semibold text-white">{label}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">{item?.detail ?? "Lecture de la configuration serveur..."}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function NotificationGrid({ notifications }: { notifications: Array<{ id: string; title: string; detail: string; severity: "info" | "success" | "warning"; createdAt: string }> }) {
  return (
    <Card className="p-5">
      <h2 className="text-lg font-semibold text-white">Activite integrations</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {notifications.map((notification) => <div key={notification.id} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4"><Badge tone={notification.severity === "warning" ? "rose" : notification.severity === "success" ? "emerald" : "cyan"}>{notification.severity}</Badge><p className="mt-3 font-medium text-white">{notification.title}</p><p className="mt-2 text-sm text-slate-400">{notification.detail}</p><p className="mt-3 text-xs text-slate-500">{formatIntegrationDate(notification.createdAt)}</p></div>)}
      </div>
    </Card>
  );
}
