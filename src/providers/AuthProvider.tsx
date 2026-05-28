"use client";

import type { User } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
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
  isAdmin: boolean;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  authenticated: false,
  isAdmin: false,
  loading: true,
  profile: null,
  refresh: async () => undefined,
  user: null
});

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: AuthRole | null;
  workspace_id: string | null;
};

type WorkspaceRow = {
  id: string;
  name: string;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { supabase, user, loading: sessionLoading } = useSupabaseContext();
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !user) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    const { data: profileRow } = await supabase.from("profiles").select("id, full_name, email, avatar_url, role, workspace_id").eq("id", user.id).maybeSingle<ProfileRow>();
    const workspaceId = profileRow?.workspace_id ?? null;
    const { data: workspace } = workspaceId
      ? await supabase.from("workspaces").select("id, name").eq("id", workspaceId).maybeSingle<WorkspaceRow>()
      : { data: null };

    setProfile({
      avatarUrl: profileRow?.avatar_url ?? (typeof user.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : null),
      email: profileRow?.email ?? user.email ?? "",
      fullName: profileRow?.full_name ?? String(user.user_metadata?.name ?? user.email?.split("@")[0] ?? "Utilisateur CENTRIX"),
      id: user.id,
      role: profileRow?.role ?? "admin",
      workspaceId,
      workspaceName: workspace?.name ?? null
    });
    setProfileLoading(false);
  }, [supabase, user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      authenticated: Boolean(user),
      isAdmin: profile?.role === "admin",
      loading: sessionLoading || profileLoading,
      profile,
      refresh,
      user
    }),
    [profile, profileLoading, refresh, sessionLoading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
