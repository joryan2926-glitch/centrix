# Recette fonctionnelle CENTRIX

Date : 15 juin 2026  
Environnement : production `https://app-centrix.fr`

## Synthese

| Controle | Resultat |
| --- | --- |
| Build Next.js production | Conforme, 129 pages generees |
| TypeScript strict | Conforme |
| ESLint | Conforme |
| Routes de navigation protegees | Conforme, 76/76 |
| APIs sensibles sans session | Conforme, reponse 401 |
| Supabase et tables essentielles | Conforme |
| Isolation workspace et RLS | Presente dans les migrations, recette authentifiee a finaliser |
| Stripe Billing | Partiel, prix valides mais webhook incomplet |
| OpenAI | Bloque par quota API 429 |
| Google Calendar | Desactive |
| SMS et signature electronique | Non configures |

## Niveaux de validation

- **Conforme** : page, protection, stockage Supabase et logique principale disponibles.
- **Partiel** : socle fonctionnel, mais workflow avance ou integration externe incomplet.
- **A recetter avec compte QA** : necessite une session authentifiee pour tester creation, modification et suppression en production.

## Recette module par module

| Module | Etat | Validation et ecarts |
| --- | --- | --- |
| Authentification et workspaces | A recetter avec compte QA | Pages login/register/reset disponibles, routes protegees et redirections conformes. Inscription, onboarding, changement de workspace et roles doivent etre testes avec un compte QA. |
| Dashboard | Partiel | Page protegee, donnees Supabase et widgets disponibles. Les KPI reels dependent du volume de donnees du workspace. |
| CRM, prospects et clients | A recetter avec compte QA | Tables, services CRUD, pipeline et sous-module prospects disponibles. Recette create/update/delete et changement de statut necessaire. |
| Ventes, devis et facturation | Partiel | CRUD, devis, factures et exports disponibles. Paiement Stripe doit etre valide avec un abonnement de test/reel controle. |
| Comptabilite, finance et tresorerie | Partiel | Tables et dashboards disponibles. Connexion bancaire Bridge non configuree. |
| Agenda et reservations | Partiel | CRUD agenda disponible. Synchronisation Google Calendar desactivee. |
| Projets, taches, Kanban et Gantt | A recetter avec compte QA | Tables, services, vues et sous-modules disponibles. Drag and drop, dependances et historique doivent etre testes en session. |
| RH, recrutement, salaires et conges | A recetter avec compte QA | Tables et CRUD disponibles. La paie reste un outil de gestion/simulation, pas un moteur de paie certifie. |
| Marketing digital | A recetter avec compte QA | Campagnes et donnees marketing connectees. Envoi et automatisations externes a valider avec les fournisseurs. |
| Reseaux sociaux | Partiel | Moteur de publication et migration dediee disponibles. Tokens des plateformes requis; TikTok et YouTube ne sont pas finalises. |
| Automatisations et workflows | A recetter avec compte QA | CRUD, historique et suggestion IA disponibles. Les executions vers des fournisseurs externes dependent de leurs configurations. |
| IA Business et BI predictive | Bloque externe | Endpoints proteges et architecture disponibles. OpenAI retourne actuellement HTTP 429. |
| Documents et cloud | Partiel | Supabase Storage et metadonnees disponibles. Apercu PDF, OCR et signature avancee restent a finaliser. |
| Juridique et creation d'entreprise | Partiel | CRUD et parcours disponibles. Generation/signature/depot officiel ne constituent pas encore une teleprocedure juridique certifiee. |
| Support et portail client | A recetter avec compte QA | Tables, tickets, messages et portail disponibles. Recette croisee entreprise/client requise. |
| Marketplace | Partiel | Catalogue, prestataires et commandes disponibles. Stripe Connect doit etre recette avec un prestataire reel/test. |
| CENTRIX Academy | A recetter avec compte QA | Cours, inscriptions, progression et communaute disponibles. Lecture video et certificats doivent etre testes. |
| Notifications et collaboration | A recetter avec compte QA | Tables et centre de notifications disponibles. Realtime doit etre valide sous plusieurs sessions. |
| Multi-entreprises et franchises | A recetter avec compte QA | Architecture workspace disponible. Isolation et changement d'entreprise doivent etre testes avec deux tenants. |
| Parametres, roles et permissions | A recetter avec compte QA | Routes protegees, tables roles/permissions et Super Admin disponibles. Matrice de roles a tester avec plusieurs comptes. |
| API et integrations | Partiel | APIs protegees et journalisation disponibles. Google, SMS et signatures restent non actives. |
| Cybersecurite | Partiel | Sessions, logs, audit et protections disponibles. 2FA n'est pas finalisee. |
| Abonnements SaaS | Partiel | Quatre prix Stripe LIVE mensuels et actifs. Evenement `customer.subscription.created` absent du webhook; aucun abonnement actif ni evenement traite durant la recette. |

## Tests techniques executes

- `npx tsc --noEmit` : succes
- `npm run lint` : succes
- `npm run build` : succes
- Build Vercel production : succes
- Routes de navigation anonymes : 76/76 redirigent vers `/login`
- APIs IA, workflows, BI, donnees, operations et Stripe sans session : reponse 401
- `/api/health` : `ready: true`
- `/api/stripe/health` : quatre Price IDs valides, endpoint global non pret a cause du webhook incomplet
- `/api/openai/health` : configuration presente, quota API indisponible

## Conditions avant validation premiers clients

1. Creer un compte QA admin, un compte manager et un compte client.
2. Executer les scenarios CRUD authentifies et verifier l'isolation entre deux workspaces.
3. Ajouter `customer.subscription.created` au webhook Stripe et tester un paiement complet.
4. Recharger le quota OpenAI puis tester IA, BI et workflows.
5. Reconnecter Google Calendar lorsque l'integration doit etre activee.
6. Configurer et recetter les fournisseurs sociaux, SMS, signature et banque selon les besoins commerciaux.

