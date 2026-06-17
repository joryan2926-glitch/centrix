import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Conditions d'utilisation | CENTRIX",
  description: "Conditions générales d'utilisation de la plateforme CENTRIX."
};

export default function ConditionsUtilisationPage() {
  return (
    <LegalPage
      eyebrow="CGU"
      title="Conditions générales d'utilisation"
      description="Les présentes conditions encadrent l'accès et l'utilisation de la plateforme CENTRIX par les utilisateurs, administrateurs et collaborateurs invités."
      updatedAt="17 juin 2026"
      sections={[
        {
          title: "Accès au service",
          body: "L'accès à CENTRIX nécessite un compte utilisateur et un workspace actif. Certaines fonctionnalités dépendent du plan souscrit et des permissions attribuées.",
          items: ["Compte nominatif", "Mot de passe sécurisé", "Respect des rôles et permissions", "Interdiction de partage non autorisé des accès"]
        },
        {
          title: "Usage autorise",
          body: "CENTRIX doit être utilisé pour gérer une activité professionnelle licite. L'utilisateur s'engage à ne pas détourner la plateforme de son objet.",
          items: ["Pas d'usage frauduleux", "Pas d'atteinte aux droits de tiers", "Pas d'introduction volontaire de données malveillantes", "Respect des lois applicables"]
        },
        {
          title: "Disponibilité",
          body: "L&R Solutions met en œuvre des moyens raisonnables pour assurer la disponibilité du service CENTRIX. Des interruptions peuvent intervenir pour maintenance, sécurité ou force majeure."
        },
        {
          title: "Suspension",
          body: "L&R Solutions peut suspendre un accès en cas de violation des conditions, risque de sécurité, impayé ou demande légitime d'une autorité compétente."
        }
      ]}
    />
  );
}
