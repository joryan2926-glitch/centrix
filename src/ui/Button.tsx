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
        "inline-flex h-10 items-center justify-center gap-2 rounded-[10px] px-4 text-sm font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.58)] disabled:pointer-events-none disabled:opacity-55",
        theme.transition,
        theme.interactive,
        variant === "primary" && "border border-blue-600 bg-gradient-to-b from-[#3478f6] to-[#2563EB] text-white shadow-[0_1px_2px_rgba(15,23,42,0.10),0_8px_22px_rgba(37,99,235,0.24),inset_0_1px_0_rgba(255,255,255,0.24)] hover:-translate-y-0.5 hover:from-[#3b82f6] hover:to-[#1d4ed8] hover:shadow-[0_12px_28px_rgba(37,99,235,0.30)]",
        variant === "ghost" && "text-slate-600 hover:bg-slate-100 hover:text-slate-950 hover:shadow-none",
        variant === "surface" && "border border-slate-200 bg-white text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-700 hover:shadow-[0_8px_20px_rgba(37,99,235,0.10)]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
