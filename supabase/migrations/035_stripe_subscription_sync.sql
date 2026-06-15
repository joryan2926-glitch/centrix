alter table public.subscriptions
  add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade,
  add column if not exists created_by uuid references auth.users(id) on delete set null;

alter table public.billing_customers
  add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;

create unique index if not exists subscriptions_stripe_subscription_id_unique
  on public.subscriptions ("stripeSubscriptionId")
  where "stripeSubscriptionId" is not null;

create index if not exists subscriptions_workspace_id_idx on public.subscriptions (workspace_id);
create index if not exists billing_customers_company_id_idx on public.billing_customers ("companyId");

drop policy if exists "billing customers read" on public.billing_customers;
drop policy if exists "billing customers write" on public.billing_customers;
create policy "billing customers authenticated read" on public.billing_customers
  for select to authenticated
  using (public.is_workspace_member(workspace_id));

drop policy if exists "subscription plans write" on public.subscription_plans;
drop policy if exists "subscription plans read" on public.subscription_plans;
create policy "subscription plans public read" on public.subscription_plans
  for select to anon, authenticated using (true);

drop policy if exists "stripe events read" on public.stripe_events;
drop policy if exists "stripe events write" on public.stripe_events;
create policy "stripe events admin read" on public.stripe_events
  for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
