import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Politique cookies | CENTRIX",
  description: "Politique cookies et traceurs de la plateforme CENTRIX."
};

export default function CookiesPage() {
  return (
    <LegalPage
      eyebrow="Cookies"
      title="Politique cookies"
      description="Cette page explique les cookies et technologies similaires susceptibles d'être utilisés par CENTRIX pour faire fonctionner, sécuriser et améliorer le service."
      updatedAt="17 juin 2026"
      sections={[
        {
          title: "Cookies essentiels",
          body: "Ces cookies sont nécessaires au fonctionnement de la plateforme et ne peuvent pas être désactivés sans empêcher l'accès au service.",
          items: ["Session d'authentification", "Sécurité", "Préférence de workspace", "Protection contre les abus"]
        },
        {
          title: "Mesure et amélioration",
          body: "Des données techniques peuvent être utilisées pour comprendre les performances, détecter les erreurs et améliorer l'expérience utilisateur.",
          items: ["Erreurs applicatives", "Temps de chargement", "Événements de navigation internes", "Usage des modules"]
        },
        {
          title: "Intégrations tierces",
          body: "Certaines intégrations peuvent utiliser leurs propres technologies lorsque l'utilisateur les active.",
          items: ["Stripe", "Google", "Mistral", "Brevo", "Bridge", "DocuSign"]
        },
        {
          title: "Gestion des préférences",
          body: "Un centre de préférences cookies pourra être activé pour permettre aux utilisateurs de gérer les traceurs non essentiels avant le lancement commercial final."
        }
      ]}
    />
  );
}
