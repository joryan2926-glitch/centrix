import type { ReactNode } from "react";
import { Card } from "@/ui/Card";

export function AgendaKpiCard({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: ReactNode }) {
  return (
    <Card className="p-5" interactive>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-400">{label}</p>
        <span className="grid h-9 w-9 place-items-center rounded-[8px] bg-cyan-300/10 text-cyan-100">{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{detail}</p>
    </Card>
  );
}
