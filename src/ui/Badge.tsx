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
    <span className={clsx("inline-flex rounded-[8px] px-2.5 py-1 text-xs font-medium", toneClass(tone), className)}>
      {children}
    </span>
  );
}
