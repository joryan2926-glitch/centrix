export type CentrixRole = "SUPER_ADMIN" | "WORKSPACE_ADMIN" | "USER";

export function normalizeRole(role?: string | null): CentrixRole {
  const value = String(role ?? "user").toLowerCase();
  if (value === "super_admin" || value === "super-admin" || value === "superadmin") return "SUPER_ADMIN";
  if (value === "workspace_admin" || value === "workspace-admin" || value === "admin" || value === "manager") return "WORKSPACE_ADMIN";
  return "USER";
}

export function canAccessAdminPortal(role?: string | null) {
  return normalizeRole(role) === "SUPER_ADMIN";
}

export function canManageWorkspace(role?: string | null) {
  const normalized = normalizeRole(role);
  return normalized === "SUPER_ADMIN" || normalized === "WORKSPACE_ADMIN";
}

const userGroups = new Set(["Accueil", "CRM", "Finance", "Operations", "Marketing", "IA", "Reseau & services", "CENTRIX Academy"]);
const workspaceAdminGroups = new Set([...userGroups, "RH", "Parametres"]);

const userBlockedModules = new Set([
  "settings",
  "security",
  "api",
  "integrations",
  "multi-company",
  "franchises",
  "white-label",
  "administration",
  "hr",
  "recruiting",
  "legal"
]);

export function canAccessNavigationGroup(role: string | null | undefined, groupLabel: string) {
  const normalized = normalizeRole(role);
  if (normalized === "SUPER_ADMIN") return true;
  if (normalized === "WORKSPACE_ADMIN") return workspaceAdminGroups.has(groupLabel);
  return userGroups.has(groupLabel);
}

export function canAccessNavigationItem(role: string | null | undefined, moduleKey?: string) {
  return canAccessModule(role, moduleKey);
}

export function canAccessModule(role: string | null | undefined, moduleKey?: string | null) {
  const normalized = normalizeRole(role);
  if (normalized === "SUPER_ADMIN" || normalized === "WORKSPACE_ADMIN") return true;
  return !moduleKey || !userBlockedModules.has(moduleKey);
}
