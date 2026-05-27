import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return Response.json({ error: "OPENAI_API_KEY manquante cote serveur." }, { status: 503 });
  const body = await request.json().catch(() => ({}));
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      input: [
        { role: "system", content: "Tu es un expert Zapier/Make. Reponds en JSON strict avec title et detail." },
        { role: "user", content: `Propose une optimisation workflow CENTRIX pour ces donnees: ${JSON.stringify(body).slice(0, 6000)}` }
      ],
      text: { format: { type: "json_object" } }
    })
  });
  const payload = await response.json();
  if (!response.ok) return Response.json({ error: payload.error?.message ?? "Erreur OpenAI." }, { status: response.status });
  const text = payload.output_text ?? payload.output?.[0]?.content?.[0]?.text ?? "{}";
  const suggestion = JSON.parse(text);
  return Response.json({ title: suggestion.title ?? "Suggestion workflow", detail: suggestion.detail ?? "Automatiser le processus le plus repetitif." });
}
