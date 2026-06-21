import { getSupabaseSyncResult } from "@/services/supabaseSync";
import { financeFallbackData } from "@/data/comptabilite";
import { getSupabaseClient } from "@/lib/supabase";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";
import type { AccountingEntry, FinanceData, FinanceTransaction, TaxRecord } from "@/types/comptabilite";

function readLocal(): FinanceData {
  if (typeof window === "undefined") return financeFallbackData;
  return financeFallbackData;
}

function writeLocal(data: FinanceData) {
  void data;
}

export async function loadFinanceData(): Promise<{ data: FinanceData; mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();

  if (!supabase) return { data: readLocal(), mode: "local" };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { data: readLocal(), mode: "local" };

  const [companies, transactions, bankAccounts, accountingEntries, taxRecords, financialReports, categories] =
    await Promise.all([
      supabase.from("financial_settings").select("*").eq("workspace_id", workspace.workspaceId),
      supabase.from("transactions").select("*").eq("workspace_id", workspace.workspaceId).order("date", { ascending: false }),
      supabase.from("bank_accounts").select("*").eq("workspace_id", workspace.workspaceId),
      supabase.from("accounting_entries").select("*").eq("workspace_id", workspace.workspaceId).order("date", { ascending: false }),
      supabase.from("tax_records").select("*").eq("workspace_id", workspace.workspaceId).order("period", { ascending: false }),
      supabase.from("financial_reports").select("*").eq("workspace_id", workspace.workspaceId).order("month", { ascending: true }),
      supabase.from("accounting_categories").select("*")
    ]);

  if ([companies, transactions, bankAccounts, accountingEntries, taxRecords, financialReports, categories].some((result) => result.error)) {
    return { data: readLocal(), mode: "local" };
  }

  if (!companies.data?.length || !categories.data?.length) {
    await ensureFinanceBootstrap(workspace.workspaceId);
  }

  return {
    data: {
      companies: companies.data?.length ? companies.data : financeFallbackData.companies,
      transactions: transactions.data?.length ? transactions.data : financeFallbackData.transactions,
      bankAccounts: bankAccounts.data?.length ? bankAccounts.data : financeFallbackData.bankAccounts,
      accountingEntries: accountingEntries.data?.length ? accountingEntries.data : financeFallbackData.accountingEntries,
      taxRecords: taxRecords.data?.length ? taxRecords.data : financeFallbackData.taxRecords,
      financialReports: financialReports.data?.length ? financialReports.data : financeFallbackData.financialReports,
      categories: categories.data?.length ? categories.data : financeFallbackData.categories
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
  if (!supabase) return { error: "Supabase non configure.", mode: "local" as const };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { error: "Workspace introuvable.", mode: "local" as const };

  const results = await Promise.all([
    ...data.companies.map((row) => supabase.from("financial_settings").upsert({ ...row, workspace_id: workspace.workspaceId }, { onConflict: "id" })),
    ...data.transactions.map((row) => supabase.from("transactions").upsert({ ...row, workspace_id: workspace.workspaceId }, { onConflict: "id" })),
    ...data.transactions.filter((row) => row.type === "expense").map((row) => supabase.from("expenses").upsert({ ...row, workspace_id: workspace.workspaceId }, { onConflict: "id" })),
    ...data.transactions.filter((row) => row.type === "revenue").map((row) => supabase.from("revenues").upsert({ ...row, workspace_id: workspace.workspaceId }, { onConflict: "id" })),
    ...data.bankAccounts.map((row) => supabase.from("bank_accounts").upsert({ ...row, workspace_id: workspace.workspaceId }, { onConflict: "id" })),
    ...data.accountingEntries.map((row) => supabase.from("accounting_entries").upsert({ ...row, workspace_id: workspace.workspaceId }, { onConflict: "id" })),
    ...data.taxRecords.map((row) => supabase.from("tax_records").upsert({ ...row, workspace_id: workspace.workspaceId }, { onConflict: "id" })),
    ...data.financialReports.map((row) => supabase.from("financial_reports").upsert({ ...row, workspace_id: workspace.workspaceId }, { onConflict: "id" })),
    ...data.categories.map((row) => supabase.from("accounting_categories").upsert(row, { onConflict: "id" }))
  ]);

  return getSupabaseSyncResult(results);
}

export async function upsertFinanceTransaction(transaction: FinanceTransaction) {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: "Supabase non configure.", mode: "local" as const };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { error: "Workspace introuvable.", mode: "local" as const };
  await ensureFinanceBootstrap(workspace.workspaceId);

  const scopedTransaction = { ...transaction, workspace_id: workspace.workspaceId };
  const mirrorTable = transaction.type === "expense" ? "expenses" : transaction.type === "revenue" ? "revenues" : null;
  const oppositeTable = transaction.type === "expense" ? "revenues" : transaction.type === "revenue" ? "expenses" : null;
  const entry = transaction.status === "validated" ? buildAccountingEntry(transaction, workspace.workspaceId) : null;
  const taxRecord = buildTaxRecord(transaction, workspace.workspaceId);
  const report = buildMonthlyReport(transaction, workspace.workspaceId);

  const results = await Promise.all([
    supabase.from("transactions").upsert(scopedTransaction, { onConflict: "id" }),
    mirrorTable ? supabase.from(mirrorTable).upsert(scopedTransaction, { onConflict: "id" }) : Promise.resolve({ error: null }),
    oppositeTable ? supabase.from(oppositeTable).delete().eq("id", transaction.id).eq("workspace_id", workspace.workspaceId) : Promise.resolve({ error: null }),
    entry ? supabase.from("accounting_entries").upsert(entry, { onConflict: "id" }) : supabase.from("accounting_entries").delete().eq("transactionId", transaction.id).eq("workspace_id", workspace.workspaceId),
    taxRecord ? supabase.from("tax_records").upsert(taxRecord, { onConflict: "id" }) : Promise.resolve({ error: null }),
    report ? supabase.from("financial_reports").upsert(report, { onConflict: "id" }) : Promise.resolve({ error: null })
  ]);

  return getSupabaseSyncResult(results);
}

export async function deleteFinanceTransaction(id: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: "Supabase non configure.", mode: "local" as const };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { error: "Workspace introuvable.", mode: "local" as const };

  const results = await Promise.all([
    supabase.from("expenses").delete().eq("id", id).eq("workspace_id", workspace.workspaceId),
    supabase.from("revenues").delete().eq("id", id).eq("workspace_id", workspace.workspaceId),
    supabase.from("transactions").delete().eq("id", id).eq("workspace_id", workspace.workspaceId)
  ]);

  return getSupabaseSyncResult(results);
}

async function ensureFinanceBootstrap(workspaceId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  await Promise.all([
    ...financeFallbackData.companies.map((row) => supabase.from("financial_settings").upsert({ ...row, workspace_id: workspaceId }, { onConflict: "id" })),
    ...financeFallbackData.bankAccounts.map((row) => supabase.from("bank_accounts").upsert({ ...row, workspace_id: workspaceId }, { onConflict: "id" })),
    ...financeFallbackData.transactions.map((row) => supabase.from("transactions").upsert({ ...row, workspace_id: workspaceId }, { onConflict: "id" })),
    ...financeFallbackData.accountingEntries.map((row) => supabase.from("accounting_entries").upsert({ ...row, workspace_id: workspaceId }, { onConflict: "id" })),
    ...financeFallbackData.taxRecords.map((row) => supabase.from("tax_records").upsert({ ...row, workspace_id: workspaceId }, { onConflict: "id" })),
    ...financeFallbackData.financialReports.map((row) => supabase.from("financial_reports").upsert({ ...row, workspace_id: workspaceId }, { onConflict: "id" })),
    ...financeFallbackData.categories.map((row) => supabase.from("accounting_categories").upsert(row, { onConflict: "id" }))
  ]);
}

function buildAccountingEntry(transaction: FinanceTransaction, workspaceId: string): AccountingEntry & { workspace_id: string } {
  const account = accountForCategory(transaction.category);
  return {
    account,
    companyId: transaction.companyId,
    credit: transaction.type === "revenue" ? transaction.amountExcludingTax : 0,
    date: transaction.date,
    debit: transaction.type === "expense" ? transaction.amountExcludingTax : 0,
    id: `entry-${transaction.id}`,
    label: transaction.label,
    transactionId: transaction.id,
    workspace_id: workspaceId
  };
}

function buildTaxRecord(transaction: FinanceTransaction, workspaceId: string): (TaxRecord & { workspace_id: string }) | null {
  if (transaction.status !== "validated" || transaction.type === "transfer") return null;
  const period = transaction.date.slice(0, 7);
  return {
    collectedVat: transaction.type === "revenue" ? transaction.vatAmount : 0,
    companyId: transaction.companyId,
    deductibleVat: transaction.type === "expense" ? transaction.vatAmount : 0,
    id: `tax-${period}-${transaction.id}`,
    period,
    status: "ready",
    vatDue: transaction.type === "revenue" ? transaction.vatAmount : -transaction.vatAmount,
    workspace_id: workspaceId
  };
}

function buildMonthlyReport(transaction: FinanceTransaction, workspaceId: string) {
  if (transaction.status !== "validated" || transaction.type === "transfer") return null;
  const month = new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(new Date(transaction.date));
  const revenue = transaction.type === "revenue" ? transaction.amountExcludingTax : 0;
  const expenses = transaction.type === "expense" ? transaction.amountExcludingTax : 0;
  return {
    cashflow: revenue - expenses,
    companyId: transaction.companyId,
    expenses,
    id: `rep-${transaction.date.slice(0, 7)}-${transaction.id}`,
    month,
    netProfit: revenue - expenses,
    revenue,
    workspace_id: workspaceId
  };
}

function accountForCategory(category: FinanceTransaction["category"]) {
  return financeFallbackData.categories.find((item) => item.id === category)?.account ?? "471";
}
