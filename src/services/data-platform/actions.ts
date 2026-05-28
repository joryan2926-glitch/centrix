"use server";

import { revalidatePath } from "next/cache";
import { DEMO_AUTH_USER } from "@/lib/auth/demo-session";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { isAllowedDataTable, type DataTableName } from "@/repositories/supabaseRepository";

type ActionState<T = unknown> = {
  data?: T;
  error?: string;
};

async function getServerContext(table: string) {
  if (!isAllowedDataTable(table)) return { error: "Table non autorisee." };

  const supabase = await createServerSupabaseClient();
  if (!supabase) return { error: "Supabase non configure." };

  return { supabase, table: table as DataTableName, user: DEMO_AUTH_USER };
}

export async function createDataPlatformRecord(table: DataTableName, values: Record<string, unknown>, revalidate = "/dashboard"): Promise<ActionState> {
  const ctx = await getServerContext(table);
  if ("error" in ctx) return { error: ctx.error };

  const { data, error } = await ctx.supabase.from(ctx.table).insert(values).select("*").single();
  if (error) return { error: error.message };

  revalidatePath(revalidate);
  return { data };
}

export async function updateDataPlatformRecord(table: DataTableName, id: string, values: Record<string, unknown>, revalidate = "/dashboard"): Promise<ActionState> {
  const ctx = await getServerContext(table);
  if ("error" in ctx) return { error: ctx.error };

  const { data, error } = await ctx.supabase.from(ctx.table).update(values).eq("id", id).select("*").single();
  if (error) return { error: error.message };

  revalidatePath(revalidate);
  return { data };
}

export async function deleteDataPlatformRecord(table: DataTableName, id: string, revalidate = "/dashboard"): Promise<ActionState> {
  const ctx = await getServerContext(table);
  if ("error" in ctx) return { error: ctx.error };

  const { data, error } = await ctx.supabase.from(ctx.table).delete().eq("id", id).select("*").maybeSingle();
  if (error) return { error: error.message };

  revalidatePath(revalidate);
  return { data };
}
