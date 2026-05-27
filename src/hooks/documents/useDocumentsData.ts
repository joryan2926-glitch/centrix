"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { documentsFallbackData } from "@/data/documents";
import { getSupabaseClient } from "@/lib/supabase";
import { createDocumentFromFile, createDocumentNotification } from "@/services/documents/calculations";
import { loadDocumentsData, saveDocumentsData, syncDocumentsData, uploadDocumentAsset } from "@/services/documents/supabase";
import type { CloudDocument, DocumentsCloudData } from "@/types/documents";

type Toast = { title: string; detail: string };

const realtimeTables = [
  "documents",
  "folders",
  "document_shares",
  "document_comments",
  "document_versions",
  "storage_usage",
  "document_tags",
  "document_notifications"
];

export function useDocumentsData() {
  const [data, setData] = useState<DocumentsCloudData>(documentsFallbackData);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"local" | "supabase">("local");
  const [toast, setToast] = useState<Toast | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const notify = useCallback((title: string, detail: string) => {
    setToast({ title, detail });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const refresh = useCallback(async () => {
    const result = await loadDocumentsData();
    setData(result.data);
    setMode(result.mode);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const channel = supabase.channel("centrix-documents-realtime");
    realtimeTables.forEach((table) => {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, () => refresh());
    });
    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const mutate = useCallback(
    (updater: (current: DocumentsCloudData) => DocumentsCloudData, message?: Toast) => {
      setData((current) => {
        const next = updater(current);
        saveDocumentsData(next);
        return next;
      });
      if (message) notify(message.title, message.detail);
    },
    [notify]
  );

  const uploadFiles = useCallback(
    async (files: File[], folderId: string | null) => {
      if (!files.length) return;
      setUploadProgress(8);
      const created: CloudDocument[] = [];

      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const result = await uploadDocumentAsset(file);
        created.push(createDocumentFromFile(file, folderId, result.storagePath, result.url));
        setUploadProgress(Math.round(((index + 1) / files.length) * 100));
      }

      mutate(
        (current) => ({
          ...current,
          documents: [...created, ...current.documents],
          notifications: [createDocumentNotification(null, "Upload termine", `${created.length} fichier(s) ajoute(s) au cloud.`, "success"), ...current.notifications],
          storageUsage: current.storageUsage.map((usage) =>
            usage.space === "company"
              ? { ...usage, usedBytes: usage.usedBytes + created.reduce((sum, document) => sum + document.size, 0), updatedAt: new Date().toISOString() }
              : usage
          )
        }),
        { title: "Upload termine", detail: `${created.length} fichier(s) pret(s).` }
      );
      window.setTimeout(() => setUploadProgress(0), 900);
    },
    [mutate]
  );

  const sync = useCallback(async () => {
    const result = await syncDocumentsData(data);
    setMode(result.mode);
    notify(result.mode === "supabase" ? "Documents synchronises" : "Sauvegarde locale", "Le cloud documentaire est a jour.");
  }, [data, notify]);

  return useMemo(
    () => ({ data, loading, mode, toast, uploadProgress, mutate, uploadFiles, sync, notify }),
    [data, loading, mode, toast, uploadProgress, mutate, uploadFiles, sync, notify]
  );
}
