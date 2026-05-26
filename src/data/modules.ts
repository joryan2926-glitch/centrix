import type { BusinessModule } from "@/types/navigation";

export const pageCopy = {
  crm: {
    eyebrow: "Revenue command center",
    title: "CRM",
    description: "Pilotez les opportunites, les relances et les comptes strategiques avec une vision claire du pipeline.",
    metrics: [
      { label: "Deals ouverts", value: "128", delta: "+14 cette semaine" },
      { label: "Taux de closing", value: "37%", delta: "+4.2 pts" },
      { label: "Cycle moyen", value: "24 j", delta: "-3 j" }
    ],
    table: ["Novatek", "Expansion", "72K EUR", "Negociation"],
    focus: ["Qualification IA", "Scoring comptes", "Relances prioritaires"]
  },
  clients: {
    eyebrow: "Customer intelligence",
    title: "Clients",
    description: "Centralisez les comptes, signaux de satisfaction, contrats et historiques de contact.",
    metrics: [
      { label: "Clients actifs", value: "486", delta: "+22" },
      { label: "NPS", value: "68", delta: "+7 pts" },
      { label: "Retention", value: "94%", delta: "+2.1%" }
    ],
    table: ["Helio Labs", "Entreprise", "CSM Sarah", "Sante"],
    focus: ["Vue 360", "Contrats", "Alertes churn"]
  },
  facturation: {
    eyebrow: "Billing operations",
    title: "Facturation",
    description: "Suivez les factures, abonnements, paiements et litiges avec un flux de validation rapide.",
    metrics: [
      { label: "Factures dues", value: "42", delta: "18 aujourd'hui" },
      { label: "Encaisse", value: "126K EUR", delta: "+11%" },
      { label: "Retards", value: "6", delta: "-3" }
    ],
    table: ["INV-2048", "Synapse Group", "12 400 EUR", "Payee"],
    focus: ["Abonnements", "Avoirs", "Paiements SEPA"]
  },
  comptabilite: {
    eyebrow: "Finance cockpit",
    title: "Comptabilite",
    description: "Gardez une lecture instantanee des depenses, marges, rapprochements et exports comptables.",
    metrics: [
      { label: "Marge brute", value: "72%", delta: "+3 pts" },
      { label: "Depenses", value: "39K EUR", delta: "-6%" },
      { label: "A rapprocher", value: "17", delta: "urgent" }
    ],
    table: ["Stripe", "Revenus SaaS", "48 900 EUR", "Rapproche"],
    focus: ["Grand livre", "TVA", "Exports FEC"]
  },
  rh: {
    eyebrow: "People operations",
    title: "RH",
    description: "Structurez le suivi collaborateurs, recrutements, absences, onboarding et performance.",
    metrics: [
      { label: "Equipe", value: "64", delta: "+5" },
      { label: "Recrutements", value: "9", delta: "en cours" },
      { label: "Engagement", value: "82%", delta: "+6%" }
    ],
    table: ["Lea Martin", "Product Designer", "Onboarding", "Jour 12"],
    focus: ["Talents", "Conges", "Entretiens"]
  },
  agenda: {
    eyebrow: "Planning intelligent",
    title: "Agenda",
    description: "Synchronisez rendez-vous, milestones, taches et rituels d'equipe dans une vue unifiee.",
    metrics: [
      { label: "Meetings", value: "18", delta: "aujourd'hui" },
      { label: "Focus time", value: "12 h", delta: "+2 h" },
      { label: "Deadlines", value: "7", delta: "cette semaine" }
    ],
    table: ["10:30", "Comite revenus", "Salle Orbit", "Confirme"],
    focus: ["Timeline", "Disponibilites", "Priorites"]
  },
  marketing: {
    eyebrow: "Growth engine",
    title: "Marketing",
    description: "Analysez campagnes, audiences, contenus et conversions pour accelerer la demande.",
    metrics: [
      { label: "Leads", value: "2 840", delta: "+21%" },
      { label: "CAC", value: "184 EUR", delta: "-12%" },
      { label: "ROAS", value: "5.8x", delta: "+0.9x" }
    ],
    table: ["Launch Q3", "LinkedIn", "34K reach", "Optimise"],
    focus: ["Campagnes", "Attribution", "Segments"]
  },
  automatisations: {
    eyebrow: "No-code workflows",
    title: "Automatisations",
    description: "Orchestrez les flux entre ventes, finance, support et IA avec des scenarios mesurables.",
    metrics: [
      { label: "Workflows actifs", value: "56", delta: "+8" },
      { label: "Heures gagnees", value: "214", delta: "mois" },
      { label: "Erreurs evitees", value: "1 240", delta: "+19%" }
    ],
    table: ["Relance facture", "Finance", "Temps reel", "Actif"],
    focus: ["Triggers", "Conditions", "Logs"]
  },
  "ia-business": {
    eyebrow: "Executive AI",
    title: "IA Business",
    description: "Transformez vos donnees operationnelles en recommandations, previsions et actions prioritaires.",
    metrics: [
      { label: "Insights", value: "93", delta: "nouveaux" },
      { label: "Precision forecast", value: "91%", delta: "+5%" },
      { label: "Actions IA", value: "37", delta: "a valider" }
    ],
    table: ["Prevision MRR", "Risque churn bas", "91% confiance", "Action"],
    focus: ["Copilote", "Forecast", "Syntheses"]
  }
} satisfies Record<string, BusinessModule>;
