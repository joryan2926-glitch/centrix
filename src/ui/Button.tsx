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
        "inline-flex h-11 items-center justify-center gap-2 rounded-[13px] px-4 text-sm font-extrabold tracking-[-0.01em] shadow-[inset_0_1px_0_rgba(255,255,255,0.58)] disabled:pointer-events-none disabled:opacity-55",
        theme.transition,
        theme.interactive,
        variant === "primary" && "bg-gradient-to-r from-[#2563EB] via-[#0B7CFF] to-[#2563EB] text-white shadow-[0_16px_36px_rgba(37,99,235,0.30),inset_0_1px_0_rgba(255,255,255,0.28)] hover:-translate-y-0.5 hover:shadow-[0_24px_52px_rgba(37,99,235,0.38),0_0_0_1px_rgba(255,255,255,0.16)_inset]",
        variant === "ghost" && "text-slate-600 hover:bg-slate-100 hover:text-slate-950 hover:shadow-none",
        variant === "surface" && "border border-slate-200 bg-white text-slate-800 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-white hover:text-blue-700 hover:shadow-[0_14px_30px_rgba(37,99,235,0.12)]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
