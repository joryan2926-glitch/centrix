import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Mentions legales | CENTRIX",
  description: "Mentions legales de la plateforme SaaS CENTRIX."
};

export default function MentionsLegalesPage() {
  return (
    <LegalPage
      eyebrow="Informations editeur"
      title="Mentions legales"
      description="Cette page regroupe les informations d'identification de l'editeur de la plateforme CENTRIX, les coordonnees de contact et les informations d'hebergement."
      updatedAt="16 juin 2026"
      sections={[
        {
          title: "Editeur du service",
          body: "CENTRIX est une plateforme SaaS de gestion d'entreprise. Les informations societaires definitives doivent etre completees avant commercialisation.",
          items: [
            "Denomination : CENTRIX SAS",
            "Siege social : a completer",
            "SIRET : a completer",
            "Responsable de publication : a completer",
            "Contact : contact@app-centrix.fr"
          ]
        },
        {
          title: "Hebergement",
          body: "La plateforme est destinee a etre hebergee sur une infrastructure cloud professionnelle avec supervision, securite applicative et sauvegardes.",
          items: ["Hebergeur applicatif : Vercel", "Base de donnees et stockage : Supabase", "Nom de domaine : app-centrix.fr"]
        },
        {
          title: "Propriete intellectuelle",
          body: "L'interface, la marque, les composants, les textes, les graphismes et les fonctionnalites CENTRIX sont proteges. Toute reproduction non autorisee est interdite."
        },
        {
          title: "Responsabilite",
          body: "CENTRIX met a disposition des outils de pilotage et d'automatisation. L'utilisateur reste responsable de la verification juridique, fiscale, sociale et comptable des donnees produites."
        }
      ]}
    />
  );
}
