export const theme = {
  radius: {
    sm: "rounded-[10px]",
    md: "rounded-[18px]",
    full: "rounded-full"
  },
  transition: "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
  surface: "border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.94),rgba(241,247,255,0.72))] shadow-[0_22px_70px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-2xl",
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
