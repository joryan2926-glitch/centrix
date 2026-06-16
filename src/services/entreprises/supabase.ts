import { getSupabaseSyncResult } from "@/services/supabaseSync";
import { multiEnterpriseFallbackData } from "@/data/entreprises";
import { getSupabaseClient } from "@/lib/supabase";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";
import type { MultiEnterpriseData } from "@/types/entreprises";

const storageKey = "centrix-multi-enterprise-data-v1";

function readLocal(): MultiEnterpriseData {
  if (typeof window === "undefined") return multiEnterpriseFallbackData;
  const local = window.localStorage.getItem(storageKey);
  return local ? JSON.parse(local) : multiEnterpriseFallbackData;
}

function writeLocal(data: MultiEnterpriseData) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey, JSON.stringify(data));
  }
}

export async function loadMultiEnterpriseData(): Promise<{ data: MultiEnterpriseData; mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: readLocal(), mode: "local" };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { data: readLocal(), mode: "local" };

  const [companies, workspaces, franchises, users, teams, policies, activities, metrics] = await Promise.all([
    supabase.from("enterprise_companies").select("*").eq("workspace_id", workspace.workspaceId).order("updatedAt", { ascending: false }),
    supabase.from("enterprise_workspaces").select("*").eq("workspace_id", workspace.workspaceId),
    supabase.from("franchise_units").select("*").eq("workspace_id", workspace.workspaceId),
    supabase.from("enterprise_users").select("*").eq("workspace_id", workspace.workspaceId).order("lastSeenAt", { ascending: false }),
    supabase.from("enterprise_teams").select("*").eq("workspace_id", workspace.workspaceId),
    supabase.from("permission_policies").select("*").eq("workspace_id", workspace.workspaceId),
    supabase.from("enterprise_activities").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false }),
    supabase.from("consolidated_metrics").select("*").eq("workspace_id", workspace.workspaceId)
  ]);

  if ([companies, workspaces, franchises, users, teams, policies, activities, metrics].some((result) => result.error)) {
    return { data: readLocal(), mode: "local" };
  }
  if (!companies.data?.length && !workspaces.data?.length && !users.data?.length) return { data: readLocal(), mode: "supabase" };

  return {
    data: {
      companies: companies.data ?? [],
      workspaces: workspaces.data ?? [],
      franchises: franchises.data ?? [],
      users: users.data ?? [],
      teams: teams.data ?? [],
      policies: policies.data ?? [],
      activities: activities.data ?? [],
      metrics: metrics.data ?? []
    },
    mode: "supabase"
  };
}

export async function saveMultiEnterpriseData(data: MultiEnterpriseData) {
  writeLocal(data);
}

export async function syncMultiEnterpriseData(data: MultiEnterpriseData) {
  writeLocal(data);
  const supabase = getSupabaseClient();
  if (!supabase) return { mode: "local" as const };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { mode: "local" as const };
  const withWorkspace = <T extends object>(row: T) => ({ ...row, workspace_id: workspace.workspaceId });

  const results = await Promise.all([
    ...data.companies.map((row) => supabase.from("enterprise_companies").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.workspaces.map((row) => supabase.from("enterprise_workspaces").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.franchises.map((row) => supabase.from("franchise_units").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.users.map((row) => supabase.from("enterprise_users").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.teams.map((row) => supabase.from("enterprise_teams").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.policies.map((row) => supabase.from("permission_policies").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.activities.map((row) => supabase.from("enterprise_activities").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.metrics.map((row) => supabase.from("consolidated_metrics").upsert(withWorkspace(row), { onConflict: "workspace_id,month" }))
  ]);

  return getSupabaseSyncResult(results);
}
