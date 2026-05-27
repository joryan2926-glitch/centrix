"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MarketplaceData } from "@/types/marketplace";
import { Card } from "@/ui/Card";

export function MarketplaceCharts({ data }: { data: MarketplaceData }) {
  const providers = data.providers.map((provider) => ({ name: provider.name.split(" ")[0], revenue: provider.revenue, orders: provider.completedOrders }));
  return (
    <Card className="p-5">
      <p className="text-sm text-slate-400">Performance prestataires</p>
      <h3 className="text-lg font-semibold text-white">Revenus et commandes</h3>
      <div className="mt-5 h-72">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart data={providers}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} />
            <YAxis stroke="#94a3b8" tickLine={false} />
            <Tooltip contentStyle={{ background: "#080b18", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff" }} />
            <Bar dataKey="revenue" fill="#5ee7ff" radius={[8, 8, 0, 0]} />
            <Bar dataKey="orders" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
