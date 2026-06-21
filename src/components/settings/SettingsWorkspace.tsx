"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Activity, Bell, Building2, CreditCard, Database, KeyRound, LockKeyhole, Mail, Palette, Plus, Save, Search, ShieldCheck, SlidersHorizontal, UserCog, UsersRound, WalletCards } from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useRef, useState } from "react";
import { downloadCsvFile } from "@/lib/download";
import { formatAdminBytes, formatAdminCurrency, formatAdminDate } from "@/lib/settings/format";
import { createActivity, createAdminNotification, createUserRole, getAdminDashboard, moduleLabels, roleLabels, roleTone, toneForSeverity } from "@/services/settings/calculations";
import { useSettingsData } from "@/hooks/settings/useSettingsData";
import type { AdminRole, ModuleKey } from "@/types/settings";
import { SettingsKpiCard } from "@/ui/settings/SettingsKpiCard";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Modal } from "@/ui/Modal";
import { Skeleton } from "@/ui/Skeleton";
import { Toast } from "@/ui/Toast";

const AdminCharts = dynamic(() => import("@/components/settings/AdminCharts").then((module) => module.AdminCharts), {
  loading: () => <Skeleton className="h-80" />,
  ssr: false
});

const views = [
  { id: "dashboard", label: "Dashboard", icon: Activity },
  { id: "account", label: "Compte", icon: UserCog },
  { id: "users", label: "Utilisateurs", icon: UsersRound },
  { id: "security", label: "Securite", icon: LockKeyhole },
  { id: "company", label: "Entreprise", icon: Building2 },
  { id: "billing", label: "Abonnement", icon: CreditCard },
  { id: "modules", label: "Modules", icon: SlidersHorizontal },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "logs", label: "Logs", icon: Database }
] as const;

type View = (typeof views)[number]["id"];

export function SettingsWorkspace({ initialView = "dashboard" }: { initialView?: View }) {
  const { data, loading, mode, toast, mutate, sync } = useSettingsData();
  const [view, setView] = useState<View>(initialView);
  const [query, setQuery] = useState("");
  const [userModalOpen, setUserModalOpen] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "employee" as AdminRole });

  const dashboard = useMemo(() => getAdminDashboard(data), [data]);
  const profile = data.userSettings[0];
  const company = data.companySettings[0];
  const subscription = data.subscriptions[0];
  const filteredUsers = data.userRoles.filter((user) => user.name.toLowerCase().includes(query.toLowerCase()) || user.email.toLowerCase().includes(query.toLowerCase()));

  function updateProfile(field: "name" | "email" | "timezone" | "language", value: string) {
    mutate((current) => ({
      ...current,
      userSettings: current.userSettings.map((item, index) => index === 0 ? { ...item, [field]: value, updatedAt: new Date().toISOString() } : item)
    }));
  }

  function updateCompany(field: "name" | "legalName" | "vatNumber" | "iban" | "legalAddress" | "theme", value: string) {
    mutate((current) => ({
      ...current,
      companySettings: current.companySettings.map((item, index) => index === 0 ? { ...item, [field]: value, updatedAt: new Date().toISOString() } : item)
    }));
  }

  function uploadAvatar(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      mutate((current) => ({
        ...current,
        userSettings: current.userSettings.map((item, index) => index === 0 ? { ...item, avatarUrl: String(reader.result), updatedAt: new Date().toISOString() } : item)
      }), { title: "Avatar mis a jour", detail: "Le nouvel avatar est sauvegarde dans votre profil." });
    };
    reader.readAsDataURL(file);
  }

  function toggleModule(module: ModuleKey) {
    mutate(
      (current) => ({
        ...current,
        moduleSettings: current.moduleSettings.map((setting) => setting.module === module ? { ...setting, enabled: !setting.enabled, updatedAt: new Date().toISOString() } : setting),
        activityLogs: [createActivity("module.toggle", moduleLabels[module], `Module ${moduleLabels[module]} mis a jour.`, "success"), ...current.activityLogs]
      }),
      { title: "Module mis a jour", detail: `${moduleLabels[module]} est configure.` }
    );
  }

  function submitUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const user = createUserRole(newUser.name, newUser.email, newUser.role);
    mutate(
      (current) => ({
        ...current,
        userRoles: [user, ...current.userRoles],
        activityLogs: [createActivity("user.created", user.email, `${user.name} ajoute avec le role ${roleLabels[user.role]}.`, "success"), ...current.activityLogs],
        notifications: [createAdminNotification("Utilisateur ajoute", `${user.email} peut rejoindre le workspace.`, "success"), ...current.notifications]
      }),
      { title: "Utilisateur cree", detail: `${user.name} est ajoute.` }
    );
    setUserModalOpen(false);
  }

  function toggleUser(userId: string) {
    mutate((current) => ({
      ...current,
      userRoles: current.userRoles.map((user) => user.id === userId ? { ...user, active: !user.active } : user),
      activityLogs: [createActivity("user.status", userId, "Statut utilisateur modifie.", "info"), ...current.activityLogs]
    }));
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
            <Badge tone="violet">Pilotage entreprise</Badge>
            <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Parametres & Administration</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              Console SaaS enterprise pour gerer comptes, utilisateurs, securite, entreprise, abonnement, modules, notifications et audit systeme.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setUserModalOpen(true)}><Plus size={17} /> Inviter</Button>
            <Button onClick={sync} variant="primary"><Save size={17} /> Sync {mode}</Button>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-7">
        <SettingsKpiCard delta="actifs" icon={<UsersRound size={19} />} label="Utilisateurs" value={String(dashboard.activeUsers)} />
        <SettingsKpiCard delta="societes" icon={<Building2 size={19} />} label="Entreprises" tone="violet" value={String(dashboard.activeCompanies)} />
        <SettingsKpiCard delta="cloud" icon={<Database size={19} />} label="Stockage" value={formatAdminBytes(dashboard.storageUsed)} />
        <SettingsKpiCard delta="plans" icon={<WalletCards size={19} />} label="Abonnements" tone="emerald" value={String(dashboard.activeSubscriptions)} />
        <SettingsKpiCard delta="audit" icon={<Activity size={19} />} label="Activites" value={String(dashboard.recentActivities)} />
        <SettingsKpiCard delta="sessions" icon={<KeyRound size={19} />} label="Connexions" value={String(dashboard.userConnections)} />
        <SettingsKpiCard delta="score" icon={<ShieldCheck size={19} />} label="Securite" tone="emerald" value={`${dashboard.securityScore}%`} />
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
          <AdminCharts data={data} />
          <LogGrid title="Activite systeme" logs={data.activityLogs} />
        </div>
      ) : null}

      {view === "account" && profile ? (
        <Card className="p-5">
          <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
            <div className="rounded-[8px] border border-white/10 bg-white/[0.04] p-5">
              {profile.avatarUrl ? <Image alt={profile.name} className="h-24 w-24 rounded-[8px] object-cover" height={96} src={profile.avatarUrl} unoptimized width={96} /> : <div className="grid h-24 w-24 place-items-center rounded-[8px] bg-cyan-300/10 text-3xl font-semibold text-cyan-100">{profile.name.slice(0, 1)}</div>}
              <input ref={avatarInputRef} accept="image/*" className="hidden" onChange={(event) => uploadAvatar(event.target.files?.[0])} type="file" />
              <Button className="mt-4" onClick={() => avatarInputRef.current?.click()}><Palette size={17} /> Upload avatar</Button>
              <p className="mt-4 text-sm text-slate-400">2FA future: {profile.twoFactorEnabled ? "active" : "a configurer"}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Nom" value={profile.name} onChange={(value) => updateProfile("name", value)} />
              <Field label="Email" value={profile.email} onChange={(value) => updateProfile("email", value)} />
              <Field label="Fuseau horaire" value={profile.timezone} onChange={(value) => updateProfile("timezone", value)} />
              <Field label="Langue" value={profile.language} onChange={(value) => updateProfile("language", value)} />
            </div>
          </div>
        </Card>
      ) : null}

      {view === "users" ? (
        <Card className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex h-10 flex-1 items-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-sm text-slate-400">
              <Search size={16} />
              <input className="w-full bg-transparent outline-none placeholder:text-slate-500" placeholder="Rechercher utilisateur" value={query} onChange={(event) => setQuery(event.target.value)} />
            </div>
            <Button onClick={() => setUserModalOpen(true)}><Plus size={17} /> Ajouter</Button>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.16em] text-slate-500"><tr><th className="pb-3">Utilisateur</th><th className="pb-3">Role</th><th className="pb-3">Statut</th><th className="pb-3">Derniere connexion</th><th className="pb-3" /></tr></thead>
              <tbody className="divide-y divide-white/10">
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="py-3 text-white">{user.name}<p className="text-xs text-slate-500">{user.email}</p></td>
                    <td className="py-3"><Badge tone={roleTone(user.role)}>{roleLabels[user.role]}</Badge></td>
                    <td className="py-3 text-slate-300">{user.active ? "Actif" : "Suspendu"}</td>
                    <td className="py-3 text-slate-500">{formatAdminDate(user.lastLoginAt)}</td>
                    <td className="py-3 text-right"><Button className="h-9 px-3" onClick={() => toggleUser(user.id)} variant="ghost">{user.active ? "Suspendre" : "Reactiver"}</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {view === "security" ? (
        <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-white">Sessions & logs securite</h2>
            <div className="mt-5 space-y-3">
              {data.securityLogs.map((log) => (
                <div key={log.id} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center justify-between gap-3"><p className="font-medium text-white">{log.event}</p><Badge tone={toneForSeverity(log.severity)}>{log.severity}</Badge></div>
                  <p className="mt-2 text-sm text-slate-400">{log.device} - {log.ipAddress} - {log.location}</p>
                  <p className="mt-2 text-xs text-slate-500">{formatAdminDate(log.createdAt)}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-white">Protection compte</h2>
            <div className="mt-5 space-y-3 text-sm text-slate-400">
              <p>Double authentification future preparee.</p>
              <p>Gestion sessions actives et revocation.</p>
              <p>Alertes activite suspecte et historique securite.</p>
            </div>
          </Card>
        </div>
      ) : null}

      {view === "company" && company ? (
        <Card className="p-5">
          <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Entreprise" value={company.name} onChange={(value) => updateCompany("name", value)} />
              <Field label="Raison sociale" value={company.legalName} onChange={(value) => updateCompany("legalName", value)} />
              <Field label="TVA" value={company.vatNumber} onChange={(value) => updateCompany("vatNumber", value)} />
              <Field label="IBAN" value={company.iban} onChange={(value) => updateCompany("iban", value)} />
              <Field label="Adresse" value={company.legalAddress} onChange={(value) => updateCompany("legalAddress", value)} />
              <Field label="Theme" value={company.theme} onChange={(value) => updateCompany("theme", value)} />
            </div>
            <div className="rounded-[8px] border border-white/10 bg-white/[0.04] p-5">
              <p className="text-sm font-semibold text-white">Branding workspace</p>
              <div className="mt-4 flex gap-3"><span className="h-14 w-14 rounded-[8px]" style={{ backgroundColor: company.primaryColor }} /><span className="h-14 w-14 rounded-[8px]" style={{ backgroundColor: company.accentColor }} /></div>
              <p className="mt-4 text-sm text-slate-400">Logo, couleurs et themes entreprise prets pour personnalisation.</p>
            </div>
          </div>
        </Card>
      ) : null}

      {view === "billing" && subscription ? (
        <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold text-white">Plan {subscription.plan}</h2><Badge tone="emerald">{subscription.status}</Badge></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              <Metric label="Prix mensuel" value={formatAdminCurrency(subscription.monthlyPrice)} />
              <Metric label="Licences" value={`${subscription.usedSeats}/${subscription.seats}`} />
              <Metric label="Renouvellement" value={formatAdminDate(subscription.renewalAt)} />
              <Metric label="Quotas modules" value="Enterprise" />
            </div>
          </Card>
          <Card className="p-5">
            <p className="text-sm font-semibold text-white">Historique paiements</p>
            <div className="mt-4 space-y-3">{data.billingHistory.map((bill) => <div key={bill.id} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-3"><p className="text-sm text-white">{bill.invoiceNumber}</p><p className="mt-1 text-xs text-slate-500">{formatAdminCurrency(bill.amount)} - {bill.status}</p></div>)}</div>
          </Card>
        </div>
      ) : null}

      {view === "modules" ? (
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-white">Parametres modules</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.moduleSettings.map((setting) => (
              <button key={setting.id} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4 text-left transition-all hover:bg-white/[0.08]" onClick={() => toggleModule(setting.module)}>
                <div className="flex items-center justify-between gap-3"><p className="font-semibold text-white">{moduleLabels[setting.module]}</p><Badge tone={setting.enabled ? "emerald" : "rose"}>{setting.enabled ? "Actif" : "Off"}</Badge></div>
                <p className="mt-2 text-sm text-slate-400">Permissions: {setting.permissions.map((role) => roleLabels[role]).join(", ")}</p>
              </button>
            ))}
          </div>
        </Card>
      ) : null}

      {view === "notifications" ? (
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-white">Centre notifications</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {data.notifications.map((notification) => <div key={notification.id} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4"><Badge tone={toneForSeverity(notification.severity)}>{notification.channel}</Badge><p className="mt-3 font-medium text-white">{notification.title}</p><p className="mt-2 text-sm text-slate-400">{notification.detail}</p></div>)}
          </div>
        </Card>
      ) : null}

      {view === "logs" ? <LogGrid title="Audit systeme" logs={data.activityLogs} /> : null}

      <Modal open={userModalOpen} title="Inviter un utilisateur" onClose={() => setUserModalOpen(false)}>
        <form className="space-y-3" onSubmit={submitUser}>
          <input className="h-11 w-full rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-sm text-white outline-none" value={newUser.name} onChange={(event) => setNewUser((current) => ({ ...current, name: event.target.value }))} />
          <input className="h-11 w-full rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-sm text-white outline-none" value={newUser.email} onChange={(event) => setNewUser((current) => ({ ...current, email: event.target.value }))} />
          <select className="h-11 w-full rounded-[8px] border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none" value={newUser.role} onChange={(event) => setNewUser((current) => ({ ...current, role: event.target.value as AdminRole }))}>
            {Object.entries(roleLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
          <Button className="w-full" type="submit" variant="primary"><Mail size={17} /> Envoyer invitation</Button>
        </form>
      </Modal>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="text-sm text-slate-300">{label}<input className="mt-2 h-11 w-full rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-sm text-white outline-none" value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-sm font-semibold text-white">{value}</p></div>;
}

function LogGrid({ title, logs }: { title: string; logs: Array<{ id: string; action: string; target: string; detail: string; severity: "info" | "success" | "warning"; createdAt: string }> }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold text-white">{title}</h2><Button className="h-9 px-3" onClick={() => downloadCsvFile("centrix-logs.csv", [["Action", "Cible", "Detail", "Severite", "Date"], ...logs.map((log) => [log.action, log.target, log.detail, log.severity, log.createdAt])])} variant="ghost">Export logs</Button></div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {logs.map((log) => <div key={log.id} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4"><Badge tone={toneForSeverity(log.severity)}>{log.action}</Badge><p className="mt-3 font-medium text-white">{log.target}</p><p className="mt-2 text-sm text-slate-400">{log.detail}</p><p className="mt-3 text-xs text-slate-500">{formatAdminDate(log.createdAt)}</p></div>)}
      </div>
    </Card>
  );
}
