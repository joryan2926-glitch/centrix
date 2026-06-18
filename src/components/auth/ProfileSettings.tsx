"use client";

import { useState } from "react";
import { Camera, KeyRound, Save, ShieldCheck, UserRound } from "lucide-react";
import { updatePasswordAction, updateProfileAction } from "@/app/auth/actions";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Toast } from "@/ui/Toast";

type ProfileSettingsProps = {
  profile: {
    nom: string;
    email: string;
    entreprise: string;
    role: string;
    abonnement: string;
    avatarUrl: string | null;
    preferences: { notifications?: boolean; weeklyDigest?: boolean } | null;
  };
};

export function ProfileSettings({ profile }: ProfileSettingsProps) {
  const [toast, setToast] = useState<{ title: string; detail: string } | null>(null);
  const [loading, setLoading] = useState<"profile" | "password" | null>(null);

  async function submitProfile(formData: FormData) {
    setLoading("profile");
    const result = await updateProfileAction(formData);
    setLoading(null);
    setToast({ title: result.title, detail: result.detail });
  }

  async function submitPassword(formData: FormData) {
    setLoading("password");
    const result = await updatePasswordAction(formData);
    setLoading(null);
    setToast({ title: result.title, detail: result.detail });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {toast ? <Toast title={toast.title} detail={toast.detail} /> : null}

      <section className="overflow-hidden rounded-[28px] bg-[#050b18] p-6 text-white shadow-[0_30px_90px_rgba(15,23,42,0.22)] sm:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-100/60">Profil utilisateur</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight">Compte CENTRIX securise</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-50/70">
              Modifiez votre identite, avatar, preferences, entreprise et mot de passe avec Supabase Auth.
            </p>
          </div>
          <div className="grid h-20 w-20 place-items-center rounded-[24px] bg-white/10 text-2xl font-black">
            {profile.avatarUrl ? (
              <span aria-label="Avatar utilisateur" className="h-full w-full rounded-[24px] bg-cover bg-center" style={{ backgroundImage: `url(${profile.avatarUrl})` }} />
            ) : (
              profile.nom.slice(0, 1)
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-[16px] bg-blue-600 text-white">
              <UserRound size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-950">Informations profil</h2>
              <p className="text-sm text-slate-500">Synchronise avec la table `users`.</p>
            </div>
          </div>

          <form action={submitProfile} className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field defaultValue={profile.nom} label="Nom" name="nom" />
            <Field defaultValue={profile.email} disabled label="Email" name="email" />
            <Field defaultValue={profile.entreprise} label="Entreprise" name="entreprise" />
            <Field defaultValue={profile.avatarUrl ?? ""} icon={<Camera size={16} />} label="Avatar URL" name="avatarUrl" />
            <label className="block text-sm font-semibold text-slate-700">
              Upload avatar
              <span className="mt-2 flex h-11 items-center gap-2 rounded-[12px] border border-dashed border-slate-300 bg-white px-3 transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
                <Camera size={16} className="text-slate-400" />
                <input accept="image/png,image/jpeg,image/webp,image/gif" className="min-w-0 flex-1 text-sm text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-black file:text-blue-700" name="avatarFile" type="file" />
              </span>
            </label>
            <label className="flex items-center gap-3 rounded-[16px] border border-slate-200 bg-white/72 p-4 text-sm font-semibold text-slate-700">
              <input defaultChecked={profile.preferences?.notifications ?? true} name="notifications" type="checkbox" />
              Notifications business
            </label>
            <label className="flex items-center gap-3 rounded-[16px] border border-slate-200 bg-white/72 p-4 text-sm font-semibold text-slate-700">
              <input defaultChecked={profile.preferences?.weeklyDigest ?? true} name="weeklyDigest" type="checkbox" />
              Resume hebdomadaire IA
            </label>
            <Button className="sm:col-span-2" disabled={loading === "profile"} variant="primary">
              <Save size={17} />
              {loading === "profile" ? "Sauvegarde..." : "Sauvegarder le profil"}
            </Button>
          </form>
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck size={22} className="text-emerald-600" />
              <div>
                <h2 className="text-lg font-black text-slate-950">Profil & abonnement</h2>
                <p className="text-sm text-slate-500">Acces courant</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              <Info label="Profil" value={profile.role} />
              <Info label="Abonnement" value={profile.abonnement} />
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3">
              <KeyRound size={22} className="text-blue-600" />
              <div>
                <h2 className="text-lg font-black text-slate-950">Mot de passe</h2>
                <p className="text-sm text-slate-500">Modification securisee Supabase Auth.</p>
              </div>
            </div>
            <form action={submitPassword} className="mt-5 space-y-4">
              <Field label="Nouveau mot de passe" name="password" type="password" />
              <Button className="w-full" disabled={loading === "password"}>
                <KeyRound size={17} />
                {loading === "password" ? "Mise a jour..." : "Modifier le mot de passe"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({ defaultValue, disabled, icon, label, name, type = "text" }: { defaultValue?: string; disabled?: boolean; icon?: React.ReactNode; label: string; name: string; type?: string }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <span className="mt-2 flex h-11 items-center gap-2 rounded-[12px] border border-slate-200 bg-white px-3 transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
        {icon ? <span className="text-slate-400">{icon}</span> : null}
        <input className="min-w-0 flex-1 bg-transparent text-slate-900 outline-none disabled:text-slate-400" defaultValue={defaultValue} disabled={disabled} name={name} type={type} />
      </span>
    </label>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-slate-200 bg-white/74 p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-black capitalize text-slate-950">{value}</p>
    </div>
  );
}
