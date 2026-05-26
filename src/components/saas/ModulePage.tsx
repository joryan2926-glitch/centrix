import { ArrowUpRight, CheckCircle2, MoreHorizontal, Plus, Sparkles } from "lucide-react";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { MetricCard } from "@/ui/MetricCard";
import type { BusinessModule } from "@/types/navigation";

export function ModulePage({ eyebrow, title, description, metrics, table, focus }: BusinessModule) {
  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.06] px-3 py-2 text-xs uppercase tracking-[0.18em] text-cyan-200">
            <Sparkles size={14} />
            {eyebrow}
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-normal text-white sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">{description}</p>
        </div>
        <Button variant="primary">
          <Plus size={17} />
          Nouveau
        </Button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Card>
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <h2 className="text-base font-semibold text-white">Flux operationnel</h2>
            <Button aria-label="Options" className="h-9 w-9 px-0" variant="ghost">
              <MoreHorizontal size={18} />
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.16em] text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-medium">Element</th>
                  <th className="px-5 py-4 font-medium">Categorie</th>
                  <th className="px-5 py-4 font-medium">Valeur</th>
                  <th className="px-5 py-4 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-slate-300">
                {[0, 1, 2, 3].map((row) => (
                  <tr key={row} className="transition-colors duration-200 hover:bg-white/[0.04]">
                    {table.map((cell, index) => (
                      <td key={`${cell}-${index}`} className="px-5 py-4">
                        {index === 3 ? <Badge tone="violet">{cell}</Badge> : `${cell}${row ? ` ${row + 1}` : ""}`}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5" interactive>
          <h2 className="text-base font-semibold text-white">Priorites module</h2>
          <div className="mt-5 space-y-3">
            {focus.map((item) => (
              <div key={item} className="flex items-center justify-between rounded-[8px] border border-white/10 bg-white/[0.045] p-3 transition-colors duration-200 hover:bg-white/[0.07]">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-emerald-300" />
                  <span className="text-sm text-slate-200">{item}</span>
                </div>
                <ArrowUpRight size={16} className="text-slate-500" />
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
