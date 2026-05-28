create table if not exists public.subscription_plans (
  id text primary key,
  code text not null unique check (code in ('free', 'starter', 'premium', 'business', 'enterprise')),
  name text not null,
  description text not null,
  "monthlyPrice" numeric not null default 0,
  "yearlyPrice" numeric not null default 0,
  "stripePriceId" text,
  "userLimit" numeric not null default 0,
  "storageLimitGb" numeric not null default 0,
  modules text[] not null default '{}'::text[],
  features text[] not null default '{}'::text[],
  highlighted boolean not null default false
);

create table if not exists public.billing_customers (
  id text primary key,
  "companyId" text not null,
  name text not null,
  email text not null,
  "stripeCustomerId" text,
  premium boolean not null default false,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  "companyId" text not null,
  plan text not null check (plan in ('starter', 'premium', 'business', 'enterprise')),
  status text not null,
  seats numeric not null default 1,
  "usedSeats" numeric not null default 0,
  "monthlyPrice" numeric not null default 0,
  "renewalAt" timestamptz not null default now()
);

alter table public.subscriptions add column if not exists "customerId" text references public.billing_customers(id) on delete cascade;
alter table public.subscriptions add column if not exists "planId" text references public.subscription_plans(id) on delete restrict;
alter table public.subscriptions add column if not exists "stripeSubscriptionId" text;
alter table public.subscriptions add column if not exists "trialEndsAt" timestamptz;
alter table public.subscriptions add column if not exists "currentPeriodEnd" timestamptz;
alter table public.subscriptions add column if not exists "autoRenew" boolean not null default true;
alter table public.subscriptions add column if not exists "createdAt" timestamptz not null default now();
alter table public.subscriptions add column if not exists "updatedAt" timestamptz not null default now();

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  "subscriptionId" uuid not null references public.subscriptions(id) on delete cascade,
  "customerId" text not null references public.billing_customers(id) on delete cascade,
  number text not null,
  amount numeric not null default 0,
  "vatAmount" numeric not null default 0,
  status text not null check (status in ('paid', 'pending', 'failed', 'refunded')),
  "pdfUrl" text,
  "dueAt" timestamptz not null default now(),
  "paidAt" timestamptz,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.payments (
  id text primary key,
  "invoiceId" uuid not null references public.invoices(id) on delete cascade,
  "customerId" text not null references public.billing_customers(id) on delete cascade,
  "stripePaymentIntentId" text,
  "cardBrand" text not null default 'card',
  "cardLast4" text not null default '0000',
  amount numeric not null default 0,
  status text not null check (status in ('paid', 'pending', 'failed', 'refunded')),
  "createdAt" timestamptz not null default now()
);

create table if not exists public.coupons (
  id text primary key,
  code text not null unique,
  "discountPercent" numeric not null default 0,
  active boolean not null default true,
  "redemptionCount" numeric not null default 0,
  "expiresAt" timestamptz
);

create table if not exists public.usage_limits (
  id text primary key,
  "subscriptionId" uuid not null references public.subscriptions(id) on delete cascade,
  metric text not null check (metric in ('users', 'storage', 'ai_tokens', 'documents', 'workflows')),
  used numeric not null default 0,
  "limit" numeric not null default 0
);

create table if not exists public.billing_notifications (
  id text primary key,
  "customerId" text references public.billing_customers(id) on delete cascade,
  title text not null,
  detail text not null,
  severity text not null check (severity in ('info', 'success', 'warning')),
  "createdAt" timestamptz not null default now()
);

create table if not exists public.stripe_events (
  id text primary key,
  "stripeEventId" text not null unique,
  type text not null,
  status text not null check (status in ('processed', 'failed', 'ignored')),
  payload jsonb not null default '{}'::jsonb,
  "createdAt" timestamptz not null default now()
);

alter table public.subscription_plans enable row level security;
alter table public.billing_customers enable row level security;
alter table public.subscriptions enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.coupons enable row level security;
alter table public.usage_limits enable row level security;
alter table public.billing_notifications enable row level security;
alter table public.stripe_events enable row level security;

create policy "subscription plans read" on public.subscription_plans for select to anon, authenticated using (true);
create policy "subscription plans write" on public.subscription_plans for all to anon, authenticated using (true) with check (true);
create policy "billing customers read" on public.billing_customers for select to anon, authenticated using (true);
create policy "billing customers write" on public.billing_customers for all to anon, authenticated using (true) with check (true);
create policy "billing subscriptions read" on public.subscriptions for select to anon, authenticated using (true);
create policy "billing subscriptions write" on public.subscriptions for all to anon, authenticated using (true) with check (true);
create policy "invoices read" on public.invoices for select to anon, authenticated using (true);
create policy "invoices write" on public.invoices for all to anon, authenticated using (true) with check (true);
create policy "payments read" on public.payments for select to anon, authenticated using (true);
create policy "payments write" on public.payments for all to anon, authenticated using (true) with check (true);
create policy "coupons read" on public.coupons for select to anon, authenticated using (true);
create policy "coupons write" on public.coupons for all to anon, authenticated using (true) with check (true);
create policy "usage limits read" on public.usage_limits for select to anon, authenticated using (true);
create policy "usage limits write" on public.usage_limits for all to anon, authenticated using (true) with check (true);
create policy "billing notifications read" on public.billing_notifications for select to anon, authenticated using (true);
create policy "billing notifications write" on public.billing_notifications for all to anon, authenticated using (true) with check (true);
create policy "stripe events read" on public.stripe_events for select to anon, authenticated using (true);
create policy "stripe events write" on public.stripe_events for all to anon, authenticated using (true) with check (true);

do $$
begin
  alter publication supabase_realtime add table public.subscription_plans;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.billing_customers;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.subscriptions;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.invoices;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.payments;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.coupons;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.usage_limits;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.billing_notifications;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.stripe_events;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
