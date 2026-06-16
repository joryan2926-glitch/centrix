import type { EnterpriseLegalData } from "@/types/entreprise";

export const enterpriseLegalFallbackData: EnterpriseLegalData = {
  legalForms: [
    {
      id: "form-sasu",
      code: "SASU",
      name: "SASU",
      description: "Societe par actions simplifiee unipersonnelle, flexible et adaptee aux fondateurs seuls.",
      liability: "Limitee aux apports",
      socialRegime: "Assimile salarie",
      taxRegime: "IS par defaut",
      minCapital: 1,
      bestFor: ["Startup solo", "SaaS", "Croissance"],
      complexity: "standard"
    },
    {
      id: "form-sas",
      code: "SAS",
      name: "SAS",
      description: "Forme flexible pour plusieurs associes, levees de fonds et gouvernance sur mesure.",
      liability: "Limitee aux apports",
      socialRegime: "Assimile salarie",
      taxRegime: "IS par defaut",
      minCapital: 1,
      bestFor: ["Associes", "Investisseurs", "Holding"],
      complexity: "advanced"
    },
    {
      id: "form-eurl",
      code: "EURL",
      name: "EURL",
      description: "SARL unipersonnelle, cadre encadre et souvent efficace pour activites stables.",
      liability: "Limitee aux apports",
      socialRegime: "TNS",
      taxRegime: "IR ou IS",
      minCapital: 1,
      bestFor: ["Solo", "Services", "Artisanat"],
      complexity: "standard"
    },
    {
      id: "form-sarl",
      code: "SARL",
      name: "SARL",
      description: "Structure encadree pour PME avec plusieurs associes et gouvernance classique.",
      liability: "Limitee aux apports",
      socialRegime: "TNS ou assimile salarie",
      taxRegime: "IS par defaut",
      minCapital: 1,
      bestFor: ["PME", "Famille", "Commerce"],
      complexity: "standard"
    },
    {
      id: "form-ei",
      code: "EI",
      name: "Entreprise individuelle",
      description: "Creation rapide pour demarrer une activite en nom propre.",
      liability: "Patrimoine professionnel",
      socialRegime: "Independant",
      taxRegime: "IR",
      minCapital: 0,
      bestFor: ["Freelance", "Activite simple", "Test marche"],
      complexity: "simple"
    },
    {
      id: "form-micro",
      code: "MICRO",
      name: "Micro-entreprise",
      description: "Regime simplifie pour facturer vite avec obligations allegees.",
      liability: "Patrimoine professionnel",
      socialRegime: "Micro-social",
      taxRegime: "Micro-fiscal",
      minCapital: 0,
      bestFor: ["Freelance", "Side project", "Prestation"],
      complexity: "simple"
    },
    {
      id: "form-sci",
      code: "SCI",
      name: "SCI",
      description: "Societe civile immobiliere pour organiser la detention et gestion d'actifs immobiliers.",
      liability: "Indefinie proportionnelle",
      socialRegime: "Non applicable",
      taxRegime: "IR ou IS",
      minCapital: 1,
      bestFor: ["Immobilier", "Patrimoine", "Famille"],
      complexity: "advanced"
    },
    {
      id: "form-association",
      code: "ASSOCIATION",
      name: "Association",
      description: "Structure non lucrative pour projets collectifs, culturels, sportifs ou sociaux.",
      liability: "Structure dediee",
      socialRegime: "Selon salariat",
      taxRegime: "Non lucratif",
      minCapital: 0,
      bestFor: ["Projet collectif", "Evenement", "Communaute"],
      complexity: "simple"
    }
  ],
  companies: [
    {
      id: "company-nova",
      name: "Nova Atlas",
      legalFormId: "form-sasu",
      status: "in_review",
      activity: "Edition de logiciels SaaS B2B",
      city: "Paris",
      capitalAmount: 12000,
      capitalDeposited: 9000,
      progress: 72,
      siren: null,
      createdAt: "2026-05-02T08:00:00.000Z",
      updatedAt: "2026-05-26T08:00:00.000Z"
    }
  ],
  shareholders: [
    { id: "sh-1", companyId: "company-nova", name: "Lea Martin", role: "president", shares: 1000, contribution: 12000, email: "lea@novaatlas.fr" }
  ],
  companySteps: [
    { id: "step-identity", companyId: "company-nova", title: "Identite entreprise", description: "Denomination, adresse, activite et forme juridique.", status: "done", dueAt: "2026-05-04T08:00:00.000Z", order: 1 },
    { id: "step-shareholders", companyId: "company-nova", title: "Associes et dirigeants", description: "Roles, apports, repartition des parts et beneficiaires.", status: "done", dueAt: "2026-05-06T08:00:00.000Z", order: 2 },
    { id: "step-documents", companyId: "company-nova", title: "Documents juridiques", description: "Statuts, PV, siege social et declarations.", status: "in_progress", dueAt: "2026-05-27T08:00:00.000Z", order: 3 },
    { id: "step-capital", companyId: "company-nova", title: "Depot capital", description: "Envoi banque, depot des fonds et attestation.", status: "in_progress", dueAt: "2026-05-28T08:00:00.000Z", order: 4 },
    { id: "step-announcement", companyId: "company-nova", title: "Annonce legale", description: "Generation, validation et publication.", status: "todo", dueAt: "2026-05-29T08:00:00.000Z", order: 5 },
    { id: "step-registration", companyId: "company-nova", title: "Depot formalites", description: "Transmission du dossier final et suivi immatriculation.", status: "todo", dueAt: "2026-06-01T08:00:00.000Z", order: 6 }
  ],
  legalDocuments: [
    { id: "doc-statuts", companyId: "company-nova", type: "statuts", title: "Statuts SASU Nova Atlas", status: "generated", url: null, generatedAt: "2026-05-25T10:00:00.000Z", updatedAt: "2026-05-25T10:00:00.000Z" },
    { id: "doc-capital", companyId: "company-nova", type: "capital_certificate", title: "Attestation depot capital", status: "draft", url: null, generatedAt: null, updatedAt: "2026-05-24T10:00:00.000Z" },
    { id: "doc-beneficiaries", companyId: "company-nova", type: "beneficiaries", title: "Beneficiaires effectifs", status: "draft", url: null, generatedAt: null, updatedAt: "2026-05-24T10:00:00.000Z" }
  ],
  legalAnnouncements: [
    {
      id: "ann-1",
      companyId: "company-nova",
      title: "Constitution SASU Nova Atlas",
      journal: "Journal Legal Paris",
      department: "75",
      price: 189,
      status: "draft",
      content: "Avis de constitution: Nova Atlas, SASU au capital de 12 000 EUR, siege social a Paris, activite edition de logiciels.",
      publishedAt: null
    }
  ],
  capitalDeposits: [
    { id: "cap-1", companyId: "company-nova", bankName: "Qonto", iban: "FR76 XXXX XXXX XXXX", amount: 9000, status: "documents_sent", certificateUrl: null, createdAt: "2026-05-23T10:00:00.000Z" }
  ],
  companySettings: [
    { companyId: "company-nova", legalAddress: "18 rue des Archives, 75004 Paris", accountingCurrency: "EUR", fiscalYearEnd: "12-31", vatRegime: "real_simplified", logoUrl: null }
  ],
  legalNotifications: [
    { id: "legal-notif-1", companyId: "company-nova", title: "Document a verifier", detail: "Les statuts sont generes et prets pour relecture.", severity: "info", createdAt: "2026-05-26T09:00:00.000Z" },
    { id: "legal-notif-2", companyId: "company-nova", title: "Depot capital en attente", detail: "L'attestation bancaire doit etre ajoutee au dossier final.", severity: "warning", createdAt: "2026-05-26T11:00:00.000Z" }
  ],
  developmentPlans: [
    {
      id: "dev-plan-product",
      companyId: "company-nova",
      title: "Lancement MVP SaaS",
      area: "product",
      objective: "Finaliser le produit, valider le pricing et ouvrir les premiers acces clients.",
      owner: "Lea Martin",
      progress: 64,
      priority: "high",
      dueAt: "2026-06-18T09:00:00.000Z",
      status: "in_progress",
      createdAt: "2026-05-20T09:00:00.000Z",
      updatedAt: "2026-05-26T09:00:00.000Z"
    },
    {
      id: "dev-plan-sales",
      companyId: "company-nova",
      title: "Plan acquisition B2B",
      area: "sales",
      objective: "Structurer les canaux LinkedIn, partenariats et demos pour atteindre 30 prospects qualifies.",
      owner: "Sarah Picon",
      progress: 42,
      priority: "medium",
      dueAt: "2026-06-25T09:00:00.000Z",
      status: "planned",
      createdAt: "2026-05-22T09:00:00.000Z",
      updatedAt: "2026-05-25T09:00:00.000Z"
    }
  ],
  advisorySessions: [
    {
      id: "advice-legal-1",
      companyId: "company-nova",
      expertName: "Nora Chen",
      topic: "Validation statuts et pacte futur",
      recommendation: "Ajouter les clauses de cession, propriete intellectuelle et gouvernance avant immatriculation.",
      status: "scheduled",
      scheduledAt: "2026-06-04T10:00:00.000Z",
      createdAt: "2026-05-26T10:30:00.000Z"
    },
    {
      id: "advice-growth-1",
      companyId: "company-nova",
      expertName: "Yanis Perrin",
      topic: "Conseil developpement commercial",
      recommendation: "Prioriser trois segments ICP et connecter les devis au CRM des le lancement.",
      status: "requested",
      scheduledAt: "2026-06-07T14:00:00.000Z",
      createdAt: "2026-05-26T13:00:00.000Z"
    }
  ]
};
