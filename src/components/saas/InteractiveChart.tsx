"use client";

import { useId, useMemo, useState } from "react";
import type { ChartPoint } from "@/types/charts";
import { Badge } from "@/ui/Badge";
import { Card } from "@/ui/Card";

type InteractiveChartProps = {
  title: string;
  subtitle: string;
  data: ChartPoint[];
  type?: "line" | "bar";
  valueSuffix?: string;
};

export function InteractiveChart({ title, subtitle, data, type = "line", valueSuffix = "K" }: InteractiveChartProps) {
  const [activeIndex, setActiveIndex] = useState(data.length - 1);
  const chartId = useId().replaceAll(":", "");
  const lineGradientId = `line-${chartId}`;
  const areaGradientId = `area-${chartId}`;
  const active = data[activeIndex];
  const max = Math.max(...data.map((point) => point.value), 1);

  const linePath = useMemo(() => {
    const width = 640;
    const height = 220;
    const padding = 20;

    return data
      .map((point, index) => {
        const x = padding + (index / Math.max(data.length - 1, 1)) * (width - padding * 2);
        const y = height - padding - (point.value / max) * (height - padding * 2);

        return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");
  }, [data, max]);

  return (
    <Card className="p-5" interactive>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        </div>
        <Badge tone="cyan">
          {active.label} · {active.value}
          {valueSuffix}
        </Badge>
      </div>

      {type === "line" ? (
        <div className="mt-6 overflow-hidden rounded-[8px] border border-white/10 bg-slate-950/35 p-3">
          <svg viewBox="0 0 640 220" className="h-56 w-full" role="img" aria-label={title}>
            <defs>
              <linearGradient id={lineGradientId} x1="0" x2="1" y1="0" y2="0">
                <stop stopColor="#5ee7ff" />
                <stop offset="0.55" stopColor="#8b5cf6" />
                <stop offset="1" stopColor="#a7f3d0" />
              </linearGradient>
              <linearGradient id={areaGradientId} x1="0" x2="0" y1="0" y2="1">
                <stop stopColor="#5ee7ff" stopOpacity="0.22" />
                <stop offset="1" stopColor="#5ee7ff" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 1, 2, 3].map((line) => (
              <line key={line} x1="20" x2="620" y1={35 + line * 45} y2={35 + line * 45} stroke="rgba(255,255,255,0.07)" />
            ))}
            <path d={`${linePath} L 620 200 L 20 200 Z`} fill={`url(#${areaGradientId})`} />
            <path
              d={linePath}
              fill="none"
              stroke={`url(#${lineGradientId})`}
              strokeDasharray="820"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4"
              className="animate-draw-line"
            />
            {data.map((point, index) => {
              const x = 20 + (index / Math.max(data.length - 1, 1)) * 600;
              const y = 200 - (point.value / max) * 180;
              const isActive = index === activeIndex;

              return (
                <g key={point.label} onMouseEnter={() => setActiveIndex(index)} className="cursor-pointer">
                  <circle cx={x} cy={y} r={isActive ? 9 : 6} fill={isActive ? "#f8fafc" : "#5ee7ff"} />
                  <circle cx={x} cy={y} r="18" fill="transparent" />
                  <text x={x} y="216" textAnchor="middle" className="fill-slate-500 text-[12px]">
                    {point.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {data.map((point, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={point.label}
                className="grid w-full grid-cols-[84px_1fr_52px] items-center gap-3 text-left text-sm"
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
              >
                <span className={isActive ? "text-white" : "text-slate-400"}>{point.label}</span>
                <span className="h-3 overflow-hidden rounded-full bg-white/10">
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-cyan-200 via-violet-300 to-emerald-200 transition-all duration-500"
                    style={{ width: `${(point.value / max) * 100}%` }}
                  />
                </span>
                <span className="text-right font-semibold text-cyan-100">
                  {point.value}
                  {valueSuffix}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}
