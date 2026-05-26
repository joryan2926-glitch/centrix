"use client";

import { Bell, Command, Menu, Search, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navigation } from "@/data/navigation";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/Button";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isDesktop) {
      setOpen(false);
    }
  }, [isDesktop]);

  return (
    <div className="min-h-screen bg-night text-slate-100">
      <div className="fixed inset-0 -z-10 bg-app-dark" />
      <div className="fixed inset-0 -z-10 bg-grid-premium opacity-30" />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 border-r border-white/10 bg-[#090d1d]/86 px-4 py-5 backdrop-blur-2xl",
          "transition-transform duration-300 ease-out lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-3" onClick={() => setOpen(false)}>
            <span className="grid h-10 w-10 place-items-center rounded-[8px] bg-white/10 text-electric shadow-glow transition-transform duration-300 group-hover:scale-105">
              <Sparkles size={20} />
            </span>
            <span>
              <span className="block text-lg font-semibold tracking-[0.18em]">CENTRIX</span>
              <span className="text-xs text-slate-400">Operating OS</span>
            </span>
          </Link>
          <Button aria-label="Fermer le menu" className="h-9 w-9 px-0 lg:hidden" onClick={() => setOpen(false)} variant="ghost">
            <X size={18} />
          </Button>
        </div>

        <div className="mt-8 rounded-[8px] border border-white/10 bg-white/[0.06] p-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
            <Command size={14} />
            Command center
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-electric via-violet to-fuchsia-400 animate-pulse-slow" />
          </div>
        </div>

        <nav className="mt-6 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "group flex h-11 items-center gap-3 rounded-[8px] px-3 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-[linear-gradient(135deg,rgba(255,255,255,0.15),rgba(94,231,255,0.09))] text-white shadow-glow"
                    : "text-slate-400 hover:bg-white/8 hover:text-white"
                )}
              >
                <Icon size={18} className="transition-transform duration-200 group-hover:scale-110" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-5 left-4 right-4 rounded-[8px] border border-cyan-300/20 bg-cyan-300/10 p-4">
          <p className="text-sm font-semibold text-cyan-100">Plan Scale</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">IA, workflows et modules metier prets pour croissance.</p>
        </div>
      </aside>

      {open ? <button aria-label="Fermer le menu" className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} /> : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-night/64 backdrop-blur-2xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Button aria-label="Ouvrir le menu" className="h-10 w-10 px-0 lg:hidden" onClick={() => setOpen(true)}>
              <Menu size={20} />
            </Button>

            <div className="flex h-10 flex-1 items-center gap-3 rounded-[8px] border border-white/10 bg-white/[0.06] px-3 text-sm text-slate-400 transition-colors duration-200 hover:bg-white/[0.085] sm:max-w-xl">
              <Search size={17} />
              <span className="truncate">Rechercher une opportunite, client, facture...</span>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button aria-label="Notifications" className="h-10 w-10 px-0">
                <Bell size={18} />
              </Button>
              <div className="flex h-10 items-center gap-3 rounded-[8px] border border-white/10 bg-white/[0.06] px-3">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.65)]" />
                <span className="hidden text-sm text-slate-300 sm:block">Workspace Pro</span>
              </div>
            </div>
          </div>
        </header>

        <main className="mobile-safe px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-8">{children}</main>
      </div>

      <nav className="fixed bottom-3 left-3 right-3 z-30 grid grid-cols-5 gap-1 rounded-[8px] border border-white/10 bg-[#070b18]/88 p-1 shadow-halo backdrop-blur-2xl lg:hidden">
        {navigation.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-14 flex-col items-center justify-center gap-1 rounded-[8px] text-[11px] font-medium transition-all duration-200",
                active ? "bg-white/12 text-white" : "text-slate-500 hover:bg-white/8 hover:text-slate-200"
              )}
            >
              <Icon size={17} />
              <span className="max-w-full truncate px-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
