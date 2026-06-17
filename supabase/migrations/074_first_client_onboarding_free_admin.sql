-- Production onboarding fix:
-- New tenant users start as ADMIN on FREE, so plan gates can sell upgrades.
-- Existing platform super admin remains handled by 043_platform_super_admin.sql.

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
    else 'admin'::public.workspace_role
  end;

  insert into public.users (id, nom, email, entreprise, role, abonnement, avatar_url)
  values (new.id, display_name, new.email, company_name, initial_role, initial_plan, coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'))
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
  values (new.id, created_workspace_id, display_name, new.email, coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'), initial_role)
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
