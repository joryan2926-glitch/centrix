# Recettes Fonctionnelles Production CENTRIX

## Commandes

```bash
npm run recette:prod
```

Lance la recette production sans appel externe payant :

- sante `https://app-centrix.fr/api/health`
- audit des tables Supabase
- permissions, roles et plans
- CRUD controle sur tous les modules metier
- verification de configuration des integrations
- nettoyage automatique des lignes `RECETTE-PROD-*`

```bash
npm run recette:prod:external
```

Ajoute les diagnostics providers :

- Stripe Billing health
- Mistral health
- Twilio health

Les envois reels restent des actions explicites :

```bash
RECIPE_EMAIL_TO=adresse@domaine.fr npm run recette:prod -- --send-email
RECIPE_SMS_TO=+33600000000 npm run recette:prod:external -- --send-sms
```

## Couverture Actuelle

La recette CRUD couvre :

- CRM, prospects, clients
- Devis, factures, TVA
- Projets et taches
- Comptabilite, finance, banque
- RH
- Agenda et reservations
- Marketing et reseaux sociaux
- Support client
- Documents et cloud
- Marketplace
- CENTRIX Academy
- IA et workflows
- API et integrations
- Cybersecurite
- Notifications et collaboration
- Juridique et creation entreprise
- Sous-modules operationnels via `module_records`

## Etat Des Integrations Externes

Dernier diagnostic externe :

- Stripe : prix live OK, abonnements mensuels OK, webhook configure mais il manque `customer.subscription.created`.
- Mistral : cle configuree via `MISTRAL_API_KEY`, endpoint IA joignable selon quota provider.
- Twilio : SID/token configures, mais Twilio retourne `20003` et aucun `TWILIO_FROM_NUMBER` actif.
- Google Calendar : actif cote application, reconnecter les utilisateurs pour le scope Calendar si besoin.
- DocuSign : en attente de configuration.
- Bridge banking : configure via Vercel lorsque `BRIDGE_CLIENT_ID` et `BRIDGE_CLIENT_SECRET` sont presents.

## Conditions Pour Passer En Vert Total

Stripe :

- Ajouter `customer.subscription.created` dans les evenements du webhook production `/api/stripe/webhook`.

Mistral :

- Verifier quota/billing/rate limit de la cle `MISTRAL_API_KEY`.
- Relancer `npm run recette:prod:external`.

Twilio :

- Verifier `TWILIO_ACCOUNT_SID`.
- Remplacer `TWILIO_AUTH_TOKEN` si invalide.
- Ajouter `TWILIO_FROM_NUMBER`.

Google Calendar :

- Reconnecter les utilisateurs Google avec le scope Calendar.

DocuSign :

- Ajouter `DOCUSIGN_ACCOUNT_ID`.
- Ajouter `DOCUSIGN_ACCESS_TOKEN`.
- Ajouter `DOCUSIGN_BASE_URL` si l'environnement n'est pas `https://eu.docusign.net/restapi`.

Bridge Banking :

- Ajouter `BRIDGE_CLIENT_ID`.
- Ajouter `BRIDGE_CLIENT_SECRET`.

## Regle De Validation

Avant d'accepter des clients payants :

1. `npm run lint`
2. `npx tsc --noEmit --pretty false`
3. `npx next build --no-lint`
4. `npm run recette:prod`
5. `npm run recette:prod:external`

La recette externe doit avoir `failed: 0`.
