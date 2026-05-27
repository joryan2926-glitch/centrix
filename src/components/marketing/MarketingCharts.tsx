"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MarketingData } from "@/types/marketing";
import { Card } from "@/ui/Card";

export function MarketingCharts({ data }: { data: MarketingData }) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Card className="p-5" interactive>
        <h2 className="text-base font-semibold text-white">Portee, engagement et leads</h2>
        <p className="mt-1 text-sm text-slate-400">Evolution mensuelle multicanale</p>
        <div className="mt-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.reports}>
              <defs>
                <linearGradient id="marketingReach" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#5ee7ff" stopOpacity={0.34} />
                  <stop offset="95%" stopColor="#5ee7ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#070b18", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8 }} />
              <Area type="monotone" dataKey="reach" stroke="#5ee7ff" fill="url(#marketingReach)" strokeWidth={3} />
              <Area type="monotone" dataKey="engagement" stroke="#8b5cf6" fill="transparent" strokeWidth={3} />
              <Area type="monotone" dataKey="leads" stroke="#34d399" fill="transparent" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-5" interactive>
        <h2 className="text-base font-semibold text-white">Clics par mois</h2>
        <p className="mt-1 text-sm text-slate-400">Traffic social et campagne</p>
        <div className="mt-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.reports}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#070b18", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8 }} />
              <Bar dataKey="clicks" fill="#f472b6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </section>
  );
}
