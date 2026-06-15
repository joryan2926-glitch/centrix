"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSupabaseContext } from "@/providers/SupabaseProvider";
import { defaultsForRole, loadCurrentPermissions, type PermissionSet } from "@/services/permissions/supabase";
import { useAuth } from "@/hooks/useAuth";

export function useModulePermissions(moduleKey: string) {
  const { profile } = useAuth();
  const { supabase } = useSupabaseContext();
  const [permissions, setPermissions] = useState<PermissionSet>(defaultsForRole(profile?.role ?? "user"));
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase) {
      setPermissions(defaultsForRole(profile?.role ?? "user"));
      setLoading(false);
      return;
    }
    const result = await loadCurrentPermissions(supabase, moduleKey);
    setPermissions(result.permissions);
    setLoading(false);
  }, [moduleKey, profile?.role, supabase]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return useMemo(() => ({ ...permissions, loading, refresh }), [loading, permissions, refresh]);
}
