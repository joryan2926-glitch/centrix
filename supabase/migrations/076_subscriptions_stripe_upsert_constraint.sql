-- PostgREST upsert requires a non-partial unique index/constraint for onConflict.
-- Multiple NULL values are allowed by PostgreSQL unique indexes, so this remains safe for FREE/local rows.

drop index if exists public.subscriptions_stripe_subscription_id_unique;

create unique index subscriptions_stripe_subscription_id_unique
  on public.subscriptions ("stripeSubscriptionId");
