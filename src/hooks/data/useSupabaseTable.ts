"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createRepository, type DataTableName } from "@/repositories/supabaseRepository";
import { useSupabaseContext } from "@/providers/SupabaseProvider";

type UseSupabaseTableOptions = {
  workspaceId?: string;
  realtime?: boolean;
  limit?: number;
};

export function useSupabaseTable<T extends Record<string, unknown>>(table: DataTableName, options: UseSupabaseTableOptions = {}) {
  const { supabase, connected } = useSupabaseContext();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [error, setError] = useState<string | null>(null);

  const repository = useMemo(() => (supabase ? createRepository<T>(supabase, table) : null), [supabase, table]);

  const refresh = useCallback(async () => {
    if (!repository) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const result = await repository.list({ workspaceId: options.workspaceId, limit: options.limit });
    setData(result.data);
    setError(result.error);
    setLoading(false);
  }, [repository, options.workspaceId, options.limit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!supabase || options.realtime === false) return;

    const channel = supabase
      .channel(`centrix-table-${table}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => refresh())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, table, refresh, options.realtime]);

  const create = useCallback(async (values: Partial<T>) => {
    if (!repository) return { data: null, error: "Supabase non configure." };
    const result = await repository.create(values);
    await refresh();
    return result;
  }, [repository, refresh]);

  const update = useCallback(async (id: string, values: Partial<T>) => {
    if (!repository) return { data: null, error: "Supabase non configure." };
    const result = await repository.update(id, values);
    await refresh();
    return result;
  }, [repository, refresh]);

  const remove = useCallback(async (id: string) => {
    if (!repository) return { data: null, error: "Supabase non configure." };
    const result = await repository.delete(id);
    await refresh();
    return result;
  }, [repository, refresh]);

  return useMemo(() => ({ data, loading, error, connected, refresh, create, update, remove }), [data, loading, error, connected, refresh, create, update, remove]);
}
