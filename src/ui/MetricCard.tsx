import { Badge } from "@/ui/Badge";
import { Card } from "@/ui/Card";
import type { Metric } from "@/types/navigation";

type MetricCardProps = {
  metric: Metric;
};

export function MetricCard({ metric }: MetricCardProps) {
  return (
    <Card className="p-5" interactive>
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-400">{metric.label}</div>
        <span className="h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_16px_rgba(103,232,249,0.65)]" />
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <span className="text-3xl font-semibold text-white">{metric.value}</span>
        <Badge tone={metric.tone ?? "emerald"}>{metric.delta}</Badge>
      </div>
      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-cyan-200 via-violet-300 to-emerald-200 transition-all duration-700 group-hover:w-[92%]" />
      </div>
    </Card>
  );
}
