"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ProjectsData } from "@/types/projects";

export function ProjectCharts({ data }: { data: ProjectsData }) {
  const progress = data.projects.map((project) => ({ name: project.title.slice(0, 16), progress: project.progress, budget: Math.round(project.budget / 1000) }));
  const time = data.tasks.map((task) => ({ name: task.assignee, estime: task.estimateHours, reel: task.actualHours }));
  return (
    <section className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
      <div className="rounded-[18px] border border-slate-200 bg-white/82 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <h2 className="text-lg font-black text-slate-950">Progression projets</h2>
        <div className="mt-5 h-72"><ResponsiveContainer width="100%" height="100%"><LineChart data={progress}><CartesianGrid stroke="rgba(15,23,42,0.08)" vertical={false} /><XAxis dataKey="name" stroke="#64748b" fontSize={12} /><YAxis stroke="#64748b" fontSize={12} /><Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14 }} /><Line dataKey="progress" stroke="#2563EB" strokeWidth={3} type="monotone" /><Line dataKey="budget" stroke="#10b981" strokeWidth={2} type="monotone" /></LineChart></ResponsiveContainer></div>
      </div>
      <div className="rounded-[18px] border border-slate-200 bg-white/82 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <h2 className="text-lg font-black text-slate-950">Temps estime vs reel</h2>
        <div className="mt-5 h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={time}><CartesianGrid stroke="rgba(15,23,42,0.08)" vertical={false} /><XAxis dataKey="name" stroke="#64748b" fontSize={12} /><YAxis stroke="#64748b" fontSize={12} /><Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14 }} /><Bar dataKey="estime" fill="#2563EB" radius={[10, 10, 0, 0]} /><Bar dataKey="reel" fill="#cbd5e1" radius={[10, 10, 0, 0]} /></BarChart></ResponsiveContainer></div>
      </div>
    </section>
  );
}
