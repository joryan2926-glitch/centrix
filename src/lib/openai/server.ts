import "server-only";

import type { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getTrustedAppOrigin, requireExternalApiUser, unauthorizedExternalApiResponse } from "@/lib/integrations/server";

type AiGateOptions = {
  endpoint: string;
  limit?: number;
  maxBodyBytes?: number;
  windowSeconds?: number;
};

type AiGateSuccess = {
  ok: true;
  requestId: string;
  user: { id: string; email: string | null };
};

type AiGateFailure = {
  ok: false;
  response: Response;
};

type OpenAiErrorPayload = {
  error?: { message?: string; type?: string };
};

export type OpenAiResponsePayload = {
  output_text?: string;
  output?: Array<{ content?: Array<{ text?: string }> }>;
};

const OPENAI_URL = "https://api.openai.com/v1/responses";
const DEFAULT_TIMEOUT_MS = 45_000;

function jsonError(error: string, status: number, requestId?: string, headers?: HeadersInit) {
  return Response.json(
    { error, requestId },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        ...headers
      }
    }
  );
}

function safeOpenAiError(status: number) {
  if (status === 400) return "La requete IA est invalide.";
  if (status === 401 || status === 403) return "La configuration OpenAI doit etre verifiee.";
  if (status === 429) return "Le quota IA est temporairement atteint. Reessayez dans un instant.";
  if (status >= 500) return "OpenAI est temporairement indisponible.";
  return "La generation IA a echoue.";
}

export function getOpenAiModel() {
  return process.env.OPENAI_MODEL ?? "gpt-5.1";
}

export async function gateAiRequest(request: NextRequest, options: AiGateOptions): Promise<AiGateSuccess | AiGateFailure> {
  const user = await requireExternalApiUser();
  if (!user) return { ok: false, response: unauthorizedExternalApiResponse() };

  const requestId = crypto.randomUUID();
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > (options.maxBodyBytes ?? 32_000)) {
    return { ok: false, response: jsonError("Requete IA trop volumineuse.", 413, requestId) };
  }

  const origin = request.headers.get("origin");
  const allowedOrigins = new Set([new URL(request.url).origin, getTrustedAppOrigin(request)]);
  if (origin && !allowedOrigins.has(origin)) {
    return { ok: false, response: jsonError("Origine de requete refusee.", 403, requestId) };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { ok: false, response: jsonError("Controle de quota IA indisponible.", 503, requestId) };
  }

  const { data, error } = await supabase.rpc("check_ai_rate_limit", {
    p_endpoint: options.endpoint,
    p_limit: options.limit ?? 20,
    p_window_seconds: options.windowSeconds ?? 60
  });

  if (error) {
    return { ok: false, response: jsonError("Controle de quota IA indisponible.", 503, requestId) };
  }

  const rateLimit = data as { allowed?: boolean; remaining?: number; retry_after_seconds?: number } | null;
  if (!rateLimit?.allowed) {
    const retryAfter = String(rateLimit?.retry_after_seconds ?? options.windowSeconds ?? 60);
    return {
      ok: false,
      response: jsonError("Limite IA atteinte. Reessayez dans un instant.", 429, requestId, { "Retry-After": retryAfter })
    };
  }

  return { ok: true, requestId, user };
}

export async function callOpenAi(body: Record<string, unknown>, requestId: string, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { ok: false as const, response: jsonError("OPENAI_API_KEY manquante cote serveur.", 503, requestId) };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "X-Client-Request-Id": requestId
  };
  if (process.env.OPENAI_PROJECT_ID) headers["OpenAI-Project"] = process.env.OPENAI_PROJECT_ID;

  try {
    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      cache: "no-store",
      signal: controller.signal
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null) as OpenAiErrorPayload | null;
      console.error("OpenAI request failed", {
        requestId,
        status: response.status,
        type: payload?.error?.type
      });
      return { ok: false as const, response: jsonError(safeOpenAiError(response.status), response.status, requestId) };
    }

    return { ok: true as const, response };
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    console.error("OpenAI request unavailable", { requestId, timedOut });
    return { ok: false as const, response: jsonError(timedOut ? "La generation IA a expire." : "OpenAI est indisponible.", timedOut ? 504 : 502, requestId) };
  } finally {
    clearTimeout(timeout);
  }
}

export function extractOpenAiText(payload: OpenAiResponsePayload) {
  return payload.output_text ?? payload.output?.[0]?.content?.[0]?.text ?? "";
}

export function safeParseJsonObject(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

export function sanitizeText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}
