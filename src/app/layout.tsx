import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/layouts/AppShell";

export const metadata: Metadata = {
  title: "CENTRIX | SaaS Operating OS",
  description: "Plateforme SaaS premium pour piloter CRM, finance, RH, marketing et IA business."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
