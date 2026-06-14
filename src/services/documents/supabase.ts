import { getSupabaseSyncResult } from "@/services/supabaseSync";
import { documentsFallbackData } from "@/data/documents";
import { getSupabaseClient } from "@/lib/supabase";
import type { DocumentsCloudData } from "@/types/documents";

const storageKey = "centrix-documents-cloud-data-v1";
export const documentsBucket = "centrix-documents";

function readLocal(): DocumentsCloudData {
  if (typeof window === "undefined") return documentsFallbackData;
  const local = window.localStorage.getItem(storageKey);
  return local ? JSON.parse(local) : documentsFallbackData;
}

function writeLocal(data: DocumentsCloudData) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey, JSON.stringify(data));
  }
}

export async function loadDocumentsData(): Promise<{ data: DocumentsCloudData; mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: readLocal(), mode: "local" };

  const [documents, folders, shares, comments, versions, storageUsage, tags, notifications] = await Promise.all([
    supabase.from("documents").select("*").order("updated_at", { ascending: false }),
    supabase.from("folders").select("*").order("updatedAt", { ascending: false }),
    supabase.from("document_shares").select("*").order("createdAt", { ascending: false }),
    supabase.from("document_comments").select("*").order("createdAt", { ascending: false }),
    supabase.from("document_versions").select("*").order("createdAt", { ascending: false }),
    supabase.from("storage_usage").select("*"),
    supabase.from("document_tags").select("*"),
    supabase.from("document_notifications").select("*").order("createdAt", { ascending: false })
  ]);

  if ([documents, folders, shares, comments, versions, storageUsage, tags, notifications].some((result) => result.error)) {
    return { data: readLocal(), mode: "local" };
  }

  return {
    data: {
      documents: documents.data ?? [],
      folders: folders.data ?? [],
      shares: shares.data ?? [],
      comments: comments.data ?? [],
      versions: versions.data ?? [],
      storageUsage: storageUsage.data ?? [],
      tags: tags.data ?? [],
      notifications: notifications.data ?? []
    },
    mode: "supabase"
  };
}

export async function saveDocumentsData(data: DocumentsCloudData) {
  writeLocal(data);
}

export async function syncDocumentsData(data: DocumentsCloudData) {
  writeLocal(data);
  const supabase = getSupabaseClient();
  if (!supabase) return { mode: "local" as const };

  const results = await Promise.all([
    ...data.folders.map((row) => supabase.from("folders").upsert(row, { onConflict: "id" })),
    ...data.documents.map((row) => supabase.from("documents").upsert(row, { onConflict: "id" })),
    ...data.shares.map((row) => supabase.from("document_shares").upsert(row, { onConflict: "id" })),
    ...data.comments.map((row) => supabase.from("document_comments").upsert(row, { onConflict: "id" })),
    ...data.versions.map((row) => supabase.from("document_versions").upsert(row, { onConflict: "id" })),
    ...data.storageUsage.map((row) => supabase.from("storage_usage").upsert(row, { onConflict: "id" })),
    ...data.tags.map((row) => supabase.from("document_tags").upsert(row, { onConflict: "id" })),
    ...data.notifications.map((row) => supabase.from("document_notifications").upsert(row, { onConflict: "id" }))
  ]);

  return getSupabaseSyncResult(results);
}

export async function uploadDocumentAsset(file: File, folderName = "uploads") {
  const supabase = getSupabaseClient();
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "file";
  const storagePath = `${folderName}/${crypto.randomUUID()}.${extension}`;

  if (!supabase) {
    return { mode: "local" as const, storagePath: `local://${storagePath}`, url: null };
  }

  const result = await supabase.storage.from(documentsBucket).upload(storagePath, file, {
    cacheControl: "3600",
    upsert: false
  });

  if (result.error) {
    return { mode: "local" as const, storagePath: `local://${storagePath}`, url: null };
  }

  const publicUrl = supabase.storage.from(documentsBucket).getPublicUrl(result.data.path).data.publicUrl;
  return { mode: "supabase" as const, storagePath: result.data.path, url: publicUrl };
}
