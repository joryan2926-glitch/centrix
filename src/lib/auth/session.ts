export const protectedRoutes = [
  "/dashboard",
  "/crm",
  "/facturation",
  "/comptabilite",
  "/billing",
  "/settings",
  "/security",
  "/business-intelligence"
] as const;

export function isProtectedRoute(pathname: string) {
  return protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}
