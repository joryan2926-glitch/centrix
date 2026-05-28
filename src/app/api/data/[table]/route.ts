import type { NextRequest } from "next/server";
import { DEMO_AUTH_USER } from "@/lib/auth/demo-session";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { isAllowedDataTable } from "@/repositories/supabaseRepository";

export const runtime = "nodejs";

async function getContext(context: { params: Promise<{ table: string }> }) {
  const { table } = await context.params;
  if (!isAllowedDataTable(table)) {
    return { table: null, error: Response.json({ error: "Table non autorisee." }, { status: 404 }) };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { table, error: Response.json({ error: "Supabase non configure." }, { status: 503 }) };
  }

  return { table, supabase, user: DEMO_AUTH_USER, error: null };
}

export async function GET(request: NextRequest, context: { params: Promise<{ table: string }> }) {
  const ctx = await getContext(context);
  if (ctx.error) return ctx.error;

  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") ?? 50), 100);
  const workspaceId = request.nextUrl.searchParams.get("workspaceId");
  const id = request.nextUrl.searchParams.get("id");

  let query = ctx.supabase.from(ctx.table).select("*");
  if (id) query = query.eq("id", id);
  if (workspaceId && ctx.table !== "users" && ctx.table !== "profiles") query = query.eq("workspace_id", workspaceId);

  const { data, error } = await query.order("created_at", { ascending: false }).limit(limit);
  if (error) return Response.json({ error: error.message }, { status: 400 });

  return Response.json({ data: data ?? [] });
}

export async function POST(request: NextRequest, context: { params: Promise<{ table: string }> }) {
  const ctx = await getContext(context);
  if (ctx.error) return ctx.error;

  const body = await request.json().catch(() => ({}));
  const { data, error } = await ctx.supabase.from(ctx.table).insert(body).select("*").single();
  if (error) return Response.json({ error: error.message }, { status: 400 });

  return Response.json({ data }, { status: 201 });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ table: string }> }) {
  const ctx = await getContext(context);
  if (ctx.error) return ctx.error;

  const body = await request.json().catch(() => ({}));
  const id = String(body.id ?? request.nextUrl.searchParams.get("id") ?? "");
  if (!id) return Response.json({ error: "id requis." }, { status: 400 });

  const { id: ignoredId, ...values } = body;
  void ignoredId;
  const { data, error } = await ctx.supabase.from(ctx.table).update(values).eq("id", id).select("*").single();
  if (error) return Response.json({ error: error.message }, { status: 400 });

  return Response.json({ data });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ table: string }> }) {
  const ctx = await getContext(context);
  if (ctx.error) return ctx.error;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return Response.json({ error: "id requis." }, { status: 400 });

  const { data, error } = await ctx.supabase.from(ctx.table).delete().eq("id", id).select("*").maybeSingle();
  if (error) return Response.json({ error: error.message }, { status: 400 });

  return Response.json({ data });
}
