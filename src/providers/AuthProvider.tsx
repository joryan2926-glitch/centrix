"use client";

import type { User } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEMO_AUTH_PROFILE, DEMO_AUTH_USER } from "@/lib/auth/demo-session";
import { DEMO_MODE } from "@/lib/demo-mode";
import { useSupabaseContext } from "@/providers/SupabaseProvider";

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
  const { loading: supabaseLoading, supabase, user } = useSupabaseContext();
  const [profile, setProfile] = useState<AuthProfile | null>(DEMO_MODE || !supabase ? DEMO_AUTH_PROFILE : null);
  const [profileLoading, setProfileLoading] = useState(Boolean(supabase && !DEMO_MODE));

  const loadProfile = useCallback(async () => {
    if (DEMO_MODE || !supabase) {
      setProfile(DEMO_AUTH_PROFILE);
      setProfileLoading(false);
      return;
    }

    if (!user) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url, role, workspace_id, workspaces(name)")
      .eq("id", user.id)
      .maybeSingle();

    if (error || !data) {
      setProfile({
        avatarUrl: user.user_metadata?.avatar_url ?? null,
        email: user.email ?? "",
        fullName: user.user_metadata?.name ?? user.email ?? "Utilisateur CENTRIX",
        id: user.id,
        role: "user",
        workspaceId: null,
        workspaceName: null
      });
      setProfileLoading(false);
      return;
    }

    const workspace = Array.isArray(data.workspaces) ? data.workspaces[0] : data.workspaces;

    setProfile({
      avatarUrl: data.avatar_url ?? null,
      email: data.email ?? user.email ?? "",
      fullName: data.full_name ?? user.user_metadata?.name ?? "Utilisateur CENTRIX",
      id: data.id,
      role: (data.role as AuthRole | null) ?? "user",
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
      canManageBilling: profile?.role === "admin",
      canManageWorkspace: profile?.role === "admin" || profile?.role === "manager",
      hasRole: (roles: AuthRole | AuthRole[]) => {
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        return profile?.role ? allowedRoles.includes(profile.role) : false;
      },
      isAdmin: profile?.role === "admin",
      loading: supabaseLoading || profileLoading,
      profile,
      refresh,
      user: user ?? (DEMO_MODE || !supabase ? DEMO_AUTH_USER : null)
    }),
    [profile, profileLoading, refresh, supabase, supabaseLoading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
