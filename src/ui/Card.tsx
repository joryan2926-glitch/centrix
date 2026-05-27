import { clsx } from "clsx";
import type { HTMLAttributes, ReactNode } from "react";
import { theme } from "@/services/theme";

type CardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
};

export function Card({ children, className, interactive = false, ...props }: CardProps) {
  return (
    <section
      className={clsx(
        "group relative overflow-hidden rounded-[22px]",
        theme.surface,
        "before:pointer-events-none before:absolute before:inset-px before:rounded-[21px] before:border before:border-white/72",
        "after:pointer-events-none after:absolute after:-left-1/4 after:-top-1/3 after:h-36 after:w-2/3 after:rotate-12 after:bg-blue-500/12 after:blur-3xl after:opacity-0 after:transition-opacity after:duration-500",
        interactive && "hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-[0_28px_80px_rgba(0,103,255,0.14)] hover:after:opacity-100",
        theme.transition,
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}
