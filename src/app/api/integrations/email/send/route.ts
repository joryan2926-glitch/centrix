import type { NextRequest } from "next/server";
import { cleanText, connectorError, getConnectorContext, logConnectorDelivery } from "@/lib/integrations/connectors";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const context = await getConnectorContext();
  if (!context) return connectorError("Session et workspace CENTRIX requis.", 401);
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return connectorError("Configurez RESEND_API_KEY et EMAIL_FROM dans Vercel.", 503);

  const body = await request.json().catch(() => null) as { to?: string; subject?: string; html?: string; text?: string } | null;
  const to = cleanText(body?.to, 320);
  const subject = cleanText(body?.subject, 180);
  const html = cleanText(body?.html, 50_000);
  const text = cleanText(body?.text, 20_000);
  if (!to || !subject || (!html && !text)) return connectorError("Destinataire, objet et contenu requis.");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, html: html || undefined, text: text || undefined })
  });
  const payload = await response.json().catch(() => ({})) as { id?: string; message?: string };
  await logConnectorDelivery(context, "resend", "email.send", response.ok ? "delivered" : "failed", to, payload.id ?? null, { subject });
  if (!response.ok) return connectorError(payload.message ?? "Envoi email impossible.", response.status);
  return Response.json({ ok: true, id: payload.id });
}
