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
      title="Conditions générales de vente"
      description="Les présentes conditions définissent les modalités de souscription, facturation, paiement et résiliation des offres SaaS CENTRIX."
      updatedAt="17 juin 2026"
      sections={[
        {
          title: "Plans et abonnements",
          body: "L&R Solutions propose plusieurs plans SaaS CENTRIX donnant accès à des modules différents. Les droits sont automatiquement ajustés selon le plan actif.",
          items: ["Starter", "Premium", "Business", "Enterprise"]
        },
        {
          title: "Paiement",
          body: "Les paiements sont gérés via Stripe. Les prix, taxes applicables, périodes et renouvellements sont affichés avant validation de la souscription.",
          items: ["Paiement carte bancaire", "Abonnement mensuel récurrent", "Factures et reçus accessibles depuis l'espace billing", "Synchronisation Stripe vers Supabase"]
        },
        {
          title: "Résiliation",
          body: "Le client peut résilier son abonnement selon les modalités prévues dans son espace de facturation. L'accès aux fonctionnalités peut être limité à la fin de la période payée."
        },
        {
          title: "Remboursements",
          body: "Sauf disposition contraire ou obligation légale, les périodes d'abonnement entamées ne sont pas remboursées automatiquement. Les demandes sont étudiées au cas par cas."
        }
      ]}
    />
  );
}
