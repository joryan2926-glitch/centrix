"use client";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createContext, useContext, useMemo } from "react";
import { DEMO_AUTH_USER } from "@/lib/auth/demo-session";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

type SupabaseContextValue = {
  supabase: SupabaseClient | null;
  user: User | null;
  loading: boolean;
  connected: boolean;
};

const SupabaseContext = createContext<SupabaseContextValue>({
  supabase: null,
  user: null,
  loading: true,
  connected: false
});

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const user = DEMO_AUTH_USER;
  const loading = false;

  const value = useMemo(() => ({ supabase, user, loading, connected: Boolean(supabase) }), [supabase, user, loading]);

  return <SupabaseContext.Provider value={value}>{children}</SupabaseContext.Provider>;
}

export function useSupabaseContext() {
  return useContext(SupabaseContext);
}
