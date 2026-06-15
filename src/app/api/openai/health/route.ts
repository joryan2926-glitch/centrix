import { callOpenAi, extractOpenAiText, getOpenAiModel } from "@/lib/openai/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const configured = Boolean(process.env.OPENAI_API_KEY);
  const model = getOpenAiModel();
  if (!configured) {
    return Response.json(
      { ready: false, configured: false, model, apiReachable: false, responseValid: false },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  const requestId = crypto.randomUUID();
  const result = await callOpenAi({
    model,
    store: false,
    input: "Reponds uniquement par CENTRIX_OK.",
    max_output_tokens: 20
  }, requestId, 30_000);

  if (!result.ok) {
    return Response.json(
      { ready: false, configured: true, model, apiReachable: false, responseValid: false, status: result.response.status },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  const payload = await result.response.json();
  const responseValid = extractOpenAiText(payload).includes("CENTRIX_OK");
  return Response.json(
    { ready: responseValid, configured: true, model, apiReachable: true, responseValid },
    { status: responseValid ? 200 : 503, headers: { "Cache-Control": "no-store" } }
  );
}
