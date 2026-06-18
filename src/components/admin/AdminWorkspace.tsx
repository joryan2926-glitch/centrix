"use client";

import {
  BarChart3,
  Building2,
  CreditCard,
  GitBranch,
  Headphones,
  ShieldCheck,
  Users,
  Workflow
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/ui/Badge";
import { Card } from "@/ui/Card";

const adminSections = [
  {
    title: "Utilisateurs",
    description: "Superviser les comptes, les roles globaux et les acces sensibles.",
    href: "/operations/users",
    icon: Users
  },
  {
    title: "Workspaces",
    description: "Controler les entreprises, tenants, equipes et espaces actifs.",
    href: "/multi-entreprises",
    icon: Building2
  },
  {
    title: "Abonnements",
    description: "Suivre les plans, statuts Stripe, upgrades et incidents billing.",
    href: "/subscriptions",
    icon: CreditCard
  },
  {
    title: "Support",
    description: "Piloter les tickets, escalades et demandes prioritaires.",
    href: "/support",
    icon: Headphones
  },
  {
    title: "Integrations",
    description: "Verifier Google, Stripe, Bridge, Brevo, DocuSign et Mistral.",
    href: "/integrations",
    icon: GitBranch
  },
  {
    title: "Statistiques globales",
    description: "Analyser la performance plateforme via les donnees Supabase.",
    href: "/business-intelligence",
    icon: BarChart3
  }
] as const;

const controlPoints = [
  "Gestion globale des utilisateurs",
  "Gestion globale des workspaces",
  "Suivi abonnements et paiements",
  "Pilotage support et incidents",
  "Controle integrations et webhooks",
  "Statistiques globales plateforme"
];

export function AdminWorkspace() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <Badge tone="cyan">SUPER_ADMIN uniquement</Badge>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">Portail administration CENTRIX</h1>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
              Espace separe pour administrer la plateforme CENTRIX au niveau global. Les administrateurs workspace restent
              limites a leur entreprise, leurs equipes et leurs parametres.
            </p>
          </div>
          <div className="grid h-14 w-14 place-items-center rounded-[18px] border border-blue-200 bg-blue-50 text-blue-700 shadow-[0_14px_40px_rgba(37,99,235,0.14)]">
            <ShieldCheck size={26} />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {adminSections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.title} href={section.href}>
              <Card interactive className="h-full p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="grid h-11 w-11 place-items-center rounded-[14px] border border-slate-200 bg-white text-blue-700 shadow-sm">
                    <Icon size={20} />
                  </div>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                    Admin
                  </span>
                </div>
                <h2 className="mt-5 text-lg font-black text-slate-950">{section.title}</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{section.description}</p>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-[13px] bg-slate-950 text-white">
            <Workflow size={18} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-950">Couverture RBAC active</h2>
            <p className="text-sm font-semibold text-slate-600">Les menus et routes sont filtres automatiquement par role.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {controlPoints.map((point) => (
            <div key={point} className="flex items-center gap-3 rounded-[14px] border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600 shadow-[0_0_0_4px_rgba(37,99,235,0.12)]" />
              {point}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
