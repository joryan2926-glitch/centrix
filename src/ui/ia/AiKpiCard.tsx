import type { ReactNode } from "react";
import { Badge } from "@/ui/Badge";
import { Card } from "@/ui/Card";

type AiKpiCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  delta: string;
  tone?: "cyan" | "violet" | "emerald" | "rose";
};

export function AiKpiCard({ icon, label, value, delta, tone = "cyan" }: AiKpiCardProps) {
  return (
    <Card interactive className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-[8px] bg-white/[0.08] text-cyan-100">{icon}</div>
        <Badge tone={tone}>{delta}</Badge>
      </div>
      <p className="mt-5 text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </Card>
  );
}
