import { NextResponse, type NextRequest } from "next/server";
import { DEMO_MODE } from "@/lib/demo-mode";
import { isProtectedRoute, isPublicRoute } from "@/lib/auth/session";
import { updateSupabaseSession } from "@/lib/supabase-middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { response, user } = await updateSupabaseSession(request);

  if (!DEMO_MODE && isProtectedRoute(pathname) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!DEMO_MODE && user && ["/login", "/register"].includes(pathname)) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }

  if (isPublicRoute(pathname) || isProtectedRoute(pathname)) return response;
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.webmanifest).*)"]
};
