export type DocumentCategory = "contract" | "invoice" | "quote" | "hr" | "legal" | "accounting" | "image" | "archive" | "other";
export type DocumentPermission = "read" | "write" | "admin";
export type DocumentSpace = "personal" | "company";

export type CloudFolder = {
  id: string;
  parentId: string | null;
  name: string;
  space: DocumentSpace;
  color: string;
  createdAt: string;
  updatedAt: string;
};

export type CloudDocument = {
  id: string;
  folderId: string | null;
  name: string;
  extension: string;
  mimeType: string;
  size: number;
  category: DocumentCategory;
  storagePath: string | null;
  url: string | null;
  favorite: boolean;
  shared: boolean;
  downloads: number;
  signatureStatus: "none" | "pending" | "signed" | "rejected";
  ocrStatus: "pending" | "indexed" | "failed" | "not_required";
  moduleLink: "crm" | "billing" | "hr" | "legal" | "finance" | "none";
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type DocumentShare = {
  id: string;
  documentId: string;
  email: string;
  permission: DocumentPermission;
  secureLink: string;
  expiresAt: string | null;
  createdAt: string;
};

export type DocumentComment = {
  id: string;
  documentId: string;
  author: string;
  content: string;
  createdAt: string;
};

export type DocumentVersion = {
  id: string;
  documentId: string;
  version: number;
  size: number;
  storagePath: string | null;
  createdAt: string;
};

export type StorageUsage = {
  id: string;
  space: DocumentSpace;
  usedBytes: number;
  limitBytes: number;
  updatedAt: string;
};

export type DocumentTag = {
  id: string;
  label: string;
  color: string;
};

export type DocumentNotification = {
  id: string;
  documentId: string | null;
  title: string;
  detail: string;
  severity: "info" | "success" | "warning";
  createdAt: string;
};

export type DocumentsCloudData = {
  documents: CloudDocument[];
  folders: CloudFolder[];
  shares: DocumentShare[];
  comments: DocumentComment[];
  versions: DocumentVersion[];
  storageUsage: StorageUsage[];
  tags: DocumentTag[];
  notifications: DocumentNotification[];
};
