export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;
  const accountConfigured = Boolean(accountSid);
  const tokenConfigured = Boolean(authToken);
  const fromNumberConfigured = Boolean(fromNumber);

  if (!accountSid || !authToken) {
    return Response.json(
      {
        ready: false,
        checks: {
          accountConfigured,
          tokenConfigured,
          credentialsValid: false,
          fromNumberConfigured
        }
      },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`
    },
    cache: "no-store"
  });
  const payload = await response.json().catch(() => ({})) as { status?: string; code?: number };
  const credentialsValid = response.ok;
  const accountActive = payload.status === "active";
  const ready = credentialsValid && accountActive && fromNumberConfigured;

  return Response.json(
    {
      ready,
      checks: {
        accountConfigured,
        tokenConfigured,
        credentialsValid,
        accountActive,
        fromNumberConfigured,
        providerStatus: response.ok ? response.status : payload.code ?? response.status
      }
    },
    { status: ready ? 200 : 503, headers: { "Cache-Control": "no-store" } }
  );
}
