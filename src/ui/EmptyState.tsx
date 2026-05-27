import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  detail: string;
};

export function EmptyState({ icon, title, detail }: EmptyStateProps) {
  return (
    <div className="grid min-h-40 place-items-center rounded-[8px] border border-dashed border-white/15 bg-white/[0.025] p-6 text-center">
      <div>
        <div className="mx-auto grid h-11 w-11 place-items-center rounded-[8px] bg-white/[0.06] text-cyan-100">{icon}</div>
        <p className="mt-3 font-semibold text-white">{title}</p>
        <p className="mt-1 text-sm text-slate-400">{detail}</p>
      </div>
    </div>
  );
}
