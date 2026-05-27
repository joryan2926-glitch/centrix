"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { IntegrationData } from "@/types/integrations";
import { Card } from "@/ui/Card";

export function IntegrationCharts({ data }: { data: IntegrationData }) {
  const api = data.apiLogs.slice().reverse().map((log, index) => ({
    name: `R${index + 1}`,
    response: log.responseTimeMs,
    errors: log.statusCode >= 400 ? 1 : 0
  }));
  const webhooks = data.webhookLogs.map((log) => ({
    name: log.event.split(".")[0],
    attempts: log.attempts,
    response: log.responseTimeMs
  }));

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card className="p-5">
        <div className="mb-5">
          <p className="text-sm text-slate-400">Monitoring API</p>
          <h3 className="text-lg font-semibold text-white">Latence et erreurs</h3>
        </div>
        <div className="h-72">
          <ResponsiveContainer height="100%" width="100%">
            <AreaChart data={api}>
              <defs>
                <linearGradient id="apiLatency" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#5ee7ff" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#5ee7ff" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} />
              <YAxis stroke="#94a3b8" tickLine={false} />
              <Tooltip contentStyle={{ background: "#080b18", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff" }} />
              <Area dataKey="response" fill="url(#apiLatency)" stroke="#5ee7ff" strokeWidth={2} type="monotone" />
              <Area dataKey="errors" fill="transparent" stroke="#ef4444" strokeWidth={2} type="monotone" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="p-5">
        <div className="mb-5">
          <p className="text-sm text-slate-400">Webhooks</p>
          <h3 className="text-lg font-semibold text-white">Retries et reponse</h3>
        </div>
        <div className="h-72">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={webhooks}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} />
              <YAxis stroke="#94a3b8" tickLine={false} />
              <Tooltip contentStyle={{ background: "#080b18", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff" }} />
              <Bar dataKey="response" fill="#5ee7ff" radius={[8, 8, 0, 0]} />
              <Bar dataKey="attempts" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
