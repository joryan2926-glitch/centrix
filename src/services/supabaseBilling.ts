import { billingDocuments } from "@/data/billing";
import type { BillingDocument } from "@/types/billing";

const storageKey = "centrix-billing-documents";
const tableName = "billing_documents";

function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function supabaseHeaders() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: "resolution=merge-duplicates,return=representation"
  };
}

function supabaseUrl() {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${tableName}`;
}

export async function loadBillingDocuments(): Promise<BillingDocument[]> {
  if (hasSupabaseConfig()) {
    const response = await fetch(`${supabaseUrl()}?select=*&order=createdAt.desc`, {
      headers: supabaseHeaders(),
      cache: "no-store"
    });

    if (response.ok) {
      return response.json();
    }
  }

  const local = window.localStorage.getItem(storageKey);
  return local ? JSON.parse(local) : billingDocuments;
}

export async function saveBillingDocuments(documents: BillingDocument[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(documents));
}

export async function upsertBillingDocument(document: BillingDocument) {
  if (hasSupabaseConfig()) {
    await fetch(`${supabaseUrl()}?on_conflict=id`, {
      method: "POST",
      headers: supabaseHeaders(),
      body: JSON.stringify(document)
    });
  }
}

export async function syncBillingDocuments(documents: BillingDocument[]) {
  await saveBillingDocuments(documents);

  if (!hasSupabaseConfig()) {
    return { mode: "local" as const };
  }

  await Promise.all(documents.map((document) => upsertBillingDocument(document)));
  return { mode: "supabase" as const };
}
