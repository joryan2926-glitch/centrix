import { createServerSupabaseClient } from "@/lib/supabase-server";
import { planRank, type PlanCode } from "@/lib/auth/plan-catalog";

export { getRequiredPlanForModule, moduleMinimumPlan, planRank, type PlanCode } from "@/lib/auth/plan-catalog";

export async function requirePlan(requiredPlan: PlanCode) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { allowed: false as const, error: "Supabase indisponible.", status: 503 };
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { allowed: false as const, error: "Authentification requise.", status: 401 };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role,workspace_id,workspaces(plan)")
    .eq("id", authData.user.id)
    .maybeSingle();
  if (!profile?.workspace_id) return { allowed: false as const, error: "Workspace introuvable.", status: 403 };
  const workspace = Array.isArray(profile.workspaces) ? profile.workspaces[0] : profile.workspaces;
  const plan = String(workspace?.plan ?? "starter") as PlanCode;
  const allowed = profile.role === "super_admin" || planRank[plan] >= planRank[requiredPlan];
  return allowed
    ? { allowed: true as const, plan, role: String(profile.role), userId: authData.user.id, workspaceId: String(profile.workspace_id) }
    : { allowed: false as const, error: `Cette fonctionnalite necessite le plan ${requiredPlan.toUpperCase()}.`, plan, requiredPlan, status: 403 };
}
