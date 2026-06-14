import { DEMO_MODE } from "@/lib/demo-mode";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { hasSupabasePublicEnv } from "@/lib/supabase-env";

export function hasSupabaseEnv() {
  if (DEMO_MODE) return false;
  return hasSupabasePublicEnv();
}

export function getSupabaseClient() {
  if (DEMO_MODE) return null;
  return createBrowserSupabaseClient();
}
