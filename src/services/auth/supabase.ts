import { getSupabaseClient } from "@/lib/supabase";
import type { AuthFormValues } from "@/types/auth";

export async function signInWithPassword(values: Required<Pick<AuthFormValues, "email" | "password">>) {
  const supabase = getSupabaseClient();
  if (!supabase) return { mode: "demo" as const, error: null };
  const { error } = await supabase.auth.signInWithPassword(values);
  return { mode: "supabase" as const, error };
}

export async function signUpWithPassword(values: Required<Pick<AuthFormValues, "email" | "password">> & Pick<AuthFormValues, "name">) {
  const supabase = getSupabaseClient();
  if (!supabase) return { mode: "demo" as const, error: null };
  const { error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: { data: { name: values.name } }
  });
  return { mode: "supabase" as const, error };
}

export async function resetPassword(email: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return { mode: "demo" as const, error: null };
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/login` });
  return { mode: "supabase" as const, error };
}

export async function signInWithGoogle() {
  const supabase = getSupabaseClient();
  if (!supabase) return { mode: "demo" as const, error: null };
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/dashboard` }
  });
  return { mode: "supabase" as const, error };
}
