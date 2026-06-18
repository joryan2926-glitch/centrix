export type CentrixRole = "SUPER_ADMIN" | "WORKSPACE_ADMIN" | "USER";
export type CentrixExperience = "centrix_admin" | "company_owner" | "collaborator";

export const centrixExperienceLabels: Record<CentrixExperience, string> = {
  centrix_admin: "Administrateur CENTRIX",
  collaborator: "Collaborateur",
  company_owner: "Responsable d'entreprise"
};

export function normalizeRole(role?: string | null): CentrixRole {
  const value = String(role ?? "user").toLowerCase();
  if (value === "super_admin" || value === "super-admin" || value === "superadmin") return "SUPER_ADMIN";
  if (value === "workspace_admin" || value === "workspace-admin" || value === "admin" || value === "manager") return "WORKSPACE_ADMIN";
  return "USER";
}

export function canAccessAdminPortal(role?: string | null) {
  return normalizeRole(role) === "SUPER_ADMIN";
}

export function getCentrixExperience(role?: string | null): CentrixExperience {
  const normalized = normalizeRole(role);
  if (normalized === "SUPER_ADMIN") return "centrix_admin";
  if (normalized === "WORKSPACE_ADMIN") return "company_owner";
  return "collaborator";
}

export function getCentrixExperienceLabel(role?: string | null) {
  return centrixExperienceLabels[getCentrixExperience(role)];
}

export function canManageWorkspace(role?: string | null) {
  const normalized = normalizeRole(role);
  return normalized === "SUPER_ADMIN" || normalized === "WORKSPACE_ADMIN";
}

const userGroups = new Set(["Tableau de bord", "Relation client", "Finance", "Operations", "Marketing", "Intelligence artificielle"]);
const workspaceAdminGroups = new Set([...userGroups, "Ressources humaines", "Parametres", "Reseau & services", "CENTRIX Academy"]);

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
  if (normalized === "SUPER_ADMIN") return workspaceAdminGroups.has(groupLabel);
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
