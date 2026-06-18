import { getSupabaseSyncResult } from "@/services/supabaseSync";
import { documentsFallbackData } from "@/data/documents";
import { getSupabaseClient } from "@/lib/supabase";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";
import type { CloudDocument, DocumentsCloudData } from "@/types/documents";

export const documentsBucket = "centrix-documents";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readLocal(): DocumentsCloudData {
  if (typeof window === "undefined") return documentsFallbackData;
  return documentsFallbackData;
}

function writeLocal(data: DocumentsCloudData) {
  void data;
}

export async function loadDocumentsData(): Promise<{ data: DocumentsCloudData; mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: readLocal(), mode: "local" };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { data: readLocal(), mode: "local" };

  const [documents, folders, shares, comments, versions, storageUsage, tags, notifications] = await Promise.all([
    supabase.from("documents").select("*").eq("workspace_id", workspace.workspaceId).order("updated_at", { ascending: false }),
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
      documents: (documents.data ?? []).map(mapDocument),
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
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { mode: "local" as const };
  const validDocumentIds = new Set(data.documents.filter((row) => isUuid(row.id)).map((row) => row.id));

  const results = await Promise.all([
    ...data.folders.map((row) => supabase.from("folders").upsert(row, { onConflict: "id" })),
    ...data.documents.filter((row) => validDocumentIds.has(row.id)).map((row) => supabase.from("documents").upsert(toDocumentRow(row, workspace.workspaceId), { onConflict: "id" })),
    ...data.shares.filter((row) => validDocumentIds.has(row.documentId)).map((row) => supabase.from("document_shares").upsert(row, { onConflict: "id" })),
    ...data.comments.filter((row) => validDocumentIds.has(row.documentId)).map((row) => supabase.from("document_comments").upsert(row, { onConflict: "id" })),
    ...data.versions.filter((row) => validDocumentIds.has(row.documentId)).map((row) => supabase.from("document_versions").upsert(row, { onConflict: "id" })),
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

export async function deleteDocumentAsset(document: CloudDocument) {
  const supabase = getSupabaseClient();
  if (!supabase) return { mode: "local" as const };

  const operations = [];
  if (document.storagePath && !document.storagePath.startsWith("local://")) {
    operations.push(supabase.storage.from(documentsBucket).remove([document.storagePath]));
  }
  if (isUuid(document.id)) {
    operations.push(supabase.from("documents").delete().eq("id", document.id));
  }
  const results = await Promise.all(operations);
  return { mode: results.some((result) => result.error) ? "local" as const : "supabase" as const };
}

function isUuid(value: string) {
  return uuidPattern.test(value);
}

function mapDocument(row: Record<string, unknown>): CloudDocument {
  const metadata = (row.metadata ?? {}) as Partial<CloudDocument>;
  const name = String(row.name ?? "Document");
  const extension = String(row.extension ?? metadata.extension ?? name.split(".").pop()?.toLowerCase() ?? "file");
  const signatureStatus = String(row.signatureStatus ?? row.signature_status ?? metadata.signatureStatus ?? (row.signed ? "signed" : "none"));
  return {
    category: normalizeCategory(String(row.category ?? metadata.category ?? "other")),
    createdAt: String(row.createdAt ?? row.created_at ?? new Date().toISOString()),
    downloads: Number(row.downloads ?? metadata.downloads ?? 0),
    extension,
    favorite: Boolean(row.favorite ?? metadata.favorite),
    folderId: (row.folderId ?? metadata.folderId ?? null) as string | null,
    id: String(row.id),
    mimeType: String(row.mimeType ?? row.mime_type ?? metadata.mimeType ?? "application/octet-stream"),
    moduleLink: normalizeModuleLink(String(row.moduleLink ?? metadata.moduleLink ?? "none")),
    name,
    ocrStatus: normalizeOcrStatus(String(row.ocrStatus ?? metadata.ocrStatus ?? "not_required")),
    shared: Boolean(row.shared),
    signatureStatus: normalizeSignatureStatus(signatureStatus),
    size: Number(row.size ?? row.size_bytes ?? metadata.size ?? 0),
    storagePath: (row.storagePath ?? row.path ?? metadata.storagePath ?? null) as string | null,
    tags: Array.isArray(row.tags) ? row.tags as string[] : Array.isArray(metadata.tags) ? metadata.tags : [],
    updatedAt: String(row.updatedAt ?? row.updated_at ?? new Date().toISOString()),
    url: (row.url ?? metadata.url ?? null) as string | null
  };
}

function toDocumentRow(document: CloudDocument, workspaceId: string) {
  return {
    category: document.category,
    downloads: document.downloads,
    extension: document.extension,
    favorite: document.favorite,
    folderId: document.folderId,
    id: document.id,
    metadata: {
      downloads: document.downloads,
      extension: document.extension,
      favorite: document.favorite,
      folderId: document.folderId,
      mimeType: document.mimeType,
      moduleLink: document.moduleLink,
      ocrStatus: document.ocrStatus,
      size: document.size,
      storagePath: document.storagePath,
      tags: document.tags,
      url: document.url
    },
    mimeType: document.mimeType,
    moduleLink: document.moduleLink,
    name: document.name,
    ocrStatus: document.ocrStatus,
    shared: document.shared,
    signatureStatus: document.signatureStatus,
    size: document.size,
    storagePath: document.storagePath,
    tags: document.tags,
    updatedAt: document.updatedAt,
    url: document.url,
    workspace_id: workspaceId
  };
}

function normalizeCategory(value: string): CloudDocument["category"] {
  const allowed: CloudDocument["category"][] = ["contract", "invoice", "quote", "hr", "legal", "accounting", "image", "archive", "other"];
  return allowed.includes(value as CloudDocument["category"]) ? value as CloudDocument["category"] : "other";
}

function normalizeModuleLink(value: string): CloudDocument["moduleLink"] {
  const allowed: CloudDocument["moduleLink"][] = ["crm", "billing", "hr", "legal", "finance", "none"];
  return allowed.includes(value as CloudDocument["moduleLink"]) ? value as CloudDocument["moduleLink"] : "none";
}

function normalizeOcrStatus(value: string): CloudDocument["ocrStatus"] {
  const allowed: CloudDocument["ocrStatus"][] = ["pending", "indexed", "failed", "not_required"];
  return allowed.includes(value as CloudDocument["ocrStatus"]) ? value as CloudDocument["ocrStatus"] : "not_required";
}

function normalizeSignatureStatus(value: string): CloudDocument["signatureStatus"] {
  const allowed: CloudDocument["signatureStatus"][] = ["none", "pending", "signed", "rejected"];
  return allowed.includes(value as CloudDocument["signatureStatus"]) ? value as CloudDocument["signatureStatus"] : "none";
}
