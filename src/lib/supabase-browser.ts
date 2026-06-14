"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { DEMO_MODE } from "@/lib/demo-mode";
import { getSupabaseEnv } from "@/lib/supabase-env";

let browserClient: SupabaseClient | null = null;

export function createBrowserSupabaseClient() {
  if (DEMO_MODE) return null;

  const { key, url } = getSupabaseEnv();

  if (!url || !key) {
    return null;
  }

  browserClient ??= createBrowserClient(url, key);
  return browserClient;
}
