import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type CentrixLogoProps = {
  compact?: boolean;
  className?: string;
};

export function CentrixLogo({ compact = false, className }: CentrixLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-[12px] bg-gradient-to-br from-[#0077ff] via-[#2f5bff] to-[#6d5dfc] text-white shadow-[0_18px_40px_rgba(0,119,255,0.28)]">
        <span className="absolute inset-px rounded-[11px] border border-white/25" />
        <Sparkles size={19} />
      </span>
      {!compact ? (
        <span className="leading-tight">
          <span className="block text-[1.08rem] font-black tracking-[0.18em] text-white">CENTRIX</span>
          <span className="text-[0.72rem] font-medium text-blue-100/70">Business Operating OS</span>
        </span>
      ) : null}
    </div>
  );
}
