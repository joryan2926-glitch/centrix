create extension if not exists pgcrypto;

do $$ begin
  create type public.centrix_user_role as enum ('admin', 'manager', 'employee', 'client');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  nom text not null default '',
  email text not null unique,
  entreprise text not null default 'Mon entreprise',
  role public.centrix_user_role not null default 'admin',
  abonnement text not null default 'starter',
  avatar_url text,
  preferences jsonb not null default '{"notifications": true, "weeklyDigest": true}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null,
  slug text not null unique,
  plan text not null default 'starter',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.centrix_user_role not null default 'admin',
  status text not null default 'active' check (status in ('active', 'invited', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

alter table public.users enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;

create policy "users can read own profile"
  on public.users for select
  to authenticated
  using (auth.uid() = id);

create policy "users can update own profile"
  on public.users for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "users can insert own profile"
  on public.users for insert
  to authenticated
  with check (auth.uid() = id);

create policy "workspace members can read workspace"
  on public.workspaces for select
  to authenticated
  using (
    owner_id = auth.uid()
    or exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = workspaces.id and wm.user_id = auth.uid()
    )
  );

create policy "workspace owners can manage workspace"
  on public.workspaces for all
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "workspace members can read members"
  on public.workspace_members for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.workspaces w
      where w.id = workspace_members.workspace_id and w.owner_id = auth.uid()
    )
  );

create policy "workspace owners can manage members"
  on public.workspace_members for all
  to authenticated
  using (
    exists (
      select 1 from public.workspaces w
      where w.id = workspace_members.workspace_id and w.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.workspaces w
      where w.id = workspace_members.workspace_id and w.owner_id = auth.uid()
    )
  );

create or replace function public.handle_new_centrix_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  workspace_id uuid;
  company_name text;
  display_name text;
begin
  company_name := coalesce(new.raw_user_meta_data->>'company', 'Mon entreprise');
  display_name := coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'Utilisateur CENTRIX');

  insert into public.users (id, nom, email, entreprise, role, abonnement, avatar_url)
  values (
    new.id,
    display_name,
    new.email,
    company_name,
    coalesce((new.raw_user_meta_data->>'role')::public.centrix_user_role, 'admin'),
    coalesce(new.raw_user_meta_data->>'subscription', 'starter'),
    new.raw_user_meta_data->>'avatar_url'
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
    regexp_replace(lower(company_name), '[^a-z0-9]+', '-', 'g') || '-' || substring(new.id::text, 1, 8),
    coalesce(new.raw_user_meta_data->>'subscription', 'starter')
  )
  on conflict (owner_id) do update set
    name = excluded.name,
    updated_at = now()
  returning id into workspace_id;

  insert into public.workspace_members (workspace_id, user_id, role, status)
  values (workspace_id, new.id, 'admin', 'active')
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

alter publication supabase_realtime add table public.users;
alter publication supabase_realtime add table public.workspaces;
alter publication supabase_realtime add table public.workspace_members;
