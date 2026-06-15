"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Chrome, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { CentrixLogo } from "@/components/ui";
import { googleOAuthAction, resetPasswordAction, signInAction, signUpAction, updatePasswordAction } from "@/app/auth/actions";
import type { AuthMode } from "@/types/auth";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Toast } from "@/ui/Toast";

const googleAuthEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";

type AuthCardProps = {
  mode: AuthMode;
};

const copy = {
  login: { title: "Bienvenue", detail: "Connectez-vous a votre cockpit CENTRIX.", cta: "Entrer dans CENTRIX" },
  register: { title: "Creer un workspace", detail: "Configurez votre plateforme enterprise premium.", cta: "Creer mon compte" },
  forgot: { title: "Reinitialiser", detail: "Recevez un lien securise de recuperation.", cta: "Envoyer le lien" },
  reset: { title: "Nouveau mot de passe", detail: "Choisissez un mot de passe securise pour votre session.", cta: "Mettre a jour" }
};

export function AuthCard({ mode }: AuthCardProps) {
  const router = useRouter();
  const [toast, setToast] = useState<{ title: string; detail: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const error = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("error") : null;
    if (error === "oauth_callback") {
      setToast({ title: "Connexion Google interrompue", detail: "La session OAuth n'a pas pu etre finalisee. Reessayez depuis CENTRIX." });
    }
  }, []);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const redirectTo = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("redirect") : null;
    if (redirectTo) formData.set("redirectTo", redirectTo);

    const result =
      mode === "login"
        ? await signInAction(formData)
        : mode === "register"
          ? await signUpAction(formData)
          : mode === "reset"
            ? await updatePasswordAction(formData)
            : await resetPasswordAction(formData);

    setLoading(false);
    setToast({ title: result.title, detail: result.detail });

    if (result.ok && result.redirectTo) {
      window.setTimeout(() => {
        router.push(result.redirectTo ?? (mode === "reset" ? "/dashboard" : "/dashboard"));
        router.refresh();
      }, 600);
    } else if (result.ok && mode === "reset") {
      window.setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 600);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    const result = await googleOAuthAction();
    setGoogleLoading(false);
    setToast({ title: result.title, detail: result.detail });
    if (result.oauthUrl) {
      window.location.href = result.oauthUrl;
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f9fc] px-4 py-10">
      {toast ? <Toast title={toast.title} detail={toast.detail} /> : null}
      <div className="fixed inset-0 -z-10 bg-app-light" />
      <Card className="grid w-full max-w-5xl overflow-hidden lg:grid-cols-[1fr_430px]">
        <div className="bg-[#071225] p-8 text-white sm:p-10">
          <CentrixLogo inverse />
          <h1 className="mt-12 max-w-md text-4xl font-black tracking-tight">Authentification enterprise CENTRIX.</h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-blue-50/72">
            Sessions securisees, OAuth Google, preparation 2FA et protection routes pour votre plateforme SaaS.
          </p>
          <div className="mt-10 grid gap-3">
            {["Protection donnees", "Sessions Supabase Auth", "Routes applicatives securisees"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-[16px] border border-white/10 bg-white/[0.07] p-4">
                <ShieldCheck size={19} />
                <span className="text-sm font-semibold">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <form action={handleSubmit} className="p-8 sm:p-10">
          <CentrixLogo className="lg:hidden" />
          <h2 className="mt-2 text-2xl font-black text-slate-950 lg:mt-0">{copy[mode].title}</h2>
          <p className="mt-2 text-sm text-slate-500">{copy[mode].detail}</p>
          <div className="mt-8 space-y-4">
            {mode === "register" ? <Field icon={<UserRound size={17} />} label="Nom" name="name" placeholder="Julien Business" /> : null}
            {mode === "register" ? <Field icon={<ShieldCheck size={17} />} label="Entreprise" name="company" placeholder="CENTRIX SAS" /> : null}
            {mode !== "reset" ? <Field autoComplete="email" icon={<Mail size={17} />} label="Email" name="email" placeholder="admin@centrix.app" type="email" /> : null}
            {mode !== "forgot" ? <Field autoComplete={mode === "login" ? "current-password" : "new-password"} icon={<LockKeyhole size={17} />} label={mode === "reset" ? "Nouveau mot de passe" : "Mot de passe"} minLength={8} name="password" placeholder="8 caracteres minimum" type="password" /> : null}
          </div>
          <Button className="mt-6 w-full" disabled={loading} variant="primary">
            {loading ? "Traitement..." : copy[mode].cta}
            <ArrowRight size={17} />
          </Button>
          {googleAuthEnabled && mode !== "forgot" && mode !== "reset" ? (
            <Button className="mt-3 w-full" disabled={googleLoading} onClick={handleGoogle} type="button">
              <Chrome size={17} />
              {googleLoading ? "Ouverture Google..." : "Continuer avec Google"}
            </Button>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-slate-500">
            {mode !== "login" ? <Link href="/login" className="hover:text-blue-700">Se connecter</Link> : null}
            {mode !== "register" ? <Link href="/register" className="hover:text-blue-700">Creer un compte</Link> : null}
            {mode !== "forgot" && mode !== "reset" ? <Link href="/forgot-password" className="hover:text-blue-700">Mot de passe oublie</Link> : null}
          </div>
        </form>
      </Card>
    </main>
  );
}

function Field({ autoComplete, icon, label, minLength, name, placeholder, type = "text" }: { autoComplete?: string; icon: React.ReactNode; label: string; minLength?: number; name: string; placeholder: string; type?: string }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <span className="mt-2 flex h-11 items-center gap-2 rounded-[12px] border border-slate-200 bg-white px-3 transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
        <span className="text-slate-400">{icon}</span>
        <input autoComplete={autoComplete} minLength={minLength} required className="min-w-0 flex-1 bg-transparent text-slate-900 outline-none" name={name} placeholder={placeholder} type={type} />
      </span>
    </label>
  );
}
