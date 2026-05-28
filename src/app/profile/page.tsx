import { redirect } from "next/navigation";
import { ProfileSettings } from "@/components/auth/ProfileSettings";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return (
      <ProfileSettings
        profile={{
          nom: "Utilisateur demo",
          email: "admin@centrix.app",
          entreprise: "CENTRIX",
          role: "admin",
          abonnement: "starter",
          avatarUrl: null,
          preferences: { notifications: true, weeklyDigest: true }
        }}
      />
    );
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).maybeSingle();

  return (
    <ProfileSettings
      profile={{
        nom: String(profile?.nom ?? user.user_metadata?.name ?? user.email?.split("@")[0] ?? "Utilisateur CENTRIX"),
        email: String(profile?.email ?? user.email ?? ""),
        entreprise: String(profile?.entreprise ?? user.user_metadata?.company ?? "Mon entreprise"),
        role: String(profile?.role ?? "admin"),
        abonnement: String(profile?.abonnement ?? "starter"),
        avatarUrl: profile?.avatar_url ? String(profile.avatar_url) : null,
        preferences: (profile?.preferences as { notifications?: boolean; weeklyDigest?: boolean } | null) ?? { notifications: true, weeklyDigest: true }
      }}
    />
  );
}
