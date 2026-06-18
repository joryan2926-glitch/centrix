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
];

export const crmClients: CrmClient[] = [
];

export const crmFallbackData: CrmData = {
  leads: crmLeads,
  clients: crmClients,
  notes: [],
  tasks: [],
  activities: []
};
