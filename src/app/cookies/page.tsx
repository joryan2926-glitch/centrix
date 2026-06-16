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
      description="Cette page explique les cookies et technologies similaires susceptibles d'etre utilises par CENTRIX pour faire fonctionner, securiser et ameliorer le service."
      updatedAt="16 juin 2026"
      sections={[
        {
          title: "Cookies essentiels",
          body: "Ces cookies sont necessaires au fonctionnement de la plateforme et ne peuvent pas etre desactives sans empecher l'acces au service.",
          items: ["Session d'authentification", "Securite", "Preference de workspace", "Protection contre les abus"]
        },
        {
          title: "Mesure et amelioration",
          body: "Des donnees techniques peuvent etre utilisees pour comprendre les performances, detecter les erreurs et ameliorer l'experience utilisateur.",
          items: ["Erreurs applicatives", "Temps de chargement", "Evenements de navigation internes", "Usage des modules"]
        },
        {
          title: "Integrations tierces",
          body: "Certaines integrations peuvent utiliser leurs propres technologies lorsque l'utilisateur les active.",
          items: ["Stripe", "Google", "OpenAI", "Resend", "Twilio", "DocuSign", "Bridge"]
        },
        {
          title: "Gestion des preferences",
          body: "Un centre de preferences cookies pourra etre active pour permettre aux utilisateurs de gerer les traceurs non essentiels avant le lancement commercial final."
        }
      ]}
    />
  );
}
