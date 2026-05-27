import type { CrmClient, CrmData, CrmLead, CrmStatus } from "@/types/crm";

export const crmStages: Array<{ id: CrmStatus; label: string; hint: string }> = [
  { id: "new", label: "Nouveau", hint: "Prospects entrants" },
  { id: "qualified", label: "Qualifie", hint: "Besoin confirme" },
  { id: "proposal", label: "Proposition", hint: "Offre envoyee" },
  { id: "negotiation", label: "Negociation", hint: "Decision proche" },
  { id: "won", label: "Gagne", hint: "Client signe" },
  { id: "lost", label: "Perdu", hint: "A analyser" }
];

export const crmLeads: CrmLead[] = [
  {
    id: "lead-novacore",
    name: "Emma Laurent",
    company: "NovaCore",
    email: "emma@novacore.example",
    phone: "+33 6 12 34 56 78",
    status: "proposal",
    priority: "high",
    potentialAmount: 68000,
    probability: 78,
    owner: "Sarah",
    source: "LinkedIn Ads",
    tags: ["Entreprise", "Finance", "IA"],
    createdAt: "2026-05-12T08:00:00.000Z",
    updatedAt: "2026-05-24T09:30:00.000Z"
  },
  {
    id: "lead-blue-atlas",
    name: "Marc Vidal",
    company: "Blue Atlas",
    email: "marc@blueatlas.example",
    phone: "+33 7 22 45 87 12",
    status: "qualified",
    priority: "medium",
    potentialAmount: 24000,
    probability: 42,
    owner: "Nora",
    source: "Webinar",
    tags: ["Conseil", "Reporting"],
    createdAt: "2026-05-18T10:00:00.000Z",
    updatedAt: "2026-05-22T14:10:00.000Z"
  },
  {
    id: "lead-orion",
    name: "Lea Bernard",
    company: "Orion Cloud",
    email: "lea@orion.example",
    phone: "+33 6 98 45 12 10",
    status: "negotiation",
    priority: "high",
    potentialAmount: 96000,
    probability: 86,
    owner: "Sarah",
    source: "Partenaire",
    tags: ["Cloud", "Legal"],
    createdAt: "2026-05-05T08:00:00.000Z",
    updatedAt: "2026-05-25T16:45:00.000Z"
  }
];

export const crmClients: CrmClient[] = [
  {
    id: "client-helio",
    leadId: null,
    name: "Julie Moreau",
    company: "Helio Labs",
    email: "julie@helio.example",
    phone: "+33 6 44 15 90 20",
    tags: ["Onboarding", "Deeptech"],
    lifetimeValue: 59000,
    status: "onboarding",
    createdAt: "2026-05-21T12:00:00.000Z",
    updatedAt: "2026-05-21T12:00:00.000Z"
  }
];

export const crmFallbackData: CrmData = {
  leads: crmLeads,
  clients: crmClients,
  notes: [
    {
      id: "note-novacore",
      leadId: "lead-novacore",
      clientId: null,
      body: "Equipe finance interessee par automatisation facturation.",
      createdAt: "2026-05-24T09:30:00.000Z"
    }
  ],
  tasks: [
    {
      id: "task-novacore",
      leadId: "lead-novacore",
      clientId: null,
      title: "Relancer sur validation DAF",
      dueDate: "2026-05-29",
      done: false,
      createdAt: "2026-05-24T09:30:00.000Z"
    }
  ],
  activities: [
    {
      id: "act-novacore-demo",
      leadId: "lead-novacore",
      clientId: null,
      type: "meeting",
      title: "Demo executive",
      detail: "Presentation des modules CRM et facturation.",
      createdAt: "2026-05-24T09:30:00.000Z"
    }
  ]
};
