import { projectsFallbackData } from "@/data/projects";
import { getSupabaseClient } from "@/lib/supabase";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";
import type { Project, ProjectTask, ProjectsData } from "@/types/projects";

const storageKey = "centrix-projects-data-v1";

function readLocal(): ProjectsData {
  if (typeof window === "undefined") return projectsFallbackData;
  const local = window.localStorage.getItem(storageKey);
  return local ? JSON.parse(local) : projectsFallbackData;
}

function writeLocal(data: ProjectsData) {
  if (typeof window !== "undefined") window.localStorage.setItem(storageKey, JSON.stringify(data));
}

export async function loadProjectsData(): Promise<{ data: ProjectsData; mode: "local" | "supabase" }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: readLocal(), mode: "local" };
  const [projects, members, tasks, comments, checklists, files, activities, notifications, timeTracking] = await Promise.all([
    supabase.from("projects").select("*").order("due_at", { ascending: true }),
    supabase.from("project_members").select("*"),
    supabase.from("tasks").select("*").order("due_at", { ascending: true }),
    supabase.from("task_comments").select("*").order("createdAt", { ascending: false }),
    supabase.from("task_checklists").select("*"),
    supabase.from("project_files").select("*"),
    supabase.from("project_activity").select("*").order("createdAt", { ascending: false }),
    supabase.from("project_notifications").select("*").order("createdAt", { ascending: false }),
    supabase.from("time_tracking").select("*").order("startedAt", { ascending: false })
  ]);
  if ([projects, members, tasks, comments, checklists, files, activities, notifications, timeTracking].some((result) => result.error)) return { data: readLocal(), mode: "local" };
  return {
    data: {
      projects: (projects.data ?? []).map(mapProject),
      members: members.data ?? [],
      tasks: (tasks.data ?? []).map(mapTask),
      comments: comments.data ?? [],
      checklists: checklists.data ?? [],
      files: files.data ?? [],
      activities: activities.data ?? [],
      notifications: notifications.data ?? [],
      timeTracking: timeTracking.data ?? []
    },
    mode: "supabase"
  };
}

export async function saveProjectsData(data: ProjectsData) {
  writeLocal(data);
}

export async function syncProjectsData(data: ProjectsData) {
  writeLocal(data);
  const supabase = getSupabaseClient();
  if (!supabase) return { mode: "local" as const };
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { mode: "local" as const };

  const results = await Promise.all([
    ...data.projects.map((row) => supabase.from("projects").upsert(toProjectRow(row, workspace.workspaceId, workspace.userId), { onConflict: "id" })),
    ...data.members.map((row) => supabase.from("project_members").upsert(row, { onConflict: "id" })),
    ...data.tasks.map((row) => supabase.from("tasks").upsert(toTaskRow(row, workspace.workspaceId, workspace.userId), { onConflict: "id" })),
    ...data.comments.map((row) => supabase.from("task_comments").upsert(row, { onConflict: "id" })),
    ...data.checklists.map((row) => supabase.from("task_checklists").upsert(row, { onConflict: "id" })),
    ...data.files.map((row) => supabase.from("project_files").upsert(row, { onConflict: "id" })),
    ...data.activities.map((row) => supabase.from("project_activity").upsert(row, { onConflict: "id" })),
    ...data.notifications.map((row) => supabase.from("project_notifications").upsert(row, { onConflict: "id" })),
    ...data.timeTracking.map((row) => supabase.from("time_tracking").upsert(row, { onConflict: "id" }))
  ]);
  return { mode: results.some((result) => result.error) ? "local" as const : "supabase" as const };
}

function mapProject(row: Record<string, unknown>): Project {
  const metadata = (row.metadata ?? {}) as Record<string, unknown>;
  return {
    archived: Boolean(metadata.archived),
    budget: Number(metadata.budget ?? 0),
    category: String(metadata.category ?? "General"),
    client: String(metadata.client ?? "CENTRIX"),
    deadline: String(row.due_at ?? new Date().toISOString()),
    description: String(row.description ?? ""),
    id: String(row.id),
    owner: String(metadata.owner ?? "Equipe"),
    priority: String(row.priority ?? "medium") as Project["priority"],
    progress: Number(row.progress ?? 0),
    status: String(row.status ?? "planned") as Project["status"],
    title: String(row.title ?? "")
  };
}

function mapTask(row: Record<string, unknown>): ProjectTask {
  const metadata = (row.metadata ?? {}) as Record<string, unknown>;
  return {
    actualHours: Number(metadata.actualHours ?? 0),
    assignee: String(metadata.assignee ?? "Equipe"),
    dependencyId: metadata.dependencyId ? String(metadata.dependencyId) : undefined,
    description: String(row.description ?? ""),
    dueAt: String(row.due_at ?? new Date().toISOString()),
    estimateHours: Number(metadata.estimateHours ?? 0),
    id: String(row.id),
    priority: String(row.priority ?? "medium") as ProjectTask["priority"],
    projectId: String(row.project_id ?? ""),
    recurring: Boolean(metadata.recurring),
    status: String(row.status ?? "todo") as ProjectTask["status"],
    title: String(row.title ?? "")
  };
}

function toProjectRow(project: Project, workspaceId: string, userId: string) {
  return {
    created_by: userId,
    description: project.description,
    due_at: project.deadline,
    id: project.id,
    metadata: {
      archived: project.archived,
      budget: project.budget,
      category: project.category,
      client: project.client,
      owner: project.owner
    },
    priority: project.priority,
    progress: project.progress,
    status: project.status,
    title: project.title,
    workspace_id: workspaceId
  };
}

function toTaskRow(task: ProjectTask, workspaceId: string, userId: string) {
  return {
    created_by: userId,
    description: task.description,
    due_at: task.dueAt,
    id: task.id,
    metadata: {
      actualHours: task.actualHours,
      assignee: task.assignee,
      dependencyId: task.dependencyId,
      estimateHours: task.estimateHours,
      recurring: task.recurring
    },
    priority: task.priority,
    project_id: task.projectId,
    status: task.status,
    title: task.title,
    workspace_id: workspaceId
  };
}
