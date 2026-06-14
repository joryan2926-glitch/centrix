import type { CloudDocument, CloudFolder, DocumentCategory, DocumentNotification, DocumentShare, DocumentsCloudData, DocumentSpace } from "@/types/documents";

export const categoryLabels: Record<DocumentCategory, string> = {
  contract: "Contrat",
  invoice: "Facture",
  quote: "Devis",
  hr: "RH",
  legal: "Juridique",
  accounting: "Comptabilite",
  image: "Image",
  archive: "Archive",
  other: "Autre"
};

export const allowedExtensions = ["pdf", "docx", "xlsx", "png", "jpg", "jpeg", "zip"];

export function getDocumentsDashboard(data: DocumentsCloudData) {
  const used = data.storageUsage.reduce((sum, item) => sum + item.usedBytes, 0);
  const limit = data.storageUsage.reduce((sum, item) => sum + item.limitBytes, 0);
  const downloads = data.documents.reduce((sum, document) => sum + document.downloads, 0);

  return {
    documents: data.documents.length,
    used,
    limit,
    recent: data.documents.filter((document) => Date.now() - new Date(document.updatedAt).getTime() < 1000 * 60 * 60 * 24 * 7).length,
    shared: data.documents.filter((document) => document.shared).length,
    downloads,
    activity: data.notifications.length
  };
}

export function inferCategory(extension: string, name: string): DocumentCategory {
  const lower = name.toLowerCase();
  if (lower.includes("contrat")) return "contract";
  if (lower.includes("facture") || lower.includes("invoice")) return "invoice";
  if (lower.includes("devis") || lower.includes("quote")) return "quote";
  if (lower.includes("statuts") || lower.includes("juridique")) return "legal";
  if (["png", "jpg", "jpeg"].includes(extension)) return "image";
  if (extension === "zip") return "archive";
  return "other";
}

export function createDocumentFromFile(file: File, folderId: string | null, storagePath: string | null, url: string | null): CloudDocument {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "file";
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    folderId,
    name: file.name,
    extension,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    category: inferCategory(extension, file.name),
    storagePath,
    url,
    favorite: false,
    shared: false,
    downloads: 0,
    signatureStatus: extension === "pdf" || extension === "docx" ? "pending" : "none",
    ocrStatus: extension === "pdf" || ["png", "jpg", "jpeg"].includes(extension) ? "pending" : "not_required",
    moduleLink: "none",
    tags: [],
    createdAt: now,
    updatedAt: now
  };
}

export function createFolder(name: string, space: DocumentSpace = "company", parentId: string | null = null): CloudFolder {
  const now = new Date().toISOString();
  return {
    id: `folder-${crypto.randomUUID()}`,
    parentId,
    name,
    space,
    color: space === "company" ? "#5ee7ff" : "#8b5cf6",
    createdAt: now,
    updatedAt: now
  };
}

export function duplicateDocument(document: CloudDocument): CloudDocument {
  const now = new Date().toISOString();
  return {
    ...document,
    id: crypto.randomUUID(),
    name: `${document.name.replace(/\.[^/.]+$/, "")} copie.${document.extension}`,
    favorite: false,
    shared: false,
    downloads: 0,
    createdAt: now,
    updatedAt: now
  };
}

export function createShare(documentId: string, email: string, permission: DocumentShare["permission"]): DocumentShare {
  return {
    id: `share-${crypto.randomUUID()}`,
    documentId,
    email,
    permission,
    secureLink: `https://centrix.local/share/${crypto.randomUUID()}`,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    createdAt: new Date().toISOString()
  };
}

export function createDocumentNotification(documentId: string | null, title: string, detail: string, severity: DocumentNotification["severity"] = "info"): DocumentNotification {
  return {
    id: `doc-notif-${crypto.randomUUID()}`,
    documentId,
    title,
    detail,
    severity,
    createdAt: new Date().toISOString()
  };
}

export function filterDocuments(documents: CloudDocument[], query: string, category: DocumentCategory | "all", folderId: string | "all") {
  const needle = query.toLowerCase();
  return documents.filter((document) => {
    const matchQuery = !needle || document.name.toLowerCase().includes(needle) || document.tags.some((tag) => tag.toLowerCase().includes(needle));
    const matchCategory = category === "all" || document.category === category;
    const matchFolder = folderId === "all" || document.folderId === folderId;
    return matchQuery && matchCategory && matchFolder;
  });
}

export function documentTone(document: CloudDocument) {
  if (document.signatureStatus === "signed") return "emerald" as const;
  if (document.shared) return "cyan" as const;
  if (document.favorite) return "violet" as const;
  return "cyan" as const;
}
