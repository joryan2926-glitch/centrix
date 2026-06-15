import type { NextRequest } from "next/server";
import { getOperationalModule } from "@/data/operations";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createOperationalRecord, deleteOperationalRecord, loadOperationalModule, updateOperationalRecord } from "@/services/operations/supabase";
import type { OperationalRecord, OperationalRecordDraft, OperationalPriority, OperationalStatus } from "@/types/operations";

export const runtime = "nodejs";

const statuses: OperationalStatus[] = ["draft", "active", "pending", "completed", "archived"];
const priorities: OperationalPriority[] = ["low", "medium", "high", "critical"];

function parseDraft(value: unknown, defaultType: string): OperationalRecordDraft | null {
  if (!value || typeof value !== "object") return null;
  const body = value as Record<string, unknown>;
  const title = typeof body.title === "string" ? body.title.trim().slice(0, 180) : "";
  if (!title) return null;
  return {
    amount: Math.max(0, Number(body.amount ?? 0) || 0),
    description: typeof body.description === "string" ? body.description.trim().slice(0, 5_000) : "",
    due_at: typeof body.due_at === "string" && body.due_at ? body.due_at.slice(0, 10) : null,
    owner_name: typeof body.owner_name === "string" ? body.owner_name.trim().slice(0, 160) : "",
    priority: priorities.includes(body.priority as OperationalPriority) ? body.priority as OperationalPriority : "medium",
    record_type: typeof body.record_type === "string" && body.record_type.trim() ? body.record_type.trim().slice(0, 120) : defaultType,
    status: statuses.includes(body.status as OperationalStatus) ? body.status as OperationalStatus : "active",
    tags: Array.isArray(body.tags) ? body.tags.filter((tag): tag is string => typeof tag === "string").map((tag) => tag.trim().slice(0, 60)).filter(Boolean).slice(0, 20) : [],
    title
  };
}

async function context(moduleKey: string) {
  const config = getOperationalModule(moduleKey);
  const supabase = await createServerSupabaseClient();
  if (!config) return { error: Response.json({ error: "Module introuvable." }, { status: 404 }), config: null, supabase: null };
  if (!supabase) return { error: Response.json({ error: "Supabase non configure." }, { status: 503 }), config, supabase: null };
  return { error: null, config, supabase };
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  const { error, supabase } = await context(module);
  if (error || !supabase) return error;
  const result = await loadOperationalModule(supabase, module);
  if (result.error) return Response.json({ error: result.error }, { status: 403 });
  return Response.json({ history: result.history, records: result.records });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  const { config, error, supabase } = await context(module);
  if (error || !supabase || !config) return error;
  const draft = parseDraft(await request.json().catch(() => null), config.recordTypes[0] ?? "General");
  if (!draft) return Response.json({ error: "Donnees invalides." }, { status: 400 });
  const result = await createOperationalRecord(supabase, module, draft);
  return result.error ? Response.json({ error: result.error }, { status: 403 }) : Response.json(result.data, { status: 201 });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  const { config, error, supabase } = await context(module);
  if (error || !supabase || !config) return error;
  const body = await request.json().catch(() => null) as { id?: unknown; record?: unknown } | null;
  const id = typeof body?.id === "string" ? body.id : "";
  const draft = parseDraft(body?.record, config.recordTypes[0] ?? "General");
  if (!id || !draft) return Response.json({ error: "Donnees invalides." }, { status: 400 });
  const result = await updateOperationalRecord(supabase, module, id, draft);
  return result.error ? Response.json({ error: result.error }, { status: 403 }) : Response.json(result.data);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  const { error, supabase } = await context(module);
  if (error || !supabase) return error;
  const body = await request.json().catch(() => null) as { id?: unknown } | null;
  const id = typeof body?.id === "string" ? body.id : "";
  if (!id) return Response.json({ error: "Identifiant invalide." }, { status: 400 });
  const { data } = await supabase.from("module_records").select("*").eq("module_key", module).eq("id", id).maybeSingle();
  if (!data) return Response.json({ error: "Element introuvable." }, { status: 404 });
  const result = await deleteOperationalRecord(supabase, module, data as OperationalRecord);
  return result.error ? Response.json({ error: result.error }, { status: 403 }) : new Response(null, { status: 204 });
}
