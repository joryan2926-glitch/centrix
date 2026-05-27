import type { ReactNode } from "react";
import { Card } from "@/ui/Card";

type SecurityKpiCardProps = {
  label: string;
  value: string;
  delta: string;
  icon: ReactNode;
  tone?: "cyan" | "violet" | "emerald" | "rose";
};

const toneClass = {
  cyan: "from-cyan-300/20 to-cyan-300/5 text-cyan-100",
  violet: "from-violet-300/20 to-violet-300/5 text-violet-100",
  emerald: "from-emerald-300/20 to-emerald-300/5 text-emerald-100",
  rose: "from-rose-300/20 to-rose-300/5 text-rose-100"
};

export function SecurityKpiCard({ label, value, delta, icon, tone = "cyan" }: SecurityKpiCardProps) {
  return (
    <Card interactive className="p-4">
      <div className={`flex h-10 w-10 items-center justify-center rounded-[8px] bg-gradient-to-br ${toneClass[tone]}`}>{icon}</div>
      <p className="mt-4 text-sm text-slate-400">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="text-2xl font-semibold text-white">{value}</p>
        <span className="rounded-[8px] border border-white/10 bg-white/[0.05] px-2 py-1 text-xs text-slate-300">{delta}</span>
      </div>
    </Card>
  );
}
