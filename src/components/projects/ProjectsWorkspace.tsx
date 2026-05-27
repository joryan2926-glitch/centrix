"use client";

import dynamic from "next/dynamic";
import { Bell, CalendarDays, CheckCircle2, Clock3, FileUp, FolderKanban, GanttChartSquare, Plus, Save, Search, Timer, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import { formatProjectCurrency, formatProjectDate } from "@/lib/projects/format";
import { createProject, getProjectsDashboard, statusLabels, taskStatusLabels } from "@/services/projects/calculations";
import { useProjectsData } from "@/hooks/projects/useProjectsData";
import { ProjectKpiCard } from "@/ui/projects/ProjectKpiCard";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Skeleton } from "@/ui/Skeleton";
import { Toast } from "@/ui/Toast";
import type { ProjectTask, TaskStatus } from "@/types/projects";

const ProjectCharts = dynamic(() => import("@/components/projects/ProjectCharts").then((module) => module.ProjectCharts), { loading: () => <Skeleton className="h-80" />, ssr: false });
const ProjectFlow = dynamic(() => import("@/components/projects/ProjectFlow").then((module) => module.ProjectFlow), { loading: () => <Skeleton className="h-[520px]" />, ssr: false });

const views = ["dashboard", "projects", "kanban", "list", "calendar", "gantt", "team", "time", "files", "notifications"] as const;
type View = (typeof views)[number];
const columns: TaskStatus[] = ["todo", "in_progress", "review", "done"];

export function ProjectsWorkspace({ initialView = "dashboard" }: { initialView?: View }) {
  const { data, loading, mode, toast, mutate, sync } = useProjectsData();
  const [view, setView] = useState<View>(initialView);
  const [query, setQuery] = useState("");
  const dashboard = useMemo(() => getProjectsDashboard(data), [data]);
  const filteredProjects = data.projects.filter((project) => [project.title, project.client, project.category].join(" ").toLowerCase().includes(query.toLowerCase()));

  function addProject() {
    const project = createProject();
    mutate((current) => ({ ...current, projects: [project, ...current.projects] }), { title: "Projet cree", detail: "Nouveau projet ajoute au portefeuille." });
  }

  function moveTask(taskId: string, status: TaskStatus) {
    mutate((current) => ({
      ...current,
      tasks: current.tasks.map((task) => task.id === taskId ? { ...task, status } : task),
      activities: [{ id: `act-${Date.now()}`, projectId: current.tasks.find((task) => task.id === taskId)?.projectId ?? "", actor: "CENTRIX", action: `a deplace une tache vers ${taskStatusLabels[status]}`, createdAt: new Date().toISOString() }, ...current.activities]
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
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">Pilotage projets, kanban, deadlines, temps, collaboration, fichiers et dependances dans une interface premium type Linear/Monday.</p>
          </div>
          <div className="flex flex-wrap gap-2"><Button onClick={addProject}><Plus size={17} /> Projet</Button><Button onClick={sync} variant="primary"><Save size={17} /> Sync {mode}</Button></div>
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
      {view === "projects" ? <ProjectsView projects={filteredProjects} query={query} setQuery={setQuery} /> : null}
      {view === "kanban" ? <Kanban tasks={data.tasks} moveTask={moveTask} /> : null}
      {view === "list" ? <TasksTable data={data} /> : null}
      {view === "calendar" ? <CalendarView tasks={data.tasks} /> : null}
      {view === "gantt" ? <ProjectFlow tasks={data.tasks} /> : null}
      {view === "team" ? <TeamView data={data} /> : null}
      {view === "time" ? <TimeView data={data} /> : null}
      {view === "files" ? <FilesView data={data} /> : null}
      {view === "notifications" ? <NotificationsView data={data} /> : null}
    </div>
  );
}

function ProjectsView({ projects, query, setQuery }: { projects: ReturnType<typeof createProject>[]; query: string; setQuery: (value: string) => void }) {
  return <Card className="p-5"><div className="flex h-11 max-w-md items-center gap-2 rounded-[14px] border border-slate-200 bg-white px-3 text-sm text-slate-500"><Search size={16} /><input className="w-full bg-transparent outline-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher projets" /></div><div className="mt-5 grid gap-3 md:grid-cols-3">{projects.map((project) => <Card key={project.id} interactive className="p-4"><Badge tone={project.priority === "urgent" ? "rose" : project.priority === "high" ? "violet" : "cyan"}>{statusLabels[project.status]}</Badge><p className="mt-3 font-bold text-slate-950">{project.title}</p><p className="mt-2 text-sm text-slate-500">{project.description}</p><p className="mt-3 text-sm font-semibold text-blue-700">{formatProjectCurrency(project.budget)} - {project.client}</p><div className="mt-4 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400" style={{ width: `${project.progress}%` }} /></div><p className="mt-2 text-xs text-slate-400">Deadline {formatProjectDate(project.deadline)}</p></Card>)}</div></Card>;
}

function Kanban({ tasks, moveTask }: { tasks: ProjectTask[]; moveTask: (taskId: string, status: TaskStatus) => void }) {
  return <section className="grid gap-3 xl:grid-cols-4">{columns.map((status) => <Card key={status} className="p-4"><h2 className="font-black text-slate-950">{taskStatusLabels[status]}</h2><div className="mt-4 space-y-3">{tasks.filter((task) => task.status === status).map((task) => <div key={task.id} draggable onDragEnd={() => moveTask(task.id, status)} className="rounded-[14px] border border-slate-200 bg-white/80 p-3 shadow-sm"><Badge tone={task.priority === "urgent" ? "rose" : task.priority === "high" ? "violet" : "cyan"}>{task.priority}</Badge><p className="mt-3 font-bold text-slate-950">{task.title}</p><p className="mt-1 text-sm text-slate-500">{task.assignee} - {formatProjectDate(task.dueAt)}</p><div className="mt-3 flex gap-2">{columns.map((target) => <button key={target} className="h-6 rounded-full bg-slate-100 px-2 text-[11px] font-semibold text-slate-500 hover:bg-blue-50 hover:text-blue-700" onClick={() => moveTask(task.id, target)}>{taskStatusLabels[target]}</button>)}</div></div>)}</div></Card>)}</section>;
}

function TasksTable({ data }: { data: ReturnType<typeof useProjectsData>["data"] }) {
  return <Card className="p-5"><h2 className="font-black text-slate-950">Vue liste des taches</h2><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="text-xs uppercase tracking-[0.16em] text-slate-500"><tr><th className="pb-3">Tache</th><th className="pb-3">Projet</th><th className="pb-3">Assigné</th><th className="pb-3">Statut</th><th className="pb-3">Deadline</th></tr></thead><tbody className="divide-y divide-slate-100">{data.tasks.map((task) => <tr key={task.id}><td className="py-3 font-semibold text-slate-950">{task.title}</td><td className="py-3 text-slate-600">{data.projects.find((project) => project.id === task.projectId)?.title}</td><td className="py-3 text-slate-600">{task.assignee}</td><td className="py-3"><Badge tone={task.status === "done" ? "emerald" : "cyan"}>{taskStatusLabels[task.status]}</Badge></td><td className="py-3 text-slate-400">{formatProjectDate(task.dueAt)}</td></tr>)}</tbody></table></div></Card>;
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
