-- CENTRIX commercial hierarchy and quota enforcement.
-- Stripe remains the source of truth for paid subscriptions; FREE has no Stripe price.

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
values
  (
    'plan-free',
    'free',
    'Free',
    'Cockpit de demarrage CENTRIX avec quotas stricts pour tester la plateforme.',
    0,
    0,
    null,
    1,
    0.5,
    array['dashboard','profile','company-profile','notes','agenda','personal-agenda','help-center','notifications'],
    array['1 utilisateur','500 Mo stockage','10 clients','5 devis/mois','5 factures/mois'],
    false
  ),
  (
    'plan-starter',
    'starter',
    'Starter',
    'CRM, clients, devis, factures, paiements, agenda, taches, notes, documents basiques et signature electronique.',
    29,
    290,
    'price_1TiQlX1KedcFY0WPn6DtDsYn',
    3,
    5,
    array['dashboard','profile','company-profile','notes','agenda','personal-agenda','help-center','notifications','crm','clients','prospects','billing','quotes','invoices','payments','tasks','documents','basic-documents','electronic-signature'],
    array['3 utilisateurs','5 Go stockage','CRM','Devis et factures','Paiements','Documents basiques','Signature electronique'],
    false
  ),
  (
    'plan-premium',
    'premium',
    'Premium',
    'Tous les modules Starter avec projets, documents avances, workflows, automatisations, IA, support, analytics et rapports.',
    79,
    790,
    'price_1TiQn41KedcFY0WPHEP8zv9b',
    10,
    50,
    array['dashboard','profile','company-profile','notes','agenda','personal-agenda','help-center','notifications','crm','clients','prospects','billing','quotes','invoices','payments','tasks','documents','basic-documents','electronic-signature','projects','advanced-documents','workflows','automations','ai','support','analytics','reports','custom-dashboards'],
    array['10 utilisateurs','50 Go stockage','Projets','Documents avances','Workflows','IA CENTRIX','Support','Analytics','Rapports'],
    true
  ),
  (
    'plan-business',
    'business',
    'Business',
    'Tous les modules Premium avec RH, recrutement, equipe, banque, tresorerie, marketing, emailing, reseaux sociaux, API et integrations avancees.',
    149,
    1490,
    'price_1TiQoP1KedcFY0WPqZGlq0DE',
    0,
    200,
    array['dashboard','profile','company-profile','notes','agenda','personal-agenda','help-center','notifications','crm','clients','prospects','billing','quotes','invoices','payments','tasks','documents','basic-documents','electronic-signature','projects','advanced-documents','workflows','automations','ai','support','analytics','reports','custom-dashboards','hr','recruiting','team-management','finance','bank','treasury','marketing','emailing','social','api','integrations','legal','security'],
    array['Utilisateurs illimites','200 Go stockage','RH','Recrutement','Banque','Tresorerie','Marketing','Emailing','Reseaux sociaux','API','Integrations avancees'],
    false
  ),
  (
    'plan-enterprise',
    'enterprise',
    'Enterprise',
    'Tous les modules CENTRIX avec white label, multi-societes, marketplace, SSO, IA personnalisee, hebergement et accompagnement dedies.',
    499,
    4990,
    'price_1TiQpM1KedcFY0WPYQ9A1f2R',
    0,
    0,
    array['all'],
    array['Tous les modules','Stockage illimite','White Label','Multi-societes','Multi-filiales','Marketplace','API illimitee','SSO Google','SSO Microsoft','IA personnalisee','Hebergement dedie','Accompagnement dedie'],
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
  ('free','profile'),
  ('free','company-profile'),
  ('free','notes'),
  ('free','agenda'),
  ('free','personal-agenda'),
  ('free','help-center'),
  ('free','notifications'),

  ('starter','dashboard'),
  ('starter','profile'),
  ('starter','company-profile'),
  ('starter','notes'),
  ('starter','agenda'),
  ('starter','personal-agenda'),
  ('starter','help-center'),
  ('starter','notifications'),
  ('starter','crm'),
  ('starter','clients'),
  ('starter','prospects'),
  ('starter','billing'),
  ('starter','quotes'),
  ('starter','invoices'),
  ('starter','payments'),
  ('starter','tasks'),
  ('starter','documents'),
  ('starter','basic-documents'),
  ('starter','electronic-signature'),

  ('premium','dashboard'),
  ('premium','profile'),
  ('premium','company-profile'),
  ('premium','notes'),
  ('premium','agenda'),
  ('premium','personal-agenda'),
  ('premium','help-center'),
  ('premium','notifications'),
  ('premium','crm'),
  ('premium','clients'),
  ('premium','prospects'),
  ('premium','billing'),
  ('premium','quotes'),
  ('premium','invoices'),
  ('premium','payments'),
  ('premium','tasks'),
  ('premium','documents'),
  ('premium','basic-documents'),
  ('premium','electronic-signature'),
  ('premium','projects'),
  ('premium','advanced-documents'),
  ('premium','workflows'),
  ('premium','automations'),
  ('premium','ai'),
  ('premium','support'),
  ('premium','analytics'),
  ('premium','reports'),
  ('premium','custom-dashboards'),

  ('business','dashboard'),
  ('business','profile'),
  ('business','company-profile'),
  ('business','notes'),
  ('business','agenda'),
  ('business','personal-agenda'),
  ('business','help-center'),
  ('business','notifications'),
  ('business','crm'),
  ('business','clients'),
  ('business','prospects'),
  ('business','billing'),
  ('business','quotes'),
  ('business','invoices'),
  ('business','payments'),
  ('business','tasks'),
  ('business','documents'),
  ('business','basic-documents'),
  ('business','electronic-signature'),
  ('business','projects'),
  ('business','advanced-documents'),
  ('business','workflows'),
  ('business','automations'),
  ('business','ai'),
  ('business','support'),
  ('business','analytics'),
  ('business','reports'),
  ('business','custom-dashboards'),
  ('business','hr'),
  ('business','recruiting'),
  ('business','team-management'),
  ('business','finance'),
  ('business','bank'),
  ('business','treasury'),
  ('business','marketing'),
  ('business','emailing'),
  ('business','social'),
  ('business','api'),
  ('business','integrations'),
  ('business','legal'),
  ('business','security'),

  ('enterprise','dashboard'),
  ('enterprise','profile'),
  ('enterprise','company-profile'),
  ('enterprise','notes'),
  ('enterprise','agenda'),
  ('enterprise','personal-agenda'),
  ('enterprise','help-center'),
  ('enterprise','notifications'),
  ('enterprise','crm'),
  ('enterprise','clients'),
  ('enterprise','prospects'),
  ('enterprise','billing'),
  ('enterprise','quotes'),
  ('enterprise','invoices'),
  ('enterprise','payments'),
  ('enterprise','tasks'),
  ('enterprise','documents'),
  ('enterprise','basic-documents'),
  ('enterprise','electronic-signature'),
  ('enterprise','projects'),
  ('enterprise','advanced-documents'),
  ('enterprise','workflows'),
  ('enterprise','automations'),
  ('enterprise','ai'),
  ('enterprise','support'),
  ('enterprise','analytics'),
  ('enterprise','reports'),
  ('enterprise','custom-dashboards'),
  ('enterprise','hr'),
  ('enterprise','recruiting'),
  ('enterprise','team-management'),
  ('enterprise','finance'),
  ('enterprise','bank'),
  ('enterprise','treasury'),
  ('enterprise','marketing'),
  ('enterprise','emailing'),
  ('enterprise','social'),
  ('enterprise','api'),
  ('enterprise','integrations'),
  ('enterprise','legal'),
  ('enterprise','security'),
  ('enterprise','white-label'),
  ('enterprise','multi-company'),
  ('enterprise','franchises'),
  ('enterprise','marketplace'),
  ('enterprise','academy'),
  ('enterprise','administration'),
  ('enterprise','settings'),
  ('enterprise','google-sso'),
  ('enterprise','microsoft-sso'),
  ('enterprise','custom-ai'),
  ('enterprise','dedicated-hosting')
) as access(plan_code, module_key)
on conflict do nothing;

update public.subscription_plans sp
set modules = coalesce((
  select array_agg(pm.module_key order by pm.module_key)
  from public.plan_modules pm
  where pm.plan_code = sp.code
), array[]::text[])
where sp.code in ('free','starter','premium','business');

update public.subscription_plans set modules = array['all'] where code = 'enterprise';

insert into public.module_permissions (
  workspace_id,
  module_key,
  role,
  can_read,
  can_create,
  can_update,
  can_delete,
  can_export,
  can_manage
)
select
  w.id,
  pm.module_key,
  role_config.role,
  role_config.can_read,
  role_config.can_create,
  role_config.can_update,
  role_config.can_delete,
  role_config.can_export,
  role_config.can_manage
from public.workspaces w
cross join (select distinct module_key from public.plan_modules) pm
cross join (
  values
    ('super_admin'::public.workspace_role, true, true, true, true, true, true),
    ('admin'::public.workspace_role, true, true, true, true, true, true),
    ('manager'::public.workspace_role, true, true, true, false, true, false),
    ('employee'::public.workspace_role, true, true, true, false, false, false),
    ('user'::public.workspace_role, true, false, false, false, false, false),
    ('client'::public.workspace_role, true, false, false, false, false, false)
) as role_config(role, can_read, can_create, can_update, can_delete, can_export, can_manage)
on conflict (workspace_id, module_key, role) do nothing;

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

create or replace function public.workspace_plan_limits(target_workspace_id uuid)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select jsonb_build_object(
    'plan', sp.code,
    'userLimit', nullif(sp."userLimit", 0),
    'storageLimitMb', case when sp."storageLimitGb" = 0 then null else sp."storageLimitGb" * 1024 end,
    'clientLimit', case when sp.code = 'free' then 10 else null end,
    'monthlyQuoteLimit', case when sp.code = 'free' then 5 else null end,
    'monthlyInvoiceLimit', case when sp.code = 'free' then 5 else null end
  )
  from public.subscription_plans sp
  where sp.code = public.workspace_effective_plan(target_workspace_id)
  limit 1;
$$;

create or replace function public.enforce_workspace_user_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  limit_value numeric;
  active_count numeric;
begin
  if new.status <> 'active' then
    return new;
  end if;

  select nullif(sp."userLimit", 0)
    into limit_value
  from public.subscription_plans sp
  where sp.code = public.workspace_effective_plan(new.workspace_id)
  limit 1;

  if limit_value is null then
    return new;
  end if;

  select count(*)
    into active_count
  from public.workspace_members wm
  where wm.workspace_id = new.workspace_id
    and wm.status = 'active'
    and (tg_op = 'INSERT' or wm.user_id <> new.user_id);

  if active_count >= limit_value then
    raise exception 'CENTRIX plan user limit reached (% active users)', limit_value
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_workspace_user_limit_trigger on public.workspace_members;
create trigger enforce_workspace_user_limit_trigger
before insert or update of status, workspace_id, user_id on public.workspace_members
for each row execute function public.enforce_workspace_user_limit();

create or replace function public.enforce_free_client_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_plan text;
  current_count numeric;
begin
  current_plan := public.workspace_effective_plan(new.workspace_id);
  if current_plan <> 'free' then
    return new;
  end if;

  select count(*) into current_count
  from public.clients c
  where c.workspace_id = new.workspace_id
    and (tg_op = 'INSERT' or c.id <> new.id);

  if current_count >= 10 then
    raise exception 'CENTRIX FREE client limit reached (10 clients)'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_free_client_limit_trigger on public.clients;
create trigger enforce_free_client_limit_trigger
before insert or update of workspace_id on public.clients
for each row execute function public.enforce_free_client_limit();

create or replace function public.enforce_free_monthly_quote_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_plan text;
  current_count numeric;
begin
  current_plan := public.workspace_effective_plan(new.workspace_id);
  if current_plan <> 'free' then
    return new;
  end if;

  select count(*) into current_count
  from public.quotes q
  where q.workspace_id = new.workspace_id
    and date_trunc('month', q.created_at) = date_trunc('month', coalesce(new.created_at, now()))
    and (tg_op = 'INSERT' or q.id <> new.id);

  if current_count >= 5 then
    raise exception 'CENTRIX FREE quote limit reached (5 quotes/month)'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_free_monthly_quote_limit_trigger on public.quotes;
create trigger enforce_free_monthly_quote_limit_trigger
before insert or update of workspace_id, created_at on public.quotes
for each row execute function public.enforce_free_monthly_quote_limit();

create or replace function public.enforce_free_monthly_invoice_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_plan text;
  current_count numeric;
begin
  current_plan := public.workspace_effective_plan(new.workspace_id);
  if current_plan <> 'free' then
    return new;
  end if;

  select count(*) into current_count
  from public.invoices i
  where i.workspace_id = new.workspace_id
    and date_trunc('month', i.created_at) = date_trunc('month', coalesce(new.created_at, now()))
    and (tg_op = 'INSERT' or i.id <> new.id);

  if current_count >= 5 then
    raise exception 'CENTRIX FREE invoice limit reached (5 invoices/month)'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_free_monthly_invoice_limit_trigger on public.invoices;
create trigger enforce_free_monthly_invoice_limit_trigger
before insert or update of workspace_id, created_at on public.invoices
for each row execute function public.enforce_free_monthly_invoice_limit();

create or replace function public.enforce_workspace_document_storage_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  limit_bytes numeric;
  used_bytes numeric;
  incoming_size numeric;
begin
  select case when sp."storageLimitGb" = 0 then null else sp."storageLimitGb" * 1024 * 1024 * 1024 end
    into limit_bytes
  from public.subscription_plans sp
  where sp.code = public.workspace_effective_plan(new.workspace_id)
  limit 1;

  if limit_bytes is null then
    return new;
  end if;

  incoming_size := coalesce(new.size, 0);

  select coalesce(sum(coalesce(d.size, 0)), 0)
    into used_bytes
  from public.documents d
  where d.workspace_id = new.workspace_id
    and (tg_op = 'INSERT' or d.id <> new.id);

  if used_bytes + incoming_size > limit_bytes then
    raise exception 'CENTRIX storage limit reached'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_workspace_document_storage_limit_trigger on public.documents;
create trigger enforce_workspace_document_storage_limit_trigger
before insert or update of workspace_id, size on public.documents
for each row execute function public.enforce_workspace_document_storage_limit();

grant execute on function public.workspace_plan_limits(uuid) to authenticated;
