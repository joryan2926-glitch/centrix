import type { NextRequest } from "next/server";
import { cleanText, connectorError, getConnectorContext, logConnectorDelivery } from "@/lib/integrations/connectors";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const context = await getConnectorContext();
  if (!context) return connectorError("Session et workspace CENTRIX requis.", 401);
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return connectorError("Configurez BREVO_API_KEY dans Vercel.", 503);

  const body = await request.json().catch(() => null) as { to?: string; subject?: string; html?: string; text?: string } | null;
  const to = cleanText(body?.to, 320);
  const subject = cleanText(body?.subject, 180);
  const html = cleanText(body?.html, 50_000);
  const text = cleanText(body?.text, 20_000);
  if (!to || !subject || (!html && !text)) return connectorError("Destinataire, objet et contenu requis.");

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": apiKey, "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: { email: "noreply@app-centrix.fr", name: "CENTRIX" },
      to: [{ email: to }],
      subject,
      htmlContent: html || undefined,
      textContent: text || undefined
    })
  });
  const payload = await response.json().catch(() => ({})) as { messageId?: string; code?: string; message?: string };
  await logConnectorDelivery(context, "brevo", "email.send", response.ok ? "delivered" : "failed", to, payload.messageId ?? null, { subject });
  if (!response.ok) return connectorError(payload.message ?? "Envoi email Brevo impossible.", response.status);
  return Response.json({ ok: true, provider: "brevo", id: payload.messageId });
}
