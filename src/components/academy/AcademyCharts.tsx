"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AcademyData } from "@/types/academy";
import { Card } from "@/ui/Card";

export function AcademyCharts({ data }: { data: AcademyData }) {
  const courses = data.courses.map((course) => ({ name: course.title.split(" ").slice(0, 2).join(" "), revenue: course.revenue, students: course.students }));
  const progress = data.courses.map((course) => ({ name: course.category, progress: course.progressAverage }));

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card className="p-5">
        <p className="text-sm text-slate-400">Revenus Academy</p>
        <h3 className="text-lg font-semibold text-white">Formations et inscriptions</h3>
        <div className="mt-5 h-72">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={courses}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} />
              <YAxis stroke="#94a3b8" tickLine={false} />
              <Tooltip contentStyle={{ background: "#080b18", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff" }} />
              <Bar dataKey="revenue" fill="#5ee7ff" radius={[8, 8, 0, 0]} />
              <Bar dataKey="students" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="p-5">
        <p className="text-sm text-slate-400">Progression apprenants</p>
        <h3 className="text-lg font-semibold text-white">Engagement contenus</h3>
        <div className="mt-5 h-72">
          <ResponsiveContainer height="100%" width="100%">
            <LineChart data={progress}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} />
              <YAxis stroke="#94a3b8" tickLine={false} />
              <Tooltip contentStyle={{ background: "#080b18", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff" }} />
              <Line dataKey="progress" stroke="#5ee7ff" strokeWidth={3} type="monotone" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
