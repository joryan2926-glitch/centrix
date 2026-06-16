import type { SocialNetwork } from "@/types/marketing";

export type SocialProviderAccount = {
  network: SocialNetwork;
  providerAccountId: string;
};

export type SocialPublishInput = {
  content: string;
  mediaUrls: string[];
};

export type SocialPublishResult = {
  externalId: string;
  network: SocialNetwork;
};

type ProviderConfig = {
  accountId: string | undefined;
  token: string | undefined;
};

function configFor(network: SocialNetwork): ProviderConfig {
  const prefix = `SOCIAL_${network.toUpperCase()}`;
  return {
    accountId: process.env[`${prefix}_ACCOUNT_ID`],
    token: process.env[`${prefix}_ACCESS_TOKEN`]
  };
}

export function socialProviderStatus() {
  return (["facebook", "instagram", "linkedin", "tiktok", "x", "youtube"] as SocialNetwork[]).map((network) => {
    const config = configFor(network);
    return { network, configured: Boolean(config.accountId && config.token) };
  });
}

async function providerRequest(url: string, init: RequestInit, network: SocialNetwork) {
  const response = await fetch(url, init);
  const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) {
    const providerMessage =
      typeof payload.message === "string"
        ? payload.message
        : typeof (payload.error as { message?: unknown } | undefined)?.message === "string"
          ? String((payload.error as { message: string }).message)
          : `Publication ${network} refusee.`;
    throw new Error(providerMessage);
  }
  return payload;
}

export async function publishSocialPost(account: SocialProviderAccount, input: SocialPublishInput): Promise<SocialPublishResult> {
  const configured = configFor(account.network);
  const accountId = account.providerAccountId || configured.accountId;
  const token = configured.token;
  if (!accountId || !token) throw new Error(`Connexion ${account.network} non configuree.`);

  if (account.network === "linkedin") {
    const payload = await providerRequest("https://api.linkedin.com/rest/posts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "LinkedIn-Version": "202505",
        "X-Restli-Protocol-Version": "2.0.0"
      },
      body: JSON.stringify({
        author: accountId,
        commentary: input.content,
        distribution: { feedDistribution: "MAIN_FEED", targetEntities: [], thirdPartyDistributionChannels: [] },
        lifecycleState: "PUBLISHED",
        visibility: "PUBLIC"
      })
    }, account.network);
    return { network: account.network, externalId: String(payload.id ?? crypto.randomUUID()) };
  }

  if (account.network === "facebook") {
    const payload = await providerRequest(`https://graph.facebook.com/v23.0/${encodeURIComponent(accountId)}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token: token, message: input.content })
    }, account.network);
    return { network: account.network, externalId: String(payload.id ?? crypto.randomUUID()) };
  }

  if (account.network === "instagram") {
    const imageUrl = input.mediaUrls.find((url) => /^https:\/\//.test(url));
    if (!imageUrl) throw new Error("Instagram requiert une image publique HTTPS.");
    const container = await providerRequest(`https://graph.facebook.com/v23.0/${encodeURIComponent(accountId)}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token: token, caption: input.content, image_url: imageUrl })
    }, account.network);
    const payload = await providerRequest(`https://graph.facebook.com/v23.0/${encodeURIComponent(accountId)}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token: token, creation_id: container.id })
    }, account.network);
    return { network: account.network, externalId: String(payload.id ?? crypto.randomUUID()) };
  }

  if (account.network === "x") {
    const payload = await providerRequest("https://api.x.com/2/tweets", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ text: input.content.slice(0, 280) })
    }, account.network);
    const data = payload.data as { id?: string } | undefined;
    return { network: account.network, externalId: String(data?.id ?? crypto.randomUUID()) };
  }

  throw new Error(`La publication automatique ${account.network} necessite encore son connecteur fournisseur.`);
}
