export const theme = {
  radius: {
    sm: "rounded-[6px]",
    md: "rounded-[14px]",
    full: "rounded-full"
  },
  transition: "transition-all duration-300 ease-out motion-reduce:transition-none",
  surface: "border border-slate-200/75 bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(247,250,255,0.72))] shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl",
  interactive: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f9fc]"
} as const;

export function toneClass(tone: "cyan" | "violet" | "emerald" | "rose" = "cyan") {
  const tones = {
    cyan: "border border-blue-200 bg-blue-50 text-blue-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]",
    violet: "border border-violet-200 bg-violet-50 text-violet-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]",
    emerald: "border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]",
    rose: "border border-rose-200 bg-rose-50 text-rose-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]"
  };

  return tones[tone];
}
