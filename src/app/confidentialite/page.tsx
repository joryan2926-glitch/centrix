import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Politique de confidentialité | CENTRIX",
  description: "Politique de confidentialité et traitement des données personnelles CENTRIX."
};

export default function ConfidentialitePage() {
  return (
    <LegalPage
      eyebrow="Données personnelles"
      title="Politique de confidentialité"
      description="CENTRIX traite des données professionnelles afin de fournir ses modules SaaS : CRM, facturation, finance, RH, documents, support, IA et automatisations."
      updatedAt="17 juin 2026"
      sections={[
        {
          title: "Responsable du traitement",
          body: "Les traitements de données réalisés dans CENTRIX sont opérés par L&R Solutions, société en formation, éditrice de la plateforme CENTRIX.",
          items: ["Adresse : 25 Rue Élise Gervais, 42000 Saint-Étienne, France", "Contact privacy : privacy@app-centrix.fr"]
        },
        {
          title: "Données collectées",
          body: "Les données traitées dépendent des modules utilisés par le client et des informations renseignées dans le workspace.",
          items: [
            "Données d'identification : nom, email, entreprise, rôle, avatar.",
            "Données métier : clients, prospects, factures, projets, documents, tickets, messages.",
            "Données techniques : journaux, sessions, événements de sécurité, activité applicative.",
            "Données de paiement : informations Stripe, statuts d'abonnement et historiques de facturation."
          ]
        },
        {
          title: "Finalités",
          body: "Les données sont utilisées pour fournir, sécuriser, personnaliser et améliorer le service CENTRIX.",
          items: ["Gestion des comptes et workspaces", "Exécution des modules métier", "Support client", "Sécurité et prévention des abus", "Facturation et obligations légales"]
        },
        {
          title: "Sous-traitants",
          body: "CENTRIX peut s'appuyer sur des prestataires cloud et intégrations externes strictement nécessaires au fonctionnement du service.",
          items: ["Supabase pour auth, base de données et storage", "Vercel pour l'hébergement applicatif", "Stripe pour paiements et abonnements", "Mistral pour les fonctions IA", "Brevo, Google, Bridge ou DocuSign selon configuration"]
        },
        {
          title: "Droits des utilisateurs",
          body: "Conformément au RGPD, les utilisateurs peuvent demander l'accès, la rectification, l'export ou la suppression de leurs données dans les limites légales applicables.",
          items: ["Contact privacy : privacy@app-centrix.fr", "Délai de traitement indicatif : 30 jours", "Vérification d'identité possible avant exécution d'une demande"]
        }
      ]}
    />
  );
}
