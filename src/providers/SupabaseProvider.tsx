"use client";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) {
      setUser(null);
      setLoading(false);
      return undefined;
    }

    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUser(data.user);
      setLoading(false);
    }).catch(() => {
      if (!mounted) return;
      setUser(null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  const value = useMemo(() => ({ supabase, user, loading, connected: Boolean(supabase) }), [supabase, user, loading]);

  return <SupabaseContext.Provider value={value}>{children}</SupabaseContext.Provider>;
}

export function useSupabaseContext() {
  return useContext(SupabaseContext);
}
