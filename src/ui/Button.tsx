import { clsx } from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { theme } from "@/services/theme";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "ghost" | "surface";
};

export function Button({ children, className, variant = "surface", ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex h-11 items-center justify-center gap-2 rounded-[8px] px-4 text-sm font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
        theme.transition,
        theme.interactive,
        variant === "primary" && "bg-white text-slate-950 hover:-translate-y-0.5 hover:bg-cyan-100 hover:shadow-glow",
        variant === "ghost" && "text-slate-300 hover:bg-white/8 hover:text-white",
        variant === "surface" && "border border-white/10 bg-white/[0.065] text-slate-200 hover:-translate-y-0.5 hover:bg-white/[0.115]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
