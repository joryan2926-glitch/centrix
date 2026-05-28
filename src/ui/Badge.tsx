import { clsx } from "clsx";
import type { ReactNode } from "react";
import { toneClass } from "@/services/theme";

type BadgeProps = {
  children: ReactNode;
  tone?: "cyan" | "violet" | "emerald" | "rose";
  className?: string;
};

export function Badge({ children, tone = "cyan", className }: BadgeProps) {
  return (
    <span className={clsx("inline-flex rounded-full px-2.5 py-1 text-xs font-black tracking-[-0.01em]", toneClass(tone), className)}>
      {children}
    </span>
  );
}
