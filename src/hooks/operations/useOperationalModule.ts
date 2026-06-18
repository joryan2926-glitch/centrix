"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSupabaseContext } from "@/providers/SupabaseProvider";
import { createOperationalRecord, deleteOperationalRecord, executeOperationalAction, loadOperationalModule, updateOperationalRecord } from "@/services/operations/supabase";
import type { OperationalHistory, OperationalRecord, OperationalRecordDraft } from "@/types/operations";

export function useOperationalModule(moduleKey: string) {
  const { supabase } = useSupabaseContext();
  const [records, setRecords] = useState<OperationalRecord[]>([]);
  const [history, setHistory] = useState<OperationalHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"local" | "supabase">("local");
  const [message, setMessage] = useState<string | null>(null);
  const [cloudError, setCloudError] = useState<string | null>(null);

  const notify = useCallback((value: string) => {
    setMessage(value);
    window.setTimeout(() => setMessage(null), 3200);
  }, []);

  const refresh = useCallback(async () => {
    if (!supabase) {
      setRecords([]);
      setHistory([]);
      setMode("supabase");
      setCloudError("Connexion Supabase indisponible.");
      setLoading(false);
      return;
    }
    const result = await loadOperationalModule(supabase, moduleKey);
    if (result.error) {
      setRecords([]);
      setHistory([]);
      setMode("supabase");
      setCloudError(result.error);
    } else {
      setRecords(result.records);
      setHistory(result.history);
      setMode("supabase");
      setCloudError(null);
    }
    setLoading(false);
  }, [moduleKey, supabase]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = useCallback(async (draft: OperationalRecordDraft) => {
    if (supabase) {
      const result = await createOperationalRecord(supabase, moduleKey, draft);
      if (!result.error) {
        await refresh();
        notify("Element cree et synchronise avec Supabase.");
        return null;
      }
      setCloudError(result.error);
      notify(`Supabase: ${result.error}`);
      return result.error;
    }
    const error = "Supabase est requis pour creer cet element.";
    setCloudError(error);
    notify(error);
    return error;
  }, [moduleKey, notify, refresh, supabase]);

  const update = useCallback(async (id: string, draft: OperationalRecordDraft) => {
    if (supabase && mode === "supabase") {
      const result = await updateOperationalRecord(supabase, moduleKey, id, draft);
      if (!result.error) {
        await refresh();
        notify("Modifications enregistrees.");
        return;
      }
      setCloudError(result.error);
      notify(`Supabase: ${result.error}`);
      return;
    }
    setCloudError("Supabase est requis pour modifier cet element.");
    notify("Supabase est requis pour modifier cet element.");
  }, [mode, moduleKey, notify, refresh, supabase]);

  const remove = useCallback(async (record: OperationalRecord) => {
    if (supabase && mode === "supabase") {
      const result = await deleteOperationalRecord(supabase, moduleKey, record);
      if (result.error) {
        setCloudError(result.error);
        notify(`Supabase: ${result.error}`);
        return;
      }
    }
    if (!supabase) {
      setCloudError("Supabase est requis pour supprimer cet element.");
      notify("Supabase est requis pour supprimer cet element.");
      return;
    }
    await refresh();
    notify("Element supprime.");
  }, [mode, moduleKey, notify, refresh, supabase]);

  const runAction = useCallback(async (action: string) => {
    if (supabase && mode === "supabase") {
      const result = await executeOperationalAction(supabase, moduleKey, action);
      if (result.error) {
        notify(result.error);
        return;
      }
      await refresh();
    }
    notify(`${action} lance.`);
  }, [mode, moduleKey, notify, refresh, supabase]);

  return useMemo(() => ({ cloudError, create, history, loading, message, mode, records, refresh, remove, runAction, update }), [cloudError, create, history, loading, message, mode, records, refresh, remove, runAction, update]);
}
