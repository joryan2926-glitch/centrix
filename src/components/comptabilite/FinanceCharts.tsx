"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { getExpenseBreakdown } from "@/services/comptabilite/calculations";
import type { FinanceData } from "@/types/comptabilite";
import { Card } from "@/ui/Card";

const colors = ["#5ee7ff", "#8b5cf6", "#34d399", "#f472b6", "#fbbf24", "#a78bfa", "#94a3b8"];

export function FinanceCharts({ data }: { data: FinanceData }) {
  const breakdown = getExpenseBreakdown(data);

  return (
    <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <Card className="p-5" interactive>
        <div className="mb-5">
          <h2 className="text-base font-semibold text-white">Evolution revenus, depenses et cashflow</h2>
          <p className="mt-1 text-sm text-slate-400">Statistiques mensuelles animees</p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.financialReports}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#5ee7ff" stopOpacity={0.38} />
                  <stop offset="95%" stopColor="#5ee7ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#f472b6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f472b6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#070b18", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8 }} />
              <Area type="monotone" dataKey="revenue" stroke="#5ee7ff" fill="url(#revenueGradient)" strokeWidth={3} />
              <Area type="monotone" dataKey="expenses" stroke="#f472b6" fill="url(#expenseGradient)" strokeWidth={3} />
              <Area type="monotone" dataKey="cashflow" stroke="#34d399" fill="transparent" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-5" interactive>
        <div className="mb-5">
          <h2 className="text-base font-semibold text-white">Repartition des depenses</h2>
          <p className="mt-1 text-sm text-slate-400">Categories comptables principales</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr] xl:grid-cols-1 2xl:grid-cols-[1fr_0.9fr]">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={breakdown} dataKey="value" nameKey="name" innerRadius={58} outerRadius={96} paddingAngle={3}>
                  {breakdown.map((item, index) => (
                    <Cell key={item.name} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#070b18", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {breakdown.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between rounded-[8px] bg-white/[0.045] p-3 text-sm">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                  {item.name}
                </span>
                <strong className="text-white">{Math.round(item.value).toLocaleString("fr-FR")} EUR</strong>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-5 xl:col-span-2" interactive>
        <div className="mb-5">
          <h2 className="text-base font-semibold text-white">Resultat net mensuel</h2>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.financialReports}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#070b18", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8 }} />
              <Bar dataKey="netProfit" radius={[8, 8, 0, 0]} fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </section>
  );
}
