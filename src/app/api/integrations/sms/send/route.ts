import type { NextRequest } from "next/server";
import { cleanText, connectorError, getConnectorContext, logConnectorDelivery } from "@/lib/integrations/connectors";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const context = await getConnectorContext();
  if (!context) return connectorError("Session et workspace CENTRIX requis.", 401);
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!accountSid || !authToken || !from) return connectorError("Configurez Twilio dans Vercel.", 503);

  const body = await request.json().catch(() => null) as { to?: string; message?: string } | null;
  const to = cleanText(body?.to, 32);
  const message = cleanText(body?.message, 1_500);
  if (!to || !message) return connectorError("Numero et message requis.");

  const params = new URLSearchParams({ To: to, From: from, Body: message });
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params
  });
  const payload = await response.json().catch(() => ({})) as { sid?: string; message?: string };
  await logConnectorDelivery(context, "twilio", "sms.send", response.ok ? "delivered" : "failed", to, payload.sid ?? null);
  if (!response.ok) return connectorError(payload.message ?? "Envoi SMS impossible.", response.status);
  return Response.json({ ok: true, id: payload.sid });
}
