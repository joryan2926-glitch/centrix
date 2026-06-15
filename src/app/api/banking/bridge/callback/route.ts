import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { syncBridgeBankingData } from "@/lib/banking/bridge";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";

export async function GET(request: NextRequest) {
  const redirect = new URL("/comptabilite?banking=connected", request.url);
  const success = request.nextUrl.searchParams.get("success");
  if (success !== "true") {
    redirect.searchParams.set("banking", "cancelled");
    return NextResponse.redirect(redirect);
  }

  const supabase = await createServerSupabaseClient();
  const workspace = supabase ? await resolveWorkspaceContext(supabase) : null;
  if (!supabase || !workspace) {
    redirect.searchParams.set("banking", "session-required");
    return NextResponse.redirect(redirect);
  }

  try {
    await syncBridgeBankingData(supabase, workspace);
  } catch {
    redirect.searchParams.set("banking", "sync-required");
  }
  return NextResponse.redirect(redirect);
}
