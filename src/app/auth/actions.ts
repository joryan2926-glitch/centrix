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

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function safeRedirectPath(path: string | null | undefined) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/dashboard";
  return path;
}

function validatePassword(password: string) {
  if (password.length < 8) return "Le mot de passe doit contenir au moins 8 caracteres.";
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) return "Ajoutez au moins une lettre et un chiffre.";
  return null;
}

async function getOrigin() {
  const headerStore = await headers();
  return headerStore.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function signInAction(formData: FormData): Promise<AuthActionState> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false, title: "Supabase manquant", detail: "Ajoutez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY." };

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = safeRedirectPath(String(formData.get("redirectTo") ?? "/dashboard"));

  if (!isValidEmail(email)) return { ok: false, title: "Email invalide", detail: "Entrez une adresse email valide." };
  if (!password) return { ok: false, title: "Mot de passe requis", detail: "Entrez votre mot de passe CENTRIX." };

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

  if (!name) return { ok: false, title: "Nom requis", detail: "Ajoutez votre nom pour creer le profil." };
  if (!isValidEmail(email)) return { ok: false, title: "Email invalide", detail: "Entrez une adresse email valide." };
  const passwordError = validatePassword(password);
  if (passwordError) return { ok: false, title: "Mot de passe faible", detail: passwordError };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
      data: { name, company, role: "super_admin", subscription: "starter" }
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
  if (!isValidEmail(email)) return { ok: false, title: "Email invalide", detail: "Entrez une adresse email valide." };
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/auth/callback?next=/reset-password` });

  if (error) return { ok: false, title: "Email non envoye", detail: authErrorMessage(error.message) };
  return { ok: true, title: "Email envoye", detail: "Un lien de reinitialisation securise vient d'etre envoye." };
}

export async function googleOAuthAction(): Promise<AuthActionState> {
  return startGoogleOAuth("/dashboard", false);
}

export async function googleCalendarOAuthAction(): Promise<AuthActionState> {
  return startGoogleOAuth("/agenda?google=connected", true);
}

async function startGoogleOAuth(next: string, forceCalendarConsent: boolean): Promise<AuthActionState> {
  if (process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED !== "true") {
    return { ok: false, title: "Google desactive", detail: "Google OAuth est temporairement desactive dans CENTRIX." };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false, title: "Supabase manquant", detail: "Ajoutez les variables d'environnement Supabase." };

  const origin = await getOrigin();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      queryParams: {
        access_type: "offline",
        include_granted_scopes: "true",
        prompt: forceCalendarConsent ? "consent select_account" : "select_account"
      },
      scopes: "openid email profile https://www.googleapis.com/auth/calendar.events",
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`
    }
  });

  if (error || !data.url) return { ok: false, title: "OAuth indisponible", detail: authErrorMessage(error?.message) };
  return {
    ok: true,
    title: forceCalendarConsent ? "Autorisation Calendar" : "Redirection Google",
    detail: forceCalendarConsent ? "Google va demander l'autorisation d'acceder au calendrier." : "Ouverture de Google OAuth.",
    oauthUrl: data.url
  };
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

  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) return { ok: false, title: "Session requise", detail: "Reconnectez-vous pour modifier votre profil." };

  const nom = String(formData.get("nom") ?? "").trim();
  const entreprise = String(formData.get("entreprise") ?? "").trim();
  const avatarUrl = String(formData.get("avatarUrl") ?? "").trim();
  const avatarFile = formData.get("avatarFile");

  if (!nom) return { ok: false, title: "Nom requis", detail: "Ajoutez un nom visible sur votre profil." };
  if (!entreprise) return { ok: false, title: "Entreprise requise", detail: "Ajoutez le nom de votre workspace entreprise." };

  const { data: currentProfile } = await supabase.from("profiles").select("workspace_id, role").eq("id", user.id).maybeSingle<{ workspace_id: string | null; role: string | null }>();
  let resolvedAvatarUrl = avatarUrl || null;

  if (avatarFile instanceof File && avatarFile.size > 0) {
    if (avatarFile.size > 5 * 1024 * 1024) {
      return { ok: false, title: "Avatar trop lourd", detail: "Utilisez une image inferieure a 5 Mo." };
    }

    const extension = avatarFile.name.split(".").pop()?.toLowerCase() || "png";
    const avatarPath = `${user.id}/avatar-${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("centrix-avatars").upload(avatarPath, avatarFile, {
      cacheControl: "3600",
      contentType: avatarFile.type || "image/png",
      upsert: true
    });

    if (uploadError) return { ok: false, title: "Avatar non envoye", detail: uploadError.message };

    const { data: publicAvatar } = supabase.storage.from("centrix-avatars").getPublicUrl(avatarPath);
    resolvedAvatarUrl = publicAvatar.publicUrl;
  }

  const preferences = {
    notifications: formData.get("notifications") === "on",
    weeklyDigest: formData.get("weeklyDigest") === "on"
  };

  const { error } = await supabase.from("users").upsert({
    id: user.id,
    nom,
    email: user.email ?? "",
    entreprise,
    avatar_url: resolvedAvatarUrl,
    preferences,
    updated_at: new Date().toISOString()
  });

  if (error) return { ok: false, title: "Profil non sauvegarde", detail: error.message };

  await supabase.from("profiles").upsert({
    id: user.id,
    workspace_id: currentProfile?.workspace_id ?? undefined,
    full_name: nom,
    email: user.email ?? "",
    avatar_url: resolvedAvatarUrl,
    role: currentProfile?.role ?? "admin",
    preferences,
    updated_at: new Date().toISOString()
  }, { onConflict: "id" });

  if (currentProfile?.workspace_id) {
    await supabase
      .from("workspaces")
      .update({ name: entreprise, updated_at: new Date().toISOString() })
      .eq("id", currentProfile.workspace_id);
  }

  await supabase.auth.updateUser({ data: { name: nom, company: entreprise, avatar_url: resolvedAvatarUrl } });
  return { ok: true, title: "Profil mis a jour", detail: "Vos informations utilisateur sont synchronisees." };
}

export async function updatePasswordAction(formData: FormData): Promise<AuthActionState> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false, title: "Supabase manquant", detail: "Connexion Supabase requise." };

  const password = String(formData.get("password") ?? "");
  const passwordError = validatePassword(password);
  if (passwordError) return { ok: false, title: "Mot de passe faible", detail: passwordError };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, title: "Mot de passe non modifie", detail: authErrorMessage(error.message) };

  return { ok: true, title: "Mot de passe modifie", detail: "Votre prochaine connexion utilisera ce mot de passe." };
}
