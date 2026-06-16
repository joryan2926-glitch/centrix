import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { CentrixLogo } from "@/components/ui";

export type LegalSection = {
  title: string;
  body: string;
  items?: string[];
};

type LegalPageProps = {
  title: string;
  eyebrow: string;
  description: string;
  updatedAt: string;
  sections: LegalSection[];
};

const legalLinks = [
  { href: "/mentions-legales", label: "Mentions legales" },
  { href: "/confidentialite", label: "Confidentialite" },
  { href: "/conditions-utilisation", label: "CGU" },
  { href: "/conditions-vente", label: "CGV" },
  { href: "/cookies", label: "Cookies" }
];

export function LegalPage({ description, eyebrow, sections, title, updatedAt }: LegalPageProps) {
  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="fixed inset-0 -z-10 bg-app-light" />
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="inline-flex items-center">
            <CentrixLogo />
          </Link>
          <Link href="/login" className="inline-flex items-center gap-2 rounded-[12px] border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700">
            <ArrowLeft size={16} />
            Connexion
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8 lg:py-14">
        <aside className="h-fit rounded-[18px] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)] lg:sticky lg:top-6">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">Legal CENTRIX</p>
          <nav className="mt-4 grid gap-1">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-[12px] px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-5 rounded-[14px] bg-[#071226] p-4 text-white">
            <ShieldCheck size={18} className="text-blue-200" />
            <p className="mt-3 text-sm font-bold">Documents informatifs</p>
            <p className="mt-2 text-xs leading-5 text-blue-100/72">
              Ces pages doivent etre relues par un conseil juridique avant lancement commercial final.
            </p>
          </div>
        </aside>

        <article className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.07)] sm:p-8 lg:p-10">
          <div className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-blue-700">
            {eyebrow}
          </div>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{description}</p>
          <p className="mt-5 text-sm font-semibold text-slate-500">Derniere mise a jour : {updatedAt}</p>

          <div className="mt-10 space-y-8">
            {sections.map((section) => (
              <section key={section.title} className="rounded-[18px] border border-slate-200 bg-slate-50/70 p-5">
                <h2 className="text-xl font-black text-slate-950">{section.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{section.body}</p>
                {section.items?.length ? (
                  <ul className="mt-4 grid gap-2">
                    {section.items.map((item) => (
                      <li key={item} className="flex gap-3 text-sm leading-6 text-slate-600">
                        <CheckCircle2 size={16} className="mt-1 shrink-0 text-blue-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
