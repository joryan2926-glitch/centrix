"use client";

import { motion } from "framer-motion";
import { Bot, Building2, CheckCircle2, CreditCard, Database, Rocket, ShieldCheck, Sparkles, UsersRound, Wand2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Badge } from "@/ui/Badge";
import { Toast } from "@/ui/Toast";

const steps = [
  { id: "company", title: "Configurer l'entreprise", detail: "Logo, TVA, IBAN, devise et informations legales.", icon: Building2 },
  { id: "team", title: "Inviter l'equipe", detail: "Admins, managers, employes et permissions modules.", icon: UsersRound },
  { id: "billing", title: "Activer le billing", detail: "Stripe, plans SaaS, factures et espace paiement.", icon: CreditCard },
  { id: "data", title: "Importer les donnees", detail: "Clients, factures, documents, RH et historique CRM.", icon: Database },
  { id: "security", title: "Securiser l'acces", detail: "Sessions, logs, 2FA future et politique RGPD.", icon: ShieldCheck },
  { id: "ai", title: "Initialiser l'IA", detail: "Prompts business, scoring, insights et automatisations.", icon: Bot }
] as const;

const recommendations = [
  "Importer les 50 meilleurs clients avant d'activer le scoring IA.",
  "Connecter Stripe avant la publication des plans tarifaires.",
  "Activer les notifications critiques pour securite, factures et support.",
  "Creer un workflow de relance CRM apres la premiere synchronisation."
];

export function OnboardingWorkspace() {
  const [completed, setCompleted] = useState<string[]>(["company", "security"]);
  const [toast, setToast] = useState<{ title: string; detail: string } | null>(null);
  const progress = useMemo(() => Math.round((completed.length / steps.length) * 100), [completed]);

  function toggleStep(id: string) {
    setCompleted((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      return next;
    });
  }

  function launchAssistant() {
    setToast({ title: "Assistant IA onboarding", detail: "Plan de configuration enterprise genere pour votre workspace CENTRIX." });
    window.setTimeout(() => setToast(null), 3200);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {toast ? <Toast title={toast.title} detail={toast.detail} /> : null}
      <section className="overflow-hidden rounded-[24px] bg-[#071225] p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <Badge tone="cyan">Onboarding intelligent</Badge>
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">Configurez CENTRIX comme une plateforme enterprise.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-blue-50/72">
              Tutoriel interactif, checklist de demarrage, configuration entreprise et recommandations IA pour lancer un workspace propre.
            </p>
          </div>
          <Card className="border-white/10 bg-white/[0.08] p-5 text-white">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-blue-50/70">Progression</span>
              <Rocket size={20} className="text-cyan-200" />
            </div>
            <p className="mt-3 text-5xl font-black">{progress}%</p>
            <div className="mt-5 h-3 rounded-full bg-white/10">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-300" animate={{ width: `${progress}%` }} />
            </div>
          </Card>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.75fr]">
        <Card className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-950">Checklist de demarrage</h2>
              <p className="mt-1 text-sm text-slate-500">Chaque etape prepare un module CENTRIX pour un usage reel.</p>
            </div>
            <Button onClick={launchAssistant} variant="primary">
              <Wand2 size={17} />
              Assistant IA
            </Button>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const done = completed.includes(step.id);
              return (
                <motion.button
                  key={step.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => toggleStep(step.id)}
                  className={`rounded-[18px] border p-4 text-left shadow-[0_14px_36px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-0.5 ${
                    done ? "border-blue-200 bg-blue-50/80" : "border-slate-200 bg-white/84 hover:border-blue-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`grid h-11 w-11 place-items-center rounded-[14px] ${done ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                      <Icon size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-black text-slate-950">{step.title}</p>
                        {done ? <CheckCircle2 size={18} className="text-emerald-600" /> : null}
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-500">{step.detail}</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-[16px] bg-blue-600 text-white">
                <Sparkles size={22} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-950">Recommandations IA</h2>
                <p className="text-sm text-slate-500">Priorites de configuration.</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {recommendations.map((item) => (
                <div key={item} className="rounded-[14px] border border-slate-200 bg-white/78 p-4 text-sm font-medium leading-6 text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-black text-slate-950">Configuration entreprise</h2>
            <div className="mt-5 grid gap-3">
              {["Nom entreprise", "TVA intracommunautaire", "IBAN principal", "Branding workspace"].map((label) => (
                <label key={label} className="text-sm font-semibold text-slate-700">
                  {label}
                  <input className="mt-2 h-11 w-full rounded-[12px] border border-slate-200 bg-white px-3 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100" placeholder={label} />
                </label>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
