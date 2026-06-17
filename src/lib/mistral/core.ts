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

type AiProviderErrorPayload = {
  error?: { message?: string; type?: string };
  message?: string;
};

export type AiResponsePayload = {
  choices?: Array<{ message?: { content?: string }; delta?: { content?: string } }>;
  output_text?: string;
  output?: Array<{ content?: Array<{ text?: string }> }>;
};

const MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions";
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

function safeAiError(status: number) {
  if (status === 400) return "La requete IA est invalide.";
  if (status === 401 || status === 403) return "La configuration Mistral doit etre verifiee.";
  if (status === 429) return "Le quota IA est temporairement atteint. Reessayez dans un instant.";
  if (status >= 500) return "Mistral est temporairement indisponible.";
  return "La generation IA a echoue.";
}

export function getMistralModel() {
  return process.env.MISTRAL_MODEL ?? "mistral-large-latest";
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

function normalizeInputToMessages(body: Record<string, unknown>) {
  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];
  const instructions = sanitizeText(body.instructions, 8_000);
  if (instructions) messages.push({ role: "system", content: instructions });

  const input = body.input;
  if (typeof input === "string") {
    messages.push({ role: "user", content: sanitizeText(input, 16_000) });
  } else if (Array.isArray(input)) {
    for (const item of input) {
      if (!item || typeof item !== "object") continue;
      const role = "role" in item ? String(item.role) : "user";
      if (role !== "system" && role !== "user" && role !== "assistant") continue;
      const content = sanitizeText("content" in item ? item.content : "", 16_000);
      if (content) messages.push({ role, content });
    }
  }

  return messages.length ? messages : [{ role: "user" as const, content: "Reponds de facon concise." }];
}

function buildMistralPayload(body: Record<string, unknown>) {
  const text = body.text && typeof body.text === "object" ? body.text as { format?: { type?: string } } : null;
  return {
    max_tokens: Number(body.max_output_tokens ?? 900),
    messages: normalizeInputToMessages(body),
    model: String(body.model ?? getMistralModel()),
    response_format: text?.format?.type === "json_object" ? { type: "json_object" } : undefined,
    stream: Boolean(body.stream),
    temperature: Number(body.temperature ?? 0.3)
  };
}

function toCentrixAiPayload(payload: AiResponsePayload) {
  const content = payload.choices?.[0]?.message?.content ?? "";
  return {
    ...payload,
    output_text: content,
    output: [{ content: [{ text: content }] }]
  };
}

function toCentrixAiStream(source: ReadableStream<Uint8Array>) {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = source.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (!raw) continue;
            if (raw === "[DONE]") {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              continue;
            }

            const event = JSON.parse(raw) as AiResponsePayload;
            const delta = event.choices?.[0]?.delta?.content ?? "";
            if (delta) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "response.output_text.delta", delta })}\n\n`));
            }
          }
        }
      } finally {
        reader.releaseLock();
        controller.close();
      }
    }
  });
}

export async function callMistral(body: Record<string, unknown>, requestId: string, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    return { ok: false as const, response: jsonError("MISTRAL_API_KEY manquante cote serveur.", 503, requestId) };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "X-Client-Request-Id": requestId
  };

  try {
    const requestBody = buildMistralPayload(body);
    const response = await fetch(MISTRAL_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
      cache: "no-store",
      signal: controller.signal
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null) as AiProviderErrorPayload | null;
      console.error("Mistral request failed", {
        requestId,
        status: response.status,
        type: payload?.error?.type,
        message: payload?.message
      });
      return { ok: false as const, response: jsonError(safeAiError(response.status), response.status, requestId) };
    }

    if (requestBody.stream && response.body) {
      return {
        ok: true as const,
        response: new Response(toCentrixAiStream(response.body), {
          headers: response.headers,
          status: response.status,
          statusText: response.statusText
        })
      };
    }

    const payload = await response.json() as AiResponsePayload;
    return { ok: true as const, response: Response.json(toCentrixAiPayload(payload), { headers: { "Cache-Control": "no-store" } }) };
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    console.error("Mistral request unavailable", { requestId, timedOut });
    return { ok: false as const, response: jsonError(timedOut ? "La generation IA a expire." : "Mistral est indisponible.", timedOut ? 504 : 502, requestId) };
  } finally {
    clearTimeout(timeout);
  }
}

export function extractMistralText(payload: AiResponsePayload) {
  return payload.output_text ?? payload.output?.[0]?.content?.[0]?.text ?? payload.choices?.[0]?.message?.content ?? "";
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
