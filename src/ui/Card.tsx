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
        "group relative overflow-hidden rounded-[24px]",
        theme.surface,
        "before:pointer-events-none before:absolute before:inset-px before:rounded-[23px] before:border before:border-white/90",
        "after:pointer-events-none after:absolute after:inset-x-8 after:top-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-blue-500/45 after:to-transparent after:opacity-0 after:transition-opacity after:duration-200",
        interactive && "hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_26px_64px_rgba(37,99,235,0.16),0_0_0_1px_rgba(37,99,235,0.10)] hover:after:opacity-100",
        theme.transition,
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}
