import { operationalModules } from "@/data/operations";

const coreModules = {
  academy: "Academy",
  agenda: "Agenda",
  analytics: "Analytics",
  billing: "Facturation",
  clients: "Clients",
  crm: "CRM",
  documents: "Documents",
  finance: "Finance",
  hr: "Ressources humaines",
  integrations: "Integrations",
  marketing: "Marketing",
  marketplace: "Marketplace",
  notifications: "Notifications",
  projects: "Projets",
  security: "Cybersecurite",
  settings: "Administration",
  support: "Support client",
  workflows: "Automatisations"
} as const;

export const permissionCatalog: Record<string, string> = {
  ...coreModules,
  ...Object.fromEntries(Object.entries(operationalModules).map(([key, config]) => [key, config.title]))
};
