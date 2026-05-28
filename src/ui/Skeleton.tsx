import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("relative overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_18px_46px_rgba(15,23,42,0.08)] before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-blue-100/70 before:to-transparent before:animate-shimmer", className)} />;
}
