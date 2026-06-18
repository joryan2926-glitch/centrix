"use client";

import { Activity, BarChart3, BellRing, Bot, Building2, ChevronRight, CreditCard, Database, GitBranch, Headphones, Home, LogOut, Settings, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOutAction } from "@/app/auth/actions";
import { RoutePermissionGuard } from "@/components/auth/RoutePermissionGuard";
import { CentrixLogo } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/Button";

type AdminShellProps = {
  children: React.ReactNode;
};

const adminNavigation = [
  { label: "Vue globale", href: "/admin", icon: Home },
  { label: "Utilisateurs", href: "/operations/users", icon: Users },
  { label: "Workspaces", href: "/multi-entreprises", icon: Building2 },
  { label: "Responsabilites & acces", href: "/permissions", icon: ShieldCheck },
  { label: "Abonnements", href: "/subscriptions", icon: CreditCard },
  { label: "Support global", href: "/support", icon: Headphones },
  { label: "Integrations", href: "/integrations", icon: GitBranch },
  { label: "Stripe", href: "/billing", icon: CreditCard },
  { label: "Supabase", href: "/api-management", icon: Database },
  { label: "IA", href: "/business-intelligence", icon: Bot },
  { label: "DocuSign & Brevo", href: "/integrations", icon: Settings },
  { label: "Monitoring", href: "/security", icon: Activity },
  { label: "Logs systeme", href: "/operations/audit", icon: BarChart3 }
] as const;

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-[#050b18] text-white">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[292px] border-r border-white/10 bg-[#050b18] px-4 py-5 shadow-[20px_0_70px_rgba(0,0,0,0.35)] lg:block">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(37,99,235,0.28),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_28%)]" />
        <div className="relative z-10 flex h-full flex-col">
          <Link href="/admin" className="flex items-center gap-3">
            <CentrixLogo inverse />
          </Link>

          <div className="mt-6 rounded-[18px] border border-blue-300/15 bg-blue-500/10 p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-200">Equipe CENTRIX</p>
              <p className="mt-2 truncate text-sm font-black text-white">{profile?.fullName ?? "Administrateur CENTRIX"}</p>
            <p className="mt-1 text-xs font-semibold text-blue-100/70">Portail interne separe de l&apos;espace client</p>
          </div>

          <nav className="mt-5 flex-1 space-y-1 overflow-y-auto pr-1 [scrollbar-width:none]">
            {adminNavigation.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={`${item.href}-${item.label}`}
                  href={item.href}
                  className={cn(
                    "flex min-h-10 items-center gap-3 rounded-[12px] px-3 py-2 text-sm font-bold transition-all duration-200",
                    active ? "bg-white text-[#050b18] shadow-[0_14px_30px_rgba(37,99,235,0.22)]" : "text-blue-100/72 hover:bg-white/[0.07] hover:text-white"
                  )}
                >
                  <span className={cn("grid h-8 w-8 place-items-center rounded-[10px]", active ? "bg-blue-50 text-blue-700" : "bg-white/[0.06]")}>
                    <Icon size={16} />
                  </span>
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {active ? <ChevronRight size={15} /> : null}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-2 border-t border-white/10 pt-4">
            <Link className="flex items-center gap-3 rounded-[12px] px-3 py-2 text-sm font-bold text-blue-100/72 transition hover:bg-white/[0.07] hover:text-white" href="/dashboard">
              <Home size={16} />
              Retour espace client
            </Link>
            <button
              className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2 text-sm font-bold text-rose-200 transition hover:bg-rose-500/10 hover:text-rose-100"
              onClick={async () => {
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
      </aside>

      <div className="lg:pl-[292px]">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050b18]/92 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex min-h-12 items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-200">Portail administrateur CENTRIX</p>
              <h1 className="mt-1 text-lg font-black text-white">Pilotage interne L&amp;R Solutions</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link className="hidden rounded-[11px] border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-bold text-blue-100 transition hover:bg-white/[0.10] sm:inline-flex" href="/dashboard">
                Espace client
              </Link>
              <Button className="h-10 border-blue-400 bg-blue-600 text-white hover:bg-blue-500" variant="primary">
                <BellRing size={16} />
                Alertes
              </Button>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <RoutePermissionGuard>{children}</RoutePermissionGuard>
        </main>
      </div>
    </div>
  );
}
