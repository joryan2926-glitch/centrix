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
  or public.workspace_role_for(target_workspace_id)::text in ('super_admin', 'workspace_admin', 'admin');
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
      and p.role in ('super_admin', 'workspace_admin', 'admin', 'manager')
  )
  or exists (
    select 1 from public.workspace_members wm
    where wm.user_id = auth.uid()
      and wm.workspace_id = target_workspace_id
      and wm.status = 'active'
      and wm.role::text in ('super_admin', 'workspace_admin', 'admin', 'manager')
  )
  or exists (
    select 1 from public.workspaces w
    where w.id = target_workspace_id and w.owner_id = auth.uid()
  );
$$;

create or replace function public.current_workspace_role(target_workspace_id uuid)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(wm.role::text, p.role::text, 'user')
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
    when target_role in ('super_admin', 'workspace_admin', 'admin') then true
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
    where a.role in ('super_admin', 'workspace_admin', 'admin')
      or public.role_can_use_module(target_workspace_id, target_module_key, a.role, requested_action)
  );
$$;

create or replace function public.can_access_module(target_workspace_id uuid, target_module_key text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.can_use_module(target_workspace_id, target_module_key, 'read');
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
  initial_plan text;
  initial_role public.workspace_role;
begin
  company_name := coalesce(new.raw_user_meta_data->>'company', 'Mon entreprise');
  display_name := coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'Utilisateur CENTRIX');
  workspace_slug := regexp_replace(lower(company_name), '[^a-z0-9]+', '-', 'g') || '-' || substring(new.id::text, 1, 8);
  initial_plan := coalesce(new.raw_user_meta_data->>'subscription', 'free');
  if initial_plan not in ('free', 'starter', 'premium', 'business', 'enterprise') then
    initial_plan := 'free';
  end if;
  initial_role := case
    when new.id = public.platform_super_admin_id() then 'super_admin'::public.workspace_role
    else 'workspace_admin'::public.workspace_role
  end;

  insert into public.users (id, nom, email, entreprise, role, abonnement, avatar_url)
  values (new.id, display_name, new.email, company_name, initial_role::text, initial_plan, coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'))
  on conflict (id) do update set
    nom = excluded.nom,
    email = excluded.email,
    entreprise = excluded.entreprise,
    avatar_url = excluded.avatar_url,
    updated_at = now();

  insert into public.workspaces (owner_id, name, slug, plan)
  values (new.id, company_name, workspace_slug, initial_plan)
  on conflict (owner_id) do update set name = excluded.name, updated_at = now()
  returning id into created_workspace_id;

  insert into public.profiles (id, workspace_id, full_name, email, avatar_url, role)
  values (new.id, created_workspace_id, display_name, new.email, coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'), initial_role::text)
  on conflict (id) do update set
    workspace_id = excluded.workspace_id,
    full_name = excluded.full_name,
    email = excluded.email,
    avatar_url = excluded.avatar_url,
    updated_at = now();

  insert into public.workspace_members (workspace_id, user_id, role, status)
  values (created_workspace_id, new.id, initial_role, 'active')
  on conflict (workspace_id, user_id) do update set status = 'active', updated_at = now();

  return new;
end;
$$;

drop policy if exists "user permissions manager read" on public.user_permissions;
drop policy if exists "user permissions manager write" on public.user_permissions;
create policy "user permissions manager read" on public.user_permissions for select to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('super_admin', 'workspace_admin', 'admin', 'manager')));
create policy "user permissions manager write" on public.user_permissions for all to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('super_admin', 'workspace_admin', 'admin', 'manager')))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('super_admin', 'workspace_admin', 'admin', 'manager')));

drop policy if exists "permission policies admin write" on public.permission_policies;
create policy "permission policies admin write" on public.permission_policies for all to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('super_admin', 'workspace_admin', 'admin')))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('super_admin', 'workspace_admin', 'admin')));

drop policy if exists "stripe events admin read" on public.stripe_events;
create policy "stripe events admin read" on public.stripe_events for select to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('super_admin', 'workspace_admin', 'admin')));
