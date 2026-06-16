import { cn } from "@/lib/utils";

type CentrixLogoProps = {
  compact?: boolean;
  className?: string;
  inverse?: boolean;
};

export function CentrixLogo({ compact = false, className, inverse = false }: CentrixLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-[13px] bg-gradient-to-br from-[#3478f6] via-[#2563EB] to-[#0F172A] shadow-[0_8px_20px_rgba(37,99,235,0.28)] ring-1 ring-white/20">
        <span className="absolute right-[-2px] top-1/2 h-[15px] w-[20px] -translate-y-1/2 bg-white" />
        <span className="absolute left-0 top-1/2 h-[7px] w-[20px] -translate-y-1/2 bg-white" />
        <span className="absolute h-[20px] w-[20px] rounded-full bg-white" />
        <span className="absolute h-[12px] w-[12px] rounded-full bg-gradient-to-br from-[#2563EB] to-[#0F172A]" />
      </span>
      {!compact ? (
        <span className="leading-tight">
          <span className={cn("block text-[1.25rem] font-black lowercase", inverse ? "text-white" : "text-[#0F172A]")}>centrix</span>
          <span className={cn("text-[0.68rem] font-bold", inverse ? "text-blue-100/70" : "text-blue-600")}>Business Operating OS</span>
        </span>
      ) : null}
    </div>
  );
}
