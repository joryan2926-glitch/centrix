import type { ReactNode } from "react";
import { Card } from "@/ui/Card";

type BiKpiCardProps = {
  label: string;
  value: string;
  delta: string;
  icon: ReactNode;
  tone?: "blue" | "violet" | "emerald" | "rose";
};

const tones = {
  blue: "from-blue-600 to-sky-400 text-white shadow-[0_18px_40px_rgba(37,99,235,0.22)]",
  violet: "from-violet-600 to-blue-500 text-white shadow-[0_18px_40px_rgba(124,58,237,0.20)]",
  emerald: "from-emerald-500 to-teal-400 text-white shadow-[0_18px_40px_rgba(16,185,129,0.18)]",
  rose: "from-rose-500 to-orange-400 text-white shadow-[0_18px_40px_rgba(244,63,94,0.18)]"
};

export function BiKpiCard({ label, value, delta, icon, tone = "blue" }: BiKpiCardProps) {
  return (
    <Card interactive className="p-4">
      <div className={`grid h-11 w-11 place-items-center rounded-[14px] bg-gradient-to-br ${tones[tone]}`}>{icon}</div>
      <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="text-2xl font-black text-slate-950">{value}</p>
        <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">{delta}</span>
      </div>
    </Card>
  );
}
