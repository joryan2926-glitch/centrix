import type { AiAutomationData } from "@/types/ia";

export const aiAutomationFallbackData: AiAutomationData = {
  conversations: [
    {
      id: "conv-board",
      title: "Synthese business hebdo",
      model: "gpt-5.1",
      tokensUsed: 1840,
      createdAt: "2026-05-24T08:00:00.000Z",
      updatedAt: "2026-05-26T09:00:00.000Z"
    }
  ],
  messages: [
    { id: "msg-1", conversationId: "conv-board", role: "user", content: "Resume les priorites business de la semaine.", tokens: 32, createdAt: "2026-05-26T09:00:00.000Z" },
    { id: "msg-2", conversationId: "conv-board", role: "assistant", content: "Priorites: accelerer les relances CRM, valider la TVA de mai, finaliser deux automatisations de facturation.", tokens: 94, createdAt: "2026-05-26T09:00:10.000Z" }
  ],
  templates: [
    { id: "tpl-email", category: "sales", title: "Redaction email commercial", prompt: "Redige un email commercial clair, court et oriente valeur.", favorite: true },
    { id: "tpl-quote", category: "finance", title: "Generation devis", prompt: "Structure un devis SaaS avec lignes, options et conditions.", favorite: false },
    { id: "tpl-contract", category: "legal", title: "Generation contrat", prompt: "Redige une trame contractuelle professionnelle a valider juridiquement.", favorite: false },
    { id: "tpl-post", category: "marketing", title: "Post reseaux sociaux", prompt: "Genere 3 variantes de posts LinkedIn avec hook et CTA.", favorite: true },
    { id: "tpl-meeting", category: "productivity", title: "Resume reunion", prompt: "Resume cette reunion en decisions, risques et prochaines actions.", favorite: false },
    { id: "tpl-business-plan", category: "strategy", title: "Business plan", prompt: "Genere un business plan structure pour un SaaS B2B.", favorite: false },
    { id: "tpl-invoice", category: "finance", title: "Generation facture", prompt: "Prepare une facture professionnelle avec TVA, echeance et conditions de paiement.", favorite: false },
    { id: "tpl-crm-score", category: "crm", title: "Scoring prospect IA", prompt: "Analyse ce prospect, attribue un score sur 100 et recommande la prochaine action commerciale.", favorite: true },
    { id: "tpl-tasks", category: "productivity", title: "Generation taches", prompt: "Transforme ce contexte en taches priorisees avec responsables, echeances et risques.", favorite: false },
    { id: "tpl-ideas", category: "strategy", title: "Idees business", prompt: "Propose 10 idees business actionnables avec impact, effort et risques.", favorite: false }
  ],
  generations: [
    { id: "gen-1", templateId: "tpl-post", title: "Post lancement Finance OS", output: "Annonce LinkedIn prete pour validation marketing.", category: "marketing", createdAt: "2026-05-25T10:00:00.000Z" }
  ],
  workflows: [
    { id: "wf-paid-invoice", name: "Facture payee -> CRM", description: "Met a jour le compte client, cree une tache CSM et notifie finance.", active: true, trigger: "invoice_paid", runs: 128, successRate: 98, timeSavedHours: 42, createdAt: "2026-05-01T08:00:00.000Z", updatedAt: "2026-05-26T08:00:00.000Z" },
    { id: "wf-new-lead", name: "Nouveau lead -> Scoring IA", description: "Score le lead, recommande une action et cree un rappel commercial.", active: true, trigger: "new_lead", runs: 284, successRate: 94, timeSavedHours: 61, createdAt: "2026-05-04T08:00:00.000Z", updatedAt: "2026-05-26T08:00:00.000Z" }
  ],
  workflowSteps: [
    { id: "step-1", workflowId: "wf-paid-invoice", type: "trigger", label: "Facture payee", action: null, positionX: 40, positionY: 80, order: 1 },
    { id: "step-2", workflowId: "wf-paid-invoice", type: "condition", label: "Montant > 5K", action: null, positionX: 260, positionY: 80, order: 2 },
    { id: "step-3", workflowId: "wf-paid-invoice", type: "action", label: "Notifier CSM", action: "send_notification", positionX: 500, positionY: 80, order: 3 },
    { id: "step-4", workflowId: "wf-new-lead", type: "trigger", label: "Nouveau lead", action: null, positionX: 40, positionY: 190, order: 1 },
    { id: "step-5", workflowId: "wf-new-lead", type: "action", label: "Scoring IA", action: "update_crm", positionX: 260, positionY: 190, order: 2 },
    { id: "step-6", workflowId: "wf-new-lead", type: "action", label: "Creer rappel", action: "create_task", positionX: 500, positionY: 190, order: 3 }
  ],
  automationLogs: [
    { id: "log-1", workflowId: "wf-paid-invoice", status: "success", message: "Compte NovaCore mis a jour.", createdAt: "2026-05-26T08:40:00.000Z" },
    { id: "log-2", workflowId: "wf-new-lead", status: "success", message: "Lead Blue Atlas score 82/100.", createdAt: "2026-05-26T08:10:00.000Z" }
  ],
  notifications: [
    { id: "notif-1", title: "Action commerciale recommandee", detail: "Relancer Orion Cloud avant vendredi: probabilite de closing elevee.", severity: "warning", createdAt: "2026-05-26T08:30:00.000Z" },
    { id: "notif-2", title: "Automatisation performante", detail: "Le workflow facture payee a economise 42h ce mois-ci.", severity: "success", createdAt: "2026-05-25T17:00:00.000Z" }
  ]
};
