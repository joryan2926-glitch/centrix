"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SettingsData } from "@/types/settings";
import { Card } from "@/ui/Card";

type AdminChartsProps = {
  data: SettingsData;
};

export function AdminCharts({ data }: AdminChartsProps) {
  const activity = data.activityLogs.slice(0, 6).reverse().map((log, index) => ({
    name: `A${index + 1}`,
    actions: index + 4,
    security: log.severity === "warning" ? 3 : 1
  }));

  const seats = data.subscriptions.map((subscription) => ({
    name: subscription.plan,
    used: subscription.usedSeats,
    total: subscription.seats
  }));

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card className="p-5">
        <div className="mb-5">
          <p className="text-sm text-slate-400">Activite systeme</p>
          <h3 className="text-lg font-semibold text-white">Actions et securite</h3>
        </div>
        <div className="h-72">
          <ResponsiveContainer height="100%" width="100%">
            <AreaChart data={activity}>
              <defs>
                <linearGradient id="adminActivity" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#5ee7ff" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#5ee7ff" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} />
              <YAxis stroke="#94a3b8" tickLine={false} />
              <Tooltip contentStyle={{ background: "#080b18", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff" }} />
              <Area dataKey="actions" fill="url(#adminActivity)" stroke="#5ee7ff" strokeWidth={2} type="monotone" />
              <Area dataKey="security" fill="transparent" stroke="#8b5cf6" strokeWidth={2} type="monotone" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-5">
          <p className="text-sm text-slate-400">Licences SaaS</p>
          <h3 className="text-lg font-semibold text-white">Sieges utilises</h3>
        </div>
        <div className="h-72">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={seats}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} />
              <YAxis stroke="#94a3b8" tickLine={false} />
              <Tooltip contentStyle={{ background: "#080b18", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff" }} />
              <Bar dataKey="total" fill="#1e293b" radius={[8, 8, 0, 0]} />
              <Bar dataKey="used" fill="#5ee7ff" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
