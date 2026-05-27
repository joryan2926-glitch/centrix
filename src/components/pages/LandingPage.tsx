"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BarChart3, Bot, Check, ChevronDown, CreditCard, LockKeyhole, Network, Play, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { CentrixLogo } from "@/components/ui";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 }
};

const features = [
  { title: "CRM intelligent", detail: "Pipeline, scoring IA, relances et fiches clients.", icon: Network },
  { title: "Finance & billing", detail: "Factures, TVA, abonnements, Stripe et previsions.", icon: CreditCard },
  { title: "IA business", detail: "Insights, redaction, automatisations et recommandations.", icon: Bot },
  { title: "Securite enterprise", detail: "Sessions, logs, 2FA future et monitoring donnees.", icon: LockKeyhole }
];

const plans = [
  { name: "Starter", price: "29 EUR", detail: "Pour independants et petites equipes.", cta: "Demarrer" },
  { name: "Business", price: "99 EUR", detail: "Modules avances, IA et collaboration.", cta: "Choisir Business", highlighted: true },
  { name: "Enterprise", price: "Sur devis", detail: "Multi-societes, SSO futur, SLA et support.", cta: "Contacter" }
];

const faqs = [
  "CENTRIX remplace-t-il plusieurs outils ?",
  "Puis-je connecter Stripe, Google et Slack ?",
  "Les donnees sont-elles isolees par entreprise ?",
  "L'IA fonctionne-t-elle avec mes modules internes ?"
];

export function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f9fc] text-slate-950">
      <div className="fixed inset-0 -z-10 bg-app-light" />
      <div className="fixed inset-0 -z-10 bg-grid-light opacity-70" />

      <header className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="CENTRIX">
          <CentrixLogo />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-500 lg:flex">
          <a href="#features" className="hover:text-blue-700">Fonctionnalites</a>
          <a href="#pricing" className="hover:text-blue-700">Pricing</a>
          <a href="#faq" className="hover:text-blue-700">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden text-sm font-semibold text-slate-600 hover:text-blue-700 sm:block">Login</Link>
          <Link href="/register">
            <Button variant="primary">Essayer <ArrowRight size={16} /></Button>
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:px-8 lg:pb-24 lg:pt-16">
        <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.12 }} className="flex flex-col justify-center">
          <motion.div variants={fadeUp} className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-white/82 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-700 shadow-sm backdrop-blur-xl">
            <Sparkles size={15} />
            Enterprise SaaS Operating OS
          </motion.div>
          <motion.h1 variants={fadeUp} className="mt-7 max-w-4xl text-5xl font-black tracking-tight text-slate-950 sm:text-7xl">
            Le cockpit premium pour piloter toute votre entreprise.
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            CENTRIX rassemble CRM, finance, billing, RH, marketing, IA, support, documents, securite et analytics dans une experience fluide, claire et scalable.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/register"><Button className="w-full sm:w-auto" variant="primary">Creer mon workspace <ArrowRight size={17} /></Button></Link>
            <Link href="/dashboard"><Button className="w-full sm:w-auto"><Play size={17} /> Voir le cockpit</Button></Link>
          </motion.div>
          <motion.div variants={fadeUp} className="mt-8 grid gap-3 sm:grid-cols-3">
            {["68 routes SaaS", "Realtime ready", "Supabase + Stripe"].map((item) => (
              <div key={item} className="rounded-[14px] border border-slate-200 bg-white/75 px-4 py-3 text-sm font-bold text-slate-700 shadow-[0_14px_36px_rgba(15,23,42,0.05)] backdrop-blur-xl">
                {item}
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.96, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative">
          <div className="absolute -inset-6 rounded-[36px] bg-blue-500/10 blur-3xl" />
          <Card className="relative p-4 sm:p-5">
            <div className="rounded-[22px] bg-[#071225] p-4 text-white shadow-[0_28px_80px_rgba(15,23,42,0.22)]">
              <div className="flex items-center justify-between">
                <CentrixLogo inverse compact />
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-200">Live</span>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {["MRR 84.2K", "Score IA 91", "Pipeline 428K"].map((metric) => (
                  <div key={metric} className="rounded-[16px] border border-white/10 bg-white/[0.07] p-4">
                    <p className="text-xs text-blue-100/70">CENTRIX</p>
                    <p className="mt-2 text-xl font-black">{metric}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.7fr]">
                <div className="rounded-[18px] border border-white/10 bg-white/[0.07] p-4">
                  <div className="flex h-48 items-end gap-2">
                    {[42, 62, 55, 74, 69, 88, 96].map((height, index) => (
                      <motion.div key={index} initial={{ height: 12 }} animate={{ height }} transition={{ delay: index * 0.08 }} className="flex-1 rounded-t-[10px] bg-gradient-to-t from-blue-700 to-cyan-300" />
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  {["Lead gagne", "Facture payee", "Insight IA", "Webhook Stripe"].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-[14px] bg-white/[0.07] p-3">
                      <Check size={17} className="text-emerald-300" />
                      <span className="text-sm font-semibold">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }}>
                <Card interactive className="h-full p-5">
                  <div className="grid h-12 w-12 place-items-center rounded-[16px] bg-blue-600 text-white shadow-[0_16px_34px_rgba(37,99,235,0.24)]">
                    <Icon size={21} />
                  </div>
                  <h3 className="mt-5 text-lg font-black text-slate-950">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{feature.detail}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <Card className="grid gap-8 p-6 lg:grid-cols-[0.8fr_1.2fr] lg:p-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">Business intelligence</p>
            <h2 className="mt-4 text-3xl font-black text-slate-950">Analytics IA, previsions et rapports intelligents.</h2>
            <p className="mt-4 text-sm leading-6 text-slate-500">Suivez croissance, revenus, pipeline, churn, automatisations et securite dans une seule lecture executive.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Croissance", "+28%", BarChart3],
              ["Automations", "1 284", Zap],
              ["Securite", "99.9%", ShieldCheck]
            ].map(([label, value, Icon]) => (
              <div key={String(label)} className="rounded-[18px] border border-slate-200 bg-white/78 p-5">
                <Icon className="text-blue-600" size={22} />
                <p className="mt-4 text-sm text-slate-500">{String(label)}</p>
                <p className="mt-1 text-3xl font-black text-slate-950">{String(value)}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">Pricing</p>
            <h2 className="mt-3 text-3xl font-black text-slate-950">Des plans clairs pour scaler.</h2>
          </div>
          <p className="max-w-lg text-sm text-slate-500">Billing Stripe, upgrade/downgrade et espace paiement sont prepares dans le module SaaS Billing.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.name} interactive className={`p-6 ${plan.highlighted ? "border-blue-200 ring-2 ring-blue-500/20" : ""}`}>
              <h3 className="text-xl font-black text-slate-950">{plan.name}</h3>
              <p className="mt-4 text-4xl font-black text-blue-700">{plan.price}</p>
              <p className="mt-3 text-sm leading-6 text-slate-500">{plan.detail}</p>
              <ul className="mt-6 space-y-3 text-sm font-semibold text-slate-700">
                {["Modules premium", "Realtime", "Support prioritaire"].map((item) => (
                  <li key={item} className="flex items-center gap-2"><Check size={16} className="text-emerald-600" />{item}</li>
                ))}
              </ul>
              <Link href="/register"><Button className="mt-6 w-full" variant={plan.highlighted ? "primary" : "surface"}>{plan.cta}</Button></Link>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <Card className="p-6 lg:p-8">
          <h2 className="text-3xl font-black text-slate-950">Ils construisent plus vite avec CENTRIX.</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {["NovaCore a centralise ventes et finance en 10 jours.", "Blue Atlas pilote 4 societes depuis un seul workspace.", "Orion Cloud automatise support, facturation et CRM."].map((quote) => (
              <div key={quote} className="rounded-[18px] border border-slate-200 bg-white/76 p-5 text-sm leading-6 text-slate-600">
                &ldquo;{quote}&rdquo;
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section id="faq" className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-black text-slate-950">Questions frequentes</h2>
        <div className="mt-7 space-y-3">
          {faqs.map((faq) => (
            <Card key={faq} className="flex items-center justify-between p-4">
              <span className="font-semibold text-slate-800">{faq}</span>
              <ChevronDown size={18} className="text-slate-400" />
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-[28px] bg-[#071225] p-8 text-center text-white shadow-[0_30px_90px_rgba(15,23,42,0.24)]">
          <CentrixLogo inverse compact className="mx-auto" />
          <h2 className="mx-auto mt-6 max-w-2xl text-4xl font-black">Lancez votre cockpit enterprise en quelques minutes.</h2>
          <Link href="/onboarding"><Button className="mt-7" variant="primary">Demarrer l&apos;onboarding <ArrowRight size={17} /></Button></Link>
        </div>
      </section>
    </main>
  );
}
