import { NextResponse } from "next/server";
import { ensureUserOnboarding } from "@/lib/auth/onboarding";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Supabase non configure." }, { status: 500 });

  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "Session CENTRIX requise." }, { status: 401 });

  await ensureUserOnboarding();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, workspace_id, workspaces(name)")
    .eq("id", data.user.id)
    .maybeSingle();

  if (error || !profile?.workspace_id) {
    return NextResponse.json({ error: error?.message ?? "Workspace CENTRIX introuvable apres initialisation." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, profile });
}
