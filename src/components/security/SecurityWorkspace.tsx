"use client";

import dynamic from "next/dynamic";
import { AlertTriangle, DatabaseBackup, Download, FileLock2, Fingerprint, KeyRound, LockKeyhole, MonitorCheck, Plus, Radar, Save, Search, ServerCog, ShieldCheck, Smartphone, UserCog, Wifi } from "lucide-react";
import { useMemo, useState } from "react";
import { formatLatency, formatSecurityDate, formatSecurityPercent } from "@/lib/security/format";
import { createSecurityAlert, createSecurityLog, getSecurityDashboard, severityLabels, severityTone, statusLabels, statusTone } from "@/services/security/calculations";
import { useSecurityData } from "@/hooks/security/useSecurityData";
import { SecurityKpiCard } from "@/ui/security/SecurityKpiCard";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { EmptyState } from "@/ui/EmptyState";
import { Skeleton } from "@/ui/Skeleton";
import { Toast } from "@/ui/Toast";
import type { SecurityAlert, SecuritySeverity, SecurityStatus } from "@/types/security";

const SecurityCharts = dynamic(() => import("@/components/security/SecurityCharts").then((module) => module.SecurityCharts), {
  loading: () => <Skeleton className="h-80" />,
  ssr: false
});

const views = ["dashboard", "auth", "users", "data", "alerts", "audit", "api", "backups", "gdpr"] as const;
type View = (typeof views)[number];

const viewLabels: Record<View, string> = {
  dashboard: "Dashboard",
  auth: "Authentification",
  users: "Acces",
  data: "Donnees",
  alerts: "Alertes",
  audit: "Audit",
  api: "API",
  backups: "Backups",
  gdpr: "RGPD"
};

export function SecurityWorkspace({ initialView = "dashboard" }: { initialView?: View }) {
  const { data, loading, mode, toast, mutate, sync, notify } = useSecurityData();
  const [view, setView] = useState<View>(initialView);
  const [query, setQuery] = useState("");
  const dashboard = useMemo(() => getSecurityDashboard(data), [data]);
  const filteredLogs = data.logs.filter((log) => [log.event, log.actor, log.ipAddress, log.location].join(" ").toLowerCase().includes(query.toLowerCase()));
  const filteredAlerts = data.alerts.filter((alert) => [alert.title, alert.description, alert.assignedTo].join(" ").toLowerCase().includes(query.toLowerCase()));

  function addAlert() {
    const alert = createSecurityAlert();
    mutate((current) => ({ ...current, alerts: [alert, ...current.alerts], logs: [createSecurityLog(), ...current.logs] }), { title: "Alerte creee", detail: "Nouvel incident ajoute au centre de monitoring." });
  }

  function resolveAlert(id: string) {
    mutate((current) => ({ ...current, alerts: current.alerts.map((alert) => alert.id === id ? { ...alert, status: "resolved" } : alert) }), { title: "Incident resolu", detail: "Le statut de securite a ete mis a jour." });
  }

  if (loading) return <div className="mx-auto max-w-7xl space-y-6 animate-fade-in"><Skeleton className="h-36" /><Skeleton className="h-[560px]" /></div>;

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      {toast ? <Toast {...toast} /> : null}

      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Badge tone="cyan">CENTRIX Security</Badge>
            <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Cybersecurite & Protection des Donnees</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">Centre de commande securite pour sessions, authentification, API, conformite RGPD, sauvegardes et audit entreprise.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={addAlert}><Plus size={17} /> Alerte</Button>
            <Button onClick={() => notify("Export logs", "Export CSV prepare pour les journaux de securite.")} variant="surface"><Download size={17} /> Export</Button>
            <Button onClick={sync} variant="primary"><Save size={17} /> Sync {mode}</Button>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <SecurityKpiCard delta="live" icon={<Wifi size={19} />} label="Connexions actives" value={String(dashboard.activeConnections)} />
        <SecurityKpiCard delta="bloquees" icon={<AlertTriangle size={19} />} label="Tentatives suspectes" tone="rose" value={String(dashboard.suspiciousAttempts)} />
        <SecurityKpiCard delta="devices" icon={<Smartphone size={19} />} label="Appareils connectes" value={String(dashboard.connectedDevices)} />
        <SecurityKpiCard delta="score" icon={<ShieldCheck size={19} />} label="Niveau securite" tone="emerald" value={formatSecurityPercent(dashboard.securityScore)} />
        <SecurityKpiCard delta="sessions" icon={<MonitorCheck size={19} />} label="Sessions ouvertes" value={String(dashboard.openSessions)} />
        <SecurityKpiCard delta="incidents" icon={<Radar size={19} />} label="Alertes securite" tone="violet" value={String(dashboard.openAlerts)} />
      </section>

      <div className="flex gap-2 overflow-x-auto rounded-[8px] border border-white/10 bg-white/[0.045] p-1">
        {views.map((item) => <button key={item} className={`h-10 shrink-0 rounded-[8px] px-3 text-sm transition-all ${view === item ? "bg-white/12 text-white" : "text-slate-400 hover:bg-white/8 hover:text-white"}`} onClick={() => setView(item)}>{viewLabels[item]}</button>)}
      </div>

      {view === "dashboard" ? <><SecurityCharts data={data} /><SecurityOverview dashboard={dashboard} /></> : null}

      {view === "auth" ? (
        <section className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
          <Card className="p-5">
            <SectionTitle icon={<Fingerprint size={18} />} title="Sessions & appareils" />
            <div className="mt-5 grid gap-3">
              {data.sessions.map((session) => <div key={session.id} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-white">{session.userName}</p><p className="text-sm text-slate-400">{session.device} - {session.browser} - {session.location}</p></div><Badge tone={session.status === "active" ? "emerald" : session.status === "revoked" ? "rose" : "cyan"}>{session.status}</Badge></div><div className="mt-3 h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-300" style={{ width: `${Math.min(session.riskScore, 100)}%` }} /></div><p className="mt-2 text-xs text-slate-500">Risque {session.riskScore}% - expire {formatSecurityDate(session.expiresAt)}</p></div>)}
            </div>
          </Card>
          <Card className="p-5">
            <SectionTitle icon={<LockKeyhole size={18} />} title="Tentatives connexion" />
            <div className="mt-5 space-y-3">{data.loginAttempts.map((attempt) => <div key={attempt.id} className="flex items-center justify-between rounded-[8px] border border-white/10 bg-white/[0.04] p-3"><div><p className="text-sm font-medium text-white">{attempt.email}</p><p className="text-xs text-slate-500">{attempt.ipAddress} - {attempt.reason}</p></div><Badge tone={attempt.suspicious ? "rose" : "emerald"}>{attempt.success ? "validee" : "refusee"}</Badge></div>)}</div>
          </Card>
        </section>
      ) : null}

      {view === "users" ? (
        <Card className="p-5">
          <SectionTitle icon={<UserCog size={18} />} title="Roles, permissions et acces sensibles" />
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{data.permissions.map((permission) => <Card key={permission.id} interactive className="p-4"><div className="flex items-center justify-between"><p className="font-semibold text-white">{permission.userName}</p><Badge tone={permission.mfaEnabled ? "emerald" : "rose"}>{permission.mfaEnabled ? "2FA active" : "2FA manquante"}</Badge></div><p className="mt-1 text-sm text-slate-400">{permission.role}</p><div className="mt-3 flex flex-wrap gap-2">{permission.modules.map((module) => <Badge key={module} tone="cyan">{module}</Badge>)}</div><p className="mt-3 text-xs text-slate-500">Revue {formatSecurityDate(permission.lastReviewedAt)}</p></Card>)}</div>
        </Card>
      ) : null}

      {view === "data" ? (
        <section className="grid gap-4 md:grid-cols-3">
          {["Chiffrement donnees sensibles", "Acces documents securises", "Consentements utilisateurs", "Suppression donnees", "Export utilisateur", "Confidentialite fichiers"].map((item) => <Card key={item} interactive className="p-4"><FileLock2 size={20} className="text-cyan-100" /><p className="mt-4 font-semibold text-white">{item}</p><p className="mt-2 text-sm leading-6 text-slate-400">Workflow pret pour politiques RGPD, restrictions d&apos;acces, journalisation et controles entreprise.</p></Card>)}
        </section>
      ) : null}

      {view === "alerts" ? (
        <section className="grid gap-4 xl:grid-cols-[280px_1fr]">
          <Card className="p-4"><SearchBox query={query} setQuery={setQuery} /><div className="mt-4 space-y-2">{(["critical", "high", "medium", "low"] as SecuritySeverity[]).map((severity) => <Badge key={severity} tone={severityTone(severity)} className="mr-2">{severityLabels[severity]}</Badge>)}</div></Card>
          <div className="grid gap-3">{filteredAlerts.length ? filteredAlerts.map((alert) => <AlertCard key={alert.id} alert={alert} onResolve={resolveAlert} />) : <EmptyState icon={<ShieldCheck size={18} />} title="Aucune alerte" detail="Aucun incident ne correspond a votre recherche." />}</div>
        </section>
      ) : null}

      {view === "audit" ? (
        <Card className="p-5">
          <SectionTitle icon={<Search size={18} />} title="Audit & logs securite" />
          <div className="mt-4 max-w-md"><SearchBox query={query} setQuery={setQuery} /></div>
          <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="text-xs uppercase tracking-[0.16em] text-slate-500"><tr><th className="pb-3">Evenement</th><th className="pb-3">Acteur</th><th className="pb-3">IP</th><th className="pb-3">Gravite</th><th className="pb-3">Date</th></tr></thead><tbody className="divide-y divide-white/10">{filteredLogs.map((log) => <tr key={log.id}><td className="py-3 text-white">{log.event}</td><td className="py-3 text-slate-300">{log.actor}</td><td className="py-3 text-slate-300">{log.ipAddress}</td><td className="py-3"><Badge tone={severityTone(log.severity)}>{severityLabels[log.severity]}</Badge></td><td className="py-3 text-slate-500">{formatSecurityDate(log.createdAt)}</td></tr>)}</tbody></table></div>
        </Card>
      ) : null}

      {view === "api" ? (
        <Card className="p-5">
          <SectionTitle icon={<ServerCog size={18} />} title="Securite API, rate limiting et webhooks" />
          <div className="mt-5 grid gap-3">{data.apiLogs.map((log) => <div key={log.id} className="grid gap-3 rounded-[8px] border border-white/10 bg-white/[0.04] p-4 md:grid-cols-[1fr_auto_auto] md:items-center"><div><p className="font-semibold text-white">{log.method} {log.endpoint}</p><p className="text-sm text-slate-400">{log.apiKeyLabel} - {log.ipAddress}</p></div><span className="text-sm text-slate-300">{formatLatency(log.latencyMs)}</span><Badge tone={log.blocked ? "rose" : "emerald"}>{log.blocked ? "bloque" : String(log.statusCode)}</Badge></div>)}</div>
        </Card>
      ) : null}

      {view === "backups" ? (
        <Card className="p-5">
          <SectionTitle icon={<DatabaseBackup size={18} />} title="Backups & restauration" />
          <div className="mt-5 grid gap-3 md:grid-cols-3">{data.backups.map((backup) => <Card key={backup.id} interactive className="p-4"><Badge tone={backup.status === "completed" ? "emerald" : backup.status === "failed" ? "rose" : "violet"}>{backup.status}</Badge><p className="mt-4 font-semibold text-white">{backup.name}</p><p className="mt-2 text-sm text-slate-400">{backup.scope} - {backup.sizeGb} GB - retention {backup.retentionDays} jours</p><p className="mt-3 text-xs text-slate-500">{backup.encrypted ? "Chiffre" : "Non chiffre"} - {formatSecurityDate(backup.createdAt)}</p></Card>)}</div>
        </Card>
      ) : null}

      {view === "gdpr" ? (
        <Card className="p-5">
          <SectionTitle icon={<KeyRound size={18} />} title="Conformite RGPD & demandes donnees" />
          <div className="mt-5 grid gap-3 md:grid-cols-2">{data.gdprRequests.map((request) => <div key={request.id} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4"><div className="flex items-center justify-between"><p className="font-semibold text-white">{request.requester}</p><Badge tone={request.status === "completed" ? "emerald" : request.status === "rejected" ? "rose" : "violet"}>{request.status}</Badge></div><p className="mt-1 text-sm text-slate-400">{request.email} - {request.type}</p><p className="mt-3 text-xs text-slate-500">Echeance {formatSecurityDate(request.dueAt)}</p></div>)}</div>
        </Card>
      ) : null}
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return <div className="flex items-center gap-2 text-white">{icon}<h2 className="text-lg font-semibold">{title}</h2></div>;
}

function SearchBox({ query, setQuery }: { query: string; setQuery: (value: string) => void }) {
  return <div className="flex h-10 items-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-sm text-slate-400"><Search size={16} /><input className="w-full bg-transparent outline-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher" /></div>;
}

function SecurityOverview({ dashboard }: { dashboard: ReturnType<typeof getSecurityDashboard> }) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <Card interactive className="p-4"><ShieldCheck size={20} className="text-emerald-300" /><p className="mt-4 font-semibold text-white">Couverture MFA</p><p className="mt-2 text-2xl font-semibold text-white">{formatSecurityPercent(dashboard.mfaCoverage)}</p><p className="mt-2 text-sm text-slate-400">Preparation 2FA, SSO et authentification biometrie.</p></Card>
      <Card interactive className="p-4"><DatabaseBackup size={20} className="text-cyan-100" /><p className="mt-4 font-semibold text-white">Sante backups</p><p className="mt-2 text-2xl font-semibold text-white">{formatSecurityPercent(dashboard.backupHealth)}</p><p className="mt-2 text-sm text-slate-400">Sauvegardes chiffrees, retention et restauration.</p></Card>
      <Card interactive className="p-4"><Radar size={20} className="text-violet-200" /><p className="mt-4 font-semibold text-white">Menaces bloquees</p><p className="mt-2 text-2xl font-semibold text-white">{dashboard.blockedThreats}</p><p className="mt-2 text-sm text-slate-400">Rate limiting, webhooks signes et validation API.</p></Card>
    </section>
  );
}

function AlertCard({ alert, onResolve }: { alert: SecurityAlert; onResolve: (id: string) => void }) {
  return (
    <Card interactive className="p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2"><Badge tone={severityTone(alert.severity)}>{severityLabels[alert.severity]}</Badge><Badge tone={statusTone(alert.status as SecurityStatus)}>{statusLabels[alert.status]}</Badge></div>
          <p className="mt-4 font-semibold text-white">{alert.title}</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">{alert.description}</p>
          <p className="mt-3 text-xs text-slate-500">{alert.source} - {alert.assignedTo} - {formatSecurityDate(alert.createdAt)}</p>
        </div>
        <Button className="h-9 px-3" onClick={() => onResolve(alert.id)} variant="surface">Resoudre</Button>
      </div>
    </Card>
  );
}
