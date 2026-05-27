import type { ReactNode } from "react";
import { Card } from "@/ui/Card";

type NotificationKpiCardProps = {
  icon: ReactNode;
  label: string;
  value: string | number;
  detail: string;
};

export function NotificationKpiCard({ icon, label, value, detail }: NotificationKpiCardProps) {
  return (
    <Card interactive className="p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="grid h-11 w-11 place-items-center rounded-[14px] bg-blue-600 text-white shadow-[0_16px_34px_rgba(37,99,235,0.24)]">
          {icon}
        </div>
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-blue-700 shadow-sm">Live</span>
      </div>
      <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{detail}</p>
    </Card>
  );
}
