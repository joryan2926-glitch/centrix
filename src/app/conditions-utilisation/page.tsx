import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Conditions d'utilisation | CENTRIX",
  description: "Conditions generales d'utilisation de la plateforme CENTRIX."
};

export default function ConditionsUtilisationPage() {
  return (
    <LegalPage
      eyebrow="CGU"
      title="Conditions generales d'utilisation"
      description="Les presentes conditions encadrent l'acces et l'utilisation de la plateforme CENTRIX par les utilisateurs, administrateurs et collaborateurs invites."
      updatedAt="16 juin 2026"
      sections={[
        {
          title: "Acces au service",
          body: "L'acces a CENTRIX necessite un compte utilisateur et un workspace actif. Certaines fonctionnalites dependent du plan souscrit et des permissions attribuees.",
          items: ["Compte nominatif", "Mot de passe securise", "Respect des roles et permissions", "Interdiction de partage non autorise des acces"]
        },
        {
          title: "Usage autorise",
          body: "CENTRIX doit etre utilise pour gerer une activite professionnelle licite. L'utilisateur s'engage a ne pas detourner la plateforme de son objet.",
          items: ["Pas d'usage frauduleux", "Pas d'atteinte aux droits de tiers", "Pas d'introduction volontaire de donnees malveillantes", "Respect des lois applicables"]
        },
        {
          title: "Disponibilite",
          body: "CENTRIX met en oeuvre des moyens raisonnables pour assurer la disponibilite du service. Des interruptions peuvent intervenir pour maintenance, securite ou force majeure."
        },
        {
          title: "Suspension",
          body: "CENTRIX peut suspendre un acces en cas de violation des conditions, risque de securite, impaye ou demande legitime d'une autorite competente."
        }
      ]}
    />
  );
}
