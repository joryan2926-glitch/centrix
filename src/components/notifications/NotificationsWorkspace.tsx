"use client";

import { Activity, BellRing, CheckCheck, Clock3, MessageCircle, Paperclip, Radio, Search, Settings2, ShieldAlert, Sparkles, Users2, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { formatNotificationDate } from "@/lib/notifications/format";
import { createCollaborationMessage, createNotification, createSharedFile, getNotificationsDashboard, moduleLabels, severityLabels, severityTone } from "@/services/notifications/calculations";
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
  { id: "collaboration", label: "Collaboration", icon: MessageCircle },
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
  const [selectedConversationId, setSelectedConversationId] = useState(data.conversations[0]?.id ?? "");
  const dashboard = useMemo(() => getNotificationsDashboard(data), [data]);
  const selectedConversation = data.conversations.find((item) => item.id === selectedConversationId) ?? data.conversations[0] ?? null;

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

  const createManualAlert = () => {
    mutate(
      (current) => ({
        ...current,
        notifications: [
          createNotification({
            title: "Notification manuelle",
            detail: "Cette notification a ete creee par un utilisateur CENTRIX.",
            module: "system",
            severity: "info"
          }),
          ...current.notifications
        ]
      }),
      { title: "Notification creee", detail: "La notification sera synchronisee avec Supabase." }
    );
  };

  const sendCollaborationMessage = () => {
    const conversation = selectedConversation;
    if (!conversation) return;
    const message = createCollaborationMessage(conversation.id);
    mutate(
      (current) => ({
        ...current,
        messages: [...current.messages, message],
        conversations: current.conversations.map((item) => item.id === conversation.id ? { ...item, unreadCount: 0, updatedAt: message.createdAt } : item),
        notifications: [
          createNotification({ title: "Nouveau message equipe", detail: `${message.author} a ajoute une mise a jour dans ${conversation.name}.`, module: conversation.module, severity: "info" }),
          ...current.notifications
        ]
      }),
      { title: "Message envoye", detail: "La conversation collaborative est synchronisee." }
    );
  };

  const shareCollaborationFile = () => {
    const conversation = selectedConversation;
    if (!conversation) return;
    const file = createSharedFile(conversation.id);
    mutate(
      (current) => ({
        ...current,
        sharedFiles: [file, ...current.sharedFiles],
        messages: [...current.messages, { ...createCollaborationMessage(conversation.id, `${file.name} partage avec l'equipe.`), attachmentName: file.name }]
      }),
      { title: "Fichier partage", detail: `${file.name} est rattache a la conversation.` }
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
            <Button variant="primary" onClick={createManualAlert}>
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
      {!loading && view === "collaboration" ? (
        <CollaborationView
          data={data}
          selectedConversationId={selectedConversation?.id ?? ""}
          setSelectedConversationId={setSelectedConversationId}
          onSendMessage={sendCollaborationMessage}
          onShareFile={shareCollaborationFile}
        />
      ) : null}
      {!loading && view === "rules" ? (
        <Card className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Scenarios automatiques</h2>
              <p className="mt-1 text-sm text-slate-500">Declencheurs connectes aux modules CENTRIX.</p>
            </div>
            <Button onClick={createManualAlert} variant="surface">
              <Zap size={16} />
              Creer
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
        <NotificationKpiCard icon={<Users2 size={20} />} label="Connectes" value={dashboard.onlineUsers} detail="Presence equipe" />
        <NotificationKpiCard icon={<MessageCircle size={20} />} label="Messages non lus" value={dashboard.unreadMessages} detail="Collaboration" />
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

function CollaborationView({
  data,
  selectedConversationId,
  setSelectedConversationId,
  onSendMessage,
  onShareFile
}: {
  data: ReturnType<typeof useNotificationsData>["data"];
  selectedConversationId: string;
  setSelectedConversationId: (value: string) => void;
  onSendMessage: () => void;
  onShareFile: () => void;
}) {
  const conversation = data.conversations.find((item) => item.id === selectedConversationId) ?? data.conversations[0] ?? null;
  const messages = conversation ? data.messages.filter((item) => item.conversationId === conversation.id) : [];
  const files = conversation ? data.sharedFiles.filter((item) => item.conversationId === conversation.id) : data.sharedFiles;

  return (
    <section className="grid gap-4 xl:grid-cols-[320px_1fr]">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-950">Conversations</h2>
          <Badge tone="cyan">{data.conversations.length}</Badge>
        </div>
        <div className="mt-4 space-y-2">
          {data.conversations.map((item) => (
            <button key={item.id} className={`w-full rounded-[14px] border p-3 text-left transition ${conversation?.id === item.id ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50"}`} onClick={() => setSelectedConversationId(item.id)}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-slate-950">{item.name}</p>
                {item.unreadCount ? <Badge tone="rose">{item.unreadCount}</Badge> : null}
              </div>
              <p className="mt-1 text-xs text-slate-500">{item.type} - {moduleLabels[item.module]}</p>
            </button>
          ))}
        </div>
        <div className="mt-5 border-t border-slate-200 pt-4">
          <p className="text-sm font-semibold text-slate-950">Presence equipe</p>
          <div className="mt-3 space-y-2">
            {data.presence.map((user) => (
              <div key={user.id} className="flex items-center justify-between rounded-[12px] bg-slate-50 px-3 py-2">
                <div>
                  <p className="text-sm font-semibold text-slate-950">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.role}</p>
                </div>
                <span className={`h-2.5 w-2.5 rounded-full ${user.status === "online" ? "bg-emerald-500" : user.status === "away" ? "bg-amber-400" : "bg-slate-300"}`} />
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">{conversation?.name ?? "Collaboration"}</h2>
            <p className="mt-1 text-sm text-slate-500">Messages temps reel, fichiers partages et decisions equipe.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={onShareFile}><Paperclip size={16} /> Partager fichier</Button>
            <Button onClick={onSendMessage} variant="primary"><MessageCircle size={16} /> Envoyer message</Button>
          </div>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_260px]">
          <div className="space-y-3">
            {messages.map((message) => (
              <div key={message.id} className={`rounded-[16px] border p-4 ${message.role === "admin" ? "border-blue-100 bg-blue-50" : "border-slate-200 bg-white"}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-950">{message.author}</p>
                  <span className="text-xs text-slate-400">{formatNotificationDate(message.createdAt)}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{message.content}</p>
                {message.attachmentName ? <Badge tone="violet">{message.attachmentName}</Badge> : null}
              </div>
            ))}
          </div>
          <div className="rounded-[16px] border border-slate-200 bg-slate-50 p-4">
            <p className="font-semibold text-slate-950">Fichiers partages</p>
            <div className="mt-3 space-y-2">
              {files.map((file) => (
                <div key={file.id} className="rounded-[12px] bg-white p-3">
                  <p className="text-sm font-semibold text-slate-950">{file.name}</p>
                  <p className="text-xs text-slate-500">{file.fileType} - {file.sizeMb} MB</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </section>
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
