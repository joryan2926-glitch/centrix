"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { securityFallbackData } from "@/data/security";
import { getSupabaseClient } from "@/lib/supabase";
import { loadSecurityData, saveSecurityData, syncSecurityData } from "@/services/security/supabase";
import type { SecurityData } from "@/types/security";

type Toast = { title: string; detail: string };
const tables = ["security_logs", "user_sessions", "login_attempts", "security_alerts", "api_security_logs", "user_permissions", "audit_logs", "backups", "gdpr_requests"];

export function useSecurityData() {
  const [data, setData] = useState<SecurityData>(securityFallbackData);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"local" | "supabase">("local");
  const [toast, setToast] = useState<Toast | null>(null);

  const notify = useCallback((title: string, detail: string) => {
    setToast({ title, detail });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const refresh = useCallback(async () => {
    const result = await loadSecurityData();
    setData(result.data);
    setMode(result.mode);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const channel = supabase.channel("centrix-security-realtime");
    tables.forEach((table) => channel.on("postgres_changes", { event: "*", schema: "public", table }, () => refresh()));
    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const mutate = useCallback((updater: (current: SecurityData) => SecurityData, message?: Toast) => {
    setData((current) => {
      const next = updater(current);
      saveSecurityData(next);
      return next;
    });
    if (message) notify(message.title, message.detail);
  }, [notify]);

  const sync = useCallback(async () => {
    const result = await syncSecurityData(data);
    setMode(result.mode);
    notify(result.mode === "supabase" ? "Securite synchronisee" : "Sauvegarde locale", "Logs, alertes et sessions sont a jour.");
  }, [data, notify]);

  return useMemo(() => ({ data, loading, mode, toast, mutate, sync, notify }), [data, loading, mode, toast, mutate, sync, notify]);
}
