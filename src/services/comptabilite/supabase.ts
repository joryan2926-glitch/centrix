import { financeFallbackData } from "@/data/comptabilite";
import { getSupabaseClient } from "@/lib/supabase";
import type { FinanceData } from "@/types/comptabilite";

const storageKey = "centrix-finance-data-v1";

function readLocal(): FinanceData {
  if (typeof window === "undefined") return financeFallbackData;
  const local = window.localStorage.getItem(storageKey);
  return local ? JSON.parse(local) : financeFallbackData;
}

function writeLocal(data: FinanceData) {
  window.localStorage.setItem(storageKey, JSON.stringify(data));
}

export async function loadFinanceData(): Promise<{ data: FinanceData; mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();

  if (!supabase) return { data: readLocal(), mode: "local" };

  const [companies, transactions, bankAccounts, accountingEntries, taxRecords, financialReports, categories] =
    await Promise.all([
      supabase.from("financial_settings").select("*"),
      supabase.from("transactions").select("*").order("date", { ascending: false }),
      supabase.from("bank_accounts").select("*"),
      supabase.from("accounting_entries").select("*").order("date", { ascending: false }),
      supabase.from("tax_records").select("*").order("period", { ascending: false }),
      supabase.from("financial_reports").select("*").order("month", { ascending: true }),
      supabase.from("accounting_categories").select("*")
    ]);

  if ([companies, transactions, bankAccounts, accountingEntries, taxRecords, financialReports, categories].some((result) => result.error)) {
    return { data: readLocal(), mode: "local" };
  }

  return {
    data: {
      companies: companies.data ?? [],
      transactions: transactions.data ?? [],
      bankAccounts: bankAccounts.data ?? [],
      accountingEntries: accountingEntries.data ?? [],
      taxRecords: taxRecords.data ?? [],
      financialReports: financialReports.data ?? [],
      categories: categories.data ?? []
    },
    mode: "supabase"
  };
}

export async function saveFinanceData(data: FinanceData) {
  writeLocal(data);
}

export async function syncFinanceData(data: FinanceData) {
  writeLocal(data);
  const supabase = getSupabaseClient();
  if (!supabase) return { mode: "local" as const };

  await Promise.all([
    ...data.companies.map((row) => supabase.from("financial_settings").upsert(row, { onConflict: "id" })),
    ...data.transactions.map((row) => supabase.from("transactions").upsert(row, { onConflict: "id" })),
    ...data.transactions.filter((row) => row.type === "expense").map((row) => supabase.from("expenses").upsert(row, { onConflict: "id" })),
    ...data.transactions.filter((row) => row.type === "revenue").map((row) => supabase.from("revenues").upsert(row, { onConflict: "id" })),
    ...data.bankAccounts.map((row) => supabase.from("bank_accounts").upsert(row, { onConflict: "id" })),
    ...data.accountingEntries.map((row) => supabase.from("accounting_entries").upsert(row, { onConflict: "id" })),
    ...data.taxRecords.map((row) => supabase.from("tax_records").upsert(row, { onConflict: "id" })),
    ...data.financialReports.map((row) => supabase.from("financial_reports").upsert(row, { onConflict: "id" })),
    ...data.categories.map((row) => supabase.from("accounting_categories").upsert(row, { onConflict: "id" }))
  ]);

  return { mode: "supabase" as const };
}
