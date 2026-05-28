import { NextResponse, type NextRequest } from "next/server";
import { ensureUserOnboarding } from "@/lib/auth/onboarding";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextParam = requestUrl.searchParams.get("next");
  const next = nextParam?.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/dashboard";

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = (await supabase?.auth.exchangeCodeForSession(code)) ?? { error: null };
    if (!error) {
      await ensureUserOnboarding();
    } else {
      const loginUrl = new URL("/login", requestUrl.origin);
      loginUrl.searchParams.set("error", "oauth_callback");
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
