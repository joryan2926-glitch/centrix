import type { WorkflowData } from "@/types/workflows";

export const workflowFallbackData: WorkflowData = {
  workflows: [
    { id: "11111111-1111-4111-8111-111111111111", name: "Lead CRM vers devis IA", description: "Score un nouveau lead, cree une tache commerciale et genere un brouillon de devis.", status: "active", runs: 284, successRate: 97, timeSavedHours: 42, owner: "Sales Ops", updatedAt: "2026-05-27T08:10:00.000Z" },
    { id: "22222222-2222-4222-8222-222222222222", name: "Facture payee vers notifications", description: "Notifie finance, met a jour le CRM et archive le recu dans Documents Cloud.", status: "active", runs: 612, successRate: 99, timeSavedHours: 68, owner: "Finance", updatedAt: "2026-05-27T07:45:00.000Z" },
    { id: "33333333-3333-4333-8333-333333333333", name: "Support urgent vers Slack futur", description: "Detecte un ticket urgent, assigne un agent et cree une alerte executive.", status: "paused", runs: 121, successRate: 91, timeSavedHours: 19, owner: "Support", updatedAt: "2026-05-26T16:20:00.000Z" }
  ],
  blocks: [
    { id: "b-1", workflowId: "11111111-1111-4111-8111-111111111111", type: "trigger", label: "Nouveau lead CRM", description: "Declenchement quand un prospect est cree.", positionX: 40, positionY: 120, config: { event: "crm.lead.created" } },
    { id: "b-2", workflowId: "11111111-1111-4111-8111-111111111111", type: "ai", label: "Scoring IA", description: "Analyse potentiel, urgence et fit commercial.", positionX: 330, positionY: 80, config: { model: "sales-score" } },
    { id: "b-3", workflowId: "11111111-1111-4111-8111-111111111111", type: "condition", label: "Score > 80", description: "Filtre les leads haute valeur.", positionX: 620, positionY: 120, config: { threshold: 80 } },
    { id: "b-4", workflowId: "11111111-1111-4111-8111-111111111111", type: "action", label: "Creer devis", description: "Prepare un devis et une tache de relance.", positionX: 910, positionY: 80, config: { module: "billing" } },
    { id: "b-5", workflowId: "11111111-1111-4111-8111-111111111111", type: "notification", label: "Notifier sales", description: "Envoie une alerte au commercial assigne.", positionX: 910, positionY: 210, config: { channel: "dashboard" } },
    { id: "b-6", workflowId: "22222222-2222-4222-8222-222222222222", type: "trigger", label: "Facture payee", description: "Paiement Stripe confirme.", positionX: 60, positionY: 120, config: { event: "invoice.paid" } },
    { id: "b-7", workflowId: "22222222-2222-4222-8222-222222222222", type: "action", label: "MAJ CRM", description: "Met a jour historique client.", positionX: 360, positionY: 120, config: { module: "crm" } }
  ],
  connections: [
    { id: "c-1", workflowId: "11111111-1111-4111-8111-111111111111", sourceId: "b-1", targetId: "b-2" },
    { id: "c-2", workflowId: "11111111-1111-4111-8111-111111111111", sourceId: "b-2", targetId: "b-3" },
    { id: "c-3", workflowId: "11111111-1111-4111-8111-111111111111", sourceId: "b-3", targetId: "b-4", label: "oui" },
    { id: "c-4", workflowId: "11111111-1111-4111-8111-111111111111", sourceId: "b-3", targetId: "b-5", label: "alerte" },
    { id: "c-5", workflowId: "22222222-2222-4222-8222-222222222222", sourceId: "b-6", targetId: "b-7" }
  ],
  runs: [
    { id: "run-1", workflowId: "11111111-1111-4111-8111-111111111111", status: "success", durationMs: 1840, message: "Lead NovaCore score a 92.", createdAt: "2026-05-27T08:10:00.000Z" },
    { id: "run-2", workflowId: "22222222-2222-4222-8222-222222222222", status: "success", durationMs: 930, message: "Paiement synchronise.", createdAt: "2026-05-27T07:45:00.000Z" },
    { id: "run-3", workflowId: "33333333-3333-4333-8333-333333333333", status: "failed", durationMs: 4100, message: "Connecteur Slack futur non configure.", createdAt: "2026-05-26T16:20:00.000Z" }
  ],
  templates: [
    { id: "tpl-1", name: "Nouveau client vers onboarding", category: "crm", description: "Cree dossier, taches, documents et notifications.", blocks: 6 },
    { id: "tpl-2", name: "Facture impayee vers relance", category: "billing", description: "Relance automatique et alerte finance.", blocks: 5 },
    { id: "tpl-3", name: "Post social IA", category: "marketing", description: "Genere, planifie et suit une publication.", blocks: 7 }
  ],
  tasks: [
    { id: "task-1", title: "Relance devis premium", module: "CRM", automated: true, savedMinutes: 18, createdAt: "2026-05-27T08:00:00.000Z" },
    { id: "task-2", title: "Archivage recu Stripe", module: "Documents", automated: true, savedMinutes: 8, createdAt: "2026-05-27T07:44:00.000Z" },
    { id: "task-3", title: "Qualification ticket urgent", module: "Support", automated: false, savedMinutes: 0, createdAt: "2026-05-26T16:12:00.000Z" }
  ],
  alerts: [
    { id: "wa-1", workflowId: "33333333-3333-4333-8333-333333333333", title: "Connecteur a configurer", detail: "Le workflow support attend une integration Slack/Teams.", severity: "warning", createdAt: "2026-05-26T16:21:00.000Z" },
    { id: "wa-2", workflowId: "11111111-1111-4111-8111-111111111111", title: "Performance elevee", detail: "Le scoring IA maintient 97% de succes sur 284 executions.", severity: "info", createdAt: "2026-05-27T08:11:00.000Z" }
  ]
};
