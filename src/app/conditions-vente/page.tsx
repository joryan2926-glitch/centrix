import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Conditions de vente | CENTRIX",
  description: "Conditions commerciales, abonnements et facturation CENTRIX."
};

export default function ConditionsVentePage() {
  return (
    <LegalPage
      eyebrow="CGV"
      title="Conditions generales de vente"
      description="Les presentes conditions definissent les modalites de souscription, facturation, paiement et resiliation des offres SaaS CENTRIX."
      updatedAt="16 juin 2026"
      sections={[
        {
          title: "Plans et abonnements",
          body: "CENTRIX propose plusieurs plans SaaS donnant acces a des modules differents. Les droits sont automatiquement ajustes selon le plan actif.",
          items: ["Starter", "Premium", "Business", "Enterprise"]
        },
        {
          title: "Paiement",
          body: "Les paiements sont geres via Stripe. Les prix, taxes applicables, periodes et renouvellements sont affiches avant validation de la souscription.",
          items: ["Paiement carte bancaire", "Abonnement mensuel recurrent", "Factures et recus accessibles depuis l'espace billing", "Synchronisation Stripe vers Supabase"]
        },
        {
          title: "Resiliation",
          body: "Le client peut resilier son abonnement selon les modalites prevues dans son espace de facturation. L'acces aux fonctionnalites peut etre limite a la fin de la periode payee."
        },
        {
          title: "Remboursements",
          body: "Sauf disposition contraire ou obligation legale, les periodes d'abonnement entamees ne sont pas remboursees automatiquement. Les demandes sont etudiees au cas par cas."
        }
      ]}
    />
  );
}
