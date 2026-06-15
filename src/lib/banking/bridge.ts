import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkspaceContext } from "@/types/data-platform";

const bridgeBaseUrl = "https://api.bridgeapi.io/v3";
const bridgeVersion = "2025-01-15";

type BridgeRecord = Record<string, unknown>;

function getBridgeCredentials() {
  const clientId = process.env.BRIDGE_CLIENT_ID;
  const clientSecret = process.env.BRIDGE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Ajoutez BRIDGE_CLIENT_ID et BRIDGE_CLIENT_SECRET pour connecter une banque.");
  }

  return { clientId, clientSecret };
}

export function hasBridgeCredentials() {
  return Boolean(process.env.BRIDGE_CLIENT_ID && process.env.BRIDGE_CLIENT_SECRET);
}

async function bridgeRequest(path: string, init: RequestInit = {}, accessToken?: string) {
  const { clientId, clientSecret } = getBridgeCredentials();
  const response = await fetch(`${bridgeBaseUrl}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Bridge-Version": bridgeVersion,
      "Client-Id": clientId,
      "Client-Secret": clientSecret,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers
    },
    cache: "no-store"
  });

  const payload = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const detail = payload && typeof payload === "object"
      ? String((payload as BridgeRecord).message ?? (payload as BridgeRecord).error ?? `Erreur Bridge ${response.status}`)
      : `Erreur Bridge ${response.status}`;
    throw new Error(detail);
  }

  return payload as BridgeRecord | BridgeRecord[] | null;
}

function collection(payload: BridgeRecord | BridgeRecord[] | null) {
  if (Array.isArray(payload)) return payload;
  if (!payload) return [];
  const resources = payload.resources ?? payload.data;
  return Array.isArray(resources) ? resources as BridgeRecord[] : [];
}

async function ensureBridgeUser(externalUserId: string) {
  try {
    await bridgeRequest("/aggregation/users", {
      method: "POST",
      body: JSON.stringify({ external_user_id: externalUserId })
    });
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (!message.includes("exist") && !message.includes("conflict") && !message.includes("already")) throw error;
  }

  const token = await bridgeRequest("/aggregation/authorization/token", {
    method: "POST",
    body: JSON.stringify({ external_user_id: externalUserId })
  });
  const accessToken = token && !Array.isArray(token) ? String(token.access_token ?? "") : "";
  if (!accessToken) throw new Error("Bridge n'a pas retourne de jeton utilisateur.");
  return accessToken;
}

export async function createBridgeConnectSession(input: {
  callbackUrl: string;
  email: string;
  userId: string;
}) {
  const accessToken = await ensureBridgeUser(input.userId);
  const payload = await bridgeRequest("/aggregation/connect-sessions", {
    method: "POST",
    body: JSON.stringify({
      account_types: "payment",
      callback_url: input.callbackUrl,
      user_email: input.email
    })
  }, accessToken);

  const url = payload && !Array.isArray(payload) ? String(payload.url ?? payload.connect_url ?? "") : "";
  if (!url) throw new Error("Bridge n'a pas retourne de lien de connexion.");
  return { url };
}

export async function syncBridgeBankingData(supabase: SupabaseClient, workspace: WorkspaceContext) {
  const accessToken = await ensureBridgeUser(workspace.userId);
  const [accountsPayload, transactionsPayload] = await Promise.all([
    bridgeRequest("/aggregation/accounts?limit=500", {}, accessToken),
    bridgeRequest("/aggregation/transactions?limit=500", {}, accessToken)
  ]);
  const accounts = collection(accountsPayload).filter((account) => account.data_access !== "disabled");
  const transactions = collection(transactionsPayload).filter((transaction) => !transaction.deleted && !transaction.future);
  const companyId = await ensureFinanceCompany(supabase, workspace);
  const now = new Date().toISOString();

  const accountRows = accounts.map((account) => ({
    id: `bridge-account-${String(account.id)}`,
    companyId,
    bankName: String(account.bank_name ?? account.provider_name ?? account.name ?? "Compte bancaire"),
    label: String(account.name ?? account.display_name ?? account.type ?? "Compte bancaire"),
    iban: String(account.iban ?? ""),
    balance: Number(account.balance ?? 0),
    lastSyncAt: now,
    bridge_account_id: String(account.id),
    bridge_item_id: account.item_id ? String(account.item_id) : null,
    bridge_status: String(account.last_refresh_status ?? "synced"),
    workspace_id: workspace.workspaceId
  }));

  const accountIds = new Map(accounts.map((account) => [String(account.id), `bridge-account-${String(account.id)}`]));
  const transactionRows = transactions.map((transaction) => {
    const signedAmount = Number(transaction.amount ?? 0);
    const amount = Math.abs(signedAmount);
    const operationType = String(transaction.operation_type ?? "bank");

    return {
      id: `bridge-tx-${String(transaction.id)}`,
      companyId,
      bankAccountId: accountIds.get(String(transaction.account_id)) ?? null,
      type: signedAmount >= 0 ? "revenue" : "expense",
      status: "validated",
      date: String(transaction.date ?? transaction.booking_date ?? now).slice(0, 10),
      label: String(transaction.clean_description ?? transaction.provider_description ?? "Operation bancaire"),
      counterparty: String(transaction.clean_description ?? transaction.provider_description ?? "Banque"),
      category: "other",
      tags: ["Bridge", operationType],
      amountExcludingTax: amount,
      vatRate: 0,
      vatAmount: 0,
      amountIncludingTax: amount,
      attachmentUrl: null,
      history: [{ at: now, label: "Synchronisee depuis Bridge Open Banking" }],
      createdAt: String(transaction.created_at ?? now),
      updatedAt: String(transaction.updated_at ?? now),
      bridge_transaction_id: String(transaction.id),
      bridge_operation_type: operationType,
      workspace_id: workspace.workspaceId
    };
  });

  const results = await Promise.all([
    accountRows.length ? supabase.from("bank_accounts").upsert(accountRows, { onConflict: "id" }) : Promise.resolve({ error: null }),
    transactionRows.length ? supabase.from("transactions").upsert(transactionRows, { onConflict: "id" }) : Promise.resolve({ error: null }),
    supabase.from("bridge_connections").upsert({
      external_user_id: workspace.userId,
      last_synced_at: now,
      status: "connected",
      user_id: workspace.userId,
      workspace_id: workspace.workspaceId
    }, { onConflict: "workspace_id,user_id" })
  ]);
  const error = results.find((result) => result.error)?.error;
  if (error) throw new Error(error.message);

  return { accounts: accountRows.length, transactions: transactionRows.length, syncedAt: now };
}

async function ensureFinanceCompany(supabase: SupabaseClient, workspace: WorkspaceContext) {
  const { data } = await supabase.from("financial_settings").select("id").eq("workspace_id", workspace.workspaceId).limit(1).maybeSingle();
  if (data?.id) return String(data.id);

  const id = `company-${workspace.workspaceId}`;
  const { error } = await supabase.from("financial_settings").upsert({
    id,
    currency: "EUR",
    fiscalYearStart: `${new Date().getFullYear()}-01-01`,
    iban: "",
    legalName: workspace.workspaceName,
    logoUrl: "",
    name: workspace.workspaceName,
    vatNumber: "",
    vatRate: 20,
    workspace_id: workspace.workspaceId
  }, { onConflict: "id" });
  if (error) throw new Error(error.message);
  return id;
}
