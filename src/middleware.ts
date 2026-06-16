import { NextResponse, type NextRequest } from "next/server";
import { getRouteModuleKey } from "@/lib/auth/module-access";
import { getRequiredPlanForModule } from "@/lib/auth/plan-catalog";
import { isProtectedRoute } from "@/lib/auth/session";
import { DEMO_MODE } from "@/lib/demo-mode";
import { updateSupabaseSession } from "@/lib/supabase-middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { response, supabase, user } = await updateSupabaseSession(request);

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

  const moduleKey = getRouteModuleKey(pathname);
  if (!DEMO_MODE && user && supabase && moduleKey) {
    const { data: allowed, error } = await supabase.rpc("can_access_current_module", { target_module_key: moduleKey });
    if (error || allowed !== true) {
      const requiredPlan = getRequiredPlanForModule(moduleKey);
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: `Cette fonctionnalite necessite le plan ${requiredPlan.toUpperCase()}.`, module: moduleKey, requiredPlan },
          { status: 403 }
        );
      }
      const upgradeUrl = request.nextUrl.clone();
      upgradeUrl.pathname = "/upgrade";
      upgradeUrl.search = "";
      upgradeUrl.searchParams.set("module", moduleKey);
      upgradeUrl.searchParams.set("plan", requiredPlan);
      return NextResponse.redirect(upgradeUrl);
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
