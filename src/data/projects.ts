import type { ProjectsData } from "@/types/projects";

export const projectsFallbackData: ProjectsData = {
  projects: [
    { id: "proj-1", title: "Refonte portail client", description: "Nouvelle experience self-service pour comptes premium.", category: "Produit", client: "NovaCore", status: "in_progress", priority: "high", progress: 68, budget: 48000, owner: "Nadia", deadline: "2026-06-20T18:00:00.000Z", archived: false },
    { id: "proj-2", title: "Automatisation finance", description: "Synchronisation facturation, comptabilite et relances.", category: "Ops", client: "Blue Atlas", status: "planned", priority: "urgent", progress: 28, budget: 32000, owner: "Thomas", deadline: "2026-06-05T18:00:00.000Z", archived: false },
    { id: "proj-3", title: "Campagne lancement IA", description: "Plan marketing multicanal et contenus generes par IA.", category: "Marketing", client: "CENTRIX", status: "waiting", priority: "medium", progress: 45, budget: 18000, owner: "Sarah", deadline: "2026-07-01T18:00:00.000Z", archived: false }
  ],
  members: [
    { id: "mem-1", projectId: "proj-1", name: "Nadia", role: "Lead", online: true },
    { id: "mem-2", projectId: "proj-1", name: "Malik", role: "Design", online: true },
    { id: "mem-3", projectId: "proj-2", name: "Thomas", role: "Finance Ops", online: false },
    { id: "mem-4", projectId: "proj-3", name: "Sarah", role: "Growth", online: true }
  ],
  tasks: [
    { id: "task-1", projectId: "proj-1", title: "Maquettes dashboard client", description: "Finaliser vues mobile et desktop.", status: "in_progress", priority: "high", assignee: "Malik", dueAt: "2026-05-30T18:00:00.000Z", estimateHours: 18, actualHours: 10, recurring: false },
    { id: "task-2", projectId: "proj-1", title: "API historique tickets", description: "Relier support et espace client.", status: "review", priority: "medium", assignee: "Nadia", dueAt: "2026-06-03T18:00:00.000Z", estimateHours: 12, actualHours: 13, recurring: false, dependencyId: "task-1" },
    { id: "task-3", projectId: "proj-2", title: "Mapping regles relance", description: "Definir statuts et automatisations.", status: "todo", priority: "urgent", assignee: "Thomas", dueAt: "2026-05-29T18:00:00.000Z", estimateHours: 8, actualHours: 2, recurring: false },
    { id: "task-4", projectId: "proj-3", title: "Calendrier editorial", description: "Planifier posts LinkedIn et email.", status: "done", priority: "medium", assignee: "Sarah", dueAt: "2026-05-27T18:00:00.000Z", estimateHours: 6, actualHours: 5, recurring: true }
  ],
  comments: [
    { id: "com-1", taskId: "task-1", author: "Nadia", content: "@Malik garde la variante claire pour la demo.", createdAt: "2026-05-27T08:00:00.000Z" },
    { id: "com-2", taskId: "task-3", author: "Thomas", content: "Besoin validation juridique avant activation.", createdAt: "2026-05-26T17:30:00.000Z" }
  ],
  checklists: [
    { id: "chk-1", taskId: "task-1", label: "Desktop", done: true },
    { id: "chk-2", taskId: "task-1", label: "Mobile", done: false },
    { id: "chk-3", taskId: "task-3", label: "Scenario impaye", done: false }
  ],
  files: [
    { id: "file-1", projectId: "proj-1", name: "wireframes-client.pdf", type: "PDF", sizeMb: 4.2, url: "#", createdAt: "2026-05-26T13:00:00.000Z" },
    { id: "file-2", projectId: "proj-2", name: "relances.xlsx", type: "XLSX", sizeMb: 1.1, url: "#", createdAt: "2026-05-25T10:00:00.000Z" }
  ],
  activities: [
    { id: "act-1", projectId: "proj-1", actor: "Nadia", action: "a deplace API historique tickets en revue", createdAt: "2026-05-27T09:10:00.000Z" },
    { id: "act-2", projectId: "proj-3", actor: "Sarah", action: "a termine Calendrier editorial", createdAt: "2026-05-27T07:30:00.000Z" }
  ],
  notifications: [
    { id: "not-1", projectId: "proj-2", title: "Deadline proche", detail: "Mapping regles relance arrive a echeance.", read: false, createdAt: "2026-05-27T09:00:00.000Z" },
    { id: "not-2", projectId: "proj-1", title: "Commentaire ajoute", detail: "Nouvelle mention sur Maquettes dashboard client.", read: true, createdAt: "2026-05-27T08:05:00.000Z" }
  ],
  timeTracking: [
    { id: "time-1", taskId: "task-1", userName: "Malik", minutes: 240, startedAt: "2026-05-27T08:00:00.000Z", endedAt: "2026-05-27T12:00:00.000Z" },
    { id: "time-2", taskId: "task-4", userName: "Sarah", minutes: 300, startedAt: "2026-05-26T10:00:00.000Z", endedAt: "2026-05-26T15:00:00.000Z" }
  ]
};
