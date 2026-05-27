import { NextResponse, type NextRequest } from "next/server";
import { isProtectedRoute } from "@/lib/auth/session";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const requireAuth = process.env.CENTRIX_REQUIRE_AUTH === "true";

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  if (!requireAuth || !isProtectedRoute(request.nextUrl.pathname)) {
    return response;
  }

  const hasSupabaseSession = request.cookies.getAll().some((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"));
  if (hasSupabaseSession) {
    return response;
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"]
};
