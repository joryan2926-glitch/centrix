"use client";

import { ChevronDown, ChevronRight, LogOut, Menu, Star, X } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GlobalSearch } from "@/components/shell/GlobalSearch";
import { NotificationCenter } from "@/components/shell/NotificationCenter";
import { QuickActions } from "@/components/shell/QuickActions";
import { CentrixLogo } from "@/components/ui";
import { favoriteNavigation, navigation, navigationGroups } from "@/data/navigation";
import { signOutAction } from "@/app/auth/actions";
import { useAuth } from "@/hooks/useAuth";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/Button";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [open, setOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const { loading: authLoading, profile } = useAuth();
  const isPublicPage = ["/", "/login", "/register", "/forgot-password", "/reset-password"].includes(pathname) || pathname.startsWith("/auth/");
  const profileInitials = profile?.fullName
    .split(" ")
    .map((part) => part.slice(0, 1))
    .join("")
    .slice(0, 2)
    .toUpperCase() || "CX";

  useEffect(() => {
    if (isDesktop) {
      setOpen(false);
    }
  }, [isDesktop]);

  useEffect(() => {
    if (isPublicPage) return;
    const prefetch = () => {
      favoriteNavigation.forEach((item) => router.prefetch(item.href));
      ["/notifications", "/settings", "/profile"].forEach((href) => router.prefetch(href));
    };

    const idle = window.requestIdleCallback?.(prefetch, { timeout: 1800 });
    if (!idle) window.setTimeout(prefetch, 800);

    return () => {
      if (idle) window.cancelIdleCallback?.(idle);
    };
  }, [isPublicPage, router]);

  if (isPublicPage) {
    return <div className="min-h-screen bg-[#f6f8fb] text-slate-900">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#f3f6fb] text-slate-900">
      <div className="fixed inset-0 -z-10 bg-app-light" />
      <div className="fixed inset-0 -z-10 bg-grid-light opacity-55" />
      <div className="pointer-events-none fixed left-[18rem] top-[-18rem] -z-10 h-[34rem] w-[34rem] rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none fixed bottom-[-16rem] right-[-10rem] -z-10 h-[32rem] w-[32rem] rounded-full bg-cyan-400/8 blur-3xl" />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-80 border-r border-white/10 bg-[#071226] px-4 py-5 text-white shadow-[20px_0_64px_rgba(7,18,38,0.42)]",
          "transition-transform duration-300 ease-out lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_0%,rgba(37,99,235,0.28),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.045),transparent_25%)]" />
        <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="group flex items-center gap-3" onClick={() => setOpen(false)}>
            <CentrixLogo inverse />
          </Link>
          <Button aria-label="Fermer le menu" className="h-9 w-9 px-0 text-white hover:bg-white/10 hover:text-white lg:hidden" onClick={() => setOpen(false)} variant="ghost">
            <X size={18} />
          </Button>
        </div>

        <div className="mt-7 rounded-[18px] border border-white/14 bg-white/[0.08] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_16px_36px_rgba(0,0,0,0.22)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-100/72">Workspace</p>
              <p className="mt-1 text-sm font-bold text-white">{authLoading ? "Synchronisation..." : profile?.workspaceName ?? "CENTRIX Scale"}</p>
            </div>
            <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-black text-emerald-200">Live</span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-4/5 rounded-full bg-[#3b82f6]" />
          </div>
        </div>

        <nav className="mt-6 flex-1 space-y-5 overflow-y-auto pr-1 [scrollbar-width:none]">
          <div>
            <p className="mb-2 flex items-center gap-2 px-3 text-[0.66rem] font-black uppercase tracking-[0.24em] text-blue-100/50">
              <Star size={12} />
              Favoris
            </p>
            <div className="space-y-1">
              {favoriteNavigation.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={`favorite-${item.href}-${item.label}`}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    prefetch
                    className={cn(
                      "group relative flex min-h-10 items-center gap-3 rounded-[13px] px-3 py-2 text-sm font-bold transition-all duration-200",
                      active ? "bg-white text-[#071225] shadow-[0_12px_28px_rgba(37,99,235,0.24),0_0_0_1px_rgba(255,255,255,0.70)_inset]" : "text-blue-100/78 hover:bg-white/[0.10] hover:text-white"
                    )}
                  >
                    <span className={cn("relative z-10 grid h-7 w-7 place-items-center rounded-[10px]", active ? "bg-blue-50" : "bg-white/[0.07]")}>
                      <Icon size={16} className={active ? "text-[#2563EB]" : ""} />
                    </span>
                    <span className="relative z-10 min-w-0 flex-1 truncate">{item.label}</span>
                    {item.badge ? <span className="relative z-10 rounded-full bg-blue-600 px-2 py-0.5 text-[0.65rem] font-black text-white">{item.badge}</span> : null}
                  </Link>
                );
              })}
            </div>
          </div>

          {navigationGroups.map((group) => (
            <div key={group.label}>
              <button
                className="mb-2 flex w-full items-center justify-between rounded-[10px] px-3 py-1.5 text-left text-[0.66rem] font-black uppercase tracking-[0.24em] text-blue-100/50 transition-colors duration-200 hover:bg-white/[0.06] hover:text-blue-100"
                onClick={() => setCollapsedGroups((current) => ({ ...current, [group.label]: !current[group.label] }))}
                type="button"
              >
                <span>{group.label}</span>
                {collapsedGroups[group.label] ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
              </button>
              <div className={cn("space-y-1", collapsedGroups[group.label] && "hidden")}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={`${group.label}-${item.href}-${item.label}`}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      prefetch
                      className={cn(
                        "group relative flex min-h-10 items-center gap-3 rounded-[13px] px-3 py-2 text-sm font-bold transition-all duration-200",
                        active
                          ? "bg-white text-[#071225] shadow-[0_12px_28px_rgba(37,99,235,0.24),0_0_0_1px_rgba(255,255,255,0.70)_inset]"
                          : "text-blue-100/78 hover:bg-white/[0.10] hover:text-white"
                      )}
                    >
                      {active ? <motion.span layoutId="sidebar-active" className="absolute inset-0 rounded-[13px] bg-white" transition={{ type: "spring", stiffness: 420, damping: 34 }} /> : null}
                      <span className={cn("relative z-10 grid h-7 w-7 place-items-center rounded-[10px]", active ? "bg-blue-50" : "bg-white/[0.07]")}>
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

        <div className="mt-5 rounded-[18px] border border-blue-300/20 bg-[#0d1b36] p-4 shadow-[0_12px_32px_rgba(0,0,0,0.20)]">
          <p className="text-sm font-bold text-white">{profile?.role === "admin" ? "Plan Enterprise" : "Acces equipe"}</p>
          <p className="mt-1 text-xs leading-5 text-blue-100/72">{profile?.workspaceName ? `${profile.workspaceName} synchronise avec Supabase Auth.` : "Modules metier, IA et donnees consolidees."}</p>
        </div>
        </div>
      </aside>

      {open ? <button aria-label="Fermer le menu" className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} /> : null}

      <div className="lg:pl-80">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/96 shadow-[0_12px_34px_rgba(15,23,42,0.07)] backdrop-blur-sm">
          {authLoading ? <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-blue-50"><span className="block h-full w-1/2 animate-pulse bg-blue-600" /></div> : null}
          <div className="flex h-[72px] items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <Button aria-label="Ouvrir le menu" className="h-10 w-10 px-0 lg:hidden" onClick={() => setOpen(true)} variant="surface">
              <Menu size={20} />
            </Button>
            <Link href="/dashboard" className="hidden xl:block">
              <CentrixLogo compact />
            </Link>

            <GlobalSearch />

            <div className="ml-auto flex items-center gap-2">
              <QuickActions />
              <NotificationCenter />
              <Link href="/profile" className="flex h-11 items-center gap-3 rounded-[14px] border border-slate-200 bg-white px-2.5 shadow-[0_8px_22px_rgba(15,23,42,0.04)] transition-all duration-200 hover:border-blue-300 hover:bg-blue-50">
                <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-[#0077ff] to-[#6d5dfc] text-xs font-bold text-white">
                  {profile?.avatarUrl ? <span className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${profile.avatarUrl})` }} /> : profileInitials}
                </span>
                <span className="hidden leading-tight sm:block">
                  <span className="block max-w-28 truncate text-sm font-semibold text-slate-900">{authLoading ? "Chargement" : profile?.fullName ?? "CENTRIX"}</span>
                  <span className="text-xs capitalize text-slate-500">{profile?.role ?? "user"}</span>
                </span>
                <ChevronDown size={15} className="hidden text-slate-400 sm:block" />
              </Link>
              <Button
                aria-label="Se deconnecter"
                className="hidden h-10 w-10 px-0 sm:inline-flex"
                onClick={async () => {
                  await signOutAction();
                  router.push("/login");
                  router.refresh();
                }}
                variant="surface"
              >
                <LogOut size={17} />
              </Button>
            </div>
          </div>
        </header>

        <main className="centrix-content mobile-safe px-4 pb-28 pt-7 sm:px-6 lg:px-8 xl:px-10 lg:pb-12">
          <motion.div key={pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}>
            {children}
          </motion.div>
        </main>
      </div>

      <nav className="fixed bottom-3 left-3 right-3 z-30 grid grid-cols-5 gap-1 rounded-[20px] border border-slate-200 bg-white p-1.5 shadow-[0_16px_44px_rgba(15,23,42,0.16)] lg:hidden">
        {navigation.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-14 flex-col items-center justify-center gap-1 rounded-[16px] text-[11px] font-bold transition-all duration-200",
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
