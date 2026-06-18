"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SaaSBillingData } from "@/types/billing";
import { Card } from "@/ui/Card";

export function SaaSBillingCharts({ data }: { data: SaaSBillingData }) {
  const revenue = data.invoices.slice().reverse().map((invoice, index) => ({
    name: `F${index + 1}`,
    revenue: invoice.status === "paid" ? invoice.amount : 0,
    pending: invoice.status === "pending" ? invoice.amount : 0
  }));

  const plans = data.plans.filter((plan) => plan.code !== "free").map((plan) => ({
    name: plan.name,
    price: plan.monthlyPrice,
    users: plan.userLimit || 0
  }));

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card className="p-5">
        <div className="mb-5">
          <p className="text-sm text-slate-400">Revenus abonnements</p>
          <h3 className="text-lg font-semibold text-white">MRR et paiements</h3>
        </div>
        <div className="h-72">
          <ResponsiveContainer height="100%" width="100%">
            <AreaChart data={revenue}>
              <defs>
                <linearGradient id="billingRevenue" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#5ee7ff" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#5ee7ff" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} />
              <YAxis stroke="#94a3b8" tickLine={false} />
              <Tooltip contentStyle={{ background: "#080b18", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff" }} />
              <Area dataKey="revenue" fill="url(#billingRevenue)" stroke="#5ee7ff" strokeWidth={2} type="monotone" />
              <Area dataKey="pending" fill="transparent" stroke="#8b5cf6" strokeWidth={2} type="monotone" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-5">
          <p className="text-sm text-slate-400">Plans SaaS</p>
          <h3 className="text-lg font-semibold text-white">Prix et limites utilisateurs</h3>
        </div>
        <div className="h-72">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={plans}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} />
              <YAxis stroke="#94a3b8" tickLine={false} />
              <Tooltip contentStyle={{ background: "#080b18", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff" }} />
              <Bar dataKey="price" fill="#5ee7ff" radius={[8, 8, 0, 0]} />
              <Bar dataKey="users" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
