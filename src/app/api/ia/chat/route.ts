import type { NextRequest } from "next/server";

export const runtime = "nodejs";

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

const systemPrompt =
  "Tu es CENTRIX AI, un copilote business SaaS francophone. Reponds de facon concise, professionnelle, actionnable, avec des recommandations operations, CRM, finance, marketing ou automatisations quand c'est utile.";

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "OPENAI_API_KEY manquante cote serveur." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as { messages?: ChatMessage[] } | null;
  const messages = body?.messages?.filter((message) => message.content?.trim()).slice(-12) ?? [];
  if (!messages.length) {
    return Response.json({ error: "Aucun message a envoyer au modele." }, { status: 400 });
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-5.1",
      stream: true,
      instructions: systemPrompt,
      input: messages.map((message) => ({
          role: message.role === "assistant" ? "assistant" : "user",
          content: message.content
        })),
      max_output_tokens: 900
    })
  });

  if (!response.ok || !response.body) {
    const detail = await response.text().catch(() => "Erreur OpenAI inconnue.");
    return Response.json({ error: detail }, { status: response.status || 502 });
  }

  return new Response(response.body, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    }
  });
}
