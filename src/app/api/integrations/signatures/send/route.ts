import type { NextRequest } from "next/server";
import { cleanText, connectorError, getConnectorContext, logConnectorDelivery } from "@/lib/integrations/connectors";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const context = await getConnectorContext();
  if (!context) return connectorError("Session et workspace CENTRIX requis.", 401);
  const accountId = process.env.DOCUSIGN_ACCOUNT_ID;
  const accessToken = process.env.DOCUSIGN_ACCESS_TOKEN;
  const baseUrl = process.env.DOCUSIGN_BASE_URL ?? "https://eu.docusign.net/restapi";
  if (!accountId || !accessToken) return connectorError("Configurez DocuSign dans Vercel.", 503);

  const body = await request.json().catch(() => null) as { documentId?: string; signerEmail?: string; signerName?: string } | null;
  const documentId = cleanText(body?.documentId, 80);
  const signerEmail = cleanText(body?.signerEmail, 320);
  const signerName = cleanText(body?.signerName, 160);
  if (!documentId || !signerEmail || !signerName) return connectorError("Document et signataire requis.");

  const { data: document, error: documentError } = await context.supabase
    .from("documents")
    .select("id,name,storagePath,mimeType,metadata")
    .eq("id", documentId)
    .eq("workspace_id", context.workspaceId)
    .maybeSingle();
  if (documentError || !document) return connectorError("Document introuvable.", 404);

  const path = String(document.storagePath ?? "");
  if (!path) return connectorError("Fichier document introuvable.", 409);
  const { data: file, error: downloadError } = await context.supabase.storage.from("centrix-documents").download(path);
  if (downloadError || !file) return connectorError("Telechargement du document impossible.", 500);

  const documentBase64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  const extension = String(document.name ?? "document.pdf").split(".").pop() ?? "pdf";
  const response = await fetch(`${baseUrl}/v2.1/accounts/${accountId}/envelopes`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      emailSubject: `Signature requise - ${document.name}`,
      documents: [{ documentBase64, documentId: "1", fileExtension: extension, name: document.name }],
      recipients: { signers: [{ email: signerEmail, name: signerName, recipientId: "1", routingOrder: "1" }] },
      status: "sent"
    })
  });
  const payload = await response.json().catch(() => ({})) as { envelopeId?: string; message?: string };
  await logConnectorDelivery(context, "docusign", "signature.send", response.ok ? "delivered" : "failed", signerEmail, payload.envelopeId ?? null, { documentId });
  if (!response.ok) return connectorError(payload.message ?? "Envoi DocuSign impossible.", response.status);

  await context.supabase.from("documents").update({
    signatureStatus: "pending",
    metadata: { ...(document.metadata as Record<string, unknown> ?? {}), signature_provider: "docusign", envelope_id: payload.envelopeId },
    updatedAt: new Date().toISOString()
  }).eq("id", documentId).eq("workspace_id", context.workspaceId);
  return Response.json({ ok: true, envelopeId: payload.envelopeId });
}
