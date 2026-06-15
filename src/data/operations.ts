import type { OperationalModuleConfig } from "@/types/operations";

function moduleConfig(
  key: string,
  title: string,
  eyebrow: string,
  description: string,
  recordLabel: string,
  recordTypes: readonly string[],
  suggestions: readonly string[]
): OperationalModuleConfig {
  return { key, title, eyebrow, description, recordLabel, recordTypes, suggestions };
}

export const operationalModules = {
  alerts: moduleConfig("alerts", "Alertes", "Pilotage temps reel", "Centralisez les alertes business et traitez les situations prioritaires.", "alerte", ["Business", "Finance", "Securite", "Equipe"], ["Traiter les alertes critiques", "Automatiser les escalades", "Analyser les tendances"]),
  activities: moduleConfig("activities", "Activites recentes", "Journal entreprise", "Suivez chaque action importante realisee dans le workspace.", "activite", ["Action", "Modification", "Validation", "Synchronisation"], ["Verifier les actions sensibles", "Identifier les blocages", "Partager le rapport hebdomadaire"]),
  prospects: moduleConfig("prospects", "Prospects", "Acquisition commerciale", "Qualifiez, priorisez et convertissez les opportunites commerciales.", "prospect", ["Inbound", "Outbound", "Partenaire", "Evenement"], ["Relancer les prospects chauds", "Completer les fiches", "Automatiser le scoring"]),
  quotes: moduleConfig("quotes", "Devis", "Propositions commerciales", "Creez et suivez les propositions commerciales jusqu'a leur signature.", "devis", ["Standard", "Abonnement", "Projet", "Sur mesure"], ["Relancer les devis ouverts", "Verifier les marges", "Convertir les devis signes"]),
  treasury: moduleConfig("treasury", "Tresorerie", "Finance quotidienne", "Pilotez encaissements, decaissements et besoins de tresorerie.", "mouvement", ["Encaissement", "Decaissement", "Prevision", "Alerte"], ["Verifier le solde a 30 jours", "Relancer les impayes", "Ajuster les previsions"]),
  contracts: moduleConfig("contracts", "Contrats", "Cycle contractuel", "Centralisez les contrats, validations, echeances et renouvellements.", "contrat", ["Client", "Fournisseur", "Partenaire", "Interne"], ["Traiter les echeances proches", "Verifier les signatures", "Archiver les versions obsoletes"]),
  "business-plan": moduleConfig("business-plan", "Business plan", "Strategie entreprise", "Structurez le modele economique, les hypotheses et les objectifs.", "hypothese", ["Marche", "Revenus", "Couts", "Strategie"], ["Valider les hypotheses", "Comparer reel et previsionnel", "Generer une synthese investisseurs"]),
  funding: moduleConfig("funding", "Financement", "Capital et financement", "Suivez investisseurs, subventions, emprunts et levees de fonds.", "dossier", ["Investisseur", "Subvention", "Emprunt", "Aide"], ["Prioriser les dossiers", "Preparer les justificatifs", "Mettre a jour le calendrier"]),
  compliance: moduleConfig("compliance", "Conformite", "Gouvernance", "Pilotez les obligations, controles et plans de mise en conformite.", "controle", ["RGPD", "Fiscal", "Social", "Sectoriel"], ["Traiter les ecarts critiques", "Planifier les controles", "Documenter les preuves"]),
  formalities: moduleConfig("formalities", "Formalites administratives", "Administration entreprise", "Suivez toutes les demarches et obligations administratives.", "formalite", ["Creation", "Modification", "Declaration", "Renouvellement"], ["Completer les dossiers en attente", "Verifier les echeances", "Centraliser les justificatifs"]),
  recruitment: moduleConfig("recruitment", "Recrutement", "Talent acquisition", "Gerez postes ouverts, candidatures, entretiens et offres.", "candidature", ["Candidature", "Entretien", "Offre", "Viviers"], ["Planifier les entretiens", "Repondre aux candidats", "Comparer les profils"]),
  salaries: moduleConfig("salaries", "Salaires", "Gestion de la paie", "Preparez et controlez les variables, salaires et charges.", "element de paie", ["Salaire", "Prime", "Charge", "Correction"], ["Valider les variables", "Verifier les anomalies", "Preparer les exports"]),
  leave: moduleConfig("leave", "Conges", "Temps et absences", "Centralisez les demandes, soldes et validations de conges.", "demande", ["Conge paye", "RTT", "Maladie", "Exceptionnel"], ["Valider les demandes", "Verifier les conflits", "Notifier les managers"]),
  expenses: moduleConfig("expenses", "Notes de frais", "Depenses equipe", "Collectez, validez et remboursez les depenses professionnelles.", "note de frais", ["Transport", "Repas", "Hebergement", "Materiel"], ["Verifier les justificatifs", "Valider les remboursements", "Detecter les doublons"]),
  time: moduleConfig("time", "Gestion du temps", "Productivite equipe", "Suivez temps passe, capacite et allocation des collaborateurs.", "saisie de temps", ["Projet", "Client", "Interne", "Absence"], ["Completer les temps manquants", "Analyser la capacite", "Optimiser l'allocation"]),
  tasks: moduleConfig("tasks", "Taches", "Execution operationnelle", "Planifiez, priorisez et suivez les actions de toutes les equipes.", "tache", ["Operation", "Projet", "Client", "Interne"], ["Traiter les retards", "Reequilibrer la charge", "Automatiser les rappels"]),
  gantt: moduleConfig("gantt", "Gantt", "Planification projets", "Structurez les jalons, dependances et calendriers projet.", "jalon", ["Jalon", "Dependance", "Livrable", "Risque"], ["Verifier le chemin critique", "Ajuster les dependances", "Partager le planning"]),
  collaboration: moduleConfig("collaboration", "Collaboration", "Travail en equipe", "Centralisez decisions, commentaires et actions collaboratives.", "discussion", ["Decision", "Question", "Idee", "Compte rendu"], ["Clore les decisions ouvertes", "Assigner les actions", "Partager les comptes rendus"]),
  messaging: moduleConfig("messaging", "Messagerie interne", "Communication equipe", "Organisez les conversations et suivis entre collaborateurs.", "conversation", ["Direct", "Equipe", "Projet", "Annonce"], ["Repondre aux messages prioritaires", "Transformer les decisions en taches", "Archiver les fils clos"]),
  emailing: moduleConfig("emailing", "Emailing", "Marketing relationnel", "Preparez campagnes email, audiences et sequences automatisees.", "campagne email", ["Newsletter", "Nurturing", "Transactionnel", "Relance"], ["Verifier les audiences", "Optimiser les objets", "Analyser les conversions"]),
  sms: moduleConfig("sms", "SMS Marketing", "Engagement direct", "Planifiez et mesurez les campagnes SMS professionnelles.", "campagne SMS", ["Promotion", "Rappel", "Alerte", "Transactionnel"], ["Verifier les consentements", "Programmer les envois", "Analyser les reponses"]),
  advertising: moduleConfig("advertising", "Campagnes publicitaires", "Acquisition payante", "Pilotez budgets, audiences, creatives et performances publicitaires.", "campagne", ["Search", "Social Ads", "Display", "Retargeting"], ["Couper les campagnes faibles", "Reallouer le budget", "Tester de nouvelles creatives"]),
  "content-generation": moduleConfig("content-generation", "Generation de contenu", "Studio IA", "Organisez les contenus generes pour chaque canal de communication.", "contenu", ["Article", "Email", "Post", "Script"], ["Valider les brouillons", "Adapter les formats", "Planifier la publication"]),
  "financial-analysis": moduleConfig("financial-analysis", "Analyse financiere", "Intelligence financiere", "Centralisez analyses, anomalies et recommandations financieres.", "analyse", ["Rentabilite", "Tresorerie", "Couts", "Prevision"], ["Verifier les anomalies", "Comparer les periodes", "Mettre a jour les hypotheses"]),
  "document-generator": moduleConfig("document-generator", "Generateur de documents", "IA documentaire", "Generez et suivez les documents metier de l'entreprise.", "document", ["Contrat", "Rapport", "Courrier", "Procedure"], ["Valider les documents generes", "Associer les sources", "Planifier les signatures"]),
  "data-chat": moduleConfig("data-chat", "Chat avec les donnees", "Copilote entreprise", "Conservez les analyses et questions posees aux donnees CENTRIX.", "analyse IA", ["Business", "Finance", "CRM", "Equipe"], ["Verifier les sources", "Transformer les insights en actions", "Partager les analyses"]),
  sav: moduleConfig("sav", "SAV", "Service apres-vente", "Suivez incidents, retours et resolutions apres-vente.", "dossier SAV", ["Incident", "Retour", "Garantie", "Intervention"], ["Traiter les urgences", "Respecter les SLA", "Analyser les causes recurrentes"]),
  faq: moduleConfig("faq", "FAQ", "Centre de connaissance", "Creez et maintenez les reponses utiles aux clients et equipes.", "article FAQ", ["Produit", "Facturation", "Compte", "Technique"], ["Mettre a jour les articles consultes", "Traiter les recherches sans resultat", "Publier les brouillons"]),
  experts: moduleConfig("experts", "Experts", "Ecosysteme CENTRIX", "Gerez les experts disponibles et leurs domaines d'intervention.", "expert", ["Juridique", "Finance", "Marketing", "Tech"], ["Verifier les profils", "Suivre les disponibilites", "Analyser la satisfaction"]),
  trainers: moduleConfig("trainers", "Formateurs", "Ecosysteme Academy", "Centralisez les formateurs, programmes et disponibilites.", "formateur", ["Business", "Finance", "Vente", "Management"], ["Valider les programmes", "Planifier les sessions", "Suivre les evaluations"]),
  consultants: moduleConfig("consultants", "Consultants", "Prestations professionnelles", "Pilotez missions, disponibilites et performances des consultants.", "consultant", ["Strategie", "Operations", "Finance", "Digital"], ["Affecter les missions", "Verifier la charge", "Suivre la marge"]),
  resources: moduleConfig("resources", "Bibliotheque de ressources", "Academy", "Organisez modeles, guides, supports et ressources pedagogiques.", "ressource", ["Guide", "Modele", "Video", "Checklist"], ["Publier les ressources valides", "Archiver les versions obsoletes", "Analyser les consultations"]),
  connections: moduleConfig("connections", "Connexions", "Securite des acces", "Surveillez les connexions, appareils et sessions utilisateur.", "connexion", ["Session", "Appareil", "Alerte", "Blocage"], ["Verifier les connexions inhabituelles", "Revoquer les sessions inactives", "Activer la double authentification"]),
  audit: moduleConfig("audit", "Journal d'audit", "Conformite et securite", "Consultez les actions sensibles et preuves de controle.", "evenement d'audit", ["Acces", "Modification", "Export", "Securite"], ["Examiner les evenements critiques", "Exporter le rapport", "Documenter les controles"]),
  access: moduleConfig("access", "Gestion des acces", "Permissions entreprise", "Pilotez demandes d'acces, revocations et controles.", "demande d'acces", ["Module", "Workspace", "Document", "API"], ["Traiter les demandes", "Verifier les acces sensibles", "Revoir les droits"]),
  permissions: moduleConfig("permissions", "Permissions", "Administration", "Definissez et auditez les autorisations par role et module.", "permission", ["Lecture", "Creation", "Modification", "Administration"], ["Verifier les droits admin", "Appliquer le moindre privilege", "Planifier une revue"]),
  users: moduleConfig("users", "Utilisateurs", "Administration", "Gerez les utilisateurs, invitations et statuts du workspace.", "utilisateur", ["Admin", "Manager", "Employe", "Client"], ["Traiter les invitations", "Verifier les comptes inactifs", "Mettre a jour les roles"]),
  roles: moduleConfig("roles", "Roles", "Administration", "Structurez les roles et responsabilites de l'organisation.", "role", ["Admin", "Management", "Operation", "Externe"], ["Clarifier les responsabilites", "Verifier les permissions", "Archiver les roles inutilises"])
} satisfies Record<string, OperationalModuleConfig>;

export type OperationalModuleKey = keyof typeof operationalModules;

export function getOperationalModule(key: string) {
  return operationalModules[key as OperationalModuleKey] ?? null;
}
