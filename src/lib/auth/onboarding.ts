import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function ensureUserOnboarding(name?: string | null, company?: string | null) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return;

  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) return;

  const displayName = name || user.user_metadata?.name || user.email?.split("@")[0] || "Utilisateur CENTRIX";
  const companyName = company || user.user_metadata?.company || "Mon entreprise";
  const workspaceSlug = `${companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "workspace"}-${user.id.slice(0, 8)}`;
  const [{ data: existingUser }, { data: existingProfile }, { data: existingWorkspace }] = await Promise.all([
    supabase.from("users").select("role,abonnement").eq("id", user.id).maybeSingle<{ role: string | null; abonnement: string | null }>(),
    supabase.from("profiles").select("role,workspace_id").eq("id", user.id).maybeSingle<{ role: string | null; workspace_id: string | null }>(),
    supabase.from("workspaces").select("id,plan").eq("owner_id", user.id).maybeSingle<{ id: string; plan: string | null }>()
  ]);
  const metadataRole = typeof user.user_metadata?.role === "string" ? user.user_metadata.role : null;
  const role = existingProfile?.role ?? existingUser?.role ?? (metadataRole === "super_admin" ? "super_admin" : "admin");
  const abonnement = existingUser?.abonnement ?? (typeof user.user_metadata?.subscription === "string" ? user.user_metadata.subscription : "free");

  await supabase.from("users").upsert({
    id: user.id,
    nom: displayName,
    email: user.email ?? "",
    entreprise: companyName,
    role,
    abonnement,
    avatar_url: user.user_metadata?.avatar_url ?? null,
    updated_at: new Date().toISOString()
  });

  const workspaceResult = existingWorkspace?.id
    ? await supabase
      .from("workspaces")
      .update({
        name: companyName,
        updated_at: new Date().toISOString()
      })
      .eq("id", existingWorkspace.id)
      .select("id")
      .single()
    : await supabase
      .from("workspaces")
      .insert({
      owner_id: user.id,
      name: companyName,
      slug: workspaceSlug,
      plan: abonnement,
      updated_at: new Date().toISOString()
    })
      .select("id")
      .single();
  const workspace = workspaceResult.data;

  if (!workspace?.id) return;

  await supabase.from("profiles").upsert({
    id: user.id,
    workspace_id: workspace.id,
    full_name: displayName,
    email: user.email ?? "",
    avatar_url: user.user_metadata?.avatar_url ?? null,
    role,
    updated_at: new Date().toISOString()
  }, { onConflict: "id" });

  await supabase.from("workspace_members").upsert({
    workspace_id: workspace.id,
    user_id: user.id,
    role,
    status: "active",
    updated_at: new Date().toISOString()
  }, { onConflict: "workspace_id,user_id" });
}
