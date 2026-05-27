import type { SupportData } from "@/types/support";

export const supportFallbackData: SupportData = {
  agents: [
    { id: "agent-sarah", name: "Sarah Martin", email: "sarah@centrix.local", role: "lead", online: true, avatarUrl: null, activeTickets: 8, satisfactionScore: 96 },
    { id: "agent-yanis", name: "Yanis Lefevre", email: "yanis@centrix.local", role: "agent", online: true, avatarUrl: null, activeTickets: 6, satisfactionScore: 91 },
    { id: "agent-nora", name: "Nora Chen", email: "nora@centrix.local", role: "agent", online: false, avatarUrl: null, activeTickets: 4, satisfactionScore: 88 }
  ],
  categories: [
    { id: "cat-billing", name: "Facturation", color: "#5ee7ff", slaHours: 8 },
    { id: "cat-technical", name: "Technique", color: "#8b5cf6", slaHours: 4 },
    { id: "cat-account", name: "Compte client", color: "#34d399", slaHours: 12 },
    { id: "cat-onboarding", name: "Onboarding", color: "#d946ef", slaHours: 24 }
  ],
  tickets: [
    {
      id: "ticket-1024",
      title: "Erreur synchronisation factures Stripe",
      description: "Le client ne voit plus les factures Stripe depuis la derniere synchronisation.",
      clientName: "Nova Atlas",
      clientEmail: "ops@novaatlas.fr",
      priority: "urgent",
      categoryId: "cat-technical",
      status: "in_progress",
      assignedAgentId: "agent-sarah",
      attachments: ["capture-stripe.png"],
      createdAt: "2026-05-26T08:10:00.000Z",
      updatedAt: "2026-05-26T09:45:00.000Z"
    },
    {
      id: "ticket-1025",
      title: "Question sur changement de plan",
      description: "Demande de details sur la migration du plan Growth vers Scale.",
      clientName: "Blue Atlas",
      clientEmail: "admin@blueatlas.io",
      priority: "medium",
      categoryId: "cat-account",
      status: "pending",
      assignedAgentId: "agent-yanis",
      attachments: [],
      createdAt: "2026-05-25T14:20:00.000Z",
      updatedAt: "2026-05-26T08:20:00.000Z"
    },
    {
      id: "ticket-1026",
      title: "Validation avoir facture avril",
      description: "Le client demande un avoir sur une facture deja reglee.",
      clientName: "Orion Cloud",
      clientEmail: "finance@orioncloud.fr",
      priority: "high",
      categoryId: "cat-billing",
      status: "open",
      assignedAgentId: null,
      attachments: ["facture-avril.pdf"],
      createdAt: "2026-05-26T10:00:00.000Z",
      updatedAt: "2026-05-26T10:00:00.000Z"
    },
    {
      id: "ticket-1027",
      title: "Guide onboarding equipe RH",
      description: "Besoin d'un guide rapide pour inviter 12 collaborateurs RH.",
      clientName: "Helio Labs",
      clientEmail: "people@heliolabs.com",
      priority: "low",
      categoryId: "cat-onboarding",
      status: "resolved",
      assignedAgentId: "agent-nora",
      attachments: [],
      createdAt: "2026-05-24T11:00:00.000Z",
      updatedAt: "2026-05-25T11:00:00.000Z"
    }
  ],
  messages: [
    { id: "msg-support-1", ticketId: "ticket-1024", authorName: "Nova Atlas", authorType: "client", content: "Nous avons besoin de recuperer les factures avant la cloture comptable.", createdAt: "2026-05-26T08:12:00.000Z" },
    { id: "msg-support-2", ticketId: "ticket-1024", authorName: "Sarah Martin", authorType: "agent", content: "Je prends le ticket. Je verifie les logs de synchronisation et reviens vers vous sous 30 minutes.", createdAt: "2026-05-26T08:20:00.000Z" },
    { id: "msg-support-3", ticketId: "ticket-1025", authorName: "Yanis Lefevre", authorType: "agent", content: "Le plan Scale active les workflows IA, SLA prioritaire et exports avances.", createdAt: "2026-05-26T08:25:00.000Z" }
  ],
  comments: [
    { id: "comment-support-1", ticketId: "ticket-1024", agentId: "agent-sarah", content: "Verifier webhook Stripe et dernier job finance.", internal: true, createdAt: "2026-05-26T08:30:00.000Z" },
    { id: "comment-support-2", ticketId: "ticket-1026", agentId: "agent-sarah", content: "A assigner finance si avoir superieur a 500 EUR.", internal: true, createdAt: "2026-05-26T10:05:00.000Z" }
  ],
  articles: [
    { id: "article-1", categoryId: "cat-billing", title: "Comprendre vos factures CENTRIX", excerpt: "TVA, echeances, avoirs et moyens de paiement.", content: "Guide complet de lecture des factures, avoirs et relances.", views: 1840, likes: 162, published: true, updatedAt: "2026-05-24T10:00:00.000Z" },
    { id: "article-2", categoryId: "cat-technical", title: "Resoudre une erreur de synchronisation", excerpt: "Checklist de diagnostic des integrations.", content: "Verifier API keys, webhooks, permissions et logs d'execution.", views: 920, likes: 88, published: true, updatedAt: "2026-05-25T10:00:00.000Z" },
    { id: "article-3", categoryId: "cat-onboarding", title: "Inviter votre equipe", excerpt: "Roles, permissions et bonnes pratiques.", content: "Ajoutez les membres, attribuez les roles et configurez les notifications.", views: 740, likes: 65, published: true, updatedAt: "2026-05-22T10:00:00.000Z" }
  ],
  feedback: [
    { id: "feedback-1", ticketId: "ticket-1027", rating: 5, comment: "Reponse claire et rapide.", createdAt: "2026-05-25T12:00:00.000Z" },
    { id: "feedback-2", ticketId: "ticket-1025", rating: 4, comment: "Bon accompagnement commercial.", createdAt: "2026-05-26T09:00:00.000Z" }
  ],
  notifications: [
    { id: "support-notif-1", ticketId: "ticket-1024", title: "SLA urgent", detail: "Ticket Stripe a traiter avant 12:10.", severity: "warning", createdAt: "2026-05-26T09:10:00.000Z" },
    { id: "support-notif-2", ticketId: "ticket-1027", title: "Satisfaction recue", detail: "Helio Labs a note le support 5/5.", severity: "success", createdAt: "2026-05-25T12:00:00.000Z" }
  ]
};
