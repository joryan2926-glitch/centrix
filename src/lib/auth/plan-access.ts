import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { PlanCode } from "@/lib/auth/plan-catalog";

export { getRequiredPlanForModule, moduleMinimumPlan, planQuotas, planRank, type PlanCode, type PlanQuota } from "@/lib/auth/plan-catalog";

export async function requirePlan(requiredPlan: PlanCode) {
  void requiredPlan;
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { allowed: false as const, error: "Supabase indisponible.", status: 503 };
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { allowed: false as const, error: "Authentification requise.", status: 401 };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role,workspace_id")
    .eq("id", authData.user.id)
    .maybeSingle();
  if (!profile?.workspace_id) return { allowed: false as const, error: "Workspace introuvable.", status: 403 };
  return {
    allowed: true as const,
    plan: "enterprise" as PlanCode,
    role: String(profile.role),
    userId: authData.user.id,
    workspaceId: String(profile.workspace_id)
  };
}
