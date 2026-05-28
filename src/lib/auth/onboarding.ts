import { createServerSupabaseClient } from "@/lib/supabase-server";
import { DEMO_AUTH_USER, DEMO_USER, DEMO_WORKSPACE } from "@/lib/auth/demo-session";

export async function ensureUserOnboarding(name?: string | null, company?: string | null) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return;

  const user = DEMO_AUTH_USER;

  const displayName = name || DEMO_USER.full_name;
  const companyName = company || DEMO_WORKSPACE.name;
  const workspaceSlug = `${companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "workspace"}-${user.id.slice(0, 8)}`;

  await supabase.from("users").upsert({
    id: user.id,
    nom: displayName,
    email: user.email ?? "",
    entreprise: companyName,
    role: "admin",
    abonnement: "starter",
    avatar_url: user.user_metadata?.avatar_url ?? null,
    updated_at: new Date().toISOString()
  });

  const { data: workspace } = await supabase
    .from("workspaces")
    .upsert({
      owner_id: user.id,
      name: companyName,
      slug: workspaceSlug,
      plan: "starter",
      updated_at: new Date().toISOString()
    }, { onConflict: "owner_id" })
    .select("id")
    .single();

  if (!workspace?.id) return;

  await supabase.from("profiles").upsert({
    id: user.id,
    workspace_id: workspace.id,
    full_name: displayName,
    email: user.email ?? "",
    avatar_url: user.user_metadata?.avatar_url ?? null,
    role: "admin",
    updated_at: new Date().toISOString()
  }, { onConflict: "id" });

  await supabase.from("workspace_members").upsert({
    workspace_id: workspace.id,
    user_id: user.id,
    role: "admin",
    status: "active",
    updated_at: new Date().toISOString()
  }, { onConflict: "workspace_id,user_id" });
}
