"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SecurityData, SecuritySeverity } from "@/types/security";

const colors: Record<SecuritySeverity, string> = {
  low: "#22d3ee",
  medium: "#a78bfa",
  high: "#fb7185",
  critical: "#f43f5e"
};

export function SecurityCharts({ data }: { data: SecurityData }) {
  const alertTrend = data.alerts.map((alert) => ({
    name: new Date(alert.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
    alertes: alert.severity === "critical" ? 4 : alert.severity === "high" ? 3 : alert.severity === "medium" ? 2 : 1
  }));
  const apiTrend = data.apiLogs.map((log) => ({
    endpoint: log.endpoint.replace("/api/", ""),
    latence: log.latencyMs,
    blocages: log.blocked ? 1 : 0
  }));
  const severityData = (["low", "medium", "high", "critical"] as SecuritySeverity[]).map((severity) => ({
    name: severity,
    value: data.alerts.filter((alert) => alert.severity === severity).length + data.logs.filter((log) => log.severity === severity).length
  }));

  return (
    <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-[8px] border border-white/10 bg-white/[0.045] p-4">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Monitoring</p>
            <h2 className="text-lg font-semibold text-white">Alertes securite</h2>
          </div>
          <span className="rounded-[8px] border border-cyan-200/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">temps reel</span>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={alertTrend}>
              <defs>
                <linearGradient id="securityAlertGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.55} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ background: "#08111f", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff" }} />
              <Area dataKey="alertes" fill="url(#securityAlertGradient)" stroke="#22d3ee" strokeWidth={2} type="monotone" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="rounded-[8px] border border-white/10 bg-white/[0.045] p-4">
          <h2 className="text-lg font-semibold text-white">Risques par gravite</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={severityData} dataKey="value" innerRadius={52} outerRadius={78} paddingAngle={4}>
                  {severityData.map((entry) => <Cell key={entry.name} fill={colors[entry.name as SecuritySeverity]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#08111f", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-[8px] border border-white/10 bg-white/[0.045] p-4">
          <h2 className="text-lg font-semibold text-white">Latence API</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={apiTrend}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="endpoint" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ background: "#08111f", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff" }} />
                <Bar dataKey="latence" fill="#a78bfa" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
