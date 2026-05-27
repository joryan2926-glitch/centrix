import type { ReactNode } from "react";
import { Card } from "@/ui/Card";

export function SalesKpiCard({ label, value, delta, icon }: { label: string; value: string; delta: string; icon: ReactNode }) {
  return <Card interactive className="p-4"><div className="grid h-11 w-11 place-items-center rounded-[14px] bg-gradient-to-br from-blue-600 to-sky-400 text-white shadow-[0_18px_40px_rgba(37,99,235,0.22)]">{icon}</div><p className="mt-4 text-sm font-medium text-slate-500">{label}</p><div className="mt-2 flex items-end justify-between gap-3"><p className="text-2xl font-black text-slate-950">{value}</p><span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">{delta}</span></div></Card>;
}
