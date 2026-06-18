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
        "group relative overflow-hidden rounded-[16px]",
        theme.surface,
        "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white before:to-transparent",
        "after:pointer-events-none after:absolute after:inset-x-8 after:top-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-blue-500/45 after:to-transparent after:opacity-0 after:transition-opacity after:duration-200",
        interactive && "hover:-translate-y-0.5 hover:border-blue-300/90 hover:shadow-[0_2px_4px_rgba(15,23,42,0.04),0_18px_42px_rgba(37,99,235,0.11)] hover:after:opacity-100",
        theme.transition,
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}
