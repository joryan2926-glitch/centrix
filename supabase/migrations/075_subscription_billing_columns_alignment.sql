-- Align the live subscriptions/billing_customers tables with the billing workflow code.
-- Some environments created subscriptions before the SaaS billing schema added camelCase fields.

alter table public.billing_customers add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.billing_customers add column if not exists "companyId" text;
alter table public.billing_customers add column if not exists name text not null default 'Workspace CENTRIX';
alter table public.billing_customers add column if not exists email text not null default '';
alter table public.billing_customers add column if not exists "stripeCustomerId" text;
alter table public.billing_customers add column if not exists premium boolean not null default false;
alter table public.billing_customers add column if not exists "createdAt" timestamptz not null default now();

alter table public.subscriptions add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.subscriptions add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.subscriptions add column if not exists "companyId" text;
alter table public.subscriptions add column if not exists "customerId" text;
alter table public.subscriptions add column if not exists "planId" text references public.subscription_plans(id) on delete restrict;
alter table public.subscriptions add column if not exists "stripeSubscriptionId" text;
alter table public.subscriptions add column if not exists status text not null default 'active';
alter table public.subscriptions add column if not exists seats numeric not null default 1;
alter table public.subscriptions add column if not exists "usedSeats" numeric not null default 0;
alter table public.subscriptions add column if not exists "monthlyPrice" numeric not null default 0;
alter table public.subscriptions add column if not exists "renewalAt" timestamptz not null default now();
alter table public.subscriptions add column if not exists "trialEndsAt" timestamptz;
alter table public.subscriptions add column if not exists "currentPeriodEnd" timestamptz;
alter table public.subscriptions add column if not exists "autoRenew" boolean not null default true;
alter table public.subscriptions add column if not exists "createdAt" timestamptz not null default now();
alter table public.subscriptions add column if not exists "updatedAt" timestamptz not null default now();

create unique index if not exists subscriptions_stripe_subscription_id_unique
  on public.subscriptions ("stripeSubscriptionId")
  where "stripeSubscriptionId" is not null;

create index if not exists subscriptions_workspace_status_idx on public.subscriptions(workspace_id, status);
create index if not exists billing_customers_workspace_idx on public.billing_customers(workspace_id);
