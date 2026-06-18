import type { CentrixModule, SaasCoreDashboard } from "@/types/saas-core";

export const centrixModules: CentrixModule[] = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard", status: "active", description: "KPIs, widgets, analytics, activite recente.", connectedModules: ["crm", "billing", "analytics", "notifications"] },
  { key: "crm", label: "CRM", href: "/crm", status: "active", description: "Clients, prospects, pipeline, notes, relances.", connectedModules: ["clients", "billing", "automations", "ai"] },
  { key: "clients", label: "Clients / portail", href: "/client-portal", status: "active", description: "Espace client, factures, devis, documents, projets.", connectedModules: ["billing", "documents", "support", "projects"] },
  { key: "billing", label: "Devis & facturation", href: "/facturation", status: "active", description: "PDF, Stripe, TVA, exports comptables.", connectedModules: ["crm", "accounting", "clients", "banking"] },
  { key: "accounting", label: "Comptabilite", href: "/comptabilite", status: "active", description: "Depenses, revenus, categories, exports.", connectedModules: ["billing", "banking", "analytics"] },
  { key: "banking", label: "Banque & tresorerie", href: "/finance", status: "active", description: "Cashflow, previsionnel, connexion bancaire future-ready.", connectedModules: ["accounting", "billing", "analytics"] },
  { key: "enterprise", label: "Creation entreprise", href: "/entreprise", status: "active", description: "Assistant IA, statuts, documents, capital, checklist.", connectedModules: ["legal", "documents", "ai"] },
  { key: "legal", label: "Juridique", href: "/juridique", status: "active", description: "Contrats, signatures, stockage securise.", connectedModules: ["documents", "clients", "enterprise"] },
  { key: "documents", label: "Documents & Cloud", href: "/documents", status: "active", description: "Upload, dossiers, Supabase Storage, partage.", connectedModules: ["clients", "legal", "hr", "billing"] },
  { key: "hr", label: "Ressources humaines", href: "/rh", status: "active", description: "Employes, contrats, absences, conges, planning.", connectedModules: ["payroll", "documents", "agenda"] },
  { key: "payroll", label: "Paie", href: "/rh", status: "planned", description: "Simulation salaires, fiches de paie, charges.", connectedModules: ["hr", "accounting"] },
  { key: "agenda", label: "Agenda", href: "/agenda", status: "active", description: "Calendrier, rendez-vous, sync, rappels.", connectedModules: ["crm", "projects", "notifications"] },
  { key: "projects", label: "Gestion projets", href: "/projects", status: "active", description: "Kanban, taches, deadlines, equipes, progression.", connectedModules: ["clients", "collaboration", "documents"] },
  { key: "collaboration", label: "Collaboration", href: "/notifications", status: "active", description: "Commentaires, chat, notifications realtime.", connectedModules: ["projects", "support", "documents"] },
  { key: "marketing", label: "Marketing", href: "/marketing", status: "active", description: "Campagnes, emailing, analytics, automation.", connectedModules: ["crm", "social", "automations"] },
  { key: "social", label: "Reseaux sociaux", href: "/reseaux-sociaux", status: "active", description: "Programmation, calendrier social, plateformes.", connectedModules: ["marketing", "ai"] },
  { key: "ai", label: "IA Business", href: "/ia", status: "active", description: "Assistant IA, emails, devis, conseils business.", connectedModules: ["crm", "billing", "analytics", "automations"] },
  { key: "automations", label: "Automatisations", href: "/workflows", status: "active", description: "Workflows, triggers, emails, taches auto.", connectedModules: ["crm", "billing", "marketing", "support"] },
  { key: "analytics", label: "Analytics & KPI", href: "/business-intelligence", status: "active", description: "Graphiques, rapports, business intelligence.", connectedModules: ["crm", "billing", "accounting", "marketing"] },
  { key: "support", label: "Support Client", href: "/support", status: "active", description: "Tickets, SAV, FAQ, chat support.", connectedModules: ["clients", "collaboration", "ai"] },
  { key: "notifications", label: "Notifications realtime", href: "/notifications", status: "active", description: "Alertes business, rappels, realtime et collaboration.", connectedModules: ["dashboard", "agenda", "support", "automations"] },
  { key: "marketplace", label: "Marketplace", href: "/marketplace", status: "active", description: "Services, achats, ventes, prestataires.", connectedModules: ["billing", "clients"] },
  { key: "academy", label: "CENTRIX Academy", href: "/centrix-academy", status: "active", description: "Formations, videos, progression, certificats.", connectedModules: ["clients", "billing"] },
  { key: "settings", label: "Parametres", href: "/settings", status: "active", description: "Entreprise, utilisateurs, roles, permissions.", connectedModules: ["security", "multi-company", "integrations"] },
  { key: "integrations", label: "API & Integrations", href: "/integrations", status: "active", description: "Webhooks, API REST, Stripe, Google, Outlook.", connectedModules: ["automations", "billing", "agenda"] },
  { key: "security", label: "Cybersecurite", href: "/security", status: "active", description: "2FA, logs, sessions, protections API.", connectedModules: ["settings", "integrations"] },
  { key: "multi-company", label: "Multi-entreprises", href: "/entreprises", status: "active", description: "Workspaces, franchises, equipes.", connectedModules: ["settings", "analytics"] }
];

export const saasCoreFallbackDashboard: SaasCoreDashboard = {
  modules: centrixModules,
  metrics: [],
  analytics: [],
  events: [],
  tasks: [],
  connections: []
};
