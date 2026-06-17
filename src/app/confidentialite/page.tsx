import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Politique de confidentialite | CENTRIX",
  description: "Politique de confidentialite et traitement des donnees personnelles CENTRIX."
};

export default function ConfidentialitePage() {
  return (
    <LegalPage
      eyebrow="Donnees personnelles"
      title="Politique de confidentialite"
      description="CENTRIX traite des donnees professionnelles afin de fournir ses modules SaaS : CRM, facturation, finance, RH, documents, support, IA et automatisations."
      updatedAt="16 juin 2026"
      sections={[
        {
          title: "Donnees collectees",
          body: "Les donnees traitees dependent des modules utilises par le client et des informations renseignees dans le workspace.",
          items: [
            "Donnees d'identification : nom, email, entreprise, role, avatar.",
            "Donnees metier : clients, prospects, factures, projets, documents, tickets, messages.",
            "Donnees techniques : journaux, sessions, evenements de securite, activite applicative.",
            "Donnees de paiement : informations Stripe, statuts d'abonnement et historiques de facturation."
          ]
        },
        {
          title: "Finalites",
          body: "Les donnees sont utilisees pour fournir, securiser, personnaliser et ameliorer le service CENTRIX.",
          items: ["Gestion des comptes et workspaces", "Execution des modules metier", "Support client", "Securite et prevention des abus", "Facturation et obligations legales"]
        },
        {
          title: "Sous-traitants",
          body: "CENTRIX peut s'appuyer sur des prestataires cloud et integrations externes strictement necessaires au fonctionnement du service.",
          items: ["Supabase pour auth, base de donnees et storage", "Vercel pour l'hebergement applicatif", "Stripe pour paiements et abonnements", "Mistral pour les fonctions IA", "Resend, Google, Twilio, DocuSign ou Bridge selon configuration"]
        },
        {
          title: "Droits des utilisateurs",
          body: "Conformement au RGPD, les utilisateurs peuvent demander l'acces, la rectification, l'export ou la suppression de leurs donnees dans les limites legales applicables.",
          items: ["Contact privacy : privacy@app-centrix.fr", "Delai de traitement indicatif : 30 jours", "Verification d'identite possible avant execution d'une demande"]
        }
      ]}
    />
  );
}
