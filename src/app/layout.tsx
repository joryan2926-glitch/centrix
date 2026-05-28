import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/layouts/AppShell";
import { PwaRegistrar } from "@/components/pwa/PwaRegistrar";
import { ErrorBoundary } from "@/components/system/ErrorBoundary";
import { ProductionMonitor } from "@/components/system/ProductionMonitor";
import { SupabaseProvider } from "@/providers/SupabaseProvider";

export const metadata: Metadata = {
  title: "CENTRIX | SaaS Operating OS",
  description: "Plateforme SaaS premium pour piloter CRM, finance, RH, marketing et IA business."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <SupabaseProvider>
          <PwaRegistrar />
          <ProductionMonitor />
          <ErrorBoundary>
            <AppShell>{children}</AppShell>
          </ErrorBoundary>
        </SupabaseProvider>
      </body>
    </html>
  );
}
