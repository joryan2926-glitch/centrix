create table if not exists public.enterprise_companies (
  id text primary key,
  name text not null,
  siret text not null,
  "vatNumber" text not null,
  address text not null,
  iban text not null,
  "logoUrl" text,
  industry text not null,
  status text not null check (status in ('active', 'pending', 'suspended')),
  revenue numeric not null default 0,
  "activeUsers" numeric not null default 0,
  "brandColor" text not null default '#5ee7ff',
  "workspaceSlug" text not null unique,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.enterprise_workspaces (
  id text primary key,
  "companyId" text not null references public.enterprise_companies(id) on delete cascade,
  name text not null,
  "primaryColor" text not null default '#5ee7ff',
  "accentColor" text not null default '#8b5cf6',
  "logoUrl" text,
  modules text[] not null default '{}'::text[],
  preferences jsonb not null default '{"locale":"fr-FR","currency":"EUR","timezone":"Europe/Paris"}'::jsonb,
  "isolatedData" boolean not null default true,
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.franchise_units (
  id text primary key,
  "companyId" text not null references public.enterprise_companies(id) on delete cascade,
  name text not null,
  "franchiseeName" text not null,
  zone text not null,
  city text not null,
  status text not null check (status in ('active', 'onboarding', 'at_risk', 'paused')),
  "monthlyRevenue" numeric not null default 0,
  "targetRevenue" numeric not null default 0,
  satisfaction numeric not null default 0,
  "openedAt" timestamptz not null default now()
);

create table if not exists public.enterprise_users (
  id text primary key,
  "companyId" text references public.enterprise_companies(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null check (role in ('super_admin', 'company_admin', 'manager', 'employee', 'viewer')),
  team text not null,
  active boolean not null default true,
  modules text[] not null default '{}'::text[],
  "lastSeenAt" timestamptz not null default now()
);

create table if not exists public.enterprise_teams (
  id text primary key,
  "companyId" text not null references public.enterprise_companies(id) on delete cascade,
  name text not null,
  members numeric not null default 0,
  modules text[] not null default '{}'::text[]
);

create table if not exists public.permission_policies (
  id text primary key,
  role text not null check (role in ('super_admin', 'company_admin', 'manager', 'employee', 'viewer')),
  label text not null,
  modules text[] not null default '{}'::text[],
  "canManageBilling" boolean not null default false,
  "canManageUsers" boolean not null default false,
  "canViewConsolidatedReports" boolean not null default false
);

create table if not exists public.enterprise_activities (
  id text primary key,
  "companyId" text references public.enterprise_companies(id) on delete cascade,
  title text not null,
  detail text not null,
  severity text not null check (severity in ('info', 'success', 'warning')),
  "createdAt" timestamptz not null default now()
);

create table if not exists public.consolidated_metrics (
  month text primary key,
  revenue numeric not null default 0,
  expenses numeric not null default 0,
  users numeric not null default 0,
  franchises numeric not null default 0
);

alter table public.enterprise_companies enable row level security;
alter table public.enterprise_workspaces enable row level security;
alter table public.franchise_units enable row level security;
alter table public.enterprise_users enable row level security;
alter table public.enterprise_teams enable row level security;
alter table public.permission_policies enable row level security;
alter table public.enterprise_activities enable row level security;
alter table public.consolidated_metrics enable row level security;

create policy "enterprise companies read" on public.enterprise_companies for select to anon, authenticated using (true);
create policy "enterprise companies write" on public.enterprise_companies for all to anon, authenticated using (true) with check (true);
create policy "enterprise workspaces read" on public.enterprise_workspaces for select to anon, authenticated using (true);
create policy "enterprise workspaces write" on public.enterprise_workspaces for all to anon, authenticated using (true) with check (true);
create policy "franchise units read" on public.franchise_units for select to anon, authenticated using (true);
create policy "franchise units write" on public.franchise_units for all to anon, authenticated using (true) with check (true);
create policy "enterprise users read" on public.enterprise_users for select to anon, authenticated using (true);
create policy "enterprise users write" on public.enterprise_users for all to anon, authenticated using (true) with check (true);
create policy "enterprise teams read" on public.enterprise_teams for select to anon, authenticated using (true);
create policy "enterprise teams write" on public.enterprise_teams for all to anon, authenticated using (true) with check (true);
create policy "permission policies read" on public.permission_policies for select to anon, authenticated using (true);
create policy "permission policies write" on public.permission_policies for all to anon, authenticated using (true) with check (true);
create policy "enterprise activities read" on public.enterprise_activities for select to anon, authenticated using (true);
create policy "enterprise activities write" on public.enterprise_activities for all to anon, authenticated using (true) with check (true);
create policy "consolidated metrics read" on public.consolidated_metrics for select to anon, authenticated using (true);
create policy "consolidated metrics write" on public.consolidated_metrics for all to anon, authenticated using (true) with check (true);

do $$
begin
  alter publication supabase_realtime add table public.enterprise_companies;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.enterprise_workspaces;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.franchise_units;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.enterprise_users;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.enterprise_teams;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.permission_policies;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.enterprise_activities;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.consolidated_metrics;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
