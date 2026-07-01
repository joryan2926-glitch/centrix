import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  HelpCircle,
  Mail,
  Network,
  Rocket,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Workflow,
  Zap
} from "lucide-react";

export const metadata: Metadata = {
  title: "CENTRIX | Business OS simple pour TPE, indépendants et PME",
  description:
    "CENTRIX est le copilote de gestion, relation client, finance, marketing et IA pour piloter une entreprise sans empiler les outils.",
  alternates: {
    canonical: "/"
  },
  keywords: [
    "logiciel de gestion d'entreprise",
    "CRM SaaS",
    "logiciel CRM",
    "facturation en ligne",
    "devis et factures",
    "comptabilite entreprise",
    "gestion de projet",
    "logiciel RH",
    "automatisation entreprise",
    "logiciel tout-en-un",
    "Business OS",
    "CENTRIX"
  ],
  openGraph: {
    title: "CENTRIX | Le copilote business des petites entreprises",
    description:
      "Centralisez prospects, clients, devis, factures, trésorerie, marketing et conseils IA dans une interface SaaS premium.",
    url: "/",
    type: "website"
  }
};

const features = [
  {
    icon: Network,
    title: "CRM & relation client",
    text: "Gérez prospects, clients, pipeline commercial, relances, notes, historique et scoring IA dans un CRM SaaS moderne."
  },
  {
    icon: CreditCard,
    title: "Devis, facturation & paiements",
    text: "Créez devis et factures, suivez les paiements, la TVA, les statuts et préparez vos exports comptables."
  },
  {
    icon: BarChart3,
    title: "Finance & trésorerie",
    text: "Suivez revenus, dépenses, comptes bancaires, cashflow, prévisions et alertes de trésorerie."
  },
  {
    icon: ClipboardList,
    title: "Marketing & acquisition",
    text: "Lancez campagnes email, formulaires, landing pages et actions marketing pour convertir plus de prospects."
  },
  {
    icon: UsersRound,
    title: "Réseaux sociaux",
    text: "Planifiez vos publications, structurez votre calendrier éditorial et analysez l'engagement."
  },
  {
    icon: Workflow,
    title: "Entreprise",
    text: "Gérez profil entreprise, collaborateurs, documents essentiels, paramètres et support."
  },
  {
    icon: Bot,
    title: "IA business",
    text: "Générez emails, contenus, documents, analyses, recommandations et insights stratégiques avec l'IA CENTRIX."
  },
  {
    icon: ShieldCheck,
    title: "Intégrations essentielles",
    text: "Connectez Stripe, Bridge, Brevo, DocuSign, Google et Mistral pour industrialiser vos opérations."
  }
];

const plans = [
  {
    name: "Free",
    price: "0 €",
    description: "Pour découvrir CENTRIX et structurer les premiers éléments de votre entreprise.",
    features: ["1 utilisateur", "500 Mo de stockage", "Dashboard", "Profil entreprise", "Agenda personnel", "Centre d'aide"]
  },
  {
    name: "Starter",
    price: "29 €",
    description: "Pour indépendants, TPE et petites équipes qui veulent vendre et facturer plus vite.",
    features: ["3 utilisateurs", "CRM", "Clients", "Devis", "Factures", "Paiements", "Agenda", "Documents basiques"]
  },
  {
    name: "Premium",
    price: "79 €",
    description: "Pour équipes qui veulent analyser, vendre et communiquer avec l'IA.",
    highlighted: true,
    features: ["10 utilisateurs", "Tout Starter", "Marketing", "Réseaux sociaux", "IA CENTRIX", "Support", "Analytics", "Rapports"]
  },
  {
    name: "Business",
    price: "149 €",
    description: "Pour entreprises en croissance avec banque, trésorerie, réseaux sociaux et intégrations avancées.",
    features: ["Utilisateurs illimités", "Tout Premium", "Banque", "Trésorerie", "Marketing", "Réseaux sociaux", "API"]
  },
  {
    name: "Entreprise",
    price: "Sur devis",
    description: "Pour organisations avec besoins d'accompagnement, gouvernance et intégrations avancées.",
    features: ["Tout Business", "Accompagnement dédié", "Gouvernance", "SSO futur", "API illimitée", "Support prioritaire"]
  }
];

const faqs = [
  {
    question: "CENTRIX remplace-t-il un CRM, un outil de facturation et des outils marketing ?",
    answer:
      "Oui. CENTRIX réunit prospects, clients, devis, factures, trésorerie, marketing, réseaux sociaux et IA business dans une seule interface SaaS."
  },
  {
    question: "CENTRIX convient-il aux indépendants, TPE, PME et associations ?",
    answer:
      "Oui. La plateforme est pensée pour les structures qui veulent piloter leur activité simplement sans mettre en place un outil lourd."
  },
  {
    question: "Les données affichées sont-elles réelles ?",
    answer:
      "Oui. Les modules de l'application utilisent les données Supabase du workspace. Lorsqu'il n'y a aucune donnée, CENTRIX affiche un état vide professionnel."
  },
  {
    question: "Puis-je connecter Stripe, Google, Bridge, Brevo, Mistral et DocuSign ?",
    answer:
      "CENTRIX prépare les intégrations clés pour paiements, authentification, banque, emails, IA et signatures électroniques."
  },
  {
    question: "Les données sont-elles séparées par entreprise ?",
    answer:
      "Oui. CENTRIX est conçu avec une architecture multi-workspace et des permissions pour isoler les données de chaque entreprise."
  }
];

const seoKeywords = [
  "CRM",
  "facturation",
  "comptabilité",
  "gestion de projet",
  "ressources humaines",
  "automatisation",
  "logiciel de gestion d'entreprise",
  "Business OS",
  "IA business",
  "tableau de bord entreprise"
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f8fb] text-slate-950">
      <div className="fixed inset-0 -z-10 bg-app-light" />
      <div className="fixed inset-0 -z-10 bg-grid-light opacity-50" />

      <header className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Accueil CENTRIX" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-gradient-to-br from-blue-500 to-blue-900 text-xl font-black text-white shadow-[0_16px_34px_rgba(37,99,235,0.25)]">C</span>
          <span className="text-xl font-black tracking-tight text-slate-950">centrix</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-bold text-slate-600 lg:flex" aria-label="Navigation publique">
          <a href="#fonctionnalites" className="transition hover:text-blue-700">Fonctionnalités</a>
          <a href="#tarifs" className="transition hover:text-blue-700">Tarifs</a>
          <a href="#faq" className="transition hover:text-blue-700">FAQ</a>
          <a href="#contact" className="transition hover:text-blue-700">Contact</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden rounded-[10px] px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-white hover:text-blue-700 sm:inline-flex">Connexion</Link>
          <Link href="/register" className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-gradient-to-b from-[#3478f6] to-[#2563EB] px-4 text-sm font-black text-white shadow-[0_12px_28px_rgba(37,99,235,0.24)] transition hover:-translate-y-0.5">
            Essayer CENTRIX <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:px-8 lg:pb-24 lg:pt-16">
        <div className="flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-white/90 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-blue-700 shadow-sm">
            <Sparkles size={15} />
            Business OS pour TPE, indépendants et PME
          </div>
          <h1 className="mt-7 max-w-4xl text-5xl font-black tracking-tight text-slate-950 sm:text-7xl">
            Pilotez clients, finance, marketing et croissance depuis CENTRIX.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            CENTRIX centralise prospects, clients, devis, factures, trésorerie, réseaux sociaux, marketing et conseiller IA dans une interface premium pensée pour les dirigeants.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-gradient-to-b from-[#3478f6] to-[#2563EB] px-6 text-sm font-black text-white shadow-[0_18px_34px_rgba(37,99,235,0.26)] transition hover:-translate-y-0.5">
              Créer mon compte <ArrowRight size={17} />
            </Link>
            <a href="#fonctionnalites" className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] border border-slate-200 bg-white px-6 text-sm font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-700">
              Voir les fonctionnalités <Rocket size={17} />
            </a>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {seoKeywords.slice(0, 6).map((keyword) => (
              <span key={keyword} className="rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-xs font-bold text-slate-600">
                {keyword}
              </span>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-8 rounded-[40px] bg-blue-500/10 blur-3xl" />
          <section className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/88 p-5 shadow-[0_30px_100px_rgba(15,23,42,0.14)]">
            <div className="rounded-[24px] bg-[#071225] p-5 text-white shadow-[0_26px_80px_rgba(15,23,42,0.26)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-200">Dashboard CENTRIX</p>
                  <h2 className="mt-2 text-2xl font-black">Cockpit entreprise</h2>
                </div>
                <span className="rounded-full bg-blue-400/15 px-3 py-1 text-xs font-bold text-blue-100">SaaS premium</span>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  ["CRM", "Pipeline"],
                  ["Finance", "Cashflow"],
                  ["IA", "Insights"]
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[16px] border border-white/10 bg-white/[0.07] p-4">
                    <p className="text-xs text-blue-100/70">{label}</p>
                    <p className="mt-2 text-xl font-black">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.72fr]">
                <div className="rounded-[18px] border border-white/10 bg-white/[0.07] p-4">
                  <div className="flex h-48 items-end gap-2" aria-label="Graphique de croissance CENTRIX">
                    {[42, 62, 55, 74, 69, 88, 96].map((height, index) => (
                      <div key={index} className="flex-1 rounded-t-[10px] bg-gradient-to-t from-blue-700 to-cyan-300" style={{ height }} />
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  {["Nouveau client", "Facture payée", "Projet livré", "Automatisation"].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-[14px] bg-white/[0.07] p-3">
                      <CheckCircle2 size={17} className="text-emerald-300" />
                      <span className="text-sm font-semibold">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>

      <section id="fonctionnalites" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Fonctionnalités CENTRIX</p>
          <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950">Les outils essentiels pour gérer et développer une entreprise.</h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Remplacez les outils dispersés par une plateforme claire, connectée et orientée croissance.
          </p>
        </div>
        <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="rounded-[20px] border border-slate-200 bg-white/88 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_22px_58px_rgba(37,99,235,0.12)]">
                <div className="grid h-12 w-12 place-items-center rounded-[16px] bg-blue-600 text-white shadow-[0_16px_34px_rgba(37,99,235,0.24)]">
                  <Icon size={21} />
                </div>
                <h3 className="mt-5 text-lg font-black text-slate-950">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{feature.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="rounded-[24px] border border-slate-200 bg-white/90 p-7 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Pourquoi CENTRIX</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950">Une alternative moderne aux outils dispersés.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              CENTRIX est conçu pour les dirigeants, indépendants et équipes qui veulent une vision claire de leur activité commerciale, financière et marketing.
            </p>
          </section>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Centralisation", "CRM, factures, trésorerie, marketing et IA au même endroit."],
              ["Automatisation", "Moins de clics, plus d'actions concrètes pour avancer chaque jour."],
              ["Décision", "Des KPI, rapports et recommandations IA pour agir plus vite."]
            ].map(([title, text]) => (
              <article key={title} className="rounded-[20px] border border-slate-200 bg-white/88 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
                <Zap className="text-blue-600" size={22} />
                <h3 className="mt-4 font-black text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="tarifs" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Tarifs</p>
          <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950">Des plans adaptés à chaque étape.</h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Commencez gratuitement, puis débloquez progressivement CRM avancé, automatisations, IA, RH, banque, marketing, API et multi-entreprises.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-5">
          {plans.map((plan) => (
            <article key={plan.name} className={`rounded-[22px] border bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] ${plan.highlighted ? "border-blue-300 ring-2 ring-blue-500/20" : "border-slate-200"}`}>
              <div className="flex min-h-[116px] flex-col">
                <h3 className="text-xl font-black text-slate-950">{plan.name}</h3>
                <p className="mt-3 text-3xl font-black text-blue-700">{plan.price}</p>
                <p className="mt-3 text-sm leading-6 text-slate-500">{plan.description}</p>
              </div>
              <ul className="mt-6 space-y-3 text-sm font-semibold text-slate-700">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={16} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href={plan.name === "Entreprise" ? "#contact" : "/register"} className={`mt-6 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[10px] text-sm font-black transition ${plan.highlighted ? "bg-blue-600 text-white shadow-[0_14px_30px_rgba(37,99,235,0.22)] hover:bg-blue-700" : "border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700"}`}>
                {plan.name === "Entreprise" ? "Nous contacter" : "Choisir ce plan"}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">FAQ</p>
          <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950">Questions fréquentes</h2>
        </div>
        <div className="mt-9 grid gap-4">
          {faqs.map((item) => (
            <article key={item.question} className="rounded-[20px] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
              <div className="flex gap-3">
                <HelpCircle className="mt-1 shrink-0 text-blue-600" size={20} />
                <div>
                  <h3 className="font-black text-slate-950">{item.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.answer}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 rounded-[28px] bg-[#071225] p-7 text-white shadow-[0_30px_90px_rgba(15,23,42,0.24)] lg:grid-cols-[1fr_0.75fr] lg:p-9">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-200">Contact</p>
            <h2 className="mt-4 text-4xl font-black tracking-tight">Vous voulez piloter votre entreprise avec CENTRIX ?</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-50/76">
              Contactez l&apos;équipe CENTRIX pour une démonstration, une question sur les tarifs, l&apos;activation d&apos;un module ou l&apos;accompagnement de votre entreprise.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href="mailto:contact@app-centrix.fr" className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-white px-5 text-sm font-black text-slate-950 transition hover:-translate-y-0.5">
                <Mail size={17} />
                contact@app-centrix.fr
              </a>
              <Link href="/register" className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-blue-600 px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-blue-500">
                Démarrer maintenant <ArrowRight size={17} />
              </Link>
            </div>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-white/[0.07] p-5">
            <BriefcaseBusiness className="text-cyan-200" size={28} />
            <h3 className="mt-4 text-xl font-black">Mots-clés couverts</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {seoKeywords.map((keyword) => (
                <span key={keyword} className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-1.5 text-xs font-bold text-blue-50">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white/80 px-4 py-8 text-sm text-slate-500 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold">© 2026 CENTRIX - L&R Solutions.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/mentions-legales" className="hover:text-blue-700">Mentions légales</Link>
            <Link href="/conditions-utilisation" className="hover:text-blue-700">CGU</Link>
            <Link href="/conditions-vente" className="hover:text-blue-700">CGV</Link>
            <Link href="/confidentialite" className="hover:text-blue-700">Confidentialité</Link>
            <Link href="/cookies" className="hover:text-blue-700">Cookies</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
