import { billingDocuments } from "@/data/billing";
import { getSupabaseClient } from "@/lib/supabase";
import { calculateBillingTotals } from "@/services/billing";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";
import type { BillingDocument, BillingStatus } from "@/types/billing";

const storageKey = "centrix-billing-documents";

function readLocal() {
  if (typeof window === "undefined") return billingDocuments;
  const local = window.localStorage.getItem(storageKey);
  return local ? (JSON.parse(local) as BillingDocument[]) : billingDocuments;
}

export async function loadBillingDocuments(): Promise<BillingDocument[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return readLocal();

  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return readLocal();

  const [quotes, invoices] = await Promise.all([
    supabase.from("quotes").select("*").eq("workspace_id", workspace.workspaceId).order("created_at", { ascending: false }),
    supabase.from("invoices").select("*").eq("workspace_id", workspace.workspaceId).order("created_at", { ascending: false })
  ]);

  if (quotes.error || invoices.error) return readLocal();

  return [...(quotes.data ?? []).map((row) => mapRowToDocument(row, "quote")), ...(invoices.data ?? []).map((row) => mapRowToDocument(row, "invoice"))].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function saveBillingDocuments(documents: BillingDocument[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey, JSON.stringify(documents));
  }
}

export async function upsertBillingDocument(document: BillingDocument) {
  const supabase = getSupabaseClient();
  if (!supabase) return "Supabase non configure.";

  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return "Workspace introuvable.";

  if (document.type === "quote") {
    const { error } = await supabase.from("quotes").upsert(toQuoteRow(document, workspace.workspaceId, workspace.userId) as never, { onConflict: "id" });
    return error?.message ?? null;
  }

  const { error } = await supabase.from("invoices").upsert(toInvoiceRow(document, workspace.workspaceId, workspace.userId) as never, { onConflict: "id" });
  return error?.message ?? null;
}

export async function syncBillingDocuments(documents: BillingDocument[]) {
  await saveBillingDocuments(documents);

  const supabase = getSupabaseClient();
  if (!supabase) return { mode: "local" as const };

  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { mode: "local" as const };

  const errors = await Promise.all(documents.map((document) => upsertBillingDocument(document)));
  const error = errors.find(Boolean) ?? null;
  return { error, mode: error ? "local" as const : "supabase" as const };
}

function mapRowToDocument(row: Record<string, unknown>, type: BillingDocument["type"]): BillingDocument {
  const lineItems = Array.isArray(row.line_items) ? row.line_items : [];
  const metadata = (row.metadata ?? {}) as Record<string, unknown>;

  return {
    id: String(row.id),
    number: String(row.number ?? ""),
    type,
    status: normalizeBillingStatus(String(row.status ?? "pending")),
    clientName: String(metadata.clientName ?? "Client"),
    clientEmail: String(metadata.clientEmail ?? ""),
    clientAddress: String(metadata.clientAddress ?? ""),
    issueDate: String(row.created_at ?? new Date().toISOString()).slice(0, 10),
    dueDate: String(row.due_at ?? row.valid_until ?? new Date().toISOString()).slice(0, 10),
    notes: String(metadata.notes ?? ""),
    lines: lineItems as BillingDocument["lines"],
    history: Array.isArray(metadata.history) ? (metadata.history as BillingDocument["history"]) : [],
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? row.created_at ?? new Date().toISOString())
  };
}

function toBillingBaseRow(document: BillingDocument, workspaceId: string, userId: string) {
  const totals = calculateBillingTotals(document.lines);
  const base = {
    id: document.id,
    created_by: userId,
    currency: "EUR",
    line_items: document.lines,
    metadata: {
      clientAddress: document.clientAddress,
      clientEmail: document.clientEmail,
      clientName: document.clientName,
      history: document.history,
      notes: document.notes
    },
    number: document.number,
    status: document.status,
    subtotal: totals.subtotal,
    title: document.type === "quote" ? `Devis ${document.number}` : `Facture ${document.number}`,
    total: totals.total,
    updated_at: document.updatedAt,
    vat_amount: totals.vatTotal,
    vat_rate: 20,
    workspace_id: workspaceId
  };

  return base;
}

function toQuoteRow(document: BillingDocument, workspaceId: string, userId: string) {
  return { ...toBillingBaseRow(document, workspaceId, userId), valid_until: document.dueDate };
}

function toInvoiceRow(document: BillingDocument, workspaceId: string, userId: string) {
  const totals = calculateBillingTotals(document.lines);
  return {
    ...toBillingBaseRow(document, workspaceId, userId),
    due_at: document.dueDate,
    paid_amount: document.status === "paid" ? totals.total : 0,
    paid_at: document.status === "paid" ? new Date().toISOString() : null
  };
}

function normalizeBillingStatus(status: string): BillingStatus {
  if (status === "draft" || status === "pending" || status === "paid") return status;
  return "pending";
}
