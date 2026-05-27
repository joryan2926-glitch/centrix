import type { Project, ProjectStatus, ProjectsData, TaskStatus } from "@/types/projects";

export const statusLabels: Record<ProjectStatus, string> = {
  planned: "planifie",
  in_progress: "en cours",
  waiting: "en attente",
  completed: "termine",
  cancelled: "annule"
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  todo: "A faire",
  in_progress: "En cours",
  review: "Revue",
  done: "Termine"
};

export function getProjectsDashboard(data: ProjectsData) {
  const now = Date.now();
  const activeProjects = data.projects.filter((project) => !project.archived && project.status !== "completed" && project.status !== "cancelled");
  const doneTasks = data.tasks.filter((task) => task.status === "done");
  const lateTasks = data.tasks.filter((task) => task.status !== "done" && new Date(task.dueAt).getTime() < now);
  const estimated = data.tasks.reduce((sum, task) => sum + task.estimateHours, 0);
  const actual = data.tasks.reduce((sum, task) => sum + task.actualHours, 0);
  return {
    activeProjects: activeProjects.length,
    completedTasks: doneTasks.length,
    lateTasks: lateTasks.length,
    productivity: estimated ? Math.min(100, Math.round((estimated / Math.max(actual, 1)) * 80)) : 0,
    estimatedHours: estimated,
    globalProgress: data.projects.length ? Math.round(data.projects.reduce((sum, project) => sum + project.progress, 0) / data.projects.length) : 0
  };
}

export function createProject(): Project {
  return {
    id: `proj-${Date.now()}`,
    title: "Nouveau projet",
    description: "Projet pret a configurer.",
    category: "General",
    client: "CENTRIX",
    status: "planned",
    priority: "medium",
    progress: 0,
    budget: 12000,
    owner: "Equipe",
    deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
    archived: false
  };
}
