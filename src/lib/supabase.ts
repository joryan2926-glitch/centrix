import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv, hasSupabasePublicEnv } from "@/lib/supabase-env";

export function hasSupabaseEnv() {
  return hasSupabasePublicEnv();
}

export function getSupabaseClient() {
  const { key, url } = getSupabaseEnv();

  if (!url || !key) {
    return null;
  }

  return createClient(url, key);
}
