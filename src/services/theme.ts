export const theme = {
  radius: {
    sm: "rounded-[10px]",
    md: "rounded-[16px]",
    full: "rounded-full"
  },
  transition: "transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
  surface: "border border-slate-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_rgba(15,23,42,0.065)]",
  interactive: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f7fb]"
} as const;

export function toneClass(tone: "cyan" | "violet" | "emerald" | "rose" = "cyan") {
  const tones = {
    cyan: "border border-blue-200 bg-blue-50 text-blue-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.80),0_6px_18px_rgba(37,99,235,0.08)]",
    violet: "border border-violet-200 bg-violet-50 text-violet-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.80),0_6px_18px_rgba(109,93,252,0.08)]",
    emerald: "border border-emerald-200 bg-emerald-50 text-emerald-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.80),0_6px_18px_rgba(4,120,87,0.07)]",
    rose: "border border-rose-200 bg-rose-50 text-rose-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.80),0_6px_18px_rgba(225,29,72,0.07)]"
  };

  return tones[tone];
}
