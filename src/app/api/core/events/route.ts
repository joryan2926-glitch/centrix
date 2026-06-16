import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";
import type { CentrixModuleKey, EventSeverity } from "@/types/saas-core";

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Supabase non configure." }, { status: 503 });
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return NextResponse.json({ error: "Session CENTRIX requise." }, { status: 401 });

  const body = await request.json();
  const title = String(body.title ?? "Evenement CENTRIX").trim().slice(0, 180);
  const { data: event, error } = await supabase.from("module_events").insert({
    id: `event-${crypto.randomUUID()}`,
    workspace_id: workspace.workspaceId,
    created_by: workspace.userId,
    module: body.module as CentrixModuleKey,
    entity_type: String(body.entityType ?? "event").slice(0, 120),
    entity_id: body.entityId ? String(body.entityId).slice(0, 180) : null,
    title,
    detail: String(body.detail ?? "").slice(0, 5_000),
    severity: (body.severity as EventSeverity) ?? "info",
    metadata: typeof body.metadata === "object" && body.metadata ? body.metadata : {}
  }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 403 });

  return NextResponse.json({ event });
}
