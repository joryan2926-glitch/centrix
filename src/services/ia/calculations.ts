import type { AiAutomationData, AiConversation, AiGeneration, AiMessage, AiNotification, AiTemplate, Workflow, WorkflowAction, WorkflowStep, WorkflowTrigger } from "@/types/ia";

export const triggerLabels: Record<WorkflowTrigger, string> = {
  new_client: "Nouveau client",
  invoice_paid: "Facture payee",
  meeting_created: "Rendez-vous cree",
  new_lead: "Nouveau lead",
  email_received: "Email recu"
};

export const actionLabels: Record<WorkflowAction, string> = {
  send_notification: "Envoyer notification",
  create_task: "Creer tache",
  send_email: "Envoyer email",
  create_invoice: "Creer facture",
  update_crm: "Mettre a jour CRM",
  generate_document: "Generer document"
};

export function estimateTokens(text: string) {
  return Math.max(1, Math.ceil(text.length / 4));
}

export function getAiDashboard(data: AiAutomationData) {
  const activeWorkflows = data.workflows.filter((workflow) => workflow.active);
  const runs = data.workflows.reduce((sum, workflow) => sum + workflow.runs, 0);
  const timeSaved = data.workflows.reduce((sum, workflow) => sum + workflow.timeSavedHours, 0);
  const tokensUsed = data.conversations.reduce((sum, conversation) => sum + conversation.tokensUsed, 0);
  const successRate = data.workflows.length
    ? Math.round(data.workflows.reduce((sum, workflow) => sum + workflow.successRate, 0) / data.workflows.length)
    : 0;

  return {
    conversations: data.conversations.length,
    generations: data.generations.length,
    activeWorkflows: activeWorkflows.length,
    runs,
    successRate,
    timeSaved,
    tokensUsed,
    notifications: data.notifications.length
  };
}

export function createConversation(title: string): AiConversation {
  const now = new Date().toISOString();
  return {
    id: `conv-${crypto.randomUUID()}`,
    title,
    model: "mistral-large-latest",
    tokensUsed: 0,
    createdAt: now,
    updatedAt: now
  };
}

export function createMessage(conversationId: string, role: AiMessage["role"], content: string): AiMessage {
  return {
    id: `msg-${crypto.randomUUID()}`,
    conversationId,
    role,
    content,
    tokens: estimateTokens(content),
    createdAt: new Date().toISOString()
  };
}

export function createGeneration(template: AiTemplate, output: string): AiGeneration {
  return {
    id: `gen-${crypto.randomUUID()}`,
    templateId: template.id,
    title: template.title,
    output,
    category: template.category,
    createdAt: new Date().toISOString()
  };
}

export function createNotification(title: string, detail: string, severity: AiNotification["severity"] = "info"): AiNotification {
  return {
    id: `notif-${crypto.randomUUID()}`,
    title,
    detail,
    severity,
    createdAt: new Date().toISOString()
  };
}

export function createAutomationWorkflow(): { workflow: Workflow; steps: WorkflowStep[] } {
  const now = new Date().toISOString();
  const workflowId = crypto.randomUUID();
  return {
    workflow: {
      id: workflowId,
      name: "Nouveau scenario IA",
      description: "Workflow no-code pret a connecter a un declencheur CENTRIX.",
      active: false,
      trigger: "new_lead",
      runs: 0,
      successRate: 100,
      timeSavedHours: 0,
      createdAt: now,
      updatedAt: now
    },
    steps: [
      {
        id: `step-${crypto.randomUUID()}`,
        workflowId,
        type: "trigger",
        label: "Declencheur",
        action: null,
        positionX: 40,
        positionY: 120,
        order: 1
      },
      {
        id: `step-${crypto.randomUUID()}`,
        workflowId,
        type: "action",
        label: "Action automatique",
        action: "send_notification",
        positionX: 300,
        positionY: 120,
        order: 2
      }
    ]
  };
}

export function buildAiInsights(data: AiAutomationData) {
  const bestWorkflow = [...data.workflows].sort((a, b) => b.timeSavedHours - a.timeSavedHours)[0];

  return [
    {
      title: "Pipeline commercial",
      detail: "Les leads entrants peuvent etre scores puis assignes automatiquement sous 2 minutes.",
      tone: "cyan"
    },
    {
      title: "Optimisation operations",
      detail: bestWorkflow ? `${bestWorkflow.name} economise deja ${bestWorkflow.timeSavedHours}h.` : "Activez un workflow pour mesurer le temps gagne.",
      tone: "emerald"
    },
    {
      title: "Controle des couts IA",
      detail: `${tokensUsedLabel(data)} consommes sur les conversations, a suivre par equipe.`,
      tone: "violet"
    }
  ] as const;
}

function tokensUsedLabel(data: AiAutomationData) {
  const tokens = data.conversations.reduce((sum, conversation) => sum + conversation.tokensUsed, 0);
  return new Intl.NumberFormat("fr-FR").format(tokens);
}
