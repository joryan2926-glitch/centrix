import { clsx } from "clsx";
import type { ReactNode } from "react";
import { theme } from "@/services/theme";

type CardProps = {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
};

export function Card({ children, className, interactive = false }: CardProps) {
  return (
    <section
      className={clsx(
        "group relative overflow-hidden rounded-[8px]",
        theme.surface,
        "before:pointer-events-none before:absolute before:inset-px before:rounded-[7px] before:border before:border-white/10",
        "after:pointer-events-none after:absolute after:-left-1/4 after:-top-1/3 after:h-32 after:w-2/3 after:rotate-12 after:bg-white/10 after:blur-3xl after:opacity-0 after:transition-opacity after:duration-500",
        interactive && "hover:-translate-y-1 hover:border-cyan-200/35 hover:bg-white/[0.095] hover:after:opacity-100",
        theme.transition,
        className
      )}
    >
      {children}
    </section>
  );
}
