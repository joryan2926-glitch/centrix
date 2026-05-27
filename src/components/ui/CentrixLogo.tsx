import { cn } from "@/lib/utils";

type CentrixLogoProps = {
  compact?: boolean;
  className?: string;
  inverse?: boolean;
};

export function CentrixLogo({ compact = false, className, inverse = false }: CentrixLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-[#2563EB] via-[#0B7CFF] to-[#0F172A] shadow-[0_18px_40px_rgba(37,99,235,0.30)]">
        <span className="absolute right-[-2px] top-1/2 h-[15px] w-[20px] -translate-y-1/2 bg-white" />
        <span className="absolute left-0 top-1/2 h-[7px] w-[20px] -translate-y-1/2 bg-white" />
        <span className="absolute h-[20px] w-[20px] rounded-full bg-white" />
        <span className="absolute h-[12px] w-[12px] rounded-full bg-gradient-to-br from-[#2563EB] to-[#0F172A]" />
      </span>
      {!compact ? (
        <span className="leading-tight">
          <span className={cn("block text-[1.35rem] font-black lowercase tracking-[0.08em]", inverse ? "text-white" : "text-[#0F172A]")}>centrix</span>
          <span className={cn("text-[0.72rem] font-semibold", inverse ? "text-blue-100/70" : "text-blue-500/80")}>Business Operating OS</span>
        </span>
      ) : null}
    </div>
  );
}
