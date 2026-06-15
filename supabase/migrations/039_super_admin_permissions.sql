create or replace function public.is_workspace_admin(target_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspaces w
    where w.id = target_workspace_id and w.owner_id = auth.uid()
  )
  or public.workspace_role_for(target_workspace_id) in ('super_admin', 'admin');
$$;

create or replace function public.can_manage_workspace(target_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.workspace_id = target_workspace_id
      and p.role in ('super_admin', 'admin', 'manager')
  )
  or exists (
    select 1 from public.workspace_members wm
    where wm.user_id = auth.uid()
      and wm.workspace_id = target_workspace_id
      and wm.status = 'active'
      and wm.role in ('super_admin', 'admin', 'manager')
  )
  or exists (
    select 1 from public.workspaces w
    where w.id = target_workspace_id and w.owner_id = auth.uid()
  );
$$;

create or replace function public.can_use_module(target_workspace_id uuid, target_module_key text, requested_action text)
returns boolean
language sql
security definer
set search_path = public
as $$
  with current_access as (
    select
      case
        when w.owner_id = auth.uid() then 'super_admin'::public.workspace_role
        else coalesce(wm.role, p.role)
      end as role
    from public.profiles p
    join public.workspaces w on w.id = target_workspace_id
    left join public.workspace_members wm on wm.workspace_id = target_workspace_id and wm.user_id = auth.uid() and wm.status = 'active'
    where p.id = auth.uid() and (p.workspace_id = target_workspace_id or wm.workspace_id = target_workspace_id or w.owner_id = auth.uid())
    limit 1
  ),
  configured as (
    select mp.*
    from public.module_permissions mp
    join current_access ca on ca.role = mp.role
    where mp.workspace_id = target_workspace_id and mp.module_key = target_module_key
    limit 1
  )
  select exists (
    select 1 from current_access ca
    where ca.role in ('super_admin', 'admin')
      or (
        not exists (select 1 from configured)
        and case requested_action
          when 'read' then true
          when 'create' then ca.role in ('manager', 'employee')
          when 'update' then ca.role in ('manager', 'employee')
          when 'delete' then ca.role = 'manager'
          when 'export' then ca.role = 'manager'
          when 'manage' then ca.role = 'manager'
          else false
        end
      )
      or exists (
        select 1 from configured c
        where case requested_action
          when 'read' then c.can_read
          when 'create' then c.can_create
          when 'update' then c.can_update
          when 'delete' then c.can_delete
          when 'export' then c.can_export
          when 'manage' then c.can_manage
          else false
        end
      )
  );
$$;

create or replace function public.handle_new_centrix_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  created_workspace_id uuid;
  company_name text;
  display_name text;
  workspace_slug text;
begin
  company_name := coalesce(new.raw_user_meta_data->>'company', 'Mon entreprise');
  display_name := coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'Utilisateur CENTRIX');
  workspace_slug := regexp_replace(lower(company_name), '[^a-z0-9]+', '-', 'g') || '-' || substring(new.id::text, 1, 8);

  insert into public.users (id, nom, email, entreprise, role, abonnement, avatar_url)
  values (new.id, display_name, new.email, company_name, 'super_admin', coalesce(new.raw_user_meta_data->>'subscription', 'starter'), coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'))
  on conflict (id) do update set
    nom = excluded.nom,
    email = excluded.email,
    entreprise = excluded.entreprise,
    avatar_url = excluded.avatar_url,
    updated_at = now();

  insert into public.workspaces (owner_id, name, slug, plan)
  values (new.id, company_name, workspace_slug, coalesce(new.raw_user_meta_data->>'subscription', 'starter'))
  on conflict (owner_id) do update set name = excluded.name, updated_at = now()
  returning id into created_workspace_id;

  insert into public.profiles (id, workspace_id, full_name, email, avatar_url, role)
  values (new.id, created_workspace_id, display_name, new.email, coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'), 'super_admin')
  on conflict (id) do update set
    workspace_id = excluded.workspace_id,
    full_name = excluded.full_name,
    email = excluded.email,
    avatar_url = excluded.avatar_url,
    role = 'super_admin',
    updated_at = now();

  insert into public.workspace_members (workspace_id, user_id, role, status)
  values (created_workspace_id, new.id, 'super_admin', 'active')
  on conflict (workspace_id, user_id) do update set role = 'super_admin', status = 'active', updated_at = now();

  return new;
end;
$$;

update public.users u
set role = 'super_admin', updated_at = now()
where exists (select 1 from public.workspaces w where w.owner_id = u.id);

update public.profiles p
set role = 'super_admin', updated_at = now()
where exists (select 1 from public.workspaces w where w.owner_id = p.id and w.id = p.workspace_id);

insert into public.workspace_members (workspace_id, user_id, role, status)
select w.id, w.owner_id, 'super_admin', 'active'
from public.workspaces w
on conflict (workspace_id, user_id) do update
set role = 'super_admin', status = 'active', updated_at = now();

drop policy if exists "user permissions manager read" on public.user_permissions;
drop policy if exists "user permissions manager write" on public.user_permissions;
create policy "user permissions manager read" on public.user_permissions for select to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('super_admin', 'admin', 'manager')));
create policy "user permissions manager write" on public.user_permissions for all to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('super_admin', 'admin', 'manager')))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('super_admin', 'admin', 'manager')));

drop policy if exists "permission policies admin write" on public.permission_policies;
create policy "permission policies admin write" on public.permission_policies for all to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('super_admin', 'admin')))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('super_admin', 'admin')));

drop policy if exists "stripe events admin read" on public.stripe_events;
create policy "stripe events admin read" on public.stripe_events for select to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('super_admin', 'admin')));
