"use client";

import dynamic from "next/dynamic";
import { Bell, CalendarDays, CheckCircle2, Clock3, FileUp, FolderKanban, GanttChartSquare, Pencil, Plus, Save, Search, Timer, Trash2, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import { formatProjectCurrency, formatProjectDate } from "@/lib/projects/format";
import { createProject, createTask, getProjectsDashboard, statusLabels, taskStatusLabels } from "@/services/projects/calculations";
import { useProjectsData } from "@/hooks/projects/useProjectsData";
import { ProjectKpiCard } from "@/ui/projects/ProjectKpiCard";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Skeleton } from "@/ui/Skeleton";
import { Toast } from "@/ui/Toast";
import type { Project, ProjectPriority, ProjectStatus, ProjectTask, TaskStatus } from "@/types/projects";

const ProjectCharts = dynamic(() => import("@/components/projects/ProjectCharts").then((module) => module.ProjectCharts), { loading: () => <Skeleton className="h-80" />, ssr: false });
const ProjectFlow = dynamic(() => import("@/components/projects/ProjectFlow").then((module) => module.ProjectFlow), { loading: () => <Skeleton className="h-[520px]" />, ssr: false });

const views = ["dashboard", "projects", "kanban", "list", "calendar", "gantt", "team", "time", "files", "notifications"] as const;
type View = (typeof views)[number];
const columns: TaskStatus[] = ["todo", "in_progress", "review", "done"];

export function ProjectsWorkspace({ initialView = "dashboard" }: { initialView?: View }) {
  const { data, deleteProject, deleteTask, loading, mode, toast, mutate, sync } = useProjectsData();
  const [view, setView] = useState<View>(initialView);
  const [query, setQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const dashboard = useMemo(() => getProjectsDashboard(data), [data]);
  const filteredProjects = data.projects.filter((project) => [project.title, project.client, project.category].join(" ").toLowerCase().includes(query.toLowerCase()));
  const activeProjectId = selectedProjectId || data.projects[0]?.id || "";
  const activeProject = data.projects.find((project) => project.id === activeProjectId) ?? data.projects[0];

  function addProject() {
    const project = createProject();
    setSelectedProjectId(project.id);
    mutate((current) => ({
      ...current,
      activities: [buildActivity(project.id, "CENTRIX", `a cree le projet ${project.title}`), ...current.activities],
      projects: [project, ...current.projects]
    }), { title: "Projet cree", detail: "Nouveau projet ajoute au portefeuille." });
  }

  function addTask() {
    if (!activeProjectId) {
      addProject();
      return;
    }
    const task = createTask(activeProjectId);
    mutate((current) => ({
      ...current,
      activities: [buildActivity(activeProjectId, "CENTRIX", `a cree la tache ${task.title}`), ...current.activities],
      tasks: [task, ...current.tasks]
    }), { title: "Tache creee", detail: "La tache est ajoutee au Kanban et synchronisee." });
  }

  function updateProject(projectId: string, patch: Partial<Project>) {
    mutate((current) => ({
      ...current,
      projects: current.projects.map((project) => project.id === projectId ? { ...project, ...patch } : project)
    }));
  }

  function updateTask(taskId: string, patch: Partial<ProjectTask>) {
    mutate((current) => ({
      ...current,
      tasks: current.tasks.map((task) => task.id === taskId ? { ...task, ...patch } : task)
    }));
  }

  async function removeProject(projectId: string) {
    if (!window.confirm("Supprimer ce projet et ses taches ?")) return;
    await deleteProject(projectId);
    mutate((current) => {
      const removedTaskIds = new Set(current.tasks.filter((task) => task.projectId === projectId).map((task) => task.id));
      return {
        ...current,
        activities: current.activities.filter((activity) => activity.projectId !== projectId),
        checklists: current.checklists.filter((item) => !removedTaskIds.has(item.taskId)),
        comments: current.comments.filter((comment) => !removedTaskIds.has(comment.taskId)),
        files: current.files.filter((file) => file.projectId !== projectId),
        members: current.members.filter((member) => member.projectId !== projectId),
        notifications: current.notifications.filter((notification) => notification.projectId !== projectId),
        projects: current.projects.filter((project) => project.id !== projectId),
        tasks: current.tasks.filter((task) => task.projectId !== projectId),
        timeTracking: current.timeTracking.filter((item) => !removedTaskIds.has(item.taskId))
      };
    }, { title: "Projet supprime", detail: "Le portefeuille et Supabase sont mis a jour." });
    if (selectedProjectId === projectId) setSelectedProjectId("");
  }

  async function removeTask(taskId: string) {
    if (!window.confirm("Supprimer cette tache ?")) return;
    await deleteTask(taskId);
    mutate((current) => ({
      ...current,
      checklists: current.checklists.filter((item) => item.taskId !== taskId),
      comments: current.comments.filter((comment) => comment.taskId !== taskId),
      tasks: current.tasks.filter((task) => task.id !== taskId),
      timeTracking: current.timeTracking.filter((item) => item.taskId !== taskId)
    }), { title: "Tache supprimee", detail: "La tache a ete retiree du Kanban." });
  }

  function moveTask(taskId: string, status: TaskStatus) {
    mutate((current) => ({
      ...current,
      activities: [buildActivity(current.tasks.find((task) => task.id === taskId)?.projectId ?? "", "CENTRIX", `a deplace une tache vers ${taskStatusLabels[status]}`), ...current.activities],
      tasks: current.tasks.map((task) => task.id === taskId ? { ...task, status } : task)
    }));
  }

  if (loading) return <div className="mx-auto max-w-7xl space-y-6 animate-fade-in"><Skeleton className="h-36" /><Skeleton className="h-[560px]" /></div>;

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      {toast ? <Toast {...toast} /> : null}
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Badge tone="cyan">Project OS</Badge>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">Gestion de Projets & Productivite</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">Pilotage projets, Kanban, deadlines, temps, collaboration, fichiers et dependances dans une interface premium type Linear/Monday.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={addProject}><Plus size={17} /> Projet</Button>
            <Button onClick={addTask} variant="surface"><Plus size={17} /> Tache</Button>
            <Button onClick={sync} variant="primary"><Save size={17} /> Sync {mode}</Button>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <ProjectKpiCard delta="portfolio" icon={<FolderKanban size={19} />} label="Projets actifs" value={String(dashboard.activeProjects)} />
        <ProjectKpiCard delta="done" icon={<CheckCircle2 size={19} />} label="Taches terminees" value={String(dashboard.completedTasks)} />
        <ProjectKpiCard delta="deadline" icon={<CalendarDays size={19} />} label="Taches en retard" value={String(dashboard.lateTasks)} />
        <ProjectKpiCard delta="equipe" icon={<UsersRound size={19} />} label="Productivite" value={`${dashboard.productivity}%`} />
        <ProjectKpiCard delta="estime" icon={<Timer size={19} />} label="Temps estime" value={`${dashboard.estimatedHours}h`} />
        <ProjectKpiCard delta="global" icon={<GanttChartSquare size={19} />} label="Progression" value={`${dashboard.globalProgress}%`} />
      </section>

      <div className="flex gap-2 overflow-x-auto rounded-[14px] border border-slate-200 bg-white/70 p-1 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
        {views.map((item) => <button key={item} className={`h-10 shrink-0 rounded-[12px] px-3 text-sm font-semibold capitalize transition-all ${view === item ? "bg-blue-600 text-white shadow-[0_12px_28px_rgba(37,99,235,0.22)]" : "text-slate-500 hover:bg-blue-50 hover:text-blue-700"}`} onClick={() => setView(item)}>{item}</button>)}
      </div>

      {view === "dashboard" ? <><ProjectCharts data={data} /><Activity data={data} /></> : null}
      {view === "projects" ? <ProjectsView projects={filteredProjects} query={query} removeProject={removeProject} selectedProjectId={activeProject?.id ?? ""} setQuery={setQuery} setSelectedProjectId={setSelectedProjectId} updateProject={updateProject} /> : null}
      {view === "kanban" ? <Kanban moveTask={moveTask} removeTask={removeTask} tasks={data.tasks} updateTask={updateTask} /> : null}
      {view === "list" ? <TasksTable data={data} removeTask={removeTask} updateTask={updateTask} /> : null}
      {view === "calendar" ? <CalendarView tasks={data.tasks} /> : null}
      {view === "gantt" ? <ProjectFlow tasks={data.tasks} /> : null}
      {view === "team" ? <TeamView data={data} /> : null}
      {view === "time" ? <TimeView data={data} /> : null}
      {view === "files" ? <FilesView data={data} /> : null}
      {view === "notifications" ? <NotificationsView data={data} /> : null}
    </div>
  );
}

function ProjectsView({ projects, query, removeProject, selectedProjectId, setQuery, setSelectedProjectId, updateProject }: { projects: Project[]; query: string; removeProject: (projectId: string) => void; selectedProjectId: string; setQuery: (value: string) => void; setSelectedProjectId: (value: string) => void; updateProject: (projectId: string, patch: Partial<Project>) => void }) {
  const selected = projects.find((project) => project.id === selectedProjectId) ?? projects[0];
  return (
    <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <Card className="p-5">
        <div className="flex h-11 max-w-md items-center gap-2 rounded-[14px] border border-slate-200 bg-white px-3 text-sm text-slate-500">
          <Search size={16} />
          <input className="w-full bg-transparent outline-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher projets" />
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {projects.map((project) => (
            <button key={project.id} className="text-left" onClick={() => setSelectedProjectId(project.id)}>
              <Card interactive className={`p-4 ${selected?.id === project.id ? "ring-2 ring-blue-500/40" : ""}`}>
                <div className="flex items-center justify-between gap-3">
                  <Badge tone={project.priority === "urgent" ? "rose" : project.priority === "high" ? "violet" : "cyan"}>{statusLabels[project.status]}</Badge>
                  <span className="text-xs font-bold text-slate-400">{project.progress}%</span>
                </div>
                <p className="mt-3 font-bold text-slate-950">{project.title}</p>
                <p className="mt-2 line-clamp-2 text-sm text-slate-500">{project.description}</p>
                <p className="mt-3 text-sm font-semibold text-blue-700">{formatProjectCurrency(project.budget)} - {project.client}</p>
                <div className="mt-4 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400" style={{ width: `${project.progress}%` }} /></div>
                <p className="mt-2 text-xs text-slate-400">Deadline {formatProjectDate(project.deadline)}</p>
              </Card>
            </button>
          ))}
        </div>
      </Card>
      {selected ? <ProjectEditor project={selected} removeProject={removeProject} updateProject={updateProject} /> : <EmptyState title="Aucun projet" detail="Cree un projet pour commencer la recette fonctionnelle." />}
    </div>
  );
}

function ProjectEditor({ project, removeProject, updateProject }: { project: Project; removeProject: (projectId: string) => void; updateProject: (projectId: string, patch: Partial<Project>) => void }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div><Badge tone="cyan">Edition</Badge><h2 className="mt-3 font-black text-slate-950">Fiche projet</h2></div>
        <Button variant="ghost" onClick={() => removeProject(project.id)}><Trash2 size={16} /> Supprimer</Button>
      </div>
      <div className="mt-5 grid gap-3">
        <Field label="Titre" value={project.title} onChange={(value) => updateProject(project.id, { title: value })} />
        <Field label="Client" value={project.client} onChange={(value) => updateProject(project.id, { client: value })} />
        <Field label="Categorie" value={project.category} onChange={(value) => updateProject(project.id, { category: value })} />
        <Field label="Budget" type="number" value={String(project.budget)} onChange={(value) => updateProject(project.id, { budget: Number(value) })} />
        <Field label="Progression" max={100} min={0} type="number" value={String(project.progress)} onChange={(value) => updateProject(project.id, { progress: Math.max(0, Math.min(100, Number(value))) })} />
        <SelectField label="Statut" value={project.status} options={Object.keys(statusLabels)} onChange={(value) => updateProject(project.id, { status: value as ProjectStatus })} />
        <SelectField label="Priorite" value={project.priority} options={["low", "medium", "high", "urgent"]} onChange={(value) => updateProject(project.id, { priority: value as ProjectPriority })} />
      </div>
    </Card>
  );
}

function Kanban({ moveTask, removeTask, tasks, updateTask }: { moveTask: (taskId: string, status: TaskStatus) => void; removeTask: (taskId: string) => void; tasks: ProjectTask[]; updateTask: (taskId: string, patch: Partial<ProjectTask>) => void }) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  return (
    <section className="grid gap-3 xl:grid-cols-4">
      {columns.map((status) => (
        <Card key={status} className="p-4" onDragOver={(event) => event.preventDefault()} onDrop={() => { if (draggedTaskId) moveTask(draggedTaskId, status); setDraggedTaskId(null); }}>
          <h2 className="font-black text-slate-950">{taskStatusLabels[status]}</h2>
          <div className="mt-4 space-y-3">
            {tasks.filter((task) => task.status === status).map((task) => (
              <div key={task.id} draggable onDragStart={() => setDraggedTaskId(task.id)} className="rounded-[14px] border border-slate-200 bg-white/80 p-3 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <Badge tone={task.priority === "urgent" ? "rose" : task.priority === "high" ? "violet" : "cyan"}>{task.priority}</Badge>
                  <button className="text-slate-400 hover:text-rose-600" onClick={() => removeTask(task.id)}><Trash2 size={15} /></button>
                </div>
                <input className="mt-3 w-full rounded-[10px] border border-transparent bg-transparent font-bold text-slate-950 outline-none transition focus:border-blue-200 focus:bg-blue-50/40 focus:px-2" value={task.title} onChange={(event) => updateTask(task.id, { title: event.target.value })} />
                <p className="mt-1 text-sm text-slate-500">{task.assignee} - {formatProjectDate(task.dueAt)}</p>
                <div className="mt-3 flex flex-wrap gap-2">{columns.map((target) => <button key={target} className="h-6 rounded-full bg-slate-100 px-2 text-[11px] font-semibold text-slate-500 hover:bg-blue-50 hover:text-blue-700" onClick={() => moveTask(task.id, target)}>{taskStatusLabels[target]}</button>)}</div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </section>
  );
}

function TasksTable({ data, removeTask, updateTask }: { data: ReturnType<typeof useProjectsData>["data"]; removeTask: (taskId: string) => void; updateTask: (taskId: string, patch: Partial<ProjectTask>) => void }) {
  return <Card className="p-5"><h2 className="font-black text-slate-950">Vue liste des taches</h2><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="text-xs uppercase tracking-[0.16em] text-slate-500"><tr><th className="pb-3">Tache</th><th className="pb-3">Projet</th><th className="pb-3">Assigne</th><th className="pb-3">Statut</th><th className="pb-3">Deadline</th><th className="pb-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{data.tasks.map((task) => <tr key={task.id}><td className="py-3"><input className="w-full rounded-[10px] border border-transparent bg-transparent font-semibold text-slate-950 outline-none focus:border-blue-200 focus:bg-blue-50/40 focus:px-2" value={task.title} onChange={(event) => updateTask(task.id, { title: event.target.value })} /></td><td className="py-3 text-slate-600">{data.projects.find((project) => project.id === task.projectId)?.title}</td><td className="py-3"><input className="w-32 rounded-[10px] border border-transparent bg-transparent text-slate-600 outline-none focus:border-blue-200 focus:bg-blue-50/40 focus:px-2" value={task.assignee} onChange={(event) => updateTask(task.id, { assignee: event.target.value })} /></td><td className="py-3"><select className="rounded-[10px] border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-700" value={task.status} onChange={(event) => updateTask(task.id, { status: event.target.value as TaskStatus })}>{columns.map((status) => <option key={status} value={status}>{taskStatusLabels[status]}</option>)}</select></td><td className="py-3 text-slate-400">{formatProjectDate(task.dueAt)}</td><td className="py-3"><button className="inline-flex items-center gap-1 text-xs font-bold text-rose-600" onClick={() => removeTask(task.id)}><Trash2 size={14} /> Supprimer</button></td></tr>)}</tbody></table></div></Card>;
}

function CalendarView({ tasks }: { tasks: ProjectTask[] }) {
  return <Card className="p-5"><h2 className="font-black text-slate-950">Planning & deadlines</h2><div className="mt-5 grid gap-3 md:grid-cols-3">{tasks.map((task) => <div key={task.id} className="rounded-[14px] border border-slate-200 bg-white/70 p-4"><CalendarDays className="text-blue-600" size={18} /><p className="mt-3 font-bold text-slate-950">{formatProjectDate(task.dueAt)}</p><p className="mt-1 text-sm text-slate-500">{task.title}</p></div>)}</div></Card>;
}

function Activity({ data }: { data: ReturnType<typeof useProjectsData>["data"] }) {
  return <section className="grid gap-3 md:grid-cols-3">{data.activities.map((activity) => <Card key={activity.id} interactive className="p-4"><Clock3 className="text-blue-600" size={18} /><p className="mt-3 font-bold text-slate-950">{activity.actor}</p><p className="mt-2 text-sm text-slate-500">{activity.action}</p><p className="mt-3 text-xs text-slate-400">{formatProjectDate(activity.createdAt)}</p></Card>)}</section>;
}

function TeamView({ data }: { data: ReturnType<typeof useProjectsData>["data"] }) {
  return <Card className="p-5"><h2 className="font-black text-slate-950">Collaboration equipe</h2><div className="mt-5 grid gap-3 md:grid-cols-4">{data.members.map((member) => <Card key={member.id} interactive className="p-4"><span className={`h-2.5 w-2.5 rounded-full ${member.online ? "bg-emerald-500" : "bg-slate-300"} inline-block`} /><p className="mt-3 font-bold text-slate-950">{member.name}</p><p className="text-sm text-slate-500">{member.role}</p></Card>)}</div></Card>;
}

function TimeView({ data }: { data: ReturnType<typeof useProjectsData>["data"] }) {
  return <Card className="p-5"><h2 className="font-black text-slate-950">Temps & productivite</h2><div className="mt-5 grid gap-3 md:grid-cols-3">{data.timeTracking.map((item) => <Card key={item.id} interactive className="p-4"><Timer className="text-blue-600" size={18} /><p className="mt-3 font-bold text-slate-950">{item.userName}</p><p className="text-sm text-slate-500">{Math.round(item.minutes / 60)}h suivies</p></Card>)}</div></Card>;
}

function FilesView({ data }: { data: ReturnType<typeof useProjectsData>["data"] }) {
  return <Card className="p-5"><h2 className="font-black text-slate-950">Fichiers & documents</h2><div className="mt-5 grid gap-3 md:grid-cols-3">{data.files.map((file) => <Card key={file.id} interactive className="p-4"><FileUp className="text-blue-600" size={18} /><p className="mt-3 font-bold text-slate-950">{file.name}</p><p className="text-sm text-slate-500">{file.type} - {file.sizeMb} MB</p></Card>)}</div></Card>;
}

function NotificationsView({ data }: { data: ReturnType<typeof useProjectsData>["data"] }) {
  return <Card className="p-5"><h2 className="font-black text-slate-950">Centre notifications</h2><div className="mt-5 grid gap-3 md:grid-cols-2">{data.notifications.map((notification) => <div key={notification.id} className="rounded-[14px] border border-slate-200 bg-white/70 p-4"><Bell className="text-blue-600" size={18} /><p className="mt-3 font-bold text-slate-950">{notification.title}</p><p className="mt-2 text-sm text-slate-500">{notification.detail}</p></div>)}</div></Card>;
}

function Field({ label, max, min, onChange, type = "text", value }: { label: string; max?: number; min?: number; onChange: (value: string) => void; type?: string; value: string }) {
  return <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}<input className="h-11 rounded-[12px] border border-slate-200 bg-white px-3 text-sm font-semibold normal-case tracking-normal text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100" max={max} min={min} type={type} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function SelectField({ label, onChange, options, value }: { label: string; onChange: (value: string) => void; options: string[]; value: string }) {
  return <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}<select className="h-11 rounded-[12px] border border-slate-200 bg-white px-3 text-sm font-semibold normal-case tracking-normal text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

function EmptyState({ detail, title }: { detail: string; title: string }) {
  return <Card className="p-8 text-center"><Pencil className="mx-auto text-blue-600" size={22} /><h2 className="mt-3 font-black text-slate-950">{title}</h2><p className="mt-2 text-sm text-slate-500">{detail}</p></Card>;
}

function buildActivity(projectId: string, actor: string, action: string) {
  return { action, actor, createdAt: new Date().toISOString(), id: `act-${Date.now()}`, projectId };
}
