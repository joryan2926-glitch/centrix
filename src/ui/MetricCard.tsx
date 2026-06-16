import { Badge } from "@/ui/Badge";
import { Card } from "@/ui/Card";
import type { Metric } from "@/types/navigation";

type MetricCardProps = {
  metric: Metric;
};

export function MetricCard({ metric }: MetricCardProps) {
  return (
    <Card className="p-5 sm:p-6" interactive>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-600 via-cyan-400 to-transparent opacity-80" />
      <div className="flex items-center justify-between">
        <div className="relative text-sm font-extrabold tracking-[-0.01em] text-slate-600">{metric.label}</div>
        <span className="relative h-2.5 w-2.5 rounded-full bg-blue-600 shadow-[0_0_0_4px_rgba(37,99,235,0.10)]" />
      </div>
      <div className="relative mt-4 flex items-end justify-between gap-3">
        <span className="text-4xl font-black text-slate-950">{metric.value}</span>
        <Badge tone={metric.tone ?? "emerald"}>{metric.delta}</Badge>
      </div>
      <div className="relative mt-6 h-2 overflow-hidden rounded-full bg-slate-100 shadow-[inset_0_1px_2px_rgba(15,23,42,0.05)]">
        <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-[#2563EB] to-[#0B7CFF] shadow-[0_0_18px_rgba(37,99,235,0.35)] transition-all duration-700 ease-out group-hover:w-[92%]" />
      </div>
    </Card>
  );
}
