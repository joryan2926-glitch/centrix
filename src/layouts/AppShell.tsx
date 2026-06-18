"use client";

import { Bot, BriefcaseBusiness, ChevronDown, ChevronRight, CreditCard, LogOut, Menu, Settings, ShieldCheck, UserRound, Users, X } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { GlobalSearch } from "@/components/shell/GlobalSearch";
import { RoutePermissionGuard } from "@/components/auth/RoutePermissionGuard";
import { NotificationCenter } from "@/components/shell/NotificationCenter";
import { QuickActions } from "@/components/shell/QuickActions";
import { CentrixLogo } from "@/components/ui";
import { AdminShell } from "@/layouts/AdminShell";
import { favoriteNavigation, navigation, navigationGroups } from "@/data/navigation";
import { signOutAction } from "@/app/auth/actions";
import { useAuth } from "@/hooks/useAuth";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { canAccessAdminPortal, canAccessNavigationGroup, canAccessNavigationItem, canManageWorkspace } from "@/lib/auth/rbac";
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const { loading: authLoading, profile } = useAuth();
  const canOpenAdmin = canAccessAdminPortal(profile?.role);
  const canOpenWorkspaceAdmin = canManageWorkspace(profile?.role);
  const isPublicPage = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/mentions-legales", "/confidentialite", "/conditions-utilisation", "/conditions-vente", "/cookies"].includes(pathname) || pathname.startsWith("/auth/");
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

  const sidebarGroups = useMemo(() => {
    return navigationGroups
      .filter((group) => canAccessNavigationGroup(profile?.role, group.label))
      .map((group) => {
        const items = group.items.filter((item) => canAccessNavigationItem(profile?.role, item.moduleKey)).map((item) => {
          return {
            ...item,
            href: item.href,
            locked: false,
            originalHref: item.href,
            requiredPlan: "free"
          };
        });
        const active = items.some((item) => pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)));
        return { ...group, active, items };
      })
      .filter((group) => group.items.length > 0);
  }, [pathname, profile?.role]);

  const mobileNavigation = useMemo(() => {
    const accessibleFavorites = favoriteNavigation.filter((item) => canAccessNavigationItem(profile?.role, item.moduleKey));
    const accessibleNavigation = navigation.filter((item) => canAccessNavigationItem(profile?.role, item.moduleKey));
    return [...accessibleFavorites, ...accessibleNavigation].filter((item, index, list) => list.findIndex((entry) => entry.href === item.href) === index).slice(0, 5);
  }, [profile?.role]);

  const activeNavigationItem = useMemo(
    () => navigation.find((item) => pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))),
    [pathname]
  );

  const userMenuItems = [
    { label: "Mon profil", href: "/profile", icon: UserRound },
    ...(canOpenAdmin ? [{ label: "Portail CENTRIX", href: "/admin", icon: Settings }] : []),
    ...(canOpenWorkspaceAdmin ? [
      { label: "Portail entreprise", href: "/workspace-admin", icon: ShieldCheck },
      { label: "Mon abonnement", href: "/subscriptions", icon: CreditCard },
      { label: "Mon équipe", href: "/operations/users", icon: Users },
      { label: "Paramètres", href: "/settings", icon: Settings },
      { label: "Facturation", href: "/billing", icon: BriefcaseBusiness }
    ] : [])
  ];

  if (isPublicPage) {
    return <div className="min-h-screen bg-[#f6f8fb] text-slate-900">{children}</div>;
  }

  if (pathname.startsWith("/admin")) {
    return <AdminShell>{children}</AdminShell>;
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-900">
      <div className="fixed inset-0 -z-10 bg-app-light" />
      <div className="fixed inset-0 -z-10 bg-grid-light opacity-35" />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[268px] border-r border-white/10 bg-[#071226] px-3 py-4 text-white shadow-[18px_0_48px_rgba(7,18,38,0.24)]",
          "transition-transform duration-300 ease-out lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(37,99,235,0.18),transparent_24%),linear-gradient(90deg,rgba(255,255,255,0.035),transparent)]" />
        <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="group flex items-center gap-3" onClick={() => setOpen(false)}>
            <CentrixLogo inverse />
          </Link>
          <Button aria-label="Fermer le menu" className="h-9 w-9 px-0 text-white hover:bg-white/10 hover:text-white lg:hidden" onClick={() => setOpen(false)} variant="ghost">
            <X size={18} />
          </Button>
        </div>

        <div className="mt-5 rounded-[14px] border border-white/10 bg-white/[0.045] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-100/72">Workspace</p>
              <p className="mt-1 max-w-[160px] truncate text-sm font-bold text-white">{authLoading ? "Synchronisation..." : profile?.workspaceName ?? "CENTRIX Scale"}</p>
            </div>
          </div>
        </div>

        <nav className="mt-4 flex-1 space-y-1.5 overflow-y-auto pr-1 [scrollbar-width:none]">
          {sidebarGroups.map((group) => {
            const GroupIcon = group.icon;
            const collapsed = collapsedGroups[group.label] ?? !group.active;

            return (
              <div key={group.label} className="rounded-[13px] border border-white/[0.05] bg-white/[0.025] p-1">
                <button
                  className={cn(
                    "flex w-full items-center gap-2 rounded-[10px] px-2.5 py-2 text-left transition-all duration-200",
                    group.active ? "bg-white/[0.09] text-white" : "text-blue-100/70 hover:bg-white/[0.06] hover:text-white"
                  )}
                  onClick={() => setCollapsedGroups((current) => ({ ...current, [group.label]: !collapsed }))}
                  type="button"
                >
                  <span className={cn("grid h-7 w-7 place-items-center rounded-[9px]", group.active ? "bg-blue-500 text-white" : "bg-white/[0.06]")}>
                    <GroupIcon size={15} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[0.72rem] font-black uppercase tracking-[0.14em]">{group.label}</span>
                  {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                </button>

                <div className={cn("mt-1 space-y-1 overflow-hidden", collapsed && "hidden")}>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.originalHref || (item.originalHref !== "/" && pathname.startsWith(item.originalHref));

                    return (
                      <Link
                        key={`${group.label}-${item.originalHref}-${item.label}`}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        prefetch={!item.locked}
                        className={cn(
                          "group relative flex min-h-9 items-center gap-2.5 rounded-[10px] px-2.5 py-1.5 text-[13px] font-bold transition-all duration-200",
                          active
                            ? "bg-white text-[#071225] shadow-[0_6px_18px_rgba(0,0,0,0.18)]"
                            : item.locked
                              ? "text-blue-100/42 hover:bg-amber-300/10 hover:text-amber-100"
                              : "text-blue-100/72 hover:bg-white/[0.08] hover:text-white"
                        )}
                      >
                        {active ? <motion.span layoutId="sidebar-active" className="absolute inset-0 rounded-[10px] bg-white" transition={{ type: "spring", stiffness: 420, damping: 34 }} /> : null}
                        <span className={cn("relative z-10 grid h-7 w-7 place-items-center rounded-[8px]", active ? "bg-blue-50" : item.locked ? "bg-white/[0.035]" : "bg-white/[0.06]")}>
                          <Icon size={16} className={cn("transition-transform duration-200 group-hover:scale-110", active ? "text-[#2563EB]" : "")} />
                        </span>
                        <span className="relative z-10 min-w-0 flex-1 truncate">{item.label}</span>
                        {item.badge ? (
                          <span className="relative z-10 rounded-full bg-blue-600 px-2 py-0.5 text-[0.65rem] font-black text-white">{item.badge}</span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="mt-3 hidden rounded-[14px] border border-blue-300/15 bg-[#0d1b36] p-3 xl:block">
          <p className="text-sm font-bold text-white">Acces complet</p>
          <p className="mt-1 text-xs leading-5 text-blue-100/72">{profile?.workspaceName ? `${profile.workspaceName} synchronise avec Supabase Auth.` : "Modules metier, IA et donnees consolidees."}</p>
        </div>
        </div>
      </aside>

      {open ? <button aria-label="Fermer le menu" className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} /> : null}

      <div className="lg:pl-[268px]">
        <header className="sticky top-0 z-20 border-b border-slate-200/90 bg-white/95 shadow-[0_1px_0_rgba(15,23,42,0.03),0_8px_22px_rgba(15,23,42,0.032)] backdrop-blur-md">
          {authLoading ? <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-blue-50"><span className="block h-full w-1/2 animate-pulse bg-blue-600" /></div> : null}
          <div className="grid min-h-[58px] grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-2 sm:px-5 lg:px-7">
            <div className="flex min-w-0 items-center gap-2">
              <Button aria-label="Ouvrir le menu" className="h-9 w-9 px-0 lg:hidden" onClick={() => setOpen(true)} variant="surface">
                <Menu size={19} />
              </Button>
              <nav aria-label="Fil d'Ariane" className="hidden min-w-0 items-center gap-2 rounded-[12px] border border-slate-200 bg-white px-3 py-2 shadow-[0_1px_2px_rgba(15,23,42,0.035)] md:flex">
                <Link href="/dashboard" className="text-xs font-black uppercase tracking-[0.12em] text-slate-500 transition-colors hover:text-blue-700">
                  Accueil
                </Link>
                <ChevronRight size={14} className="text-slate-300" />
                <span className="max-w-[180px] truncate text-sm font-black text-slate-950">{activeNavigationItem?.label ?? "CENTRIX"}</span>
              </nav>
            </div>

            <div className="mx-auto hidden w-full max-w-2xl sm:block">
              <GlobalSearch />
            </div>

            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              <div className="sm:hidden">
                <GlobalSearch />
              </div>
              <QuickActions />
              <NotificationCenter />
              <Link
                aria-label="Assistant IA CENTRIX"
                className="grid h-9 w-9 place-items-center rounded-[10px] border border-slate-200 bg-white text-slate-600 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                href="/ia"
              >
                <Bot size={17} />
              </Link>
              <div className="relative">
                <button
                  className="flex h-9 items-center gap-2 rounded-[12px] border border-slate-200 bg-white px-1.5 pr-2 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:border-blue-300 hover:bg-blue-50/60"
                  onClick={() => setUserMenuOpen((current) => !current)}
                  type="button"
                >
                  <span className="grid h-7 w-7 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-[#0077ff] to-[#6d5dfc] text-[11px] font-bold text-white">
                    {profile?.avatarUrl ? <span className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${profile.avatarUrl})` }} /> : profileInitials}
                  </span>
                  <span className="hidden min-w-0 leading-tight lg:block">
                    <span className="block max-w-32 truncate text-sm font-black text-slate-950">{authLoading ? "Chargement" : profile?.fullName ?? "CENTRIX"}</span>
                    <span className="block max-w-32 truncate text-[11px] font-semibold text-slate-500">{profile?.workspaceName ?? "Workspace"}</span>
                  </span>
                  <ChevronDown size={14} className="hidden text-slate-400 sm:block" />
                </button>

                {userMenuOpen ? (
                  <div className="absolute right-0 top-11 z-50 w-72 overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.16)]">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="truncate text-sm font-black text-slate-950">{profile?.fullName ?? "Utilisateur CENTRIX"}</p>
                      <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">{profile?.workspaceName ?? "CENTRIX"}</p>
                    </div>
                    <div className="p-2">
                      {userMenuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            className="flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
                            href={item.href}
                            key={item.label}
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Icon size={16} />
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                    <div className="border-t border-slate-100 p-2">
                      <button
                        className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-sm font-bold text-rose-600 transition-colors hover:bg-rose-50"
                        onClick={async () => {
                          setUserMenuOpen(false);
                          await signOutAction();
                          router.push("/login");
                          router.refresh();
                        }}
                        type="button"
                      >
                        <LogOut size={16} />
                        Deconnexion
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <main className="centrix-content mobile-safe px-4 pb-28 pt-5 sm:px-6 lg:px-7 xl:px-8 lg:pb-12">
          <motion.div key={pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}>
            <RoutePermissionGuard>{children}</RoutePermissionGuard>
          </motion.div>
        </main>
      </div>

      <nav className="fixed bottom-3 left-3 right-3 z-30 grid grid-cols-5 gap-1 rounded-[16px] border border-slate-200 bg-white p-1.5 shadow-[0_12px_34px_rgba(15,23,42,0.14)] lg:hidden">
        {mobileNavigation.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-14 flex-col items-center justify-center gap-1 rounded-[12px] text-[11px] font-bold transition-all duration-200",
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
