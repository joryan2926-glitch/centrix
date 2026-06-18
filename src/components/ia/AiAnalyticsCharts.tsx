"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AiAutomationData } from "@/types/ia";
import { Card } from "@/ui/Card";

type AiAnalyticsChartsProps = {
  data: AiAutomationData;
};

export function AiAnalyticsCharts({ data }: AiAnalyticsChartsProps) {
  const usage = data.conversations.map((conversation, index) => ({
    name: `C${index + 1}`,
    tokens: conversation.tokensUsed,
    messages: data.messages.filter((message) => message.conversationId === conversation.id).length
  }));

  const workflows = data.workflows.map((workflow) => ({
    name: workflow.name.split(" ").slice(0, 2).join(" "),
    runs: workflow.runs,
    saved: workflow.timeSavedHours
  }));

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card className="p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-400">Utilisation IA</p>
            <h3 className="text-lg font-semibold text-white">Tokens et conversations</h3>
          </div>
          <span className="rounded-[8px] border border-cyan-200/20 bg-cyan-300/10 px-2.5 py-1 text-xs text-cyan-100">Temps reel</span>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={usage}>
              <defs>
                <linearGradient id="aiTokens" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#5ee7ff" stopOpacity={0.46} />
                  <stop offset="95%" stopColor="#5ee7ff" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} />
              <YAxis stroke="#94a3b8" tickLine={false} />
              <Tooltip contentStyle={{ background: "#080b18", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff" }} />
              <Area dataKey="tokens" fill="url(#aiTokens)" stroke="#5ee7ff" strokeWidth={2} type="monotone" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-400">Automatisations</p>
            <h3 className="text-lg font-semibold text-white">Executions et temps gagne</h3>
          </div>
          <span className="rounded-[8px] border border-violet-200/20 bg-violet-300/10 px-2.5 py-1 text-xs text-violet-100">Workflows</span>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={workflows}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} />
              <YAxis stroke="#94a3b8" tickLine={false} />
              <Tooltip contentStyle={{ background: "#080b18", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff" }} />
              <Bar dataKey="runs" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="saved" fill="#5ee7ff" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
