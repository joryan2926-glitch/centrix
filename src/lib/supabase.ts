import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { hasSupabasePublicEnv } from "@/lib/supabase-env";

export function hasSupabaseEnv() {
  return hasSupabasePublicEnv();
}

export function getSupabaseClient() {
  return createBrowserSupabaseClient();
}
