import type { DocumentsCloudData } from "@/types/documents";

export const documentsFallbackData: DocumentsCloudData = {
  folders: [
    { id: "folder-contracts", parentId: null, name: "Contrats", space: "company", color: "#5ee7ff", createdAt: "2026-05-01T08:00:00.000Z", updatedAt: "2026-05-26T08:00:00.000Z" },
    { id: "folder-finance", parentId: null, name: "Finance", space: "company", color: "#8b5cf6", createdAt: "2026-05-01T08:00:00.000Z", updatedAt: "2026-05-26T08:00:00.000Z" },
    { id: "folder-hr", parentId: null, name: "RH", space: "company", color: "#34d399", createdAt: "2026-05-01T08:00:00.000Z", updatedAt: "2026-05-26T08:00:00.000Z" },
    { id: "folder-legal", parentId: null, name: "Juridique", space: "company", color: "#d946ef", createdAt: "2026-05-01T08:00:00.000Z", updatedAt: "2026-05-26T08:00:00.000Z" }
  ],
  documents: [
    {
      id: "doc-contract-1",
      folderId: "folder-contracts",
      name: "Contrat SaaS Nova Atlas.pdf",
      extension: "pdf",
      mimeType: "application/pdf",
      size: 1840000,
      category: "contract",
      storagePath: "company/contracts/contrat-saas-nova-atlas.pdf",
      url: null,
      favorite: true,
      shared: true,
      downloads: 42,
      signatureStatus: "pending",
      ocrStatus: "indexed",
      moduleLink: "crm",
      tags: ["contrat", "signature"],
      createdAt: "2026-05-22T09:00:00.000Z",
      updatedAt: "2026-05-26T09:00:00.000Z"
    },
    {
      id: "doc-invoice-1",
      folderId: "folder-finance",
      name: "Facture INV-2048.pdf",
      extension: "pdf",
      mimeType: "application/pdf",
      size: 620000,
      category: "invoice",
      storagePath: "company/finance/inv-2048.pdf",
      url: null,
      favorite: false,
      shared: false,
      downloads: 17,
      signatureStatus: "none",
      ocrStatus: "indexed",
      moduleLink: "billing",
      tags: ["facture", "finance"],
      createdAt: "2026-05-24T11:00:00.000Z",
      updatedAt: "2026-05-24T11:00:00.000Z"
    },
    {
      id: "doc-hr-1",
      folderId: "folder-hr",
      name: "Contrat travail Lea.docx",
      extension: "docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      size: 980000,
      category: "hr",
      storagePath: "company/hr/contrat-travail-lea.docx",
      url: null,
      favorite: false,
      shared: true,
      downloads: 8,
      signatureStatus: "signed",
      ocrStatus: "not_required",
      moduleLink: "hr",
      tags: ["rh", "contrat"],
      createdAt: "2026-05-20T14:00:00.000Z",
      updatedAt: "2026-05-25T14:00:00.000Z"
    },
    {
      id: "doc-legal-1",
      folderId: "folder-legal",
      name: "Statuts Nova Atlas.pdf",
      extension: "pdf",
      mimeType: "application/pdf",
      size: 1320000,
      category: "legal",
      storagePath: "company/legal/statuts-nova-atlas.pdf",
      url: null,
      favorite: true,
      shared: false,
      downloads: 23,
      signatureStatus: "signed",
      ocrStatus: "indexed",
      moduleLink: "legal",
      tags: ["juridique", "statuts"],
      createdAt: "2026-05-18T10:00:00.000Z",
      updatedAt: "2026-05-26T10:00:00.000Z"
    }
  ],
  shares: [
    { id: "share-1", documentId: "doc-contract-1", email: "client@novaatlas.fr", permission: "read", secureLink: "https://centrix.local/share/contract-1", expiresAt: "2026-06-26T10:00:00.000Z", createdAt: "2026-05-26T10:00:00.000Z" },
    { id: "share-2", documentId: "doc-hr-1", email: "rh@centrix.local", permission: "admin", secureLink: "https://centrix.local/share/hr-1", expiresAt: null, createdAt: "2026-05-25T10:00:00.000Z" }
  ],
  comments: [
    { id: "comment-1", documentId: "doc-contract-1", author: "Sarah CSM", content: "Clause de renouvellement a valider avant signature.", createdAt: "2026-05-26T08:30:00.000Z" },
    { id: "comment-2", documentId: "doc-legal-1", author: "Legal Ops", content: "Document pret pour archivage juridique.", createdAt: "2026-05-25T16:00:00.000Z" }
  ],
  versions: [
    { id: "version-1", documentId: "doc-contract-1", version: 3, size: 1840000, storagePath: "company/contracts/contrat-saas-nova-atlas-v3.pdf", createdAt: "2026-05-26T09:00:00.000Z" },
    { id: "version-2", documentId: "doc-legal-1", version: 2, size: 1320000, storagePath: "company/legal/statuts-nova-atlas-v2.pdf", createdAt: "2026-05-26T10:00:00.000Z" }
  ],
  storageUsage: [
    { id: "usage-company", space: "company", usedBytes: 35600000000, limitBytes: 100000000000, updatedAt: "2026-05-26T10:00:00.000Z" },
    { id: "usage-personal", space: "personal", usedBytes: 4200000000, limitBytes: 15000000000, updatedAt: "2026-05-26T10:00:00.000Z" }
  ],
  tags: [
    { id: "tag-contract", label: "contrat", color: "#5ee7ff" },
    { id: "tag-finance", label: "finance", color: "#8b5cf6" },
    { id: "tag-signature", label: "signature", color: "#34d399" },
    { id: "tag-legal", label: "juridique", color: "#d946ef" }
  ],
  notifications: [
    { id: "doc-notif-1", documentId: "doc-contract-1", title: "Signature en attente", detail: "Contrat SaaS Nova Atlas attend une validation client.", severity: "warning", createdAt: "2026-05-26T09:15:00.000Z" },
    { id: "doc-notif-2", documentId: "doc-invoice-1", title: "Document indexe", detail: "Facture INV-2048 est disponible dans la recherche globale.", severity: "success", createdAt: "2026-05-24T11:15:00.000Z" }
  ]
};
