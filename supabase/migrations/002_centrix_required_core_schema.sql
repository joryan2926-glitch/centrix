create extension if not exists pgcrypto;

do $$ begin
  create type public.workspace_role as enum ('admin', 'manager', 'employee', 'client');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  name text not null default 'CENTRIX Workspace',
  slug text unique,
  plan text not null default 'starter',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete set null,
  full_name text not null default '',
  email text not null default '',
  avatar_url text,
  role public.workspace_role not null default 'admin',
  preferences jsonb not null default '{}'::jsonb,
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

create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
  )
  or exists (
    select 1
    from public.workspaces w
    where w.id = target_workspace_id
      and w.owner_id = auth.uid()
  );
$$;

create or replace function public.is_workspace_admin(target_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
      and wm.role in ('admin', 'manager')
  )
  or exists (
    select 1
    from public.workspaces w
    where w.id = target_workspace_id
      and w.owner_id = auth.uid()
  );
$$;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  name text not null default '',
  company text not null default '',
  email text not null default '',
  phone text,
  status text not null default 'active',
  tags text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_contacts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  name text not null default '',
  company text not null default '',
  email text not null default '',
  phone text,
  stage text not null default 'new',
  source text not null default 'manual',
  potential_amount numeric not null default 0,
  score numeric not null default 0,
  tags text[] not null default '{}',
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  number text not null default '',
  title text not null default '',
  status text not null default 'pending',
  currency text not null default 'EUR',
  subtotal numeric not null default 0,
  vat_amount numeric not null default 0,
  total numeric not null default 0,
  paid_amount numeric not null default 0,
  due_at timestamptz,
  paid_at timestamptz,
  line_items jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  title text not null default '',
  description text,
  status text not null default 'planned',
  priority text not null default 'medium',
  progress numeric not null default 0,
  due_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  assignee_id uuid references auth.users(id) on delete set null,
  title text not null default '',
  description text,
  status text not null default 'todo',
  priority text not null default 'medium',
  due_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null default '',
  body text not null default '',
  type text not null default 'info',
  module text not null default 'system',
  read_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.workflows (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  name text not null default '',
  status text not null default 'draft',
  trigger_type text not null default 'manual',
  steps jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  uploaded_by uuid references auth.users(id) on delete set null,
  name text not null default '',
  path text not null default '',
  mime_type text,
  size_bytes bigint not null default 0,
  category text not null default 'general',
  shared boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null default '',
  email text not null default '',
  role text not null default 'employee',
  department text,
  status text not null default 'active',
  salary numeric not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payroll (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  employee_id uuid references public.employees(id) on delete cascade,
  period text not null default '',
  gross_amount numeric not null default 0,
  net_amount numeric not null default 0,
  charges numeric not null default 0,
  status text not null default 'draft',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.analytics (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  module text not null default 'dashboard',
  metric text not null default '',
  value numeric not null default 0,
  period text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  title text not null default '',
  description text,
  status text not null default 'open',
  priority text not null default 'medium',
  category text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  plan text not null default 'starter',
  status text not null default 'active',
  provider text not null default 'stripe',
  provider_customer_id text,
  provider_subscription_id text,
  current_period_end timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'clients', 'crm_contacts', 'invoices', 'projects', 'tasks', 'notifications',
    'workflows', 'documents', 'employees', 'payroll', 'analytics',
    'support_tickets', 'subscriptions'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists "%s tenant select" on public.%I', table_name, table_name);
    execute format('drop policy if exists "%s tenant insert" on public.%I', table_name, table_name);
    execute format('drop policy if exists "%s tenant update" on public.%I', table_name, table_name);
    execute format('drop policy if exists "%s tenant delete" on public.%I', table_name, table_name);
    execute format('create policy "%s tenant select" on public.%I for select to authenticated using (public.is_workspace_member(workspace_id))', table_name, table_name);
    execute format('create policy "%s tenant insert" on public.%I for insert to authenticated with check (public.is_workspace_member(workspace_id))', table_name, table_name);
    execute format('create policy "%s tenant update" on public.%I for update to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id))', table_name, table_name);
    execute format('create policy "%s tenant delete" on public.%I for delete to authenticated using (public.is_workspace_admin(workspace_id))', table_name, table_name);
  end loop;
end $$;

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;

drop policy if exists "profiles tenant select" on public.profiles;
drop policy if exists "profiles self write" on public.profiles;
drop policy if exists "workspaces tenant select" on public.workspaces;
drop policy if exists "workspaces owner write" on public.workspaces;
drop policy if exists "workspace members tenant select" on public.workspace_members;
drop policy if exists "workspace members admin write" on public.workspace_members;

create policy "profiles tenant select" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_workspace_member(workspace_id));
create policy "profiles self write" on public.profiles
  for all to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "workspaces tenant select" on public.workspaces
  for select to authenticated using (owner_id = auth.uid() or public.is_workspace_member(id));
create policy "workspaces owner write" on public.workspaces
  for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "workspace members tenant select" on public.workspace_members
  for select to authenticated using (user_id = auth.uid() or public.is_workspace_member(workspace_id));
create policy "workspace members admin write" on public.workspace_members
  for all to authenticated using (public.is_workspace_admin(workspace_id)) with check (public.is_workspace_admin(workspace_id));

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'workspaces', 'workspace_members', 'clients', 'crm_contacts',
    'invoices', 'projects', 'tasks', 'notifications', 'workflows', 'documents',
    'employees', 'payroll', 'analytics', 'support_tickets', 'subscriptions'
  ]
  loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    exception
      when duplicate_object then null;
      when others then null;
    end;
  end loop;
end $$;
