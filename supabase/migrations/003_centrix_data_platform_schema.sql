create extension if not exists pgcrypto;

do $$ begin
  create type public.workspace_role as enum ('admin', 'manager', 'employee', 'client');
exception when duplicate_object then null;
end $$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  nom text not null default '',
  email text not null unique,
  entreprise text not null default 'Mon entreprise',
  role public.workspace_role not null default 'admin',
  abonnement text not null default 'starter',
  avatar_url text,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  workspace_id uuid,
  full_name text not null default '',
  email text not null,
  avatar_url text,
  phone text,
  locale text not null default 'fr-FR',
  timezone text not null default 'Europe/Paris',
  role public.workspace_role not null default 'admin',
  preferences jsonb not null default '{}'::jsonb,
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

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.workspace_role not null default 'employee',
  status text not null default 'active' check (status in ('active', 'invited', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

alter table public.profiles add constraint profiles_workspace_fk foreign key (workspace_id) references public.workspaces(id) on delete set null;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  company text,
  email text,
  phone text,
  status text not null default 'active',
  tags text[] not null default '{}'::text[],
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.prospects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  name text not null,
  company text,
  email text,
  phone text,
  source text,
  stage text not null default 'new',
  score integer not null default 0,
  potential_amount numeric not null default 0,
  next_follow_up_at timestamptz,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  prospect_id uuid references public.prospects(id) on delete set null,
  number text not null,
  title text not null,
  status text not null default 'draft' check (status in ('draft', 'sent', 'accepted', 'rejected', 'converted')),
  subtotal numeric not null default 0,
  vat_rate numeric not null default 20,
  vat_amount numeric not null default 0,
  total numeric not null default 0,
  currency text not null default 'EUR',
  pdf_url text,
  line_items jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  valid_until date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, number)
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  quote_id uuid references public.quotes(id) on delete set null,
  number text not null,
  title text not null,
  status text not null default 'pending' check (status in ('draft', 'pending', 'paid', 'overdue', 'cancelled')),
  subtotal numeric not null default 0,
  vat_rate numeric not null default 20,
  vat_amount numeric not null default 0,
  total numeric not null default 0,
  paid_amount numeric not null default 0,
  currency text not null default 'EUR',
  stripe_payment_intent_id text,
  pdf_url text,
  due_at date,
  paid_at timestamptz,
  line_items jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, number)
);

alter table public.quotes add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.invoices add column if not exists metadata jsonb not null default '{}'::jsonb;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  name text not null,
  description text,
  status text not null default 'planned',
  priority text not null default 'medium',
  progress integer not null default 0,
  budget numeric not null default 0,
  starts_at date,
  due_at date,
  owner_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'todo',
  priority text not null default 'medium',
  assignee_id uuid references auth.users(id) on delete set null,
  due_at timestamptz,
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text,
  role text,
  department text,
  contract_type text,
  salary_gross numeric not null default 0,
  status text not null default 'active',
  hired_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payroll (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  employee_id uuid references public.employees(id) on delete cascade,
  period text not null,
  gross_salary numeric not null default 0,
  employee_charges numeric not null default 0,
  employer_charges numeric not null default 0,
  net_salary numeric not null default 0,
  status text not null default 'draft',
  payslip_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  module text not null default 'system',
  title text not null,
  body text not null default '',
  type text not null default 'info',
  read_at timestamptz,
  action_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  description text,
  location text,
  video_url text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'confirmed',
  participants jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  owner_id uuid references auth.users(id) on delete set null,
  name text not null,
  bucket text not null default 'centrix-cloud',
  path text not null,
  mime_type text,
  size_bytes bigint not null default 0,
  category text not null default 'general',
  signed boolean not null default false,
  shared boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  sender_id uuid references auth.users(id) on delete set null,
  channel text not null default 'general',
  body text not null,
  attachments jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.messages add column if not exists metadata jsonb not null default '{}'::jsonb;

create table if not exists public.workflows (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  description text,
  trigger text not null,
  actions jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  last_run_at timestamptz,
  runs_count integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.analytics (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  module text not null,
  metric_key text not null,
  metric_label text not null,
  metric_value numeric not null default 0,
  period text not null,
  dimensions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (workspace_id, module, metric_key, period)
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null default 'starter',
  status text not null default 'trialing',
  seats integer not null default 1,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  requester_id uuid references auth.users(id) on delete set null,
  assigned_to uuid references auth.users(id) on delete set null,
  title text not null,
  description text not null default '',
  status text not null default 'open',
  priority text not null default 'medium',
  category text,
  satisfaction_score integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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

alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;

drop policy if exists "users self read" on public.users;
drop policy if exists "users self write" on public.users;
drop policy if exists "profiles self read" on public.profiles;
drop policy if exists "profiles self write" on public.profiles;
drop policy if exists "workspaces member read" on public.workspaces;
drop policy if exists "workspaces owner write" on public.workspaces;
drop policy if exists "members workspace read" on public.workspace_members;
drop policy if exists "members admin write" on public.workspace_members;
create policy "users self read" on public.users for select to authenticated using (id = auth.uid());
create policy "users self write" on public.users for all to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles self read" on public.profiles for select to authenticated using (id = auth.uid() or public.is_workspace_member(workspace_id));
create policy "profiles self write" on public.profiles for all to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "workspaces member read" on public.workspaces for select to authenticated using (owner_id = auth.uid() or public.is_workspace_member(id));
create policy "workspaces owner write" on public.workspaces for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "members workspace read" on public.workspace_members for select to authenticated using (user_id = auth.uid() or public.is_workspace_member(workspace_id));
create policy "members admin write" on public.workspace_members for all to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'clients',
    'prospects',
    'quotes',
    'invoices',
    'projects',
    'tasks',
    'employees',
    'payroll',
    'notifications',
    'meetings',
    'documents',
    'messages',
    'workflows',
    'analytics',
    'subscriptions',
    'support_tickets'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists "%s workspace read" on public.%I', table_name, table_name);
    execute format('drop policy if exists "%s workspace insert" on public.%I', table_name, table_name);
    execute format('drop policy if exists "%s workspace update" on public.%I', table_name, table_name);
    execute format('drop policy if exists "%s workspace delete" on public.%I', table_name, table_name);
    execute format('create policy "%s workspace read" on public.%I for select to authenticated using (public.is_workspace_member(workspace_id))', table_name, table_name);
    execute format('create policy "%s workspace insert" on public.%I for insert to authenticated with check (public.is_workspace_member(workspace_id))', table_name, table_name);
    execute format('create policy "%s workspace update" on public.%I for update to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id))', table_name, table_name);
    execute format('create policy "%s workspace delete" on public.%I for delete to authenticated using (public.is_workspace_member(workspace_id))', table_name, table_name);
  end loop;
end $$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'clients',
    'prospects',
    'quotes',
    'invoices',
    'projects',
    'tasks',
    'employees',
    'payroll',
    'meetings',
    'documents',
    'workflows',
    'subscriptions',
    'support_tickets'
  ]
  loop
    execute format('drop trigger if exists touch_%s_updated_at on public.%I', table_name, table_name);
    execute format('create trigger touch_%s_updated_at before update on public.%I for each row execute function public.touch_updated_at()', table_name, table_name);
  end loop;
end $$;

create index if not exists clients_workspace_idx on public.clients(workspace_id);
create index if not exists prospects_workspace_idx on public.prospects(workspace_id);
create index if not exists invoices_workspace_idx on public.invoices(workspace_id, status);
create index if not exists quotes_workspace_idx on public.quotes(workspace_id, status);
create index if not exists projects_workspace_idx on public.projects(workspace_id, status);
create index if not exists tasks_workspace_idx on public.tasks(workspace_id, status);
create index if not exists notifications_workspace_idx on public.notifications(workspace_id, user_id, read_at);
create index if not exists meetings_workspace_idx on public.meetings(workspace_id, starts_at);
create index if not exists analytics_workspace_idx on public.analytics(workspace_id, module, period);
create index if not exists support_tickets_workspace_idx on public.support_tickets(workspace_id, status, priority);

insert into storage.buckets (id, name, public, file_size_limit)
values ('centrix-cloud', 'centrix-cloud', false, 52428800)
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('centrix-avatars', 'centrix-avatars', true, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "centrix cloud read" on storage.objects;
drop policy if exists "centrix cloud upload" on storage.objects;
drop policy if exists "centrix cloud update" on storage.objects;
drop policy if exists "centrix cloud delete" on storage.objects;
create policy "centrix cloud read" on storage.objects for select to authenticated using (bucket_id in ('centrix-cloud', 'centrix-avatars'));
create policy "centrix cloud upload" on storage.objects for insert to authenticated with check (bucket_id in ('centrix-cloud', 'centrix-avatars'));
create policy "centrix cloud update" on storage.objects for update to authenticated using (bucket_id in ('centrix-cloud', 'centrix-avatars') and owner = auth.uid()) with check (bucket_id in ('centrix-cloud', 'centrix-avatars') and owner = auth.uid());
create policy "centrix cloud delete" on storage.objects for delete to authenticated using (bucket_id in ('centrix-cloud', 'centrix-avatars') and owner = auth.uid());

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'clients',
    'prospects',
    'quotes',
    'invoices',
    'projects',
    'tasks',
    'employees',
    'payroll',
    'notifications',
    'meetings',
    'documents',
    'messages',
    'workflows',
    'analytics',
    'subscriptions',
    'support_tickets'
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
