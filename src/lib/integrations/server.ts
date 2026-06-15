import type { NextRequest } from "next/server";
import { DEMO_MODE } from "@/lib/demo-mode";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export type ExternalIntegrationStatus = {
  configured: boolean;
  detail: string;
};

export type ExternalIntegrationsStatus = {
  supabase: ExternalIntegrationStatus;
  openai: ExternalIntegrationStatus;
  stripe: ExternalIntegrationStatus;
  stripeWebhook: ExternalIntegrationStatus;
  stripeConnect: ExternalIntegrationStatus;
  bridge: ExternalIntegrationStatus;
  googleOAuth: ExternalIntegrationStatus;
  googleCalendar: ExternalIntegrationStatus;
  emailing: ExternalIntegrationStatus;
  sms: ExternalIntegrationStatus;
  signatures: ExternalIntegrationStatus;
};

export async function requireExternalApiUser() {
  if (DEMO_MODE) return { id: "demo", email: "admin@centrix.fr" };

  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  return { id: data.user.id, email: data.user.email ?? null };
}

export function unauthorizedExternalApiResponse() {
  return Response.json({ error: "Session CENTRIX requise." }, { status: 401 });
}

export function getTrustedAppOrigin(request: NextRequest) {
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  if (configuredOrigin) {
    try {
      return new URL(configuredOrigin).origin;
    } catch {
      // Fall back to the request URL when deployment configuration is invalid.
    }
  }

  return new URL(request.url).origin;
}

export function getTrustedRedirectUrl(candidate: string | undefined, fallback: string, origin: string) {
  if (!candidate) return new URL(fallback, origin).toString();

  try {
    const url = new URL(candidate, origin);
    return url.origin === origin ? url.toString() : new URL(fallback, origin).toString();
  } catch {
    return new URL(fallback, origin).toString();
  }
}

async function getGoogleOAuthStatus(): Promise<ExternalIntegrationStatus> {
  if (process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED !== "true") {
    return { configured: false, detail: "Google OAuth est temporairement desactive dans CENTRIX." };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return { configured: false, detail: "Supabase doit etre configure avant Google OAuth." };

  try {
    const response = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: key },
      next: { revalidate: 300 }
    });
    const settings = (await response.json()) as { external?: { google?: boolean } };
    const configured = Boolean(response.ok && settings.external?.google);
    return {
      configured,
      detail: configured ? "Google OAuth est actif dans Supabase Auth." : "Activez Google dans Supabase Auth > Providers."
    };
  } catch {
    return { configured: false, detail: "Statut Google OAuth indisponible." };
  }
}

export async function getExternalIntegrationsStatus(): Promise<ExternalIntegrationsStatus> {
  const hasSupabase = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
  const hasOpenAi = Boolean(process.env.OPENAI_API_KEY);
  const hasStripe = Boolean(process.env.STRIPE_SECRET_KEY);
  const hasStripeWebhook = Boolean(process.env.STRIPE_WEBHOOK_SECRET);
  const hasBridge = Boolean(process.env.BRIDGE_CLIENT_ID && process.env.BRIDGE_CLIENT_SECRET);
  const hasEmailing = Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
  const hasSms = Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER);
  const hasSignatures = Boolean(process.env.DOCUSIGN_ACCOUNT_ID && process.env.DOCUSIGN_ACCESS_TOKEN);
  const googleOAuth = await getGoogleOAuthStatus();

  return {
    supabase: {
      configured: hasSupabase,
      detail: hasSupabase ? "Base, Auth et Realtime disponibles." : "Variables Supabase manquantes."
    },
    openai: {
      configured: hasOpenAi,
      detail: hasOpenAi ? `Modele ${process.env.OPENAI_MODEL ?? "gpt-5.1"} configure.` : "Ajoutez OPENAI_API_KEY dans Vercel."
    },
    stripe: {
      configured: hasStripe,
      detail: hasStripe ? "Checkout et portail client disponibles." : "Ajoutez STRIPE_SECRET_KEY dans Vercel."
    },
    stripeWebhook: {
      configured: hasStripeWebhook,
      detail: hasStripeWebhook ? "Signature webhook Stripe configuree." : "Ajoutez STRIPE_WEBHOOK_SECRET dans Vercel."
    },
    stripeConnect: {
      configured: hasStripe,
      detail: hasStripe ? "Onboarding Stripe Connect disponible." : "Stripe Connect requiert STRIPE_SECRET_KEY."
    },
    bridge: {
      configured: hasBridge,
      detail: hasBridge ? "Open Banking Bridge disponible." : "Ajoutez BRIDGE_CLIENT_ID et BRIDGE_CLIENT_SECRET dans Vercel."
    },
    googleOAuth,
    googleCalendar: {
      configured: googleOAuth.configured,
      detail: googleOAuth.configured ? "Synchronisation Calendar disponible apres autorisation du scope Google Calendar." : "Google OAuth requis."
    },
    emailing: {
      configured: hasEmailing,
      detail: hasEmailing ? "Envoi transactionnel Resend disponible." : "Ajoutez RESEND_API_KEY et EMAIL_FROM dans Vercel."
    },
    sms: {
      configured: hasSms,
      detail: hasSms ? "Envoi SMS Twilio disponible." : "Ajoutez les variables Twilio dans Vercel."
    },
    signatures: {
      configured: hasSignatures,
      detail: hasSignatures ? "Enveloppes DocuSign disponibles." : "Ajoutez DOCUSIGN_ACCOUNT_ID et DOCUSIGN_ACCESS_TOKEN dans Vercel."
    }
  };
}
