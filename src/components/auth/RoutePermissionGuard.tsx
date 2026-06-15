"use client";

import { LockKeyhole } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { getRouteModuleKey } from "@/lib/auth/module-access";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Skeleton } from "@/ui/Skeleton";

export function RoutePermissionGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const moduleKey = getRouteModuleKey(pathname) ?? "__public__";
  const permissions = useModulePermissions(moduleKey);
  if (moduleKey === "__public__") return children;
  if (permissions.loading) return <div className="space-y-4"><Skeleton className="h-32" /><Skeleton className="h-[420px]" /></div>;
  if (permissions.can_read) return children;
  return (
    <Card className="mx-auto max-w-xl p-8 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-[16px] bg-rose-50 text-rose-600"><LockKeyhole size={24} /></div>
      <h1 className="mt-5 text-2xl font-black text-slate-950">Acces non autorise</h1>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">Votre role ne dispose pas de la permission de lecture pour le module <strong>{moduleKey}</strong>.</p>
      <Link className="mt-6 inline-block" href="/dashboard"><Button variant="primary">Retour au dashboard</Button></Link>
    </Card>
  );
}
