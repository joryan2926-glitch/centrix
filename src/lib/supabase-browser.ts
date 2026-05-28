"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase-env";

export function createBrowserSupabaseClient() {
  const { key, url } = getSupabaseEnv();

  if (!url || !key) {
    return null;
  }

  return createBrowserClient(url, key);
}
