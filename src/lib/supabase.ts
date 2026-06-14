import { createClient } from "@supabase/supabase-js";
import { DEMO_MODE } from "@/lib/demo-mode";
import { getSupabaseEnv, hasSupabasePublicEnv } from "@/lib/supabase-env";

export function hasSupabaseEnv() {
  if (DEMO_MODE) return false;
  return hasSupabasePublicEnv();
}

export function getSupabaseClient() {
  if (DEMO_MODE) return null;

  const { key, url } = getSupabaseEnv();

  if (!url || !key) {
    return null;
  }

  return createClient(url, key);
}
