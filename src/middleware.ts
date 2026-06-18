import { NextResponse, type NextRequest } from "next/server";
import { canAccessAdminPortal } from "@/lib/auth/rbac";
import { isProtectedRoute } from "@/lib/auth/session";
import { updateSupabaseSession } from "@/lib/supabase-middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { response, supabase, user } = await updateSupabaseSession(request);

  if (isProtectedRoute(pathname) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && ["/login", "/register"].includes(pathname)) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }

  if (pathname.startsWith("/admin")) {
    if (!user || !supabase) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle<{ role: string | null }>();
    if (!canAccessAdminPortal(profile?.role)) {
      const unauthorizedUrl = request.nextUrl.clone();
      unauthorizedUrl.pathname = "/unauthorized";
      unauthorizedUrl.search = "";
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.webmanifest).*)"]
};
