import type { BillingDocument } from "@/types/billing";

const now = "2026-05-26T18:30:00.000Z";

export const billingDocuments: BillingDocument[] = [
  {
    id: "quote-2026-001",
    number: "DEV-2026-001",
    type: "quote",
    status: "pending",
    clientName: "Synapse Group",
    clientEmail: "finance@synapse.example",
    clientAddress: "12 rue La Fayette, 75009 Paris",
    issueDate: "2026-05-26",
    dueDate: "2026-06-25",
    notes: "Devis valable 30 jours. Conditions de paiement a reception de facture.",
    lines: [
      { id: "line-1", description: "Abonnement CENTRIX Scale", quantity: 12, unitPrice: 890, vatRate: 20 },
      { id: "line-2", description: "Onboarding equipe finance", quantity: 1, unitPrice: 2400, vatRate: 20 }
    ],
    history: [
      { id: "history-1", at: now, label: "Devis cree", detail: "Creation initiale depuis le module facturation." },
      { id: "history-2", at: now, label: "Envoye au client", detail: "En attente de validation par Synapse Group." }
    ],
    createdAt: now,
    updatedAt: now
  },
  {
    id: "inv-2026-048",
    number: "INV-2026-048",
    type: "invoice",
    status: "paid",
    clientName: "Helio Labs",
    clientEmail: "ops@helio.example",
    clientAddress: "4 avenue Victor Hugo, 69002 Lyon",
    issueDate: "2026-05-12",
    dueDate: "2026-05-26",
    notes: "Paiement recu par virement bancaire.",
    lines: [
      { id: "line-1", description: "Licence CENTRIX Business", quantity: 8, unitPrice: 620, vatRate: 20 },
      { id: "line-2", description: "Support prioritaire", quantity: 1, unitPrice: 990, vatRate: 20 }
    ],
    history: [
      { id: "history-1", at: "2026-05-12T08:00:00.000Z", label: "Facture emise", detail: "Facture transmise au contact finance." },
      { id: "history-2", at: "2026-05-24T10:15:00.000Z", label: "Paiement confirme", detail: "Statut passe a paye." }
    ],
    createdAt: "2026-05-12T08:00:00.000Z",
    updatedAt: "2026-05-24T10:15:00.000Z"
  }
];

export const frenchVatRates = [0, 2.1, 5.5, 10, 20] as const;
