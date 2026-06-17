const routePermissions: Array<[string, string]> = [
  ["/permissions", "settings"],
  ["/settings", "settings"],
  ["/admin", "settings"],
  ["/platform-settings", "settings"],
  ["/onboarding", "dashboard"],
  ["/profile", "dashboard"],
  ["/entreprises", "multi-company"],
  ["/multi-entreprises", "multi-company"],
  ["/franchises", "franchises"],
  ["/entreprise", "legal"],
  ["/juridique", "legal"],
  ["/crm", "crm"],
  ["/crm-intelligent", "crm"],
  ["/pipeline", "crm"],
  ["/clients", "clients"],
  ["/sales", "crm"],
  ["/facturation", "billing"],
  ["/facturation-premium", "billing"],
  ["/billing", "billing"],
  ["/subscriptions", "billing"],
  ["/comptabilite", "finance"],
  ["/finance", "finance"],
  ["/accounting", "finance"],
  ["/projects", "projects"],
  ["/tasks", "projects"],
  ["/rh", "hr"],
  ["/hr", "hr"],
  ["/agenda", "agenda"],
  ["/reservations", "agenda"],
  ["/marketing", "marketing"],
  ["/marketing-digital", "marketing"],
  ["/reseaux-sociaux", "marketing"],
  ["/social-media", "marketing"],
  ["/ia", "ai"],
  ["/ia-business", "ai"],
  ["/business-ai", "ai"],
  ["/documents", "documents"],
  ["/documents-cloud", "documents"],
  ["/support", "support"],
  ["/client-portal", "support"],
  ["/marketplace", "marketplace"],
  ["/services", "marketplace"],
  ["/providers", "marketplace"],
  ["/centrix-academy", "academy"],
  ["/formations", "academy"],
  ["/community", "academy"],
  ["/security", "security"],
  ["/cybersecurity", "security"],
  ["/integrations", "integrations"],
  ["/api-management", "integrations"],
  ["/automatisations", "workflows"],
  ["/automation", "workflows"],
  ["/workflows", "workflows"],
  ["/analytics", "analytics"],
  ["/analytics-ia", "analytics"],
  ["/business-intelligence", "analytics"],
  ["/predictive-ai", "analytics"],
  ["/notifications", "notifications"]
  ,["/api/ia", "ai"]
  ,["/api/mistral", "ai"]
  ,["/api/workflows", "workflows"]
  ,["/api/social", "marketing"]
  ,["/api/stripe", "billing"]
  ,["/api/data", "dashboard"]
  ,["/api/v1", "integrations"]
  ,["/api/core", "dashboard"]
  ,["/api/business-intelligence", "analytics"]
  ,["/api/banking", "finance"]
  ,["/api/integrations", "integrations"]
];

export function getRouteModuleKey(pathname: string) {
  if (pathname.startsWith("/operations/")) return getOperationParentModule(pathname.split("/")[2] || "");
  if (pathname.startsWith("/api/operations/")) return getOperationParentModule(pathname.split("/")[3] || "");
  return routePermissions.find(([route]) => pathname === route || pathname.startsWith(`${route}/`))?.[1] ?? null;
}
import { getOperationParentModule } from "@/lib/auth/operation-module-map";
