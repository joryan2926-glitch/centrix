# Deploiement CENTRIX sur Vercel

## Validation locale

```bash
npm install
npm run lint
npx tsc --noEmit
npm run build
```

## Projet Vercel

Importer le depot GitHub `joryan2926-glitch/centrix` dans Vercel.

- Framework preset : `Next.js`
- Build command : `npm run build`
- Install command : `npm install`
- Output directory : laisser vide

## Variables obligatoires

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_CENTRIX_DEMO_MODE=false
NEXT_PUBLIC_SITE_URL=https://your-centrix-domain.vercel.app
NEXT_PUBLIC_APP_URL=https://your-centrix-domain.vercel.app
```

## Integrations optionnelles

```text
OPENAI_API_KEY
OPENAI_MODEL=gpt-5.1
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

Ne pas ajouter `SUPABASE_ACCESS_TOKEN` dans Vercel.

## Supabase Auth

Dans les parametres Auth Supabase, ajouter le domaine Vercel aux URLs autorisees :

```text
https://your-centrix-domain.vercel.app/auth/callback
https://your-centrix-domain.vercel.app/reset-password
```

Google OAuth doit etre active et configure dans Supabase avant utilisation.

Pour Google OAuth :

1. Creer un client OAuth Web dans Google Cloud.
2. Ajouter le callback Supabase affiche dans `Auth > Providers > Google`.
3. Ajouter le Client ID et le Client Secret dans Supabase.
4. Ajouter `https://app-centrix.fr/auth/callback` aux redirect URLs Supabase.

## Stripe

Configurer le webhook Stripe vers :

```text
https://your-centrix-domain.vercel.app/api/stripe/webhook
```

Evenements Stripe recommandes :

```text
invoice.payment_succeeded
invoice.payment_failed
customer.subscription.deleted
customer.subscription.updated
charge.refunded
```

Le module `API & Integrations` expose un diagnostic serveur des connexions actives. Les routes Stripe et OpenAI exigent une session CENTRIX et ne revelent jamais les secrets au navigateur.

## OpenAI

Configurer uniquement sur le serveur Vercel :

```text
OPENAI_API_KEY
OPENAI_MODEL=gpt-5.1
OPENAI_PROJECT_ID
```

Ne jamais utiliser de variable `NEXT_PUBLIC_*` pour une cle OpenAI. CENTRIX applique une authentification Supabase, un quota par utilisateur, un controle d'origine, une limite de taille, un timeout et `store: false` avant chaque appel OpenAI.
