import { projectsFallbackData } from "@/data/projects";
import { getSupabaseClient } from "@/lib/supabase";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";
import type { Project, ProjectTask, ProjectsData } from "@/types/projects";

const storageKey = "centrix-projects-data-v1";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { data: readLocal(), mode: "local" };

  const [projects, members, tasks, comments, checklists, files, activities, notifications, timeTracking] = await Promise.all([
    supabase.from("projects").select("*").eq("workspace_id", workspace.workspaceId).order("due_at", { ascending: true }),
    supabase.from("project_members").select("*"),
    supabase.from("tasks").select("*").eq("workspace_id", workspace.workspaceId).order("due_at", { ascending: true }),
    supabase.from("task_comments").select("*").order("createdAt", { ascending: false }),
    supabase.from("task_checklists").select("*"),
    supabase.from("project_files").select("*"),
    supabase.from("project_activity").select("*").order("createdAt", { ascending: false }),
    supabase.from("project_notifications").select("*").order("createdAt", { ascending: false }),
    supabase.from("time_tracking").select("*").order("startedAt", { ascending: false })
  ]);
  if ([projects, members, tasks, comments, checklists, files, activities, notifications, timeTracking].some((result) => result.error)) return { data: readLocal(), mode: "local" };

  const projectIds = new Set((projects.data ?? []).map((project) => String(project.id)));
  const taskIds = new Set((tasks.data ?? []).map((task) => String(task.id)));

  return {
    data: {
      projects: (projects.data ?? []).map(mapProject),
      members: (members.data ?? []).map(mapProjectMember).filter((member) => projectIds.has(member.projectId)),
      tasks: (tasks.data ?? []).map(mapTask),
      comments: (comments.data ?? []).map(mapTaskComment).filter((comment) => taskIds.has(comment.taskId)),
      checklists: (checklists.data ?? []).map(mapTaskChecklist).filter((item) => taskIds.has(item.taskId)),
      files: (files.data ?? []).map(mapProjectFile).filter((file) => projectIds.has(file.projectId)),
      activities: (activities.data ?? []).map(mapProjectActivity).filter((activity) => projectIds.has(activity.projectId)),
      notifications: (notifications.data ?? []).map(mapProjectNotification).filter((notification) => projectIds.has(notification.projectId)),
      timeTracking: (timeTracking.data ?? []).map(mapTimeTracking).filter((item) => taskIds.has(item.taskId))
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
  const validProjectIds = new Set(data.projects.filter((row) => isUuid(row.id)).map((row) => row.id));
  const validTaskIds = new Set(data.tasks.filter((row) => isUuid(row.id) && validProjectIds.has(row.projectId)).map((row) => row.id));

  const results = await Promise.all([
    ...data.projects.filter((row) => validProjectIds.has(row.id)).map((row) => supabase.from("projects").upsert(toProjectRow(row, workspace.workspaceId, workspace.userId), { onConflict: "id" })),
    ...data.members.filter((row) => validProjectIds.has(row.projectId)).map((row) => supabase.from("project_members").upsert(toProjectMemberRow(row), { onConflict: "id" })),
    ...data.tasks.filter((row) => validTaskIds.has(row.id)).map((row) => supabase.from("tasks").upsert(toTaskRow(row, workspace.workspaceId, workspace.userId), { onConflict: "id" })),
    ...data.comments.filter((row) => validTaskIds.has(row.taskId)).map((row) => supabase.from("task_comments").upsert(toTaskCommentRow(row), { onConflict: "id" })),
    ...data.checklists.filter((row) => validTaskIds.has(row.taskId)).map((row) => supabase.from("task_checklists").upsert(toTaskChecklistRow(row), { onConflict: "id" })),
    ...data.files.filter((row) => validProjectIds.has(row.projectId)).map((row) => supabase.from("project_files").upsert(toProjectFileRow(row), { onConflict: "id" })),
    ...data.activities.filter((row) => validProjectIds.has(row.projectId)).map((row) => supabase.from("project_activity").upsert(toProjectActivityRow(row), { onConflict: "id" })),
    ...data.notifications.filter((row) => validProjectIds.has(row.projectId)).map((row) => supabase.from("project_notifications").upsert(toProjectNotificationRow(row), { onConflict: "id" })),
    ...data.timeTracking.filter((row) => validTaskIds.has(row.taskId)).map((row) => supabase.from("time_tracking").upsert(toTimeTrackingRow(row), { onConflict: "id" }))
  ]);
  return { mode: results.some((result) => result.error) ? "local" as const : "supabase" as const };
}

export async function deleteProjectFromSupabase(projectId: string) {
  const supabase = getSupabaseClient();
  if (!supabase || !isUuid(projectId)) return { mode: "local" as const };
  const { error } = await supabase.from("projects").delete().eq("id", projectId);
  return { mode: error ? "local" as const : "supabase" as const };
}

export async function deleteTaskFromSupabase(taskId: string) {
  const supabase = getSupabaseClient();
  if (!supabase || !isUuid(taskId)) return { mode: "local" as const };
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  return { mode: error ? "local" as const : "supabase" as const };
}

function isUuid(value: string) {
  return uuidPattern.test(value);
}

function mapProject(row: Record<string, unknown>): Project {
  const metadata = (row.metadata ?? {}) as Record<string, unknown>;
  return {
    archived: Boolean(metadata.archived),
    budget: Number(row.budget ?? metadata.budget ?? 0),
    category: String(row.category ?? metadata.category ?? "General"),
    client: String(row.client ?? metadata.client ?? "CENTRIX"),
    deadline: String(row.due_at ?? row.deadline ?? new Date().toISOString()),
    description: String(row.description ?? ""),
    id: String(row.id),
    owner: String(metadata.owner ?? row.owner ?? "Equipe"),
    priority: String(row.priority ?? "medium") as Project["priority"],
    progress: Number(row.progress ?? 0),
    status: String(row.status ?? "planned") as Project["status"],
    title: String(row.name ?? row.title ?? "")
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
    projectId: String(row.project_id ?? row.projectId ?? ""),
    recurring: Boolean(metadata.recurring),
    status: String(row.status ?? "todo") as ProjectTask["status"],
    title: String(row.title ?? "")
  };
}

function mapProjectMember(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    online: Boolean(row.online),
    projectId: String(row.projectId ?? row.project_id ?? ""),
    role: String(row.role ?? "")
  };
}

function mapTaskComment(row: Record<string, unknown>) {
  return {
    author: String(row.author ?? ""),
    content: String(row.content ?? ""),
    createdAt: String(row.createdAt ?? row.created_at ?? new Date().toISOString()),
    id: String(row.id),
    taskId: String(row.taskId ?? row.task_id ?? "")
  };
}

function mapTaskChecklist(row: Record<string, unknown>) {
  return {
    done: Boolean(row.done),
    id: String(row.id),
    label: String(row.label ?? ""),
    taskId: String(row.taskId ?? row.task_id ?? "")
  };
}

function mapProjectFile(row: Record<string, unknown>) {
  return {
    createdAt: String(row.createdAt ?? row.created_at ?? new Date().toISOString()),
    id: String(row.id),
    name: String(row.name ?? ""),
    projectId: String(row.projectId ?? row.project_id ?? ""),
    sizeMb: Number(row.sizeMb ?? row.size_mb ?? 0),
    type: String(row.type ?? ""),
    url: String(row.url ?? "#")
  };
}

function mapProjectActivity(row: Record<string, unknown>) {
  return {
    action: String(row.action ?? ""),
    actor: String(row.actor ?? ""),
    createdAt: String(row.createdAt ?? row.created_at ?? new Date().toISOString()),
    id: String(row.id),
    projectId: String(row.projectId ?? row.project_id ?? "")
  };
}

function mapProjectNotification(row: Record<string, unknown>) {
  return {
    createdAt: String(row.createdAt ?? row.created_at ?? new Date().toISOString()),
    detail: String(row.detail ?? ""),
    id: String(row.id),
    projectId: String(row.projectId ?? row.project_id ?? ""),
    read: Boolean(row.read),
    title: String(row.title ?? "")
  };
}

function mapTimeTracking(row: Record<string, unknown>) {
  return {
    endedAt: String(row.endedAt ?? row.ended_at ?? new Date().toISOString()),
    id: String(row.id),
    minutes: Number(row.minutes ?? 0),
    startedAt: String(row.startedAt ?? row.started_at ?? new Date().toISOString()),
    taskId: String(row.taskId ?? row.task_id ?? ""),
    userName: String(row.userName ?? row.user_name ?? "")
  };
}

function toProjectRow(project: Project, workspaceId: string, userId: string) {
  return {
    description: project.description,
    due_at: project.deadline,
    id: project.id,
    metadata: {
      archived: project.archived,
      category: project.category,
      client: project.client,
      owner: project.owner
    },
    budget: project.budget,
    name: project.title,
    owner_id: userId,
    priority: project.priority,
    progress: project.progress,
    status: project.status,
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

function toProjectMemberRow(row: ProjectsData["members"][number]) {
  return { id: row.id, name: row.name, online: row.online, projectId: row.projectId, role: row.role };
}

function toTaskCommentRow(row: ProjectsData["comments"][number]) {
  return { author: row.author, content: row.content, createdAt: row.createdAt, id: row.id, taskId: row.taskId };
}

function toTaskChecklistRow(row: ProjectsData["checklists"][number]) {
  return { done: row.done, id: row.id, label: row.label, taskId: row.taskId };
}

function toProjectFileRow(row: ProjectsData["files"][number]) {
  return { createdAt: row.createdAt, id: row.id, name: row.name, projectId: row.projectId, sizeMb: row.sizeMb, type: row.type, url: row.url };
}

function toProjectActivityRow(row: ProjectsData["activities"][number]) {
  return { action: row.action, actor: row.actor, createdAt: row.createdAt, id: row.id, projectId: row.projectId };
}

function toProjectNotificationRow(row: ProjectsData["notifications"][number]) {
  return { createdAt: row.createdAt, detail: row.detail, id: row.id, projectId: row.projectId, read: row.read, title: row.title };
}

function toTimeTrackingRow(row: ProjectsData["timeTracking"][number]) {
  return { endedAt: row.endedAt, id: row.id, minutes: row.minutes, startedAt: row.startedAt, taskId: row.taskId, userName: row.userName };
}
