export const theme = {
  radius: {
    sm: "rounded-[6px]",
    md: "rounded-[8px]",
    full: "rounded-full"
  },
  transition: "transition-all duration-300 ease-out motion-reduce:transition-none",
  surface: "border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.105),rgba(255,255,255,0.045))] shadow-halo backdrop-blur-2xl",
  interactive: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-night"
} as const;

export function toneClass(tone: "cyan" | "violet" | "emerald" | "rose" = "cyan") {
  const tones = {
    cyan: "border border-cyan-200/20 bg-cyan-300/10 text-cyan-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
    violet: "border border-violet-200/20 bg-violet-300/10 text-violet-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
    emerald: "border border-emerald-200/20 bg-emerald-300/10 text-emerald-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
    rose: "border border-rose-200/20 bg-rose-300/10 text-rose-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
  };

  return tones[tone];
}
