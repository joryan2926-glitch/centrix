import { getSupabaseSyncResult } from "@/services/supabaseSync";
import { enterpriseLegalFallbackData } from "@/data/entreprise";
import { getSupabaseClient } from "@/lib/supabase";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";
import type { EnterpriseLegalData } from "@/types/entreprise";

const storageKey = "centrix-enterprise-legal-data-v1";

function readLocal(): EnterpriseLegalData {
  if (typeof window === "undefined") return enterpriseLegalFallbackData;
  const local = window.localStorage.getItem(storageKey);
  return local ? JSON.parse(local) : enterpriseLegalFallbackData;
}

function writeLocal(data: EnterpriseLegalData) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey, JSON.stringify(data));
  }
}

export async function loadEnterpriseLegalData(): Promise<{ data: EnterpriseLegalData; mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: readLocal(), mode: "local" };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { data: readLocal(), mode: "local" };

  const [companies, legalForms, legalDocuments, legalAnnouncements, shareholders, companySteps, companySettings, capitalDeposits, legalNotifications, developmentPlans, advisorySessions] = await Promise.all([
    supabase.from("companies").select("*").eq("workspace_id", workspace.workspaceId).order("updatedAt", { ascending: false }),
    supabase.from("legal_forms").select("*"),
    supabase.from("legal_documents").select("*").eq("workspace_id", workspace.workspaceId).order("updatedAt", { ascending: false }),
    supabase.from("legal_announcements").select("*").eq("workspace_id", workspace.workspaceId),
    supabase.from("shareholders").select("*").eq("workspace_id", workspace.workspaceId),
    supabase.from("company_steps").select("*").eq("workspace_id", workspace.workspaceId).order("order", { ascending: true }),
    supabase.from("company_settings").select("*").eq("workspace_id", workspace.workspaceId),
    supabase.from("capital_deposits").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false }),
    supabase.from("legal_notifications").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false }),
    supabase.from("company_development_plans").select("*").eq("workspace_id", workspace.workspaceId).order("updatedAt", { ascending: false }),
    supabase.from("company_advisory_sessions").select("*").eq("workspace_id", workspace.workspaceId).order("scheduledAt", { ascending: true })
  ]);

  if ([companies, legalForms, legalDocuments, legalAnnouncements, shareholders, companySteps, companySettings, capitalDeposits, legalNotifications, developmentPlans, advisorySessions].some((result) => result.error)) {
    return { data: readLocal(), mode: "local" };
  }
  if (!companies.data?.length && !legalDocuments.data?.length && !companySteps.data?.length) return { data: readLocal(), mode: "supabase" };

  return {
    data: {
      companies: companies.data ?? [],
      legalForms: legalForms.data?.length ? legalForms.data : enterpriseLegalFallbackData.legalForms,
      legalDocuments: legalDocuments.data ?? [],
      legalAnnouncements: legalAnnouncements.data ?? [],
      shareholders: shareholders.data ?? [],
      companySteps: companySteps.data ?? [],
      companySettings: companySettings.data ?? [],
      capitalDeposits: capitalDeposits.data ?? [],
      legalNotifications: legalNotifications.data ?? [],
      developmentPlans: developmentPlans.data ?? [],
      advisorySessions: advisorySessions.data ?? []
    },
    mode: "supabase"
  };
}

export async function saveEnterpriseLegalData(data: EnterpriseLegalData) {
  writeLocal(data);
}

export async function syncEnterpriseLegalData(data: EnterpriseLegalData) {
  writeLocal(data);
  const supabase = getSupabaseClient();
  if (!supabase) return { mode: "local" as const };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { mode: "local" as const };
  const withWorkspace = <T extends object>(row: T) => ({ ...row, workspace_id: workspace.workspaceId });

  const results = await Promise.all([
    ...data.legalForms.map((row) => supabase.from("legal_forms").upsert(row, { onConflict: "id" })),
    ...data.companies.map((row) => supabase.from("companies").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.legalDocuments.map((row) => supabase.from("legal_documents").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.legalAnnouncements.map((row) => supabase.from("legal_announcements").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.shareholders.map((row) => supabase.from("shareholders").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.companySteps.map((row) => supabase.from("company_steps").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.companySettings.map((row) => supabase.from("company_settings").upsert(withWorkspace(row), { onConflict: "workspace_id,companyId" })),
    ...data.capitalDeposits.map((row) => supabase.from("capital_deposits").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.legalNotifications.map((row) => supabase.from("legal_notifications").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.developmentPlans.map((row) => supabase.from("company_development_plans").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.advisorySessions.map((row) => supabase.from("company_advisory_sessions").upsert(withWorkspace(row), { onConflict: "id" }))
  ]);

  return getSupabaseSyncResult(results);
}
