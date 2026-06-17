import type { NextRequest } from "next/server";
import { cleanText, connectorError, getConnectorContext, logConnectorDelivery } from "@/lib/integrations/connectors";
import { createDocuSignEnvelope, type DocuSignSignRequest } from "@/lib/integrations/docusign";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const context = await getConnectorContext();
  if (!context) return connectorError("Session et workspace CENTRIX requis.", 401);

  const body = await request.json().catch(() => null) as DocuSignSignRequest | null;
  const payload: DocuSignSignRequest = {
    documentId: cleanText(body?.documentId, 80) || undefined,
    quoteId: cleanText(body?.quoteId, 80) || undefined,
    contractId: cleanText(body?.contractId, 80) || undefined,
    mandateId: cleanText(body?.mandateId, 80) || undefined,
    signerEmail: cleanText(body?.signerEmail, 320),
    signerName: cleanText(body?.signerName, 160),
    subject: cleanText(body?.subject, 180) || undefined
  };

  if (!payload.signerEmail || !payload.signerName) return connectorError("Signataire requis.");
  if (!payload.documentId && !payload.quoteId && !payload.contractId && !payload.mandateId) {
    return connectorError("Document, devis, contrat ou mandat requis.");
  }

  try {
    const result = await createDocuSignEnvelope(context, payload);
    await logConnectorDelivery(context, "docusign", "signature.send", "delivered", payload.signerEmail, result.envelopeId, {
      documentId: payload.documentId,
      quoteId: payload.quoteId,
      contractId: payload.contractId,
      mandateId: payload.mandateId
    });
    return Response.json({ ok: true, provider: "docusign", envelopeId: result.envelopeId, signature: result.request });
  } catch (error) {
    await logConnectorDelivery(context, "docusign", "signature.send", "failed", payload.signerEmail || null, null, {
      error: error instanceof Error ? error.message : "DocuSign unavailable"
    });
    return connectorError(error instanceof Error ? error.message : "Envoi DocuSign impossible.", 502);
  }
}
