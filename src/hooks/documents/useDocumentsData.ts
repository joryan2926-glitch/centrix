"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { documentsFallbackData } from "@/data/documents";
import { getSupabaseClient } from "@/lib/supabase";
import { createDocumentFromFile, createDocumentNotification } from "@/services/documents/calculations";
import { deleteDocumentAsset, loadDocumentsData, saveDocumentsData, syncDocumentsData, uploadDocumentAsset } from "@/services/documents/supabase";
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
    channel.subscribe((status) => {
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") setMode("local");
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const mutate = useCallback(
    (updater: (current: DocumentsCloudData) => DocumentsCloudData, message?: Toast) => {
      setData((current) => {
        const next = updater(current);
        saveDocumentsData(next);
        syncDocumentsData(next).then((result) => {
          setMode(result.mode);
          if ("error" in result && result.error) notify("Synchronisation Supabase impossible", result.error);
        });
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
        if ("error" in result && result.error) {
          notify("Upload impossible", result.error);
          continue;
        }
        created.push(createDocumentFromFile(file, folderId, result.storagePath, result.url));
        setUploadProgress(Math.round(((index + 1) / files.length) * 100));
      }

      if (!created.length) {
        setUploadProgress(0);
        return;
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
    [mutate, notify]
  );

  const sync = useCallback(async () => {
    const result = await syncDocumentsData(data);
    setMode(result.mode);
    notify(
      result.mode === "supabase" ? "Documents synchronises" : "Synchronisation documents impossible",
      "error" in result && result.error ? result.error : "Le cloud documentaire est a jour."
    );
  }, [data, notify]);

  const removeDocumentAsset = useCallback(async (document: CloudDocument) => {
    const result = await deleteDocumentAsset(document);
    setMode(result.mode);
  }, []);

  return useMemo(
    () => ({ data, loading, mode, toast, uploadProgress, mutate, notify, removeDocumentAsset, sync, uploadFiles }),
    [data, loading, mode, toast, uploadProgress, mutate, notify, removeDocumentAsset, sync, uploadFiles]
  );
}
