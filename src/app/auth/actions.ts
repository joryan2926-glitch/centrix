"use server";

import { headers } from "next/headers";
import { ensureUserOnboarding } from "@/lib/auth/onboarding";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export type AuthActionState = {
  ok: boolean;
  title: string;
  detail: string;
  redirectTo?: string;
  oauthUrl?: string;
};

function authErrorMessage(message?: string) {
  const value = (message ?? "").toLowerCase();

  if (value.includes("already") || value.includes("registered")) return "Cet email est deja utilise.";
  if (value.includes("weak") || value.includes("password")) return "Le mot de passe est trop faible. Utilisez au moins 8 caracteres.";
  if (value.includes("invalid login") || value.includes("invalid credentials")) return "Email ou mot de passe incorrect.";
  if (value.includes("email")) return "Verifiez le format de votre email.";
  return message ?? "Une erreur est survenue. Reessayez dans un instant.";
}

async function getOrigin() {
  const headerStore = await headers();
  return headerStore.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function signInAction(formData: FormData): Promise<AuthActionState> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false, title: "Supabase manquant", detail: "Ajoutez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY." };

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/dashboard") || "/dashboard";

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, title: "Connexion impossible", detail: authErrorMessage(error.message) };

  await ensureUserOnboarding();
  return { ok: true, title: "Connexion reussie", detail: "Session CENTRIX ouverte.", redirectTo };
}

export async function signUpAction(formData: FormData): Promise<AuthActionState> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false, title: "Supabase manquant", detail: "Ajoutez les variables d'environnement Supabase." };

  const origin = await getOrigin();
  const name = String(formData.get("name") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim() || "Mon entreprise";
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
      data: { name, company, role: "admin", subscription: "starter" }
    }
  });

  if (error) return { ok: false, title: "Inscription impossible", detail: authErrorMessage(error.message) };

  await ensureUserOnboarding(name, company);

  if (!data.session) {
    return { ok: true, title: "Compte cree", detail: "Confirmez votre email pour ouvrir CENTRIX.", redirectTo: "/login" };
  }

  return { ok: true, title: "Workspace cree", detail: "Entreprise par defaut et profil admin initialises.", redirectTo: "/dashboard" };
}

export async function resetPasswordAction(formData: FormData): Promise<AuthActionState> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false, title: "Supabase manquant", detail: "Ajoutez les variables d'environnement Supabase." };

  const origin = await getOrigin();
  const email = String(formData.get("email") ?? "").trim();
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/login` });

  if (error) return { ok: false, title: "Email non envoye", detail: authErrorMessage(error.message) };
  return { ok: true, title: "Email envoye", detail: "Un lien de reinitialisation securise vient d'etre envoye." };
}

export async function googleOAuthAction(): Promise<AuthActionState> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false, title: "Supabase manquant", detail: "Ajoutez les variables d'environnement Supabase." };

  const origin = await getOrigin();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback?next=/dashboard` }
  });

  if (error || !data.url) return { ok: false, title: "OAuth indisponible", detail: authErrorMessage(error?.message) };
  return { ok: true, title: "Redirection Google", detail: "Ouverture de Google OAuth.", oauthUrl: data.url };
}

export async function signOutAction(): Promise<AuthActionState> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: true, title: "Deconnecte", detail: "Session locale fermee.", redirectTo: "/login" };

  await supabase.auth.signOut();
  return { ok: true, title: "Deconnecte", detail: "Votre session CENTRIX est fermee.", redirectTo: "/login" };
}

export async function updateProfileAction(formData: FormData): Promise<AuthActionState> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false, title: "Supabase manquant", detail: "Connexion Supabase requise." };

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, title: "Session expiree", detail: "Reconnectez-vous pour modifier le profil.", redirectTo: "/login" };

  const nom = String(formData.get("nom") ?? "").trim();
  const entreprise = String(formData.get("entreprise") ?? "").trim();
  const avatarUrl = String(formData.get("avatarUrl") ?? "").trim();
  const preferences = {
    notifications: formData.get("notifications") === "on",
    weeklyDigest: formData.get("weeklyDigest") === "on"
  };

  const { error } = await supabase.from("users").upsert({
    id: user.id,
    nom,
    email: user.email ?? "",
    entreprise,
    avatar_url: avatarUrl || null,
    preferences,
    updated_at: new Date().toISOString()
  });

  if (error) return { ok: false, title: "Profil non sauvegarde", detail: error.message };

  await supabase.auth.updateUser({ data: { name: nom, company: entreprise, avatar_url: avatarUrl || null } });
  return { ok: true, title: "Profil mis a jour", detail: "Vos informations utilisateur sont synchronisees." };
}

export async function updatePasswordAction(formData: FormData): Promise<AuthActionState> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false, title: "Supabase manquant", detail: "Connexion Supabase requise." };

  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { ok: false, title: "Mot de passe faible", detail: "Utilisez au moins 8 caracteres." };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, title: "Mot de passe non modifie", detail: authErrorMessage(error.message) };

  return { ok: true, title: "Mot de passe modifie", detail: "Votre prochaine connexion utilisera ce mot de passe." };
}
