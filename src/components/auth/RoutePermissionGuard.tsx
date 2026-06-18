"use client";

import { LockKeyhole } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { canAccessAdminPortal, canAccessModule } from "@/lib/auth/rbac";
import { getRouteModuleKey } from "@/lib/auth/module-access";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Skeleton } from "@/ui/Skeleton";

export function RoutePermissionGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { loading, profile } = useAuth();
  const moduleKey = getRouteModuleKey(pathname);

  if (loading) return <div className="space-y-4"><Skeleton className="h-32" /><Skeleton className="h-[420px]" /></div>;
  if (pathname.startsWith("/admin") && !canAccessAdminPortal(profile?.role)) return <RoleDenied moduleKey="admin" />;
  if (!moduleKey || canAccessModule(profile?.role, moduleKey)) return children;
  return <RoleDenied moduleKey={moduleKey} />;
}

function RoleDenied({ moduleKey }: { moduleKey: string }) {
  return (
    <Card className="mx-auto max-w-xl p-8 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-[16px] bg-rose-50 text-rose-600"><LockKeyhole size={24} /></div>
      <h1 className="mt-5 text-2xl font-black text-slate-950">Acces reserve</h1>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
        Votre profil CENTRIX ne permet pas d&apos;ouvrir le module <strong>{moduleKey}</strong>. Demandez un acces responsable d&apos;entreprise si necessaire.
      </p>
      <Link className="mt-6 inline-block" href="/dashboard"><Button variant="primary">Retour au dashboard</Button></Link>
    </Card>
  );
}
