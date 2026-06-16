import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const coreTables = [
  "profiles",
  "workspaces",
  "workspace_members",
  "clients",
  "prospects",
  "invoices",
  "quotes",
  "projects",
  "tasks",
  "meetings",
  "documents",
  "notifications",
  "module_records",
  "module_permissions",
  "subscriptions",
  "subscription_plans",
  "roles",
  "permissions",
  "role_permissions",
  "plan_modules"
] as const;

const TABLE_CHECK_TIMEOUT_MS = 5_000;

export async function GET() {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return Response.json({ ready: false, supabase: false, tables: {} }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  const results = await Promise.all(coreTables.map(async (table) => {
    const result = await Promise.race([
      Promise.resolve(admin.from(table).select("*", { count: "exact", head: true })).then(({ error }) => ({
        ready: !error,
        error: error?.code ?? null
      })),
      new Promise<{ ready: false; error: "timeout" }>((resolve) => {
        setTimeout(() => resolve({ ready: false, error: "timeout" }), TABLE_CHECK_TIMEOUT_MS);
      })
    ]);

    return [table, result] as const;
  }));
  const tables = Object.fromEntries(results);
  const ready = results.every(([, result]) => result.ready);

  return Response.json(
    {
      ready,
      supabase: true,
      tables,
      integrations: {
        email: Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM),
        google: process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true",
        openai: Boolean(process.env.OPENAI_API_KEY),
        stripe: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET)
      }
    },
    { status: ready ? 200 : 503, headers: { "Cache-Control": "no-store" } }
  );
}
