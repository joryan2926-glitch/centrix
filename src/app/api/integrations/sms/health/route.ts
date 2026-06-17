export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return Response.json(
    {
      ready: false,
      disabled: true,
      provider: null,
      checks: {
        smsEnabled: false,
        whatsappEnabled: false
      }
    },
    { status: 410, headers: { "Cache-Control": "no-store" } }
  );
}
