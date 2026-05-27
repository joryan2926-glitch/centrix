"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { WorkflowData } from "@/types/workflows";

export function WorkflowCharts({ data }: { data: WorkflowData }) {
  const runs = data.workflows.map((workflow) => ({ name: workflow.name.slice(0, 14), runs: workflow.runs, succes: workflow.successRate }));
  const productivity = data.tasks.map((task) => ({ name: task.module, minutes: task.savedMinutes }));

  return (
    <section className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
      <div className="rounded-[18px] border border-slate-200 bg-white/82 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <h2 className="text-lg font-black text-slate-950">Executions workflows</h2>
        <div className="mt-5 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={runs}>
              <CartesianGrid stroke="rgba(15,23,42,0.08)" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, color: "#0f172a" }} />
              <Line dataKey="runs" stroke="#2563EB" strokeWidth={3} type="monotone" />
              <Line dataKey="succes" stroke="#10b981" strokeWidth={2} type="monotone" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-[18px] border border-slate-200 bg-white/82 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <h2 className="text-lg font-black text-slate-950">Temps economise</h2>
        <div className="mt-5 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productivity}>
              <CartesianGrid stroke="rgba(15,23,42,0.08)" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, color: "#0f172a" }} />
              <Bar dataKey="minutes" fill="#2563EB" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
