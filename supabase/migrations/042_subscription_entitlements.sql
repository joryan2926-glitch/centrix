alter type public.workspace_role add value if not exists 'user' before 'client';

create table if not exists public.roles (
  id text primary key,
  label text not null,
  system boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.permissions (
  id text primary key,
  module_key text not null,
  action text not null check (action in ('read','create','update','delete','export','manage')),
  created_at timestamptz not null default now(),
  unique(module_key, action)
);

create table if not exists public.role_permissions (
  role_id text not null references public.roles(id) on delete cascade,
  permission_id text not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(role_id, permission_id)
);

create table if not exists public.plan_modules (
  plan_code text not null check (plan_code in ('starter','premium','business','enterprise')),
  module_key text not null,
  created_at timestamptz not null default now(),
  primary key(plan_code, module_key)
);

insert into public.roles(id,label) values
  ('super_admin','Super Admin'),('admin','Admin'),('manager','Manager'),('employee','Utilisateur'),('user','Utilisateur'),('client','Client')
on conflict(id) do update set label=excluded.label;

insert into public.permissions(id,module_key,action)
select module_key || ':' || action, module_key, action
from (
  select distinct module_key from (values
    ('dashboard'),('crm'),('clients'),('billing'),('agenda'),('notifications'),('finance'),('marketing'),('ai'),('analytics'),
    ('workflows'),('support'),('projects'),('hr'),('documents'),('integrations'),('marketplace'),('academy'),('legal'),('security'),
    ('multi-company'),('franchises'),('white-label'),('settings')
  ) modules(module_key)
) modules
cross join (values ('read'),('create'),('update'),('delete'),('export'),('manage')) actions(action)
on conflict(id) do nothing;

insert into public.role_permissions(role_id,permission_id)
select role_id,p.id
from (values
  ('super_admin','read'),('super_admin','create'),('super_admin','update'),('super_admin','delete'),('super_admin','export'),('super_admin','manage'),
  ('admin','read'),('admin','create'),('admin','update'),('admin','delete'),('admin','export'),('admin','manage'),
  ('manager','read'),('manager','create'),('manager','update'),('manager','export'),
  ('employee','read'),('employee','create'),('employee','update'),
  ('user','read'),('client','read')
) role_grants(role_id,action)
join public.permissions p on p.action=role_grants.action
on conflict do nothing;

insert into public.plan_modules(plan_code,module_key)
select plan_code,module_key from (values
  ('starter','dashboard'),('starter','crm'),('starter','clients'),('starter','billing'),('starter','agenda'),('starter','notifications'),
  ('premium','dashboard'),('premium','crm'),('premium','clients'),('premium','billing'),('premium','agenda'),('premium','notifications'),
  ('premium','finance'),('premium','marketing'),('premium','ai'),('premium','analytics'),('premium','workflows'),('premium','support'),
  ('business','dashboard'),('business','crm'),('business','clients'),('business','billing'),('business','agenda'),('business','notifications'),
  ('business','finance'),('business','marketing'),('business','ai'),('business','analytics'),('business','workflows'),('business','support'),
  ('business','projects'),('business','hr'),('business','documents'),('business','integrations'),('business','marketplace'),('business','academy'),('business','legal'),('business','security'),
  ('enterprise','dashboard'),('enterprise','crm'),('enterprise','clients'),('enterprise','billing'),('enterprise','agenda'),('enterprise','notifications'),
  ('enterprise','finance'),('enterprise','marketing'),('enterprise','ai'),('enterprise','analytics'),('enterprise','workflows'),('enterprise','support'),
  ('enterprise','projects'),('enterprise','hr'),('enterprise','documents'),('enterprise','integrations'),('enterprise','marketplace'),('enterprise','academy'),('enterprise','legal'),('enterprise','security'),
  ('enterprise','multi-company'),('enterprise','franchises'),('enterprise','white-label'),('enterprise','settings')
) as access(plan_code,module_key)
on conflict do nothing;

update public.subscription_plans set modules = array['dashboard','crm','clients','billing','agenda','notifications'] where code='starter';
update public.subscription_plans set modules = array['dashboard','crm','clients','billing','agenda','notifications','finance','marketing','ai','analytics','workflows','support'] where code='premium';
update public.subscription_plans set modules = array['dashboard','crm','clients','billing','agenda','notifications','finance','marketing','ai','analytics','workflows','support','projects','hr','documents','integrations','marketplace','academy','legal','security'] where code='business';
update public.subscription_plans set modules = array['all'] where code='enterprise';

create or replace function public.workspace_effective_plan(target_workspace_id uuid)
returns text language sql security definer set search_path=public stable as $$
  select case when effective_plan in ('starter','premium','business','enterprise') then effective_plan else 'starter' end
  from (select coalesce(
    (select s.plan from public.subscriptions s where s.workspace_id=target_workspace_id and s.status in ('active','trialing') order by s."updatedAt" desc limit 1),
    (select w.plan from public.workspaces w where w.id=target_workspace_id),
    'starter'
  ) effective_plan) resolved;
$$;

create or replace function public.can_access_module(target_workspace_id uuid, target_module_key text)
returns boolean language sql security definer set search_path=public stable as $$
  with access as (
    select case when w.owner_id=auth.uid() then 'super_admin'::text else coalesce(wm.role::text,p.role::text,'user') end role
    from public.workspaces w
    left join public.profiles p on p.id=auth.uid()
    left join public.workspace_members wm on wm.workspace_id=w.id and wm.user_id=auth.uid() and wm.status='active'
    where w.id=target_workspace_id and (w.owner_id=auth.uid() or p.workspace_id=w.id or wm.user_id=auth.uid())
    limit 1
  )
  select exists (
    select 1 from access a
    where a.role='super_admin'
      or (
        exists(select 1 from public.plan_modules pm where pm.plan_code=public.workspace_effective_plan(target_workspace_id) and pm.module_key=target_module_key)
        and (
          a.role='admin'
          or exists(select 1 from public.module_permissions mp where mp.workspace_id=target_workspace_id and mp.module_key=target_module_key and mp.role::text=a.role and mp.can_read)
        )
      )
  );
$$;

create or replace function public.can_access_current_module(target_module_key text)
returns boolean language sql security definer set search_path=public stable as $$
  select public.can_access_module(p.workspace_id,target_module_key) from public.profiles p where p.id=auth.uid() limit 1;
$$;

create or replace function public.can_use_module(target_workspace_id uuid, target_module_key text, requested_action text)
returns boolean language sql security definer set search_path=public stable as $$
  with current_access as (
    select case when w.owner_id=auth.uid() then 'super_admin'::text else coalesce(wm.role::text,p.role::text,'user') end role
    from public.workspaces w
    left join public.profiles p on p.id=auth.uid()
    left join public.workspace_members wm on wm.workspace_id=w.id and wm.user_id=auth.uid() and wm.status='active'
    where w.id=target_workspace_id and (w.owner_id=auth.uid() or p.workspace_id=w.id or wm.user_id=auth.uid())
    limit 1
  ),
  configured as (
    select mp.* from public.module_permissions mp
    join current_access ca on ca.role=mp.role::text
    where mp.workspace_id=target_workspace_id and mp.module_key=target_module_key
    limit 1
  )
  select public.can_access_module(target_workspace_id,target_module_key) and exists (
    select 1 from current_access ca where ca.role in ('super_admin','admin')
    or exists (
      select 1 from configured c where case requested_action
        when 'read' then c.can_read when 'create' then c.can_create when 'update' then c.can_update
        when 'delete' then c.can_delete when 'export' then c.can_export when 'manage' then c.can_manage else false end
    )
  );
$$;

alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.plan_modules enable row level security;
create policy "roles authenticated read" on public.roles for select to authenticated using(true);
create policy "permissions authenticated read" on public.permissions for select to authenticated using(true);
create policy "role permissions authenticated read" on public.role_permissions for select to authenticated using(true);
create policy "plan modules public read" on public.plan_modules for select to anon,authenticated using(true);

update public.users u set role='super_admin',updated_at=now() where exists(select 1 from public.workspaces w where w.owner_id=u.id);
update public.profiles p set role='super_admin',updated_at=now() where exists(select 1 from public.workspaces w where w.owner_id=p.id and w.id=p.workspace_id);
update public.workspace_members wm set role='super_admin',updated_at=now() where exists(select 1 from public.workspaces w where w.id=wm.workspace_id and w.owner_id=wm.user_id);
