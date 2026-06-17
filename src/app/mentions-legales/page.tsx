import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Mentions légales | CENTRIX",
  description: "Mentions légales de la plateforme SaaS CENTRIX éditée par L&R Solutions."
};

export default function MentionsLegalesPage() {
  return (
    <LegalPage
      eyebrow="Informations éditeur"
      title="Mentions légales CENTRIX"
      description="CENTRIX est une plateforme SaaS propriétaire éditée par L&R Solutions, société actuellement en cours de constitution."
      updatedAt="17 juin 2026"
      sections={[
        {
          title: "Éditeur",
          body: "CENTRIX est une plateforme SaaS propriétaire éditée par L&R Solutions, société actuellement en cours de constitution.",
          items: [
            "Éditeur : L&R Solutions (société en formation)",
            "Adresse : 25 Rue Élise Gervais, 42000 Saint-Étienne, France",
            "Année de création : 2026"
          ]
        },
        {
          title: "Propriété intellectuelle",
          body: "La plateforme CENTRIX, son architecture, son interface, ses fonctionnalités, ses modules, ses bases de données, ses contenus, ses éléments graphiques, son identité visuelle, son code source, ses logos, ses marques, ses textes, ses documents et l'ensemble de ses composants sont la propriété exclusive de L&R Solutions.",
          items: [
            "Tous droits réservés.",
            "Toute reproduction, diffusion, modification, extraction, copie, rétro-ingénierie, décompilation, commercialisation ou exploitation, totale ou partielle, sans autorisation écrite préalable de L&R Solutions est strictement interdite."
          ]
        },
        {
          title: "Utilisation de la plateforme",
          body: "CENTRIX est une solution professionnelle privée. L'accès aux services est réservé aux utilisateurs autorisés disposant d'un compte valide.",
          items: [
            "Toute tentative d'accès non autorisé, de contournement des mesures de sécurité, d'extraction massive de données ou de copie des fonctionnalités pourra entraîner la suspension immédiate du compte ainsi que des poursuites civiles et pénales."
          ]
        },
        {
          title: "Confidentialité et données",
          body: "Les données hébergées sur CENTRIX demeurent la propriété de leurs utilisateurs respectifs.",
          items: [
            "L&R Solutions met en œuvre les mesures techniques et organisationnelles nécessaires afin d'assurer la sécurité, l'intégrité et la confidentialité des données traitées sur la plateforme."
          ]
        },
        {
          title: "Droits réservés",
          body: "© 2026 CENTRIX – Tous droits réservés. Une solution développée et exploitée par L&R Solutions. Propriété privée – Usage professionnel exclusivement autorisé dans le cadre des conditions d'utilisation de la plateforme."
        }
      ]}
    />
  );
}
