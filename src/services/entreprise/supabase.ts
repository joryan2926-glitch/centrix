import { getSupabaseSyncResult } from "@/services/supabaseSync";
import { enterpriseLegalFallbackData } from "@/data/entreprise";
import { getSupabaseClient } from "@/lib/supabase";
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

  const [companies, legalForms, legalDocuments, legalAnnouncements, shareholders, companySteps, companySettings, capitalDeposits, legalNotifications] = await Promise.all([
    supabase.from("companies").select("*").order("updatedAt", { ascending: false }),
    supabase.from("legal_forms").select("*"),
    supabase.from("legal_documents").select("*").order("updatedAt", { ascending: false }),
    supabase.from("legal_announcements").select("*"),
    supabase.from("shareholders").select("*"),
    supabase.from("company_steps").select("*").order("order", { ascending: true }),
    supabase.from("company_settings").select("*"),
    supabase.from("capital_deposits").select("*").order("createdAt", { ascending: false }),
    supabase.from("legal_notifications").select("*").order("createdAt", { ascending: false })
  ]);

  if ([companies, legalForms, legalDocuments, legalAnnouncements, shareholders, companySteps, companySettings, capitalDeposits, legalNotifications].some((result) => result.error)) {
    return { data: readLocal(), mode: "local" };
  }

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
      legalNotifications: legalNotifications.data ?? []
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

  const results = await Promise.all([
    ...data.legalForms.map((row) => supabase.from("legal_forms").upsert(row, { onConflict: "id" })),
    ...data.companies.map((row) => supabase.from("companies").upsert(row, { onConflict: "id" })),
    ...data.legalDocuments.map((row) => supabase.from("legal_documents").upsert(row, { onConflict: "id" })),
    ...data.legalAnnouncements.map((row) => supabase.from("legal_announcements").upsert(row, { onConflict: "id" })),
    ...data.shareholders.map((row) => supabase.from("shareholders").upsert(row, { onConflict: "id" })),
    ...data.companySteps.map((row) => supabase.from("company_steps").upsert(row, { onConflict: "id" })),
    ...data.companySettings.map((row) => supabase.from("company_settings").upsert(row, { onConflict: "companyId" })),
    ...data.capitalDeposits.map((row) => supabase.from("capital_deposits").upsert(row, { onConflict: "id" })),
    ...data.legalNotifications.map((row) => supabase.from("legal_notifications").upsert(row, { onConflict: "id" }))
  ]);

  return getSupabaseSyncResult(results);
}
