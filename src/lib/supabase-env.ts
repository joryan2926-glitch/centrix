export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return { key, url };
}

export function hasSupabasePublicEnv() {
  const { key, url } = getSupabaseEnv();
  return Boolean(url && key);
}
