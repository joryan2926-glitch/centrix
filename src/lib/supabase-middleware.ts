import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { DEMO_AUTH_USER } from "@/lib/auth/demo-session";
import { DEMO_MODE } from "@/lib/demo-mode";
import { getSupabaseEnv } from "@/lib/supabase-env";

export async function updateSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (DEMO_MODE) {
    return { response, user: DEMO_AUTH_USER };
  }

  const { key, url } = getSupabaseEnv();

  if (!url || !key) {
    return { response, user: null };
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  const { data } = await supabase.auth.getUser();
  return { response, user: data.user };
}
