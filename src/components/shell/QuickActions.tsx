"use client";

import { ChevronRight, FileText, FolderKanban, Plus, ReceiptText, ScrollText, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/ui/Button";

const actions = [
  { label: "Client", href: "/clients", detail: "Ajouter une fiche client", icon: UserPlus },
  { label: "Devis", href: "/operations/quotes", detail: "Creer une proposition commerciale", icon: ScrollText },
  { label: "Facture", href: "/facturation", detail: "Generer une facture PDF", icon: ReceiptText },
  { label: "Tache", href: "/tasks", detail: "Planifier une action", icon: FileText },
  { label: "Projet", href: "/projects", detail: "Lancer un projet equipe", icon: FolderKanban }
];

export function QuickActions() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button className="h-9 rounded-[11px] px-3 shadow-[0_10px_24px_rgba(37,99,235,0.24)]" onClick={() => setOpen((current) => !current)} variant="primary">
        <Plus size={17} />
        <span className="hidden sm:inline">Creer</span>
      </Button>

      {open ? (
        <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.16)]">
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-sm font-black text-slate-950">Creer</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">Demarrer une action metier</p>
          </div>
          <div className="p-2">
            {actions.map((action) => {
              const Icon = action.icon;

              return (
                <Link className="group flex items-center gap-3 rounded-[14px] p-3 transition-colors duration-200 hover:bg-blue-50" href={action.href} key={action.label} onClick={() => setOpen(false)}>
                  <span className="grid h-9 w-9 place-items-center rounded-[12px] bg-blue-50 text-blue-700">
                    <Icon size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-black text-slate-950">{action.label}</span>
                    <span className="block truncate text-xs font-semibold text-slate-500">{action.detail}</span>
                  </span>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600" />
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
