"use client";

import { Activity, BellRing, CheckCheck, Clock3, Radio, Search, Settings2, ShieldAlert, Sparkles, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { formatNotificationDate } from "@/lib/notifications/format";
import { createNotification, getNotificationsDashboard, moduleLabels, severityLabels, severityTone } from "@/services/notifications/calculations";
import { useNotificationsData } from "@/hooks/notifications/useNotificationsData";
import type { NotificationModule, NotificationSeverity, RealtimeNotification } from "@/types/notifications";
import { NotificationKpiCard } from "@/ui/notifications/NotificationKpiCard";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { EmptyState } from "@/ui/EmptyState";
import { Skeleton } from "@/ui/Skeleton";
import { Toast } from "@/ui/Toast";

const views = [
  { id: "dashboard", label: "Dashboard", icon: Activity },
  { id: "alerts", label: "Alertes", icon: BellRing },
  { id: "rules", label: "Automations", icon: Zap },
  { id: "preferences", label: "Preferences", icon: Settings2 }
] as const;

const modules: NotificationModule[] = ["crm", "billing", "projects", "support", "security", "marketing", "documents", "system"];
const severities: NotificationSeverity[] = ["info", "success", "warning", "critical"];
type View = (typeof views)[number]["id"];

export function NotificationsWorkspace() {
  const { data, loading, mode, toast, mutate, sync } = useNotificationsData();
  const [view, setView] = useState<View>("dashboard");
  const [query, setQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState<"all" | NotificationModule>("all");
  const dashboard = useMemo(() => getNotificationsDashboard(data), [data]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return data.notifications.filter((item) => {
      const matchesQuery = !normalized || `${item.title} ${item.detail}`.toLowerCase().includes(normalized);
      const matchesModule = moduleFilter === "all" || item.module === moduleFilter;
      return matchesQuery && matchesModule;
    });
  }, [data.notifications, moduleFilter, query]);

  const markAllRead = () => {
    mutate(
      (current) => ({ ...current, notifications: current.notifications.map((item) => ({ ...item, read: true })) }),
      { title: "Notifications lues", detail: "Toutes les alertes du centre ont ete marquees comme lues." }
    );
  };

  const addDemoAlert = () => {
    mutate(
      (current) => ({
        ...current,
        notifications: [
          createNotification({
            title: "Nouvelle alerte business",
            detail: "Une opportunite a fort potentiel vient d'etre detectee par CENTRIX.",
            module: "crm",
            severity: "success"
          }),
          ...current.notifications
        ]
      }),
      { title: "Alerte creee", detail: "La notification realtime est disponible dans le dashboard." }
    );
  };

  return (
    <div className="space-y-6">
      {toast ? <Toast title={toast.title} detail={toast.detail} /> : null}

      <section className="overflow-hidden rounded-[24px] border border-white/50 bg-[#071225] p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge tone="cyan">Realtime center</Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Notifications & collaboration temps reel</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-blue-50/72">
              Centre unifie pour alertes business, rappels automatiques, notifications modules et websocket Supabase Realtime.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button className="border-white/15 bg-white/10 text-white hover:bg-white/15 hover:text-white" onClick={sync}>
              <Radio size={17} />
              Sync {mode}
            </Button>
            <Button variant="primary" onClick={addDemoAlert}>
              <Sparkles size={17} />
              Creer alerte
            </Button>
          </div>
        </div>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {views.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`inline-flex h-11 items-center gap-2 rounded-[12px] px-4 text-sm font-semibold transition-all duration-200 ${
                active ? "bg-blue-600 text-white shadow-[0_14px_34px_rgba(37,99,235,0.22)]" : "border border-slate-200 bg-white/80 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              <Icon size={17} />
              {item.label}
            </button>
          );
        })}
      </div>

      {loading ? <LoadingGrid /> : null}
      {!loading && view === "dashboard" ? <DashboardView dashboard={dashboard} notifications={data.notifications} markAllRead={markAllRead} /> : null}
      {!loading && view === "alerts" ? (
        <AlertsView filtered={filtered} query={query} moduleFilter={moduleFilter} setQuery={setQuery} setModuleFilter={setModuleFilter} markAllRead={markAllRead} />
      ) : null}
      {!loading && view === "rules" ? (
        <Card className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Scenarios automatiques</h2>
              <p className="mt-1 text-sm text-slate-500">Declencheurs connectes aux modules CENTRIX.</p>
            </div>
            <Button onClick={addDemoAlert} variant="surface">
              <Zap size={16} />
              Tester
            </Button>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {data.rules.map((rule) => (
              <Card key={rule.id} interactive className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{rule.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{rule.trigger}</p>
                  </div>
                  <Badge tone={rule.active ? "emerald" : "rose"}>{rule.active ? "Actif" : "Pause"}</Badge>
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Canal {rule.channel}</p>
              </Card>
            ))}
          </div>
        </Card>
      ) : null}
      {!loading && view === "preferences" ? (
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-slate-950">Preferences notifications</h2>
          <div className="mt-5 overflow-hidden rounded-[16px] border border-slate-200 bg-white">
            {data.preferences.map((pref) => (
              <div key={pref.id} className="grid gap-3 border-b border-slate-100 px-4 py-4 last:border-b-0 md:grid-cols-[1fr_120px_120px_120px] md:items-center">
                <p className="font-semibold text-slate-950">{moduleLabels[pref.module]}</p>
                <Badge tone={pref.dashboard ? "emerald" : "rose"}>Dashboard</Badge>
                <Badge tone={pref.push ? "emerald" : "rose"}>Push</Badge>
                <Badge tone={pref.email ? "emerald" : "rose"}>Email</Badge>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-40" />
      ))}
    </div>
  );
}

function DashboardView({ dashboard, notifications, markAllRead }: { dashboard: ReturnType<typeof getNotificationsDashboard>; notifications: RealtimeNotification[]; markAllRead: () => void }) {
  const recent = notifications.slice(0, 4);
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <NotificationKpiCard icon={<BellRing size={20} />} label="Non lues" value={dashboard.unread} detail="Alertes en attente" />
        <NotificationKpiCard icon={<ShieldAlert size={20} />} label="Critiques" value={dashboard.critical} detail="Securite et risques" />
        <NotificationKpiCard icon={<Clock3 size={20} />} label="Rappels" value={dashboard.reminders} detail="Actions planifiees" />
        <NotificationKpiCard icon={<Zap size={20} />} label="Automations" value={dashboard.activeRules} detail="Regles actives" />
        <NotificationKpiCard icon={<Radio size={20} />} label="Canaux realtime" value={dashboard.realtimeChannels} detail="Dashboard + push" />
        <NotificationKpiCard icon={<Activity size={20} />} label="Alertes business" value={dashboard.businessAlerts} detail="CRM, support, finance" />
      </div>

      <Card className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Activite recente</h2>
            <p className="mt-1 text-sm text-slate-500">Flux realtime des derniers evenements importants.</p>
          </div>
          <Button onClick={markAllRead}>
            <CheckCheck size={16} />
            Tout lire
          </Button>
        </div>
        <NotificationList notifications={recent} />
      </Card>
    </div>
  );
}

function AlertsView({
  filtered,
  query,
  moduleFilter,
  setQuery,
  setModuleFilter,
  markAllRead
}: {
  filtered: RealtimeNotification[];
  query: string;
  moduleFilter: "all" | NotificationModule;
  setQuery: (value: string) => void;
  setModuleFilter: (value: "all" | NotificationModule) => void;
  markAllRead: () => void;
}) {
  return (
    <Card className="p-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Centre notifications</h2>
          <p className="mt-1 text-sm text-slate-500">Recherche, filtres modules et priorites business.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="flex h-11 items-center gap-2 rounded-[12px] border border-slate-200 bg-white px-3 text-sm text-slate-500">
            <Search size={16} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher..." className="min-w-0 bg-transparent text-slate-900 outline-none" />
          </label>
          <select value={moduleFilter} onChange={(event) => setModuleFilter(event.target.value as "all" | NotificationModule)} className="h-11 rounded-[12px] border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700">
            <option value="all">Tous modules</option>
            {modules.map((item) => (
              <option key={item} value={item}>
                {moduleLabels[item]}
              </option>
            ))}
          </select>
          <Button onClick={markAllRead}>Tout lire</Button>
        </div>
      </div>
      {filtered.length ? <NotificationList notifications={filtered} /> : <EmptyState icon={<BellRing size={18} />} title="Aucune notification" detail="Les filtres actifs ne retournent aucune alerte." />}
    </Card>
  );
}

function NotificationList({ notifications }: { notifications: RealtimeNotification[] }) {
  return (
    <div className="mt-5 space-y-3">
      {notifications.map((item) => (
        <div key={item.id} className="rounded-[16px] border border-slate-200 bg-white/86 p-4 shadow-[0_14px_36px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={severityTone(item.severity)}>{severityLabels[item.severity]}</Badge>
                <Badge tone="cyan">{moduleLabels[item.module]}</Badge>
                {!item.read ? <span className="h-2 w-2 rounded-full bg-blue-600" /> : null}
              </div>
              <p className="mt-3 font-semibold text-slate-950">{item.title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">{item.detail}</p>
            </div>
            <div className="text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 sm:text-right">
              {formatNotificationDate(item.createdAt)}
              {item.remindAt ? <p className="mt-1 normal-case tracking-normal text-blue-600">Rappel {formatNotificationDate(item.remindAt)}</p> : null}
            </div>
          </div>
        </div>
      ))}
      <div className="flex flex-wrap gap-2 pt-2">
        {severities.map((severity) => (
          <Badge key={severity} tone={severityTone(severity)}>
            {severityLabels[severity]}
          </Badge>
        ))}
      </div>
    </div>
  );
}
