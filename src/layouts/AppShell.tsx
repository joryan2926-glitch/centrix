"use client";

import { Bell, ChevronDown, Menu, PlusCircle, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CentrixLogo } from "@/components/ui";
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
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <div className="fixed inset-0 -z-10 bg-app-light" />
      <div className="fixed inset-0 -z-10 bg-grid-light opacity-70" />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 border-r border-white/10 bg-[#071225]/95 px-4 py-5 text-white shadow-[24px_0_70px_rgba(15,23,42,0.22)] backdrop-blur-2xl",
          "transition-transform duration-300 ease-out lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-3" onClick={() => setOpen(false)}>
            <CentrixLogo />
          </Link>
          <Button aria-label="Fermer le menu" className="h-9 w-9 px-0 lg:hidden" onClick={() => setOpen(false)} variant="ghost">
            <X size={18} />
          </Button>
        </div>

        <div className="mt-8 rounded-[16px] border border-white/10 bg-white/[0.07] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-100/70">Workspace</p>
              <p className="mt-1 text-sm font-semibold text-white">CENTRIX Scale</p>
            </div>
            <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-semibold text-emerald-200">Live</span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-[#0077ff] via-cyan-300 to-violet-300 animate-pulse-slow" />
          </div>
        </div>

        <nav className="mt-6 max-h-[calc(100vh-250px)] space-y-1 overflow-y-auto pr-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "group flex h-10 items-center gap-3 rounded-[12px] px-3 text-sm font-semibold transition-all duration-200",
                  active
                    ? "bg-white text-[#071225] shadow-[0_14px_34px_rgba(0,119,255,0.18)]"
                    : "text-blue-100/62 hover:bg-white/8 hover:text-white"
                )}
              >
                <Icon size={17} className={cn("transition-transform duration-200 group-hover:scale-110", active ? "text-[#0077ff]" : "")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-5 left-4 right-4 rounded-[16px] border border-blue-300/20 bg-gradient-to-br from-blue-400/18 to-white/5 p-4">
          <p className="text-sm font-semibold text-white">Plan Enterprise</p>
          <p className="mt-1 text-xs leading-5 text-blue-100/66">Modules metier, IA et donnees consolidees.</p>
        </div>
      </aside>

      {open ? <button aria-label="Fermer le menu" className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} /> : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/76 backdrop-blur-2xl">
          <div className="flex h-18 items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <Button aria-label="Ouvrir le menu" className="h-10 w-10 px-0 lg:hidden" onClick={() => setOpen(true)} variant="surface">
              <Menu size={20} />
            </Button>

            <div className="flex h-11 flex-1 items-center gap-3 rounded-[14px] border border-slate-200 bg-white/88 px-3 text-sm text-slate-500 shadow-[0_12px_34px_rgba(15,23,42,0.05)] transition-colors duration-200 hover:border-blue-200 hover:bg-white sm:max-w-xl">
              <Search size={17} />
              <span className="truncate">Rechercher un client, une facture, un document...</span>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button className="hidden sm:inline-flex" variant="primary">
                <PlusCircle size={17} />
                Action rapide
              </Button>
              <Button aria-label="Notifications" className="relative h-10 w-10 px-0" variant="surface">
                <Bell size={18} />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
              </Button>
              <div className="flex h-11 items-center gap-3 rounded-[14px] border border-slate-200 bg-white/88 px-2.5 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#0077ff] to-[#6d5dfc] text-xs font-bold text-white">JB</span>
                <span className="hidden leading-tight sm:block">
                  <span className="block text-sm font-semibold text-slate-900">Julien</span>
                  <span className="text-xs text-slate-500">Admin</span>
                </span>
                <ChevronDown size={15} className="hidden text-slate-400 sm:block" />
              </div>
            </div>
          </div>
        </header>

        <main className="centrix-content mobile-safe px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10">{children}</main>
      </div>

      <nav className="fixed bottom-3 left-3 right-3 z-30 grid grid-cols-5 gap-1 rounded-[18px] border border-slate-200 bg-white/90 p-1 shadow-[0_18px_60px_rgba(15,23,42,0.16)] backdrop-blur-2xl lg:hidden">
        {navigation.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-14 flex-col items-center justify-center gap-1 rounded-[8px] text-[11px] font-medium transition-all duration-200",
                active ? "bg-blue-600 text-white shadow-[0_10px_26px_rgba(0,119,255,0.25)]" : "text-slate-500 hover:bg-blue-50 hover:text-blue-700"
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
