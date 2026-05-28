create extension if not exists pgcrypto;

do $$ begin
  create type public.centrix_module_key as enum (
    'dashboard',
    'crm',
    'clients',
    'billing',
    'accounting',
    'banking',
    'enterprise',
    'legal',
    'documents',
    'hr',
    'payroll',
    'agenda',
    'projects',
    'collaboration',
    'marketing',
    'social',
    'ai',
    'automations',
    'analytics',
    'support',
    'notifications',
    'marketplace',
    'academy',
    'settings',
    'integrations',
    'security',
    'multi-company'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.centrix_event_severity as enum ('info', 'success', 'warning', 'critical');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.centrix_task_priority as enum ('low', 'medium', 'high', 'urgent');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.centrix_task_status as enum ('todo', 'in_progress', 'done', 'blocked');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.dashboard_metrics (
  id text primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  key text not null,
  label text not null,
  value text not null,
  delta text not null default '',
  tone text not null default 'cyan' check (tone in ('cyan', 'violet', 'emerald', 'rose')),
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.dashboard_analytics (
  id text primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  period_index integer not null default 0,
  label text not null,
  revenue numeric not null default 0,
  expenses numeric not null default 0,
  leads numeric not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.module_events (
  id text primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  module public.centrix_module_key not null,
  entity_type text not null,
  entity_id text,
  title text not null,
  detail text not null default '',
  severity public.centrix_event_severity not null default 'info',
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.module_tasks (
  id text primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  module public.centrix_module_key not null,
  title text not null,
  assignee text not null default 'Equipe',
  priority public.centrix_task_priority not null default 'medium',
  status public.centrix_task_status not null default 'todo',
  due_at timestamptz,
  source_entity_type text,
  source_entity_id text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.module_connections (
  id text primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  source_module public.centrix_module_key not null,
  target_module public.centrix_module_key not null,
  trigger text not null,
  action text not null,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.file_shares (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  owner_id uuid references auth.users(id) on delete set null,
  bucket text not null default 'centrix-cloud',
  path text not null,
  module public.centrix_module_key not null default 'documents',
  permission text not null default 'private' check (permission in ('private', 'team', 'client', 'public_link')),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.dashboard_metrics enable row level security;
alter table public.dashboard_analytics enable row level security;
alter table public.module_events enable row level security;
alter table public.module_tasks enable row level security;
alter table public.module_connections enable row level security;
alter table public.file_shares enable row level security;

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
    where w.id = target_workspace_id
      and w.owner_id = auth.uid()
  );
$$;

create policy "dashboard metrics workspace read"
  on public.dashboard_metrics for select
  to authenticated
  using (workspace_id is null or public.is_workspace_member(workspace_id));

create policy "dashboard metrics workspace write"
  on public.dashboard_metrics for all
  to authenticated
  using (workspace_id is null or public.is_workspace_member(workspace_id))
  with check (workspace_id is null or public.is_workspace_member(workspace_id));

create policy "dashboard analytics workspace read"
  on public.dashboard_analytics for select
  to authenticated
  using (workspace_id is null or public.is_workspace_member(workspace_id));

create policy "dashboard analytics workspace write"
  on public.dashboard_analytics for all
  to authenticated
  using (workspace_id is null or public.is_workspace_member(workspace_id))
  with check (workspace_id is null or public.is_workspace_member(workspace_id));

create policy "module events workspace read"
  on public.module_events for select
  to authenticated
  using (workspace_id is null or public.is_workspace_member(workspace_id));

create policy "module events workspace write"
  on public.module_events for all
  to authenticated
  using (workspace_id is null or public.is_workspace_member(workspace_id))
  with check (workspace_id is null or public.is_workspace_member(workspace_id));

create policy "module tasks workspace read"
  on public.module_tasks for select
  to authenticated
  using (workspace_id is null or public.is_workspace_member(workspace_id));

create policy "module tasks workspace write"
  on public.module_tasks for all
  to authenticated
  using (workspace_id is null or public.is_workspace_member(workspace_id))
  with check (workspace_id is null or public.is_workspace_member(workspace_id));

create policy "module connections workspace read"
  on public.module_connections for select
  to authenticated
  using (workspace_id is null or public.is_workspace_member(workspace_id));

create policy "module connections workspace write"
  on public.module_connections for all
  to authenticated
  using (workspace_id is null or public.is_workspace_member(workspace_id))
  with check (workspace_id is null or public.is_workspace_member(workspace_id));

create policy "file shares workspace read"
  on public.file_shares for select
  to authenticated
  using (workspace_id is null or public.is_workspace_member(workspace_id));

create policy "file shares workspace write"
  on public.file_shares for all
  to authenticated
  using (workspace_id is null or public.is_workspace_member(workspace_id))
  with check (workspace_id is null or public.is_workspace_member(workspace_id));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'centrix-cloud',
  'centrix-cloud',
  false,
  52428800,
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'application/zip',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "centrix cloud authenticated read"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'centrix-cloud');

create policy "centrix cloud authenticated upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'centrix-cloud');

create policy "centrix cloud owner update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'centrix-cloud' and owner = auth.uid())
  with check (bucket_id = 'centrix-cloud' and owner = auth.uid());

create policy "centrix cloud owner delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'centrix-cloud' and owner = auth.uid());

alter publication supabase_realtime add table public.dashboard_metrics;
alter publication supabase_realtime add table public.dashboard_analytics;
alter publication supabase_realtime add table public.module_events;
alter publication supabase_realtime add table public.module_tasks;
alter publication supabase_realtime add table public.module_connections;
alter publication supabase_realtime add table public.file_shares;
