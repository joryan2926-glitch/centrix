"use client";

import { Building2, Cable, CreditCard, LayoutGrid, Settings, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/ui/Badge";
import { Card } from "@/ui/Card";

const workspaceAdminSections = [
  {
    title: "Entreprise",
    description: "Informations legales, branding, modules actifs et configuration du workspace.",
    href: "/settings",
    icon: Building2
  },
  {
    title: "Equipe",
    description: "Collaborateurs, invitations, roles et organisation interne.",
    href: "/operations/users",
    icon: Users
  },
  {
    title: "Acces collaborateurs",
    description: "Permissions, controles d'acces et securite de l'entreprise.",
    href: "/permissions",
    icon: ShieldCheck
  },
  {
    title: "Modules",
    description: "Configuration des modules metier CENTRIX pour votre organisation.",
    href: "/settings",
    icon: LayoutGrid
  },
  {
    title: "Integrations",
    description: "Connecteurs Google, Stripe, Bridge, Brevo, DocuSign et services externes.",
    href: "/integrations",
    icon: Cable
  },
  {
    title: "Abonnement",
    description: "Plan, facturation SaaS, quotas et portail de paiement.",
    href: "/subscriptions",
    icon: CreditCard
  }
] as const;

export function WorkspaceAdminWorkspace() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <Badge tone="cyan">Responsable entreprise</Badge>
            <h1 className="mt-4 text-3xl font-black tracking-[-0.04em] text-slate-950">Administration de votre entreprise</h1>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
              Configurez votre workspace, vos equipes, les acces collaborateurs et les integrations externes sans acceder au portail interne CENTRIX.
            </p>
          </div>
          <div className="grid h-14 w-14 place-items-center rounded-[18px] border border-blue-200 bg-blue-50 text-blue-700 shadow-[0_14px_40px_rgba(37,99,235,0.14)]">
            <Settings size={26} />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {workspaceAdminSections.map((section) => {
          const Icon = section.icon;
          return (
            <Link href={section.href} key={section.title}>
              <Card interactive className="h-full p-5">
                <div className="grid h-11 w-11 place-items-center rounded-[14px] border border-slate-200 bg-white text-blue-700 shadow-sm">
                  <Icon size={20} />
                </div>
                <h2 className="mt-5 text-lg font-black text-slate-950">{section.title}</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{section.description}</p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
