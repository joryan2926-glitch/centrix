"use client";

import type { User } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useMemo } from "react";
import { DEMO_AUTH_PROFILE, DEMO_AUTH_USER } from "@/lib/auth/demo-session";

export type AuthRole = "admin" | "manager" | "employee" | "client" | "user";

export type AuthProfile = {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: AuthRole;
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
  const user = DEMO_AUTH_USER;
  const profile = DEMO_AUTH_PROFILE;
  const refresh = useCallback(async () => undefined, []);

  const value = useMemo(
    () => ({
      authenticated: true,
      canManageBilling: profile?.role === "admin",
      canManageWorkspace: profile?.role === "admin" || profile?.role === "manager",
      hasRole: (roles: AuthRole | AuthRole[]) => {
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        return profile?.role ? allowedRoles.includes(profile.role) : false;
      },
      isAdmin: profile?.role === "admin",
      loading: false,
      profile,
      refresh,
      user
    }),
    [profile, refresh, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
