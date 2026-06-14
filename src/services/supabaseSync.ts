type SupabaseMutationResult = {
  error: { message: string } | null;
};

export function getSupabaseSyncResult(results: SupabaseMutationResult[]) {
  const error = results.find((result) => result.error)?.error?.message ?? null;
  return { error, mode: error ? "local" as const : "supabase" as const };
}
