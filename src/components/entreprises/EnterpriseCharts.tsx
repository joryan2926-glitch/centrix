"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ConsolidatedMetric } from "@/types/entreprises";
import { Card } from "@/ui/Card";

type EnterpriseChartsProps = {
  metrics: ConsolidatedMetric[];
};

export function EnterpriseCharts({ metrics }: EnterpriseChartsProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card className="p-5">
        <div className="mb-5">
          <p className="text-sm text-slate-400">Revenus consolides</p>
          <h3 className="text-lg font-semibold text-white">CA et depenses reseau</h3>
        </div>
        <div className="h-72">
          <ResponsiveContainer height="100%" width="100%">
            <AreaChart data={metrics}>
              <defs>
                <linearGradient id="enterpriseRevenue" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#5ee7ff" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#5ee7ff" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} />
              <YAxis stroke="#94a3b8" tickLine={false} />
              <Tooltip contentStyle={{ background: "#080b18", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff" }} />
              <Area dataKey="revenue" fill="url(#enterpriseRevenue)" stroke="#5ee7ff" strokeWidth={2} type="monotone" />
              <Area dataKey="expenses" fill="transparent" stroke="#8b5cf6" strokeWidth={2} type="monotone" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-5">
          <p className="text-sm text-slate-400">Adoption workspaces</p>
          <h3 className="text-lg font-semibold text-white">Utilisateurs et franchises</h3>
        </div>
        <div className="h-72">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={metrics}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} />
              <YAxis stroke="#94a3b8" tickLine={false} />
              <Tooltip contentStyle={{ background: "#080b18", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff" }} />
              <Bar dataKey="users" fill="#5ee7ff" radius={[8, 8, 0, 0]} />
              <Bar dataKey="franchises" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
