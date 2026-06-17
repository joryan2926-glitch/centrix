create or replace function public.current_workspace_role(target_workspace_id uuid)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select case
    when w.owner_id = auth.uid() then 'super_admin'
    else coalesce(wm.role::text, p.role::text, 'user')
  end
  from public.workspaces w
  left join public.profiles p on p.id = auth.uid()
  left join public.workspace_members wm
    on wm.workspace_id = w.id
   and wm.user_id = auth.uid()
   and wm.status = 'active'
  where w.id = target_workspace_id
    and (
      w.owner_id = auth.uid()
      or p.workspace_id = w.id
      or wm.user_id = auth.uid()
    )
  limit 1;
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

create or replace function public.role_can_use_module(
  target_workspace_id uuid,
  target_module_key text,
  target_role text,
  requested_action text default 'read'
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select case
    when target_role = 'super_admin' then true
    when target_role = 'admin' then true
    else coalesce((
      select case requested_action
        when 'read' then mp.can_read
        when 'create' then mp.can_create
        when 'update' then mp.can_update
        when 'delete' then mp.can_delete
        when 'export' then mp.can_export
        when 'manage' then mp.can_manage
        else false
      end
      from public.module_permissions mp
      where mp.workspace_id = target_workspace_id
        and mp.module_key = target_module_key
        and mp.role::text = target_role
      limit 1
    ), false)
  end;
$$;

create or replace function public.can_access_module(target_workspace_id uuid, target_module_key text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  with access as (
    select public.current_workspace_role(target_workspace_id) as role
  )
  select exists (
    select 1
    from access a
    where a.role = 'super_admin'
      or (
        public.module_enabled_for_plan(target_workspace_id, target_module_key)
        and public.role_can_use_module(target_workspace_id, target_module_key, a.role, 'read')
      )
  );
$$;

create or replace function public.can_access_current_module(target_module_key text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(public.can_access_module(p.workspace_id, target_module_key), false)
  from public.profiles p
  where p.id = auth.uid()
  limit 1;
$$;

create or replace function public.can_use_module(target_workspace_id uuid, target_module_key text, requested_action text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  with access as (
    select public.current_workspace_role(target_workspace_id) as role
  )
  select exists (
    select 1
    from access a
    where a.role = 'super_admin'
      or (
        public.module_enabled_for_plan(target_workspace_id, target_module_key)
        and public.role_can_use_module(target_workspace_id, target_module_key, a.role, requested_action)
      )
  );
$$;

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
