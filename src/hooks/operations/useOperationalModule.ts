"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSupabaseContext } from "@/providers/SupabaseProvider";
import { createOperationalRecord, deleteOperationalRecord, executeOperationalAction, loadOperationalModule, updateOperationalRecord } from "@/services/operations/supabase";
import type { OperationalHistory, OperationalRecord, OperationalRecordDraft } from "@/types/operations";

const storagePrefix = "centrix-operational-";

function readLocal(moduleKey: string): OperationalRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(`${storagePrefix}${moduleKey}`) ?? "[]") as OperationalRecord[];
  } catch {
    return [];
  }
}

function writeLocal(moduleKey: string, records: OperationalRecord[]) {
  window.localStorage.setItem(`${storagePrefix}${moduleKey}`, JSON.stringify(records));
}

export function useOperationalModule(moduleKey: string) {
  const { supabase } = useSupabaseContext();
  const [records, setRecords] = useState<OperationalRecord[]>([]);
  const [history, setHistory] = useState<OperationalHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"local" | "supabase">("local");
  const [message, setMessage] = useState<string | null>(null);

  const notify = useCallback((value: string) => {
    setMessage(value);
    window.setTimeout(() => setMessage(null), 3200);
  }, []);

  const refresh = useCallback(async () => {
    if (!supabase) {
      setRecords(readLocal(moduleKey));
      setMode("local");
      setLoading(false);
      return;
    }
    const result = await loadOperationalModule(supabase, moduleKey);
    if (result.error) {
      setRecords(readLocal(moduleKey));
      setMode("local");
    } else {
      setRecords(result.records);
      setHistory(result.history);
      setMode("supabase");
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
    }
    const now = new Date().toISOString();
    const local = [{ ...draft, created_at: now, created_by: "local", id: crypto.randomUUID(), metadata: {}, module_key: moduleKey, updated_at: now, workspace_id: "local" }, ...records] as OperationalRecord[];
    setRecords(local);
    writeLocal(moduleKey, local);
    setMode("local");
    notify("Element enregistre localement.");
    return null;
  }, [moduleKey, notify, records, refresh, supabase]);

  const update = useCallback(async (id: string, draft: OperationalRecordDraft) => {
    if (supabase && mode === "supabase") {
      const result = await updateOperationalRecord(supabase, moduleKey, id, draft);
      if (!result.error) {
        await refresh();
        notify("Modifications enregistrees.");
        return;
      }
    }
    const local = records.map((record) => record.id === id ? { ...record, ...draft, updated_at: new Date().toISOString() } : record);
    setRecords(local);
    writeLocal(moduleKey, local);
    notify("Modifications enregistrees localement.");
  }, [mode, moduleKey, notify, records, refresh, supabase]);

  const remove = useCallback(async (record: OperationalRecord) => {
    if (supabase && mode === "supabase") await deleteOperationalRecord(supabase, moduleKey, record);
    const local = records.filter((item) => item.id !== record.id);
    setRecords(local);
    writeLocal(moduleKey, local);
    await refresh();
    notify("Element supprime.");
  }, [mode, moduleKey, notify, records, refresh, supabase]);

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

  return useMemo(() => ({ create, history, loading, message, mode, records, refresh, remove, runAction, update }), [create, history, loading, message, mode, records, refresh, remove, runAction, update]);
}
