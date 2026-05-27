import type { ClientPortalData } from "@/types/client-portal";

export const clientPortalFallbackData: ClientPortalData = {
  portals: [
    { id: "portal-1", clientName: "Claire Martin", companyName: "NovaCore", email: "claire@novacore.fr", phone: "+33 6 10 20 30 40", plan: "Enterprise", lastLoginAt: "2026-05-27T09:20:00.000Z" }
  ],
  invoices: [
    { id: "inv-1", portalId: "portal-1", number: "FAC-2026-041", title: "Abonnement CENTRIX Enterprise", amount: 6800, status: "pending", dueAt: "2026-06-05T18:00:00.000Z", pdfUrl: "#" },
    { id: "inv-2", portalId: "portal-1", number: "FAC-2026-032", title: "Setup portail client", amount: 2400, status: "paid", dueAt: "2026-05-18T18:00:00.000Z", pdfUrl: "#" },
    { id: "inv-3", portalId: "portal-1", number: "DEV-2026-014", title: "Extension IA Business", amount: 12000, status: "draft", dueAt: "2026-06-20T18:00:00.000Z", pdfUrl: "#" }
  ],
  projects: [
    { id: "cp-proj-1", portalId: "portal-1", title: "Refonte portail client", description: "Nouvelle experience self-service premium.", status: "active", progress: 68, deadline: "2026-06-20T18:00:00.000Z" },
    { id: "cp-proj-2", portalId: "portal-1", title: "Automatisation facturation", description: "Synchronisation paiements, relances et documents.", status: "planned", progress: 24, deadline: "2026-07-05T18:00:00.000Z" }
  ],
  documents: [
    { id: "doc-1", portalId: "portal-1", name: "Contrat Enterprise.pdf", category: "contract", fileType: "PDF", sizeMb: 2.4, secureUrl: "#", createdAt: "2026-05-20T10:00:00.000Z" },
    { id: "doc-2", portalId: "portal-1", name: "Devis IA Business.pdf", category: "quote", fileType: "PDF", sizeMb: 1.1, secureUrl: "#", createdAt: "2026-05-26T12:00:00.000Z" },
    { id: "doc-3", portalId: "portal-1", name: "Compte rendu projet.docx", category: "project", fileType: "DOCX", sizeMb: 0.8, secureUrl: "#", createdAt: "2026-05-27T08:00:00.000Z" }
  ],
  messages: [
    { id: "msg-1", portalId: "portal-1", author: "Claire Martin", role: "client", content: "Pouvez-vous confirmer la date de livraison du portail ?", createdAt: "2026-05-27T08:30:00.000Z" },
    { id: "msg-2", portalId: "portal-1", author: "Nadia", role: "company", content: "Oui, la livraison beta reste prevue le 20 juin.", createdAt: "2026-05-27T09:00:00.000Z" }
  ],
  notifications: [
    { id: "notif-1", portalId: "portal-1", title: "Facture en attente", detail: "FAC-2026-041 arrive a echeance le 05 juin.", read: false, createdAt: "2026-05-27T09:15:00.000Z" },
    { id: "notif-2", portalId: "portal-1", title: "Projet mis a jour", detail: "La progression du portail client est maintenant a 68%.", read: false, createdAt: "2026-05-27T08:10:00.000Z" }
  ],
  appointments: [
    { id: "apt-1", portalId: "portal-1", title: "Comite projet portail", type: "project", status: "confirmed", startsAt: "2026-05-30T10:00:00.000Z" },
    { id: "apt-2", portalId: "portal-1", title: "Point facturation", type: "billing", status: "pending", startsAt: "2026-06-03T14:00:00.000Z" }
  ],
  signatures: [
    { id: "sig-1", portalId: "portal-1", documentName: "Devis IA Business.pdf", status: "pending", requestedAt: "2026-05-26T12:30:00.000Z" },
    { id: "sig-2", portalId: "portal-1", documentName: "Contrat Enterprise.pdf", status: "signed", requestedAt: "2026-05-20T10:00:00.000Z", signedAt: "2026-05-21T09:00:00.000Z" }
  ],
  activityLogs: [
    { id: "act-1", portalId: "portal-1", label: "Claire a consulte Devis IA Business.pdf", module: "Documents", createdAt: "2026-05-27T09:22:00.000Z" },
    { id: "act-2", portalId: "portal-1", label: "Nouveau message projet envoye", module: "Messagerie", createdAt: "2026-05-27T09:00:00.000Z" },
    { id: "act-3", portalId: "portal-1", label: "Facture FAC-2026-041 publiee", module: "Facturation", createdAt: "2026-05-26T16:00:00.000Z" }
  ]
};
