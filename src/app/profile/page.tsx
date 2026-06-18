import { ProfileSettings } from "@/components/auth/ProfileSettings";
import { getCentrixExperienceLabel } from "@/lib/auth/rbac";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient();
  const { data: authData } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const user = authData.user;
  const { data: profile } = user && supabase
    ? await supabase.from("profiles").select("full_name,email,avatar_url,role,workspace_id,workspaces(name,plan)").eq("id", user.id).maybeSingle()
    : { data: null };
  const workspace = Array.isArray(profile?.workspaces) ? profile?.workspaces[0] : profile?.workspaces;
  const effectivePlan = profile?.workspace_id && supabase
    ? await supabase.rpc("workspace_effective_plan", { target_workspace_id: profile.workspace_id })
    : { data: workspace?.plan ?? "free" };

  return (
    <ProfileSettings
      profile={{
        abonnement: String(effectivePlan.data ?? "free"),
        avatarUrl: profile?.avatar_url ?? null,
        email: profile?.email ?? user?.email ?? "",
        entreprise: workspace?.name ?? "",
        nom: profile?.full_name ?? user?.user_metadata?.name ?? user?.email ?? "",
        preferences: { notifications: true, weeklyDigest: true },
        role: getCentrixExperienceLabel(profile?.role ?? "user")
      }}
    />
  );
}
