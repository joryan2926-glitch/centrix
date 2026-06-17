import { callMistral, extractMistralText, getMistralModel } from "@/lib/mistral/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const configured = Boolean(process.env.MISTRAL_API_KEY);
  const model = getMistralModel();
  if (!configured) {
    return Response.json(
      { ready: false, provider: "mistral", configured: false, model, apiReachable: false, responseValid: false },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  const requestId = crypto.randomUUID();
  const result = await callMistral({
    model,
    store: false,
    input: "Reponds uniquement par CENTRIX_OK.",
    max_output_tokens: 20
  }, requestId, 30_000);

  if (!result.ok) {
    return Response.json(
      { ready: false, provider: "mistral", configured: true, model, apiReachable: false, responseValid: false, status: result.response.status },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  const payload = await result.response.json();
  const responseValid = extractMistralText(payload).includes("CENTRIX_OK");
  return Response.json(
    { ready: responseValid, provider: "mistral", configured: true, model, apiReachable: true, responseValid },
    { status: responseValid ? 200 : 503, headers: { "Cache-Control": "no-store" } }
  );
}
