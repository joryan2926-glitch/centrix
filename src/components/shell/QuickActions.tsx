"use client";

import { ChevronRight, PlusCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/ui/Button";

const actions = [
  { label: "Nouveau client", href: "/crm", detail: "Créer une fiche et qualifier le lead" },
  { label: "Créer une facture", href: "/facturation", detail: "Devis, TVA, PDF et Stripe" },
  { label: "Lancer workflow", href: "/workflows", detail: "Automatisation type Zapier" },
  { label: "Demander à l'IA", href: "/ia", detail: "Assistant business CENTRIX" }
];

export function QuickActions() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative hidden sm:block">
      <Button onClick={() => setOpen((current) => !current)} variant="primary">
        <PlusCircle size={17} />
        Action rapide
      </Button>

      {open ? (
        <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="flex items-center gap-2 text-sm font-black text-slate-950">
              <Sparkles size={16} className="text-blue-600" />
              Acces rapides
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-500">Actions SaaS les plus frequentes</p>
          </div>
          <div className="p-2">
            {actions.map((action) => (
              <Link className="group flex items-center gap-3 rounded-[15px] p-3 transition-colors duration-200 hover:bg-blue-50" href={action.href} key={action.label} onClick={() => setOpen(false)}>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-black text-slate-950">{action.label}</span>
                  <span className="block truncate text-xs font-semibold text-slate-500">{action.detail}</span>
                </span>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600" />
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
