create extension if not exists pgcrypto;

do $$ begin
  create type public.workspace_role as enum ('admin', 'manager', 'employee', 'client');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  nom text not null default '',
  email text not null unique,
  entreprise text not null default 'Mon entreprise',
  role public.workspace_role not null default 'admin',
  abonnement text not null default 'starter',
  avatar_url text,
  preferences jsonb not null default '{"notifications": true, "weeklyDigest": true}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null unique,
  plan text not null default 'starter',
  logo_url text,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists workspaces_owner_id_unique on public.workspaces(owner_id);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete set null,
  full_name text not null default '',
  email text not null,
  avatar_url text,
  phone text,
  locale text not null default 'fr-FR',
  timezone text not null default 'Europe/Paris',
  role public.workspace_role not null default 'admin',
  preferences jsonb not null default '{"notifications": true, "weeklyDigest": true}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.workspace_role not null default 'admin',
  status text not null default 'active' check (status in ('active', 'invited', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
  )
  or exists (
    select 1 from public.workspaces w
    where w.id = target_workspace_id and w.owner_id = auth.uid()
  );
$$;

create or replace function public.workspace_role_for(target_workspace_id uuid)
returns public.workspace_role
language sql
security definer
set search_path = public
as $$
  select wm.role
  from public.workspace_members wm
  where wm.workspace_id = target_workspace_id
    and wm.user_id = auth.uid()
    and wm.status = 'active'
  limit 1;
$$;

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
  or public.workspace_role_for(target_workspace_id) = 'admin';
$$;

alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;

drop policy if exists "users self read" on public.users;
drop policy if exists "users self insert" on public.users;
drop policy if exists "users self update" on public.users;
drop policy if exists "profiles self read" on public.profiles;
drop policy if exists "profiles self insert" on public.profiles;
drop policy if exists "profiles self update" on public.profiles;
drop policy if exists "workspaces member read" on public.workspaces;
drop policy if exists "workspaces owner write" on public.workspaces;
drop policy if exists "members workspace read" on public.workspace_members;
drop policy if exists "members admin write" on public.workspace_members;

create policy "users self read" on public.users for select to authenticated using (id = auth.uid());
create policy "users self insert" on public.users for insert to authenticated with check (id = auth.uid());
create policy "users self update" on public.users for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles self read" on public.profiles for select to authenticated using (id = auth.uid() or public.is_workspace_member(workspace_id));
create policy "profiles self insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "profiles self update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "workspaces member read" on public.workspaces for select to authenticated using (owner_id = auth.uid() or public.is_workspace_member(id));
create policy "workspaces owner write" on public.workspaces for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "members workspace read" on public.workspace_members for select to authenticated using (user_id = auth.uid() or public.is_workspace_member(workspace_id));
create policy "members admin write" on public.workspace_members for all to authenticated using (public.is_workspace_admin(workspace_id)) with check (public.is_workspace_admin(workspace_id));

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
  values (
    new.id,
    display_name,
    new.email,
    company_name,
    'admin',
    coalesce(new.raw_user_meta_data->>'subscription', 'starter'),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  )
  on conflict (id) do update set
    nom = excluded.nom,
    email = excluded.email,
    entreprise = excluded.entreprise,
    avatar_url = excluded.avatar_url,
    updated_at = now();

  insert into public.workspaces (owner_id, name, slug, plan)
  values (
    new.id,
    company_name,
    workspace_slug,
    coalesce(new.raw_user_meta_data->>'subscription', 'starter')
  )
  on conflict (owner_id) do update set
    name = excluded.name,
    updated_at = now()
  returning id into created_workspace_id;

  insert into public.profiles (id, workspace_id, full_name, email, avatar_url, role)
  values (
    new.id,
    created_workspace_id,
    display_name,
    new.email,
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    'admin'
  )
  on conflict (id) do update set
    workspace_id = excluded.workspace_id,
    full_name = excluded.full_name,
    email = excluded.email,
    avatar_url = excluded.avatar_url,
    updated_at = now();

  insert into public.workspace_members (workspace_id, user_id, role, status)
  values (created_workspace_id, new.id, 'admin', 'active')
  on conflict (workspace_id, user_id) do update set
    role = excluded.role,
    status = excluded.status,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_centrix on auth.users;
create trigger on_auth_user_created_centrix
  after insert on auth.users
  for each row execute function public.handle_new_centrix_user();

drop trigger if exists touch_users_updated_at on public.users;
create trigger touch_users_updated_at before update on public.users for each row execute function public.touch_updated_at();
drop trigger if exists touch_profiles_updated_at on public.profiles;
create trigger touch_profiles_updated_at before update on public.profiles for each row execute function public.touch_updated_at();
drop trigger if exists touch_workspaces_updated_at on public.workspaces;
create trigger touch_workspaces_updated_at before update on public.workspaces for each row execute function public.touch_updated_at();
drop trigger if exists touch_workspace_members_updated_at on public.workspace_members;
create trigger touch_workspace_members_updated_at before update on public.workspace_members for each row execute function public.touch_updated_at();

do $$
begin
  do $$
begin
  alter publication supabase_realtime add table public.users;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
exception when duplicate_object then null; when others then null;
end $$;

do $$
begin
  do $$
begin
  alter publication supabase_realtime add table public.profiles;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
exception when duplicate_object then null; when others then null;
end $$;

do $$
begin
  do $$
begin
  alter publication supabase_realtime add table public.workspaces;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
exception when duplicate_object then null; when others then null;
end $$;

do $$
begin
  do $$
begin
  alter publication supabase_realtime add table public.workspace_members;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
exception when duplicate_object then null; when others then null;
end $$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'centrix-avatars',
  'centrix-avatars',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatars public read" on storage.objects;
drop policy if exists "avatars user upload" on storage.objects;
drop policy if exists "avatars user update" on storage.objects;
drop policy if exists "avatars user delete" on storage.objects;

create policy "avatars public read" on storage.objects
  for select using (bucket_id = 'centrix-avatars');

create policy "avatars user upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'centrix-avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars user update" on storage.objects
  for update to authenticated
  using (bucket_id = 'centrix-avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'centrix-avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars user delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'centrix-avatars' and (storage.foldername(name))[1] = auth.uid()::text);

grant usage on schema public to authenticated;
grant select, insert, update on public.users to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.workspaces to authenticated;
grant select, insert, update, delete on public.workspace_members to authenticated;
