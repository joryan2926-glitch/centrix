import type { NextRequest } from "next/server";

export const runtime = "nodejs";

type InsightPayload = {
  metrics?: unknown;
  alerts?: unknown;
};

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return Response.json({ error: "OPENAI_API_KEY manquante cote serveur." }, { status: 503 });

  const body = (await request.json().catch(() => ({}))) as InsightPayload;
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      input: [
        { role: "system", content: "Tu es un analyste business senior. Reponds en JSON strict avec title, summary, recommendation." },
        { role: "user", content: `Genere un insight business actionnable pour ces donnees CENTRIX: ${JSON.stringify(body).slice(0, 7000)}` }
      ],
      text: { format: { type: "json_object" } }
    })
  });

  const payload = await response.json();
  if (!response.ok) return Response.json({ error: payload.error?.message ?? "Erreur OpenAI." }, { status: response.status });
  const text = payload.output_text ?? payload.output?.[0]?.content?.[0]?.text ?? "{}";
  const insight = JSON.parse(text);
  return Response.json({
    title: insight.title ?? "Insight BI",
    summary: insight.summary ?? "Analyse predictive generee.",
    recommendation: insight.recommendation ?? "Prioriser les actions a plus fort impact."
  });
}
