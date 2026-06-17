import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ConnectorContext } from "@/lib/integrations/connectors";

type DocuSignTokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  expires_in: number;
  scope?: string;
};

type DocuSignUserInfo = {
  email?: string;
  accounts?: Array<{
    account_id: string;
    account_name?: string;
    base_uri: string;
    is_default?: boolean;
  }>;
};

type SignatureSource =
  | { sourceType: "document"; sourceId: string; documentId: string }
  | { sourceType: "quote"; sourceId: string; quoteId: string }
  | { sourceType: "contract"; sourceId: string; documentId: string }
  | { sourceType: "mandate"; sourceId: string; documentId: string };

type EnvelopePayload = {
  documentBase64: string;
  documentId: string;
  extension: string;
  name: string;
  subject: string;
};

type DocuSignConnection = {
  id: string;
  account_id: string;
  base_uri: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  token_type?: string;
};

export type DocuSignSignRequest = {
  documentId?: string;
  quoteId?: string;
  contractId?: string;
  mandateId?: string;
  signerEmail: string;
  signerName: string;
  subject?: string;
};

const DEFAULT_AUTH_BASE_URL = "https://account.docusign.com";
const DEFAULT_SCOPES = ["signature"];
const DOCUMENTS_BUCKET = "centrix-documents";

export function hasDocuSignOAuthConfig() {
  return Boolean(process.env.DOCUSIGN_INTEGRATION_KEY && process.env.DOCUSIGN_CLIENT_SECRET);
}

export function getDocuSignRedirectUri(origin: string) {
  return process.env.DOCUSIGN_REDIRECT_URI ?? `${origin.replace(/\/$/, "")}/api/integrations/docusign/callback`;
}

export function getDocuSignAuthUrl(origin: string, state: string) {
  const integrationKey = process.env.DOCUSIGN_INTEGRATION_KEY;
  if (!integrationKey) throw new Error("DOCUSIGN_INTEGRATION_KEY manquante.");

  const url = new URL("/oauth/auth", process.env.DOCUSIGN_AUTH_BASE_URL ?? DEFAULT_AUTH_BASE_URL);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", DEFAULT_SCOPES.join(" "));
  url.searchParams.set("client_id", integrationKey);
  url.searchParams.set("redirect_uri", getDocuSignRedirectUri(origin));
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeDocuSignCode(code: string, origin: string) {
  const payload = await requestDocuSignToken({
    grant_type: "authorization_code",
    code,
    redirect_uri: getDocuSignRedirectUri(origin)
  });
  const userInfo = await getDocuSignUserInfo(payload.access_token);
  const account = userInfo.accounts?.find((item) => item.is_default) ?? userInfo.accounts?.[0];
  if (!account) throw new Error("Aucun compte DocuSign accessible pour cet utilisateur.");

  return {
    account,
    connectedEmail: userInfo.email ?? null,
    token: payload
  };
}

export async function storeDocuSignConnection(context: ConnectorContext, code: string, origin: string) {
  const { account, connectedEmail, token } = await exchangeDocuSignCode(code, origin);
  const expiresAt = new Date(Date.now() + Math.max(60, token.expires_in - 60) * 1000).toISOString();
  const { data, error } = await context.supabase
    .from("docusign_connections")
    .upsert({
      workspace_id: context.workspaceId,
      created_by: context.userId,
      account_id: account.account_id,
      account_name: account.account_name ?? null,
      base_uri: account.base_uri,
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      token_type: token.token_type ?? "Bearer",
      expires_at: expiresAt,
      scopes: token.scope?.split(" ") ?? DEFAULT_SCOPES,
      connected_email: connectedEmail,
      status: "connected",
      updated_at: new Date().toISOString()
    }, { onConflict: "workspace_id,account_id" })
    .select("id,account_id,account_name,base_uri,connected_email,status,updated_at")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getDocuSignConnection(supabase: SupabaseClient, workspaceId: string) {
  const { data, error } = await supabase
    .from("docusign_connections")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("status", "connected")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as DocuSignConnection | null;
}

export async function getValidDocuSignConnection(context: ConnectorContext) {
  const connection = await getDocuSignConnection(context.supabase, context.workspaceId);
  if (!connection) throw new Error("Connectez DocuSign avant de demander une signature.");

  const expiresAt = new Date(connection.expires_at).getTime();
  if (expiresAt > Date.now() + 120_000) return connection;

  const refreshed = await requestDocuSignToken({
    grant_type: "refresh_token",
    refresh_token: connection.refresh_token
  });
  const nextExpiresAt = new Date(Date.now() + Math.max(60, refreshed.expires_in - 60) * 1000).toISOString();
  const { data, error } = await context.supabase
    .from("docusign_connections")
    .update({
      access_token: refreshed.access_token,
      refresh_token: refreshed.refresh_token ?? connection.refresh_token,
      token_type: refreshed.token_type ?? "Bearer",
      expires_at: nextExpiresAt,
      scopes: refreshed.scope?.split(" ") ?? DEFAULT_SCOPES,
      updated_at: new Date().toISOString()
    })
    .eq("id", connection.id)
    .eq("workspace_id", context.workspaceId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as DocuSignConnection;
}

export async function createDocuSignEnvelope(context: ConnectorContext, request: DocuSignSignRequest) {
  const source = resolveSignatureSource(request);
  const connection = await getValidDocuSignConnection(context);
  const envelopeDocument = await buildEnvelopePayload(context.supabase, context.workspaceId, source, request.subject);
  const response = await fetch(`${connection.base_uri}/restapi/v2.1/accounts/${connection.account_id}/envelopes`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${connection.access_token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      emailSubject: envelopeDocument.subject,
      documents: [{
        documentBase64: envelopeDocument.documentBase64,
        documentId: envelopeDocument.documentId,
        fileExtension: envelopeDocument.extension,
        name: envelopeDocument.name
      }],
      recipients: {
        signers: [{
          email: request.signerEmail,
          name: request.signerName,
          recipientId: "1",
          routingOrder: "1",
          tabs: {
            signHereTabs: [{
              anchorString: "/signature/",
              anchorUnits: "pixels",
              anchorXOffset: "0",
              anchorYOffset: "12"
            }]
          }
        }]
      },
      status: "sent"
    })
  });
  const payload = await response.json().catch(() => ({})) as { envelopeId?: string; message?: string };
  if (!response.ok || !payload.envelopeId) throw new Error(payload.message ?? "Creation de l'enveloppe DocuSign impossible.");

  const now = new Date().toISOString();
  const { data, error } = await context.supabase
    .from("docusign_signature_requests")
    .insert({
      workspace_id: context.workspaceId,
      created_by: context.userId,
      connection_id: connection.id,
      envelope_id: payload.envelopeId,
      source_type: source.sourceType,
      source_id: source.sourceId,
      signer_email: request.signerEmail,
      signer_name: request.signerName,
      subject: envelopeDocument.subject,
      status: "sent",
      metadata: { name: envelopeDocument.name },
      sent_at: now,
      updated_at: now
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  await updateSourceSignatureStatus(context.supabase, context.workspaceId, source, "pending", payload.envelopeId);
  return { envelopeId: payload.envelopeId, request: data };
}

export async function syncDocuSignEnvelopeStatus(context: ConnectorContext, envelopeId: string) {
  const connection = await getValidDocuSignConnection(context);
  const existing = await loadSignatureRequest(context.supabase, context.workspaceId, envelopeId);
  if (!existing) throw new Error("Demande de signature introuvable.");

  const response = await fetch(`${connection.base_uri}/restapi/v2.1/accounts/${connection.account_id}/envelopes/${envelopeId}`, {
    headers: { Authorization: `Bearer ${connection.access_token}` },
    cache: "no-store"
  });
  const payload = await response.json().catch(() => ({})) as { status?: string; completedDateTime?: string; statusChangedDateTime?: string; message?: string };
  if (!response.ok) throw new Error(payload.message ?? "Statut DocuSign indisponible.");

  const nextStatus = normalizeEnvelopeStatus(payload.status);
  const updates: Record<string, unknown> = {
    status: nextStatus,
    completed_at: nextStatus === "completed" ? payload.completedDateTime ?? new Date().toISOString() : existing.completed_at,
    updated_at: new Date().toISOString(),
    metadata: { ...(existing.metadata as Record<string, unknown> ?? {}), docusign_status: payload.status, status_changed_at: payload.statusChangedDateTime ?? null }
  };

  if (nextStatus === "completed" && !existing.signed_document_id) {
    const signedDocument = await archiveSignedDocument(context, connection, envelopeId, existing);
    updates.signed_document_id = signedDocument.id;
  }

  const { data, error } = await context.supabase
    .from("docusign_signature_requests")
    .update(updates)
    .eq("id", existing.id)
    .eq("workspace_id", context.workspaceId)
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  if (nextStatus === "completed" || nextStatus === "declined" || nextStatus === "voided") {
    const source = { sourceType: existing.source_type, sourceId: existing.source_id, documentId: existing.source_id } as SignatureSource;
    await updateSourceSignatureStatus(context.supabase, context.workspaceId, source, nextStatus === "completed" ? "signed" : "rejected", envelopeId);
  }

  return data;
}

async function requestDocuSignToken(body: Record<string, string>) {
  const integrationKey = process.env.DOCUSIGN_INTEGRATION_KEY;
  const clientSecret = process.env.DOCUSIGN_CLIENT_SECRET;
  if (!integrationKey || !clientSecret) throw new Error("Variables DocuSign OAuth manquantes.");

  const tokenBase = process.env.DOCUSIGN_AUTH_BASE_URL ?? DEFAULT_AUTH_BASE_URL;
  const response = await fetch(new URL("/oauth/token", tokenBase), {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${integrationKey}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams(body)
  });
  const payload = await response.json().catch(() => ({})) as DocuSignTokenResponse & { error_description?: string };
  if (!response.ok) throw new Error(payload.error_description ?? "Authentification DocuSign impossible.");
  return payload;
}

async function getDocuSignUserInfo(accessToken: string) {
  const tokenBase = process.env.DOCUSIGN_AUTH_BASE_URL ?? DEFAULT_AUTH_BASE_URL;
  const response = await fetch(new URL("/oauth/userinfo", tokenBase), {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store"
  });
  const payload = await response.json().catch(() => ({})) as DocuSignUserInfo & { error_description?: string };
  if (!response.ok) throw new Error(payload.error_description ?? "Compte DocuSign indisponible.");
  return payload;
}

function resolveSignatureSource(request: DocuSignSignRequest): SignatureSource {
  if (request.quoteId) return { sourceType: "quote", sourceId: request.quoteId, quoteId: request.quoteId };
  if (request.contractId) return { sourceType: "contract", sourceId: request.contractId, documentId: request.contractId };
  if (request.mandateId) return { sourceType: "mandate", sourceId: request.mandateId, documentId: request.mandateId };
  if (request.documentId) return { sourceType: "document", sourceId: request.documentId, documentId: request.documentId };
  throw new Error("Document, devis, contrat ou mandat requis.");
}

async function buildEnvelopePayload(supabase: SupabaseClient, workspaceId: string, source: SignatureSource, subject?: string): Promise<EnvelopePayload> {
  if (source.sourceType === "quote") {
    const { data, error } = await supabase.from("quotes").select("*").eq("workspace_id", workspaceId).eq("id", source.quoteId).maybeSingle();
    if (error || !data) throw new Error("Devis introuvable.");
    const title = String(data.title ?? data.number ?? "Devis CENTRIX");
    const text = [
      "CENTRIX - Devis a signer",
      `Reference: ${String(data.number ?? data.id)}`,
      `Titre: ${title}`,
      `Total: ${String(data.total ?? "")} ${String(data.currency ?? "EUR")}`,
      "",
      "Signature client:",
      "/signature/"
    ].join("\n");
    return {
      documentBase64: Buffer.from(text, "utf8").toString("base64"),
      documentId: "1",
      extension: "txt",
      name: `${title}.txt`,
      subject: subject || `Signature du devis ${String(data.number ?? title)}`
    };
  }

  const { data, error } = await supabase
    .from("documents")
    .select("id,name,storagePath,mimeType,metadata")
    .eq("workspace_id", workspaceId)
    .eq("id", source.documentId)
    .maybeSingle();
  if (error || !data) throw new Error("Document introuvable.");
  const path = String(data.storagePath ?? "");
  if (!path) throw new Error("Fichier document introuvable.");

  const { data: file, error: downloadError } = await supabase.storage.from(DOCUMENTS_BUCKET).download(path);
  if (downloadError || !file) throw new Error("Telechargement du document impossible.");

  const name = String(data.name ?? "Document CENTRIX.pdf");
  return {
    documentBase64: Buffer.from(await file.arrayBuffer()).toString("base64"),
    documentId: "1",
    extension: name.split(".").pop() ?? "pdf",
    name,
    subject: subject || `Signature requise - ${name}`
  };
}

async function loadSignatureRequest(supabase: SupabaseClient, workspaceId: string, envelopeId: string) {
  const { data, error } = await supabase
    .from("docusign_signature_requests")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("envelope_id", envelopeId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

async function archiveSignedDocument(context: ConnectorContext, connection: DocuSignConnection, envelopeId: string, signatureRequest: Record<string, unknown>) {
  const response = await fetch(`${connection.base_uri}/restapi/v2.1/accounts/${connection.account_id}/envelopes/${envelopeId}/documents/combined`, {
    headers: { Authorization: `Bearer ${connection.access_token}` },
    cache: "no-store"
  });
  if (!response.ok) throw new Error("Telechargement du document signe impossible.");

  const signedPath = `signed/docusign/${envelopeId}.pdf`;
  const bytes = await response.arrayBuffer();
  const upload = await context.supabase.storage.from(DOCUMENTS_BUCKET).upload(signedPath, bytes, {
    contentType: "application/pdf",
    upsert: true
  });
  if (upload.error) throw new Error(upload.error.message);

  const publicUrl = context.supabase.storage.from(DOCUMENTS_BUCKET).getPublicUrl(signedPath).data.publicUrl;
  const { data, error } = await context.supabase
    .from("documents")
    .insert({
      workspace_id: context.workspaceId,
      name: `DocuSign signe - ${String(signatureRequest.subject ?? envelopeId)}.pdf`,
      extension: "pdf",
      mimeType: "application/pdf",
      size: bytes.byteLength,
      category: signatureRequest.source_type === "quote" ? "quote" : signatureRequest.source_type === "contract" ? "contract" : "legal",
      storagePath: signedPath,
      url: publicUrl,
      favorite: false,
      shared: false,
      signatureStatus: "signed",
      tags: ["docusign", "signed"],
      metadata: {
        envelope_id: envelopeId,
        source_id: signatureRequest.source_id,
        source_type: signatureRequest.source_type,
        signature_provider: "docusign"
      }
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

async function updateSourceSignatureStatus(supabase: SupabaseClient, workspaceId: string, source: SignatureSource, status: "pending" | "signed" | "rejected", envelopeId: string) {
  if (source.sourceType === "quote") {
    const patch: Record<string, unknown> = {
      metadata: { signature_provider: "docusign", envelope_id: envelopeId, signature_status: status },
      updated_at: new Date().toISOString()
    };
    if (status === "signed") patch.status = "accepted";
    await supabase.from("quotes").update(patch).eq("workspace_id", workspaceId).eq("id", source.sourceId);
    return;
  }

  await supabase.from("documents").update({
    signatureStatus: status,
    metadata: { signature_provider: "docusign", envelope_id: envelopeId, signature_status: status },
    updatedAt: new Date().toISOString()
  }).eq("workspace_id", workspaceId).eq("id", source.sourceId);
}

function normalizeEnvelopeStatus(value: string | undefined) {
  if (value === "completed") return "completed";
  if (value === "declined") return "declined";
  if (value === "voided") return "voided";
  if (value === "delivered") return "delivered";
  if (value === "created") return "created";
  return "sent";
}
