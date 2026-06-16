import { getSupabaseSyncResult } from "@/services/supabaseSync";
import { hrFallbackData } from "@/data/hr";
import { getSupabaseClient } from "@/lib/supabase";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";
import type { HrData, HrEmployee } from "@/types/hr";

const storageKey = "centrix-hr-data-v1";

function readLocal(): HrData {
  if (typeof window === "undefined") return hrFallbackData;

  const local = window.localStorage.getItem(storageKey);
  return local ? JSON.parse(local) : hrFallbackData;
}

function writeLocal(data: HrData) {
  if (typeof window !== "undefined") window.localStorage.setItem(storageKey, JSON.stringify(data));
}

export async function loadHrData(): Promise<{ data: HrData; mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return { data: readLocal(), mode: "local" };
  }
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { data: readLocal(), mode: "local" };

  const [employees, contracts, leaves, absences, salaries, documents, schedule, notifications] = await Promise.all([
    supabase.from("hr_employees").select("*").eq("workspace_id", workspace.workspaceId).order("updatedAt", { ascending: false }),
    supabase.from("hr_contracts").select("*").eq("workspace_id", workspace.workspaceId),
    supabase.from("hr_leaves").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false }),
    supabase.from("hr_absences").select("*").eq("workspace_id", workspace.workspaceId).order("date", { ascending: false }),
    supabase.from("hr_salaries").select("*").eq("workspace_id", workspace.workspaceId),
    supabase.from("hr_documents").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false }),
    supabase.from("hr_schedule").select("*").eq("workspace_id", workspace.workspaceId).order("date", { ascending: true }),
    supabase.from("hr_notifications").select("*").eq("workspace_id", workspace.workspaceId).order("createdAt", { ascending: false })
  ]);

  if ([employees, contracts, leaves, absences, salaries, documents, schedule, notifications].some((result) => result.error)) {
    return { data: readLocal(), mode: "local" };
  }
  if (!employees.data?.length && !contracts.data?.length && !leaves.data?.length) return { data: readLocal(), mode: "supabase" };

  return {
    data: {
      employees: employees.data ?? [],
      contracts: contracts.data ?? [],
      leaves: leaves.data ?? [],
      absences: absences.data ?? [],
      salaries: salaries.data ?? [],
      documents: documents.data ?? [],
      schedule: schedule.data ?? [],
      notifications: notifications.data ?? []
    },
    mode: "supabase"
  };
}

export async function saveHrData(data: HrData) {
  writeLocal(data);
}

export async function syncHrData(data: HrData) {
  writeLocal(data);
  const supabase = getSupabaseClient();

  if (!supabase) return { mode: "local" as const };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { mode: "local" as const };
  const withWorkspace = <T extends object>(row: T) => ({ ...row, workspace_id: workspace.workspaceId });

  const results = await Promise.all([
    ...data.employees.map((row) => supabase.from("hr_employees").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.contracts.map((row) => supabase.from("hr_contracts").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.leaves.map((row) => supabase.from("hr_leaves").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.absences.map((row) => supabase.from("hr_absences").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.salaries.map((row) => supabase.from("hr_salaries").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.documents.map((row) => supabase.from("hr_documents").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.schedule.map((row) => supabase.from("hr_schedule").upsert(withWorkspace(row), { onConflict: "id" })),
    ...data.notifications.map((row) => supabase.from("hr_notifications").upsert(withWorkspace(row), { onConflict: "id" }))
  ]);

  return getSupabaseSyncResult(results);
}

export async function upsertHrEmployee(employee: HrEmployee) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return;
  await supabase.from("hr_employees").upsert({ ...employee, workspace_id: workspace.workspaceId }, { onConflict: "id" });
}

export async function deleteHrEmployee(employeeId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return { mode: "local" as const };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { mode: "local" as const };
  const { error } = await supabase.from("hr_employees").delete().eq("id", employeeId).eq("workspace_id", workspace.workspaceId);
  return { mode: error ? "local" as const : "supabase" as const };
}
