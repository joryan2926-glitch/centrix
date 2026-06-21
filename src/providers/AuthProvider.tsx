"use client";

import type { User } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { PlanCode } from "@/lib/auth/plan-catalog";
import { canManageWorkspace as canManageWorkspaceRole, normalizeRole, type CentrixRole } from "@/lib/auth/rbac";
import { useSupabaseContext } from "@/providers/SupabaseProvider";

export type AuthRole = "super_admin" | "workspace_admin" | "admin" | "manager" | "employee" | "client" | "user";

export type AuthProfile = {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: AuthRole;
  rbacRole: CentrixRole;
  plan: PlanCode;
  workspaceId: string | null;
  workspaceName: string | null;
};

type AuthContextValue = {
  user: User | null;
  profile: AuthProfile | null;
  loading: boolean;
  authenticated: boolean;
  canManageBilling: boolean;
  canManageWorkspace: boolean;
  isAdmin: boolean;
  hasRole: (roles: AuthRole | AuthRole[]) => boolean;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  authenticated: false,
  canManageBilling: false,
  canManageWorkspace: false,
  hasRole: () => false,
  isAdmin: false,
  loading: true,
  profile: null,
  refresh: async () => undefined,
  user: null
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { loading: supabaseLoading, supabase, user } = useSupabaseContext();
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(Boolean(supabase));
  const bootstrapAttemptedRef = useRef(false);

  const loadProfile = useCallback(async () => {
    if (!supabase) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    if (!user) {
      bootstrapAttemptedRef.current = false;
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    let { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url, role, workspace_id, workspaces(name)")
      .eq("id", user.id)
      .maybeSingle();

    if ((!data?.workspace_id || error) && !bootstrapAttemptedRef.current) {
      bootstrapAttemptedRef.current = true;
      await fetch("/api/auth/bootstrap", { method: "POST" }).catch(() => null);
      const retry = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url, role, workspace_id, workspaces(name)")
        .eq("id", user.id)
        .maybeSingle();
      data = retry.data;
      error = retry.error;
    }

    if (error || !data) {
      setProfile({
        avatarUrl: user.user_metadata?.avatar_url ?? null,
        email: user.email ?? "",
        fullName: user.user_metadata?.name ?? user.email ?? "Utilisateur CENTRIX",
        id: user.id,
        plan: "free",
        rbacRole: "USER",
        role: "user",
        workspaceId: null,
        workspaceName: null
      });
      setProfileLoading(false);
      return;
    }

    const workspace = Array.isArray(data.workspaces) ? data.workspaces[0] : data.workspaces;
    const effectivePlan = data.workspace_id
      ? await supabase.rpc("workspace_effective_plan", { target_workspace_id: data.workspace_id })
      : { data: "free" };

    const role = (data.role as AuthRole | null) ?? "user";
    setProfile({
      avatarUrl: data.avatar_url ?? null,
      email: data.email ?? user.email ?? "",
      fullName: data.full_name ?? user.user_metadata?.name ?? "Utilisateur CENTRIX",
      id: data.id,
      plan: String(effectivePlan.data ?? "free") as PlanCode,
      rbacRole: normalizeRole(role),
      role,
      workspaceId: data.workspace_id ?? null,
      workspaceName: workspace?.name ?? null
    });
    setProfileLoading(false);
  }, [supabase, user]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const refresh = useCallback(async () => {
    await loadProfile();
  }, [loadProfile]);

  const value = useMemo(
    () => ({
      authenticated: Boolean(user),
      canManageBilling: canManageWorkspaceRole(profile?.role),
      canManageWorkspace: canManageWorkspaceRole(profile?.role),
      hasRole: (roles: AuthRole | AuthRole[]) => {
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        return profile?.role ? allowedRoles.includes(profile.role) : false;
      },
      isAdmin: canManageWorkspaceRole(profile?.role),
      loading: supabaseLoading || profileLoading,
      profile,
      refresh,
      user: user ?? null
    }),
    [profile, profileLoading, refresh, supabaseLoading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
