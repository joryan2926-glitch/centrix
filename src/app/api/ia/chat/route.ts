import type { NextRequest } from "next/server";
import { callMistral, gateAiRequest, getMistralModel, sanitizeText } from "@/lib/mistral/server";

export const runtime = "nodejs";

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

const systemPrompt =
  "Tu es CENTRIX AI, un copilote business SaaS francophone. Reponds de facon concise, professionnelle, actionnable, avec des recommandations operations, CRM, finance, marketing ou automatisations quand c'est utile.";

export async function POST(request: NextRequest) {
  const gate = await gateAiRequest(request, { endpoint: "chat", limit: 20, maxBodyBytes: 48_000 });
  if (!gate.ok) return gate.response;

  const body = (await request.json().catch(() => null)) as { messages?: ChatMessage[] } | null;
  const messages = body?.messages
    ?.filter((message) => message.role === "user" || message.role === "assistant")
    .map((message) => ({ role: message.role, content: sanitizeText(message.content, 4_000) }))
    .filter((message) => message.content)
    .slice(-12) ?? [];
  if (!messages.length) {
    return Response.json({ error: "Aucun message a envoyer au modele." }, { status: 400 });
  }
  if (messages.reduce((total, message) => total + message.content.length, 0) > 16_000) {
    return Response.json({ error: "Conversation trop volumineuse. Reduisez le contexte." }, { status: 413 });
  }

  const result = await callMistral({
    model: getMistralModel(),
    stream: true,
    store: false,
    instructions: systemPrompt,
    input: messages,
    max_output_tokens: 900
  }, gate.requestId, 60_000);

  if (!result.ok) return result.response;
  if (!result.response.body) {
    return Response.json({ error: "Le flux IA est indisponible.", requestId: gate.requestId }, { status: 502 });
  }

  return new Response(result.response.body, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      "X-Request-Id": gate.requestId
    }
  });
}
