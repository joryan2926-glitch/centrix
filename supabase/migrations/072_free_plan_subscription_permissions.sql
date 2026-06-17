-- CENTRIX FREE plan: no Stripe subscription required.
-- Paid plans remain synchronized through Stripe Checkout and webhooks.

alter table public.users alter column abonnement set default 'free';
alter table public.workspaces alter column plan set default 'free';

alter table public.subscriptions drop constraint if exists subscriptions_plan_check;
alter table public.subscriptions
  add constraint subscriptions_plan_check
  check (plan in ('free', 'starter', 'premium', 'business', 'enterprise'));

alter table public.plan_modules drop constraint if exists plan_modules_plan_code_check;
alter table public.plan_modules
  add constraint plan_modules_plan_code_check
  check (plan_code in ('free', 'starter', 'premium', 'business', 'enterprise'));

insert into public.subscription_plans (
  id,
  code,
  name,
  description,
  "monthlyPrice",
  "yearlyPrice",
  "stripePriceId",
  "userLimit",
  "storageLimitGb",
  modules,
  features,
  highlighted
)
values (
  'plan-free',
  'free',
  'Free',
  'Pour découvrir CENTRIX et accéder au cockpit de démarrage.',
  0,
  0,
  null,
  1,
  1,
  array['dashboard', 'notifications'],
  array['Dashboard', 'Notifications', 'Accès upgrade'],
  false
)
on conflict (id) do update set
  code = excluded.code,
  name = excluded.name,
  description = excluded.description,
  "monthlyPrice" = excluded."monthlyPrice",
  "yearlyPrice" = excluded."yearlyPrice",
  "stripePriceId" = excluded."stripePriceId",
  "userLimit" = excluded."userLimit",
  "storageLimitGb" = excluded."storageLimitGb",
  modules = excluded.modules,
  features = excluded.features,
  highlighted = excluded.highlighted;

delete from public.plan_modules;

insert into public.plan_modules(plan_code, module_key)
select plan_code, module_key from (values
  ('free','dashboard'),
  ('free','notifications'),

  ('starter','dashboard'),
  ('starter','crm'),
  ('starter','clients'),
  ('starter','billing'),
  ('starter','agenda'),
  ('starter','finance'),
  ('starter','support'),
  ('starter','notifications'),

  ('premium','dashboard'),
  ('premium','crm'),
  ('premium','clients'),
  ('premium','billing'),
  ('premium','agenda'),
  ('premium','finance'),
  ('premium','support'),
  ('premium','marketing'),
  ('premium','ai'),
  ('premium','analytics'),
  ('premium','workflows'),
  ('premium','notifications'),

  ('business','dashboard'),
  ('business','crm'),
  ('business','clients'),
  ('business','billing'),
  ('business','agenda'),
  ('business','finance'),
  ('business','support'),
  ('business','marketing'),
  ('business','ai'),
  ('business','analytics'),
  ('business','workflows'),
  ('business','projects'),
  ('business','hr'),
  ('business','documents'),
  ('business','integrations'),
  ('business','marketplace'),
  ('business','academy'),
  ('business','legal'),
  ('business','security'),
  ('business','notifications'),

  ('enterprise','dashboard'),
  ('enterprise','crm'),
  ('enterprise','clients'),
  ('enterprise','billing'),
  ('enterprise','agenda'),
  ('enterprise','finance'),
  ('enterprise','support'),
  ('enterprise','marketing'),
  ('enterprise','ai'),
  ('enterprise','analytics'),
  ('enterprise','workflows'),
  ('enterprise','projects'),
  ('enterprise','hr'),
  ('enterprise','documents'),
  ('enterprise','integrations'),
  ('enterprise','marketplace'),
  ('enterprise','academy'),
  ('enterprise','legal'),
  ('enterprise','security'),
  ('enterprise','multi-company'),
  ('enterprise','franchises'),
  ('enterprise','white-label'),
  ('enterprise','settings'),
  ('enterprise','notifications')
) as access(plan_code, module_key)
on conflict do nothing;

update public.subscription_plans set modules = array['dashboard','notifications'] where code='free';
update public.subscription_plans set modules = array['dashboard','crm','clients','billing','agenda','finance','support','notifications'] where code='starter';
update public.subscription_plans set modules = array['dashboard','crm','clients','billing','agenda','finance','support','marketing','ai','analytics','workflows','notifications'] where code='premium';
update public.subscription_plans set modules = array['dashboard','crm','clients','billing','agenda','finance','support','marketing','ai','analytics','workflows','projects','hr','documents','integrations','marketplace','academy','legal','security','notifications'] where code='business';
update public.subscription_plans set modules = array['all'] where code='enterprise';

create or replace function public.workspace_effective_plan(target_workspace_id uuid)
returns text language sql security definer set search_path=public stable as $$
  select case
    when effective_plan in ('free','starter','premium','business','enterprise') then effective_plan
    else 'free'
  end
  from (select coalesce(
    (select s.plan from public.subscriptions s where s.workspace_id=target_workspace_id and s.status in ('active','trialing') order by s."updatedAt" desc limit 1),
    (select w.plan from public.workspaces w where w.id=target_workspace_id),
    'free'
  ) effective_plan) resolved;
$$;

create or replace function public.module_enabled_for_plan(target_workspace_id uuid, target_module_key text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.plan_modules pm
    where pm.plan_code = public.workspace_effective_plan(target_workspace_id)
      and pm.module_key = target_module_key
  );
$$;
