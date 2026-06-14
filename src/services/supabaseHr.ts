import { getSupabaseSyncResult } from "@/services/supabaseSync";
import { hrFallbackData } from "@/data/hr";
import { getSupabaseClient } from "@/lib/supabase";
import type { HrData, HrEmployee } from "@/types/hr";

const storageKey = "centrix-hr-data-v1";

function readLocal(): HrData {
  if (typeof window === "undefined") return hrFallbackData;

  const local = window.localStorage.getItem(storageKey);
  return local ? JSON.parse(local) : hrFallbackData;
}

function writeLocal(data: HrData) {
  window.localStorage.setItem(storageKey, JSON.stringify(data));
}

export async function loadHrData(): Promise<{ data: HrData; mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return { data: readLocal(), mode: "local" };
  }

  const [employees, contracts, leaves, absences, salaries, documents, schedule, notifications] = await Promise.all([
    supabase.from("hr_employees").select("*").order("updatedAt", { ascending: false }),
    supabase.from("hr_contracts").select("*"),
    supabase.from("hr_leaves").select("*").order("createdAt", { ascending: false }),
    supabase.from("hr_absences").select("*").order("date", { ascending: false }),
    supabase.from("hr_salaries").select("*"),
    supabase.from("hr_documents").select("*").order("createdAt", { ascending: false }),
    supabase.from("hr_schedule").select("*").order("date", { ascending: true }),
    supabase.from("hr_notifications").select("*").order("createdAt", { ascending: false })
  ]);

  if ([employees, contracts, leaves, absences, salaries, documents, schedule, notifications].some((result) => result.error)) {
    return { data: readLocal(), mode: "local" };
  }

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

  const results = await Promise.all([
    ...data.employees.map((row) => supabase.from("hr_employees").upsert(row, { onConflict: "id" })),
    ...data.contracts.map((row) => supabase.from("hr_contracts").upsert(row, { onConflict: "id" })),
    ...data.leaves.map((row) => supabase.from("hr_leaves").upsert(row, { onConflict: "id" })),
    ...data.absences.map((row) => supabase.from("hr_absences").upsert(row, { onConflict: "id" })),
    ...data.salaries.map((row) => supabase.from("hr_salaries").upsert(row, { onConflict: "id" })),
    ...data.documents.map((row) => supabase.from("hr_documents").upsert(row, { onConflict: "id" })),
    ...data.schedule.map((row) => supabase.from("hr_schedule").upsert(row, { onConflict: "id" })),
    ...data.notifications.map((row) => supabase.from("hr_notifications").upsert(row, { onConflict: "id" }))
  ]);

  return getSupabaseSyncResult(results);
}

export async function upsertHrEmployee(employee: HrEmployee) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  await supabase.from("hr_employees").upsert(employee, { onConflict: "id" });
}
