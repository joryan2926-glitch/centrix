export type ProjectStatus = "planned" | "in_progress" | "waiting" | "completed" | "cancelled";
export type ProjectPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "in_progress" | "review" | "done";

export type Project = {
  id: string;
  title: string;
  description: string;
  category: string;
  client: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress: number;
  budget: number;
  owner: string;
  deadline: string;
  archived: boolean;
};

export type ProjectMember = {
  id: string;
  projectId: string;
  name: string;
  role: string;
  online: boolean;
};

export type ProjectTask = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: ProjectPriority;
  assignee: string;
  dueAt: string;
  estimateHours: number;
  actualHours: number;
  recurring: boolean;
  dependencyId?: string;
};

export type TaskComment = {
  id: string;
  taskId: string;
  author: string;
  content: string;
  createdAt: string;
};

export type TaskChecklist = {
  id: string;
  taskId: string;
  label: string;
  done: boolean;
};

export type ProjectFile = {
  id: string;
  projectId: string;
  name: string;
  type: string;
  sizeMb: number;
  url: string;
  createdAt: string;
};

export type ProjectActivity = {
  id: string;
  projectId: string;
  actor: string;
  action: string;
  createdAt: string;
};

export type ProjectNotification = {
  id: string;
  projectId: string;
  title: string;
  detail: string;
  read: boolean;
  createdAt: string;
};

export type TimeTracking = {
  id: string;
  taskId: string;
  userName: string;
  minutes: number;
  startedAt: string;
  endedAt: string;
};

export type ProjectsData = {
  projects: Project[];
  members: ProjectMember[];
  tasks: ProjectTask[];
  comments: TaskComment[];
  checklists: TaskChecklist[];
  files: ProjectFile[];
  activities: ProjectActivity[];
  notifications: ProjectNotification[];
  timeTracking: TimeTracking[];
};
