"use client";

import { Bell, ChevronDown, Menu, PlusCircle, Search, X } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CentrixLogo } from "@/components/ui";
import { navigation, navigationGroups } from "@/data/navigation";
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
  const isPublicPage = ["/", "/login", "/register", "/forgot-password"].includes(pathname);

  useEffect(() => {
    if (isDesktop) {
      setOpen(false);
    }
  }, [isDesktop]);

  if (isPublicPage) {
    return <div className="min-h-screen bg-[#f7f9fc] text-slate-900">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <div className="fixed inset-0 -z-10 bg-app-light" />
      <div className="fixed inset-0 -z-10 bg-grid-light opacity-70" />
      <div className="pointer-events-none fixed left-[18rem] top-[-18rem] -z-10 h-[34rem] w-[34rem] rounded-full bg-blue-500/15 blur-3xl" />
      <div className="pointer-events-none fixed bottom-[-16rem] right-[-10rem] -z-10 h-[32rem] w-[32rem] rounded-full bg-cyan-400/10 blur-3xl" />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-80 border-r border-white/10 bg-[#050b18]/96 px-4 py-5 text-white shadow-[28px_0_90px_rgba(15,23,42,0.30)] backdrop-blur-2xl",
          "transition-transform duration-300 ease-out lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(37,99,235,0.24),transparent_34%),radial-gradient(circle_at_80%_18%,rgba(14,165,233,0.16),transparent_30%)]" />
        <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="group flex items-center gap-3" onClick={() => setOpen(false)}>
            <CentrixLogo inverse />
          </Link>
          <Button aria-label="Fermer le menu" className="h-9 w-9 px-0 text-white hover:bg-white/10 hover:text-white lg:hidden" onClick={() => setOpen(false)} variant="ghost">
            <X size={18} />
          </Button>
        </div>

        <div className="mt-7 rounded-[20px] border border-white/10 bg-white/[0.07] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_20px_60px_rgba(0,0,0,0.18)]">
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

        <nav className="mt-6 flex-1 space-y-5 overflow-y-auto pr-1">
          {navigationGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[0.68rem] font-black uppercase tracking-[0.22em] text-blue-100/36">{group.label}</p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={`${group.label}-${item.href}-${item.label}`}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "group relative flex min-h-10 items-center gap-3 rounded-[14px] px-3 py-2 text-sm font-semibold transition-all duration-200",
                        active
                          ? "bg-white text-[#071225] shadow-[0_16px_38px_rgba(37,99,235,0.22)]"
                          : "text-blue-100/58 hover:bg-white/[0.09] hover:text-white"
                      )}
                    >
                      {active ? <motion.span layoutId="sidebar-active" className="absolute inset-0 rounded-[14px] bg-white" transition={{ type: "spring", stiffness: 420, damping: 34 }} /> : null}
                      <span className="relative z-10 grid h-7 w-7 place-items-center rounded-[10px] bg-white/[0.06]">
                        <Icon size={16} className={cn("transition-transform duration-200 group-hover:scale-110", active ? "text-[#2563EB]" : "")} />
                      </span>
                      <span className="relative z-10 min-w-0 flex-1 truncate">{item.label}</span>
                      {item.badge ? <span className="relative z-10 rounded-full bg-blue-600 px-2 py-0.5 text-[0.65rem] font-black text-white">{item.badge}</span> : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-5 rounded-[20px] border border-blue-300/20 bg-gradient-to-br from-blue-400/18 to-white/5 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
          <p className="text-sm font-semibold text-white">Plan Enterprise</p>
          <p className="mt-1 text-xs leading-5 text-blue-100/66">Modules metier, IA et donnees consolidees.</p>
        </div>
        </div>
      </aside>

      {open ? <button aria-label="Fermer le menu" className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} /> : null}

      <div className="lg:pl-80">
        <header className="sticky top-0 z-20 border-b border-white/70 bg-white/72 shadow-[0_18px_50px_rgba(15,23,42,0.04)] backdrop-blur-2xl">
          <div className="flex h-[76px] items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <Button aria-label="Ouvrir le menu" className="h-10 w-10 px-0 lg:hidden" onClick={() => setOpen(true)} variant="surface">
              <Menu size={20} />
            </Button>
            <Link href="/dashboard" className="hidden xl:block">
              <CentrixLogo compact />
            </Link>

            <div className="flex h-12 flex-1 items-center gap-3 rounded-[16px] border border-slate-200/80 bg-white/88 px-3 text-sm text-slate-500 shadow-[0_12px_34px_rgba(15,23,42,0.05)] transition-colors duration-200 hover:border-blue-200 hover:bg-white sm:max-w-2xl">
              <Search size={17} />
              <span className="truncate">Recherche globale CENTRIX: client, facture, document, workflow, insight IA...</span>
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
              <div className="flex h-12 items-center gap-3 rounded-[16px] border border-slate-200 bg-white/88 px-2.5 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
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

        <main className="centrix-content mobile-safe px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            {children}
          </motion.div>
        </main>
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
