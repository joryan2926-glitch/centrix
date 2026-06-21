import type { CentrixModule, SaasCoreDashboard } from "@/types/saas-core";

export const centrixModules: CentrixModule[] = [
  { key: "dashboard", label: "Tableau de bord", href: "/dashboard", status: "active", description: "Vue unique pour piloter l'activite, les ventes, la tresorerie et les priorites.", connectedModules: ["crm", "billing", "banking", "ai"] },
  { key: "crm", label: "CRM", href: "/crm", status: "active", description: "Prospects, clients, pipeline commercial et historique relationnel.", connectedModules: ["clients", "billing", "ai"] },
  { key: "clients", label: "Clients", href: "/clients", status: "active", description: "Fiches clients, suivi commercial et donnees de contact.", connectedModules: ["crm", "billing", "support"] },
  { key: "billing", label: "Devis & factures", href: "/facturation", status: "active", description: "Creation de devis, facturation, TVA, paiement et signature electronique.", connectedModules: ["crm", "clients", "banking"] },
  { key: "banking", label: "Banque & tresorerie", href: "/finance", status: "active", description: "Comptes bancaires Bridge, soldes, flux et alertes de tresorerie.", connectedModules: ["billing", "dashboard", "ai"] },
  { key: "social", label: "Reseaux sociaux", href: "/reseaux-sociaux", status: "active", description: "Programmation des publications, calendrier editorial et engagement.", connectedModules: ["marketing", "ai"] },
  { key: "marketing", label: "Marketing", href: "/marketing", status: "active", description: "Campagnes, emailing Brevo et acquisition de prospects.", connectedModules: ["crm", "social", "ai"] },
  { key: "ai", label: "Conseiller IA Business", href: "/ia", status: "active", description: "Analyses, recommandations, contenus et conseils de developpement avec Mistral.", connectedModules: ["dashboard", "crm", "billing", "marketing"] },
  { key: "settings", label: "Entreprise", href: "/workspace-admin", status: "active", description: "Profil entreprise, collaborateurs, parametres et configuration du workspace.", connectedModules: ["dashboard", "crm", "billing"] },
  { key: "support", label: "Support", href: "/support", status: "active", description: "Demandes client, aide et suivi des demandes importantes.", connectedModules: ["clients", "dashboard", "ai"] }
];

export const saasCoreFallbackDashboard: SaasCoreDashboard = {
  modules: centrixModules,
  metrics: [],
  analytics: [],
  events: [],
  tasks: [],
  connections: []
};
