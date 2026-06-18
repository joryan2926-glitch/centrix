import type { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

const resourceTables: Record<string, string> = {
  agenda: "calendar_events",
  analytics: "analytics",
  billing: "invoices",
  clients: "clients",
  crm: "prospects",
  documents: "documents",
  hr: "employees",
  marketing: "marketing_campaigns",
  projects: "projects",
  support: "support_tickets",
  tasks: "tasks"
};

export async function GET(request: NextRequest, context: { params: Promise<{ resource: string }> }) {
  const token = request.headers.get("authorization") ?? request.headers.get("x-api-key");
  if (!token) {
    return Response.json({ error: "Authorization Bearer ou x-api-key requis." }, { status: 401 });
  }

  const { resource } = await context.params;
  const table = resourceTables[resource];
  if (!table) {
    return Response.json({ error: "Ressource API inconnue.", available: Object.keys(resourceTables) }, { status: 404 });
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return Response.json({ error: "Supabase non configure.", data: [] }, { status: 503 });
  }
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return Response.json({ error: "Session Supabase requise." }, { status: 401 });
  }

  const { data: profile } = await supabase.from("profiles").select("workspace_id").eq("id", authData.user.id).maybeSingle<{ workspace_id: string | null }>();
  if (!profile?.workspace_id) {
    return Response.json({ error: "Workspace introuvable." }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const limit = Math.min(Number(searchParams.get("limit") ?? 25), 100);
  const query = searchParams.get("q")?.toLowerCase() ?? "";
  const requestQuery = supabase.from(table).select("*").eq("workspace_id", profile.workspace_id).limit(limit);

  const { data, error } = await requestQuery;
  if (error) {
    return Response.json({ error: error.message, data: [] }, { status: 200 });
  }

  const rows = (data ?? []) as Array<Record<string, unknown>>;
  const filtered = query ? rows.filter((item) => JSON.stringify(item).toLowerCase().includes(query)) : rows;

  return Response.json({
    object: "list",
    apiVersion: "v1",
    resource,
    pagination: { limit, total: filtered.length, hasMore: filtered.length > limit },
    data: filtered.slice(0, limit)
  });
}

export async function POST(request: NextRequest, context: { params: Promise<{ resource: string }> }) {
  const token = request.headers.get("authorization") ?? request.headers.get("x-api-key");
  if (!token) {
    return Response.json({ error: "Authorization Bearer ou x-api-key requis." }, { status: 401 });
  }

  const { resource } = await context.params;
  const table = resourceTables[resource];
  if (!table) {
    return Response.json({ error: "Ressource API inconnue.", available: Object.keys(resourceTables) }, { status: 404 });
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return Response.json({ error: "Supabase non configure." }, { status: 503 });
  }
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return Response.json({ error: "Session Supabase requise." }, { status: 401 });
  }

  const { data: profile } = await supabase.from("profiles").select("workspace_id").eq("id", authData.user.id).maybeSingle<{ workspace_id: string | null }>();
  if (!profile?.workspace_id) {
    return Response.json({ error: "Workspace introuvable." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { data, error } = await supabase.from(table).insert({ ...body, workspace_id: profile.workspace_id }).select("*").single();
  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({ object: resource, data }, { status: 201 });
}
