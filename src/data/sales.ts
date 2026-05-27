import type { SalesData } from "@/types/sales";

export const salesFallbackData: SalesData = {
  pipeline: [
    { id: "new_lead", label: "Nouveau lead", order: 1, probability: 10 },
    { id: "contacted", label: "Contacte", order: 2, probability: 20 },
    { id: "qualified", label: "Qualifie", order: 3, probability: 40 },
    { id: "proposal", label: "Proposition envoyee", order: 4, probability: 60 },
    { id: "negotiation", label: "Negociation", order: 5, probability: 75 },
    { id: "won", label: "Gagne", order: 6, probability: 100 },
    { id: "lost", label: "Perdu", order: 7, probability: 0 }
  ],
  leads: [
    { id: "lead-1", name: "Claire Martin", company: "NovaCore", email: "claire@novacore.fr", phone: "+33 6 10 20 30 40", sector: "SaaS", source: "LinkedIn", potentialValue: 68000, score: 92, priority: "urgent", tags: ["enterprise", "ia"], ownerId: "seller-1", stage: "negotiation", createdAt: "2026-05-24T09:00:00.000Z" },
    { id: "lead-2", name: "Hugo Renard", company: "Blue Atlas", email: "hugo@blueatlas.fr", phone: "+33 6 20 30 40 50", sector: "Finance", source: "Webinar", potentialValue: 42000, score: 81, priority: "high", tags: ["finance"], ownerId: "seller-2", stage: "proposal", createdAt: "2026-05-25T11:00:00.000Z" },
    { id: "lead-3", name: "Maya Cohen", company: "Orion Cloud", email: "maya@orion.cloud", phone: "+33 6 30 40 50 60", sector: "Cloud", source: "Referral", potentialValue: 96000, score: 88, priority: "high", tags: ["premium"], ownerId: "seller-1", stage: "qualified", createdAt: "2026-05-26T10:00:00.000Z" },
    { id: "lead-4", name: "Adam Petit", company: "RetailOps", email: "adam@retailops.fr", phone: "+33 6 40 50 60 70", sector: "Retail", source: "Ads", potentialValue: 18000, score: 62, priority: "medium", tags: ["starter"], ownerId: "seller-3", stage: "contacted", createdAt: "2026-05-27T08:00:00.000Z" }
  ],
  opportunities: [
    { id: "opp-1", leadId: "lead-1", title: "Suite CENTRIX Enterprise", amount: 68000, probability: 78, deadline: "2026-06-12T18:00:00.000Z", status: "negotiation" },
    { id: "opp-2", leadId: "lead-2", title: "Finance + Billing", amount: 42000, probability: 61, deadline: "2026-06-18T18:00:00.000Z", status: "proposal" },
    { id: "opp-3", leadId: "lead-3", title: "IA Business + CRM", amount: 96000, probability: 46, deadline: "2026-07-02T18:00:00.000Z", status: "qualified" }
  ],
  activities: [
    { id: "act-1", leadId: "lead-1", type: "meeting", title: "Demo executive", owner: "Nadia", createdAt: "2026-05-27T09:30:00.000Z" },
    { id: "act-2", leadId: "lead-2", type: "email", title: "Proposition envoyee", owner: "Thomas", createdAt: "2026-05-26T16:00:00.000Z" },
    { id: "act-3", leadId: "lead-3", type: "call", title: "Qualification budget", owner: "Nadia", createdAt: "2026-05-26T11:45:00.000Z" }
  ],
  notes: [
    { id: "note-1", leadId: "lead-1", author: "Nadia", content: "Decision prevue apres validation DAF.", createdAt: "2026-05-27T10:00:00.000Z" }
  ],
  quotes: [
    { id: "quote-1", leadId: "lead-1", title: "Devis Enterprise annuel", amount: 68000, status: "opened", openedCount: 4, createdAt: "2026-05-26T12:00:00.000Z" },
    { id: "quote-2", leadId: "lead-2", title: "Proposition Finance", amount: 42000, status: "sent", openedCount: 1, createdAt: "2026-05-26T16:00:00.000Z" }
  ],
  targets: [
    { id: "target-1", sellerId: "seller-1", label: "Objectif Q2 Nadia", targetAmount: 180000, currentAmount: 128000, period: "Q2" },
    { id: "target-2", sellerId: "seller-2", label: "Objectif Q2 Thomas", targetAmount: 120000, currentAmount: 74000, period: "Q2" }
  ],
  notifications: [
    { id: "notif-1", title: "Relance urgente", detail: "NovaCore attend une remise finale.", priority: "urgent", read: false, createdAt: "2026-05-27T10:30:00.000Z" },
    { id: "notif-2", title: "Devis ouvert", detail: "Blue Atlas a ouvert la proposition Finance.", priority: "high", read: false, createdAt: "2026-05-26T17:00:00.000Z" }
  ],
  teams: [
    { id: "seller-1", name: "Nadia", role: "Sales Lead", active: true, closedRevenue: 128000, quota: 180000, activities: 84 },
    { id: "seller-2", name: "Thomas", role: "Account Executive", active: true, closedRevenue: 74000, quota: 120000, activities: 61 },
    { id: "seller-3", name: "Sarah", role: "SDR", active: true, closedRevenue: 36000, quota: 80000, activities: 92 }
  ]
};
