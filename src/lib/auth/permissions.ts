import type { AuthRole } from "@/providers/AuthProvider";

export const roleRank: Record<AuthRole, number> = {
  super_admin: 5,
  workspace_admin: 4,
  admin: 4,
  manager: 3,
  employee: 2,
  client: 1,
  user: 0
};

export function hasMinimumRole(role: AuthRole | null | undefined, minimum: AuthRole) {
  return roleRank[role ?? "user"] >= roleRank[minimum];
}

export function canManageWorkspace(role: AuthRole | null | undefined) {
  return hasMinimumRole(role, "manager");
}

export function canManageBilling(role: AuthRole | null | undefined) {
  return role === "super_admin" || role === "workspace_admin" || role === "admin";
}
