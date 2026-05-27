"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { BusinessIntelligenceData } from "@/types/business-intelligence";

export function BiCharts({ data }: { data: BusinessIntelligenceData }) {
  const forecast = data.predictiveMetrics.map((metric) => ({
    name: metric.module,
    actuel: metric.currentValue > 1000 ? Math.round(metric.currentValue / 1000) : metric.currentValue,
    predit: metric.predictedValue > 1000 ? Math.round(metric.predictedValue / 1000) : metric.predictedValue,
    confiance: metric.confidence
  }));
  const performance = data.performanceMetrics.map((metric) => ({ module: metric.module, valeur: metric.value, benchmark: metric.benchmark, mois: metric.month }));
  const radar = data.scores.map((score) => ({ entity: score.entity.replace("CENTRIX ", ""), score: score.score }));

  return (
    <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
      <div className="rounded-[18px] border border-slate-200 bg-white/82 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">Analytics predictifs</p>
            <h2 className="text-lg font-black text-slate-950">Previsions multi-modules</h2>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">IA active</span>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecast}>
              <defs>
                <linearGradient id="biForecast" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(15,23,42,0.08)" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, color: "#0f172a" }} />
              <Area dataKey="actuel" stroke="#94a3b8" fill="transparent" strokeWidth={2} type="monotone" />
              <Area dataKey="predit" stroke="#2563EB" fill="url(#biForecast)" strokeWidth={3} type="monotone" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="rounded-[18px] border border-slate-200 bg-white/82 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
          <h2 className="text-lg font-black text-slate-950">Scoring business</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radar}>
                <PolarGrid stroke="rgba(15,23,42,0.10)" />
                <PolarAngleAxis dataKey="entity" tick={{ fill: "#64748b", fontSize: 11 }} />
                <Radar dataKey="score" fill="#2563EB" fillOpacity={0.18} stroke="#2563EB" strokeWidth={2} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, color: "#0f172a" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-[18px] border border-slate-200 bg-white/82 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
          <h2 className="text-lg font-black text-slate-950">Performance modules</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performance}>
                <CartesianGrid stroke="rgba(15,23,42,0.08)" vertical={false} />
                <XAxis dataKey="mois" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, color: "#0f172a" }} />
                <Bar dataKey="valeur" fill="#2563EB" radius={[10, 10, 0, 0]} />
                <Bar dataKey="benchmark" fill="#cbd5e1" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
