import type { NextRequest } from "next/server";
import { getTrustedAppOrigin, requireExternalApiUser, unauthorizedExternalApiResponse } from "@/lib/integrations/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const user = await requireExternalApiUser();
  if (!user) return unauthorizedExternalApiResponse();

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return Response.json({ error: "STRIPE_SECRET_KEY manquante cote serveur." }, { status: 503 });

  const body = (await request.json().catch(() => null)) as { accountId?: string; email?: string } | null;
  const origin = getTrustedAppOrigin(request);
  let accountId = body?.accountId;

  if (!accountId) {
    const accountParams = new URLSearchParams({ type: "express", country: "FR", email: body?.email ?? user.email ?? "provider@centrix.local" });
    const accountResponse = await fetch("https://api.stripe.com/v1/accounts", {
      method: "POST",
      headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: accountParams
    });
    const account = (await accountResponse.json()) as { id?: string; error?: { message?: string } };
    if (!accountResponse.ok) return Response.json({ error: account.error?.message ?? "Erreur creation compte Connect." }, { status: accountResponse.status });
    accountId = account.id;
  }

  if (!accountId) return Response.json({ error: "Compte Stripe Connect introuvable." }, { status: 502 });

  const linkParams = new URLSearchParams({
    account: accountId,
    refresh_url: `${origin}/providers?stripe=refresh`,
    return_url: `${origin}/providers?stripe=connected`,
    type: "account_onboarding"
  });
  const linkResponse = await fetch("https://api.stripe.com/v1/account_links", {
    method: "POST",
    headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: linkParams
  });
  const link = await linkResponse.json();
  if (!linkResponse.ok) return Response.json({ error: link.error?.message ?? "Erreur onboarding Stripe Connect." }, { status: linkResponse.status });
  return Response.json({ url: link.url, accountId });
}
