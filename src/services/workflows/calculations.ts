import type { BlockType, Workflow, WorkflowBlock, WorkflowData } from "@/types/workflows";

export const blockLabels: Record<BlockType, string> = {
  trigger: "Declencheur",
  action: "Action",
  condition: "Condition",
  delay: "Delai",
  ai: "IA",
  notification: "Notification",
  filter: "Filtre"
};

export function getWorkflowDashboard(data: WorkflowData) {
  const active = data.workflows.filter((workflow) => workflow.status === "active");
  const errors = data.runs.filter((run) => run.status === "failed");
  return {
    activeWorkflows: active.length,
    runs: data.runs.length,
    timeSaved: data.workflows.reduce((sum, workflow) => sum + workflow.timeSavedHours, 0),
    errors: errors.length,
    automatedTasks: data.tasks.filter((task) => task.automated).length,
    productivity: active.length ? active.reduce((sum, workflow) => sum + workflow.successRate, 0) / active.length : 0
  };
}

export function createWorkflow(): Workflow {
  return {
    id: crypto.randomUUID(),
    name: "Nouveau workflow",
    description: "Scenario no-code pret a configurer.",
    status: "draft",
    runs: 0,
    successRate: 100,
    timeSavedHours: 0,
    owner: "Ops",
    updatedAt: new Date().toISOString()
  };
}

export function createBlock(workflowId: string, type: BlockType): WorkflowBlock {
  return {
    id: `block-${crypto.randomUUID()}`,
    workflowId,
    type,
    label: blockLabels[type],
    description: "Bloc ajoute au canvas.",
    positionX: 160 + Math.round(Math.random() * 380),
    positionY: 100 + Math.round(Math.random() * 220),
    config: {}
  };
}
