import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/layouts/AppShell";
import { PwaRegistrar } from "@/components/pwa/PwaRegistrar";
import { ErrorBoundary } from "@/components/system/ErrorBoundary";
import { ProductionMonitor } from "@/components/system/ProductionMonitor";
import { AuthProvider } from "@/providers/AuthProvider";
import { SupabaseProvider } from "@/providers/SupabaseProvider";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://app-centrix.fr"),
  title: {
    default: "CENTRIX | Plateforme SaaS tout-en-un pour entreprises",
    template: "%s | CENTRIX"
  },
  description: "CENTRIX centralise CRM, facturation, finance, projets, RH, documents, automatisations, IA business et analytics dans une plateforme SaaS premium.",
  applicationName: "CENTRIX",
  authors: [{ name: "L&R Solutions" }],
  creator: "L&R Solutions",
  publisher: "L&R Solutions",
  alternates: {
    canonical: "/"
  },
  keywords: [
    "CENTRIX",
    "SaaS entreprise",
    "CRM",
    "facturation",
    "comptabilite",
    "gestion entreprise",
    "automatisation",
    "IA business",
    "dashboard entreprise"
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "CENTRIX",
    title: "CENTRIX | Plateforme SaaS tout-en-un pour entreprises",
    description: "Pilotez toute votre entreprise depuis une interface SaaS premium : CRM, ventes, finance, projets, RH, marketing, documents, IA et automatisations."
  },
  twitter: {
    card: "summary_large_image",
    title: "CENTRIX | Plateforme SaaS tout-en-un pour entreprises",
    description: "La plateforme SaaS premium pour centraliser les opérations, la finance, le CRM, les projets et l'IA business."
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <SupabaseProvider>
          <AuthProvider>
            <PwaRegistrar />
            <ProductionMonitor />
            <ErrorBoundary>
              <AppShell>{children}</AppShell>
            </ErrorBoundary>
          </AuthProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
