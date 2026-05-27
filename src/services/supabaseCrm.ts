import { crmFallbackData } from "@/data/crm";
import { getSupabaseClient } from "@/lib/supabase";
import type { CrmActivity, CrmClient, CrmData, CrmLead, CrmNote, CrmTask } from "@/types/crm";

const storageKey = "centrix-crm-data-v2";

const emptyData: CrmData = {
  leads: [],
  clients: [],
  notes: [],
  tasks: [],
  activities: []
};

function readLocal(): CrmData {
  if (typeof window === "undefined") return crmFallbackData;

  const local = window.localStorage.getItem(storageKey);
  return local ? JSON.parse(local) : crmFallbackData;
}

function writeLocal(data: CrmData) {
  window.localStorage.setItem(storageKey, JSON.stringify(data));
}

export async function loadCrmData(): Promise<{ data: CrmData; mode: "supabase" | "local" }> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return { data: readLocal(), mode: "local" };
  }

  const [leads, clients, notes, tasks, activities] = await Promise.all([
    supabase.from("crm_leads").select("*").order("updatedAt", { ascending: false }),
    supabase.from("crm_clients").select("*").order("updatedAt", { ascending: false }),
    supabase.from("crm_notes").select("*").order("createdAt", { ascending: false }),
    supabase.from("crm_tasks").select("*").order("dueDate", { ascending: true }),
    supabase.from("crm_activities").select("*").order("createdAt", { ascending: false })
  ]);

  if (leads.error || clients.error || notes.error || tasks.error || activities.error) {
    return { data: readLocal(), mode: "local" };
  }

  return {
    data: {
      leads: leads.data ?? [],
      clients: clients.data ?? [],
      notes: notes.data ?? [],
      tasks: tasks.data ?? [],
      activities: activities.data ?? []
    },
    mode: "supabase"
  };
}

export async function saveCrmData(data: CrmData) {
  writeLocal(data);
}

export async function upsertLead(lead: CrmLead) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  await supabase.from("crm_leads").upsert(lead, { onConflict: "id" });
}

export async function upsertClient(client: CrmClient) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  await supabase.from("crm_clients").upsert(client, { onConflict: "id" });
}

export async function insertNote(note: CrmNote) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  await supabase.from("crm_notes").upsert(note, { onConflict: "id" });
}

export async function upsertTask(task: CrmTask) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  await supabase.from("crm_tasks").upsert(task, { onConflict: "id" });
}

export async function insertActivity(activity: CrmActivity) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  await supabase.from("crm_activities").upsert(activity, { onConflict: "id" });
}

export async function syncCrmData(data: CrmData) {
  writeLocal(data);
  const supabase = getSupabaseClient();

  if (!supabase) return { mode: "local" as const };

  await Promise.all([
    ...data.leads.map((lead) => upsertLead(lead)),
    ...data.clients.map((client) => upsertClient(client)),
    ...data.notes.map((note) => insertNote(note)),
    ...data.tasks.map((task) => upsertTask(task)),
    ...data.activities.map((activity) => insertActivity(activity))
  ]);

  return { mode: "supabase" as const };
}

export function mergeCrmData(data: Partial<CrmData>): CrmData {
  return { ...emptyData, ...data };
}
