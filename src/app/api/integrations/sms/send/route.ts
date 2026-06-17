export const runtime = "nodejs";

export async function POST() {
  return Response.json(
    {
      ok: false,
      disabled: true,
      provider: null,
      error: "Les fonctionnalités SMS et WhatsApp sont temporairement désactivées dans CENTRIX."
    },
    { status: 410, headers: { "Cache-Control": "no-store" } }
  );
}
