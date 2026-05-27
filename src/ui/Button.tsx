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
        "inline-flex h-11 items-center justify-center gap-2 rounded-[12px] px-4 text-sm font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]",
        theme.transition,
        theme.interactive,
        variant === "primary" && "bg-gradient-to-r from-[#0077ff] via-[#246bff] to-[#6d5dfc] text-white shadow-[0_18px_38px_rgba(0,119,255,0.24)] hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(0,119,255,0.30)]",
        variant === "ghost" && "text-slate-600 hover:bg-slate-900/5 hover:text-slate-950",
        variant === "surface" && "border border-slate-200 bg-white/80 text-slate-700 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
