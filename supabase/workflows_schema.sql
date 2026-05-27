create table if not exists public.workflows (
  id text primary key,
  name text not null,
  description text not null,
  status text not null check (status in ('active', 'paused', 'draft', 'error')),
  runs integer not null default 0,
  "successRate" numeric not null default 100,
  "timeSavedHours" numeric not null default 0,
  owner text not null,
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.workflow_blocks (
  id text primary key,
  "workflowId" text not null references public.workflows(id) on delete cascade,
  type text not null check (type in ('trigger', 'action', 'condition', 'delay', 'ai', 'notification', 'filter')),
  label text not null,
  description text not null,
  "positionX" numeric not null default 0,
  "positionY" numeric not null default 0,
  config jsonb not null default '{}'
);

create table if not exists public.workflow_connections (
  id text primary key,
  "workflowId" text not null references public.workflows(id) on delete cascade,
  "sourceId" text not null references public.workflow_blocks(id) on delete cascade,
  "targetId" text not null references public.workflow_blocks(id) on delete cascade,
  label text
);

create table if not exists public.workflow_runs (
  id text primary key,
  "workflowId" text not null references public.workflows(id) on delete cascade,
  status text not null check (status in ('success', 'failed', 'running')),
  "durationMs" integer not null default 0,
  message text not null,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.workflow_templates (
  id text primary key,
  name text not null,
  category text not null check (category in ('crm', 'billing', 'marketing', 'support', 'hr', 'ai')),
  description text not null,
  blocks integer not null default 0
);

create table if not exists public.productivity_tasks (
  id text primary key,
  title text not null,
  module text not null,
  automated boolean not null default false,
  "savedMinutes" numeric not null default 0,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.workflow_alerts (
  id text primary key,
  "workflowId" text not null references public.workflows(id) on delete cascade,
  title text not null,
  detail text not null,
  severity text not null check (severity in ('info', 'warning', 'critical')),
  "createdAt" timestamptz not null default now()
);

alter table public.workflows enable row level security;
alter table public.workflow_blocks enable row level security;
alter table public.workflow_connections enable row level security;
alter table public.workflow_runs enable row level security;
alter table public.workflow_templates enable row level security;
alter table public.productivity_tasks enable row level security;
alter table public.workflow_alerts enable row level security;

create policy "workflows read authenticated" on public.workflows for select to authenticated using (true);
create policy "workflows write authenticated" on public.workflows for all to authenticated using (true) with check (true);
create policy "workflow blocks read authenticated" on public.workflow_blocks for select to authenticated using (true);
create policy "workflow blocks write authenticated" on public.workflow_blocks for all to authenticated using (true) with check (true);
create policy "workflow connections read authenticated" on public.workflow_connections for select to authenticated using (true);
create policy "workflow connections write authenticated" on public.workflow_connections for all to authenticated using (true) with check (true);
create policy "workflow runs read authenticated" on public.workflow_runs for select to authenticated using (true);
create policy "workflow runs write authenticated" on public.workflow_runs for all to authenticated using (true) with check (true);
create policy "workflow templates read authenticated" on public.workflow_templates for select to authenticated using (true);
create policy "workflow templates write authenticated" on public.workflow_templates for all to authenticated using (true) with check (true);
create policy "productivity tasks read authenticated" on public.productivity_tasks for select to authenticated using (true);
create policy "productivity tasks write authenticated" on public.productivity_tasks for all to authenticated using (true) with check (true);
create policy "workflow alerts read authenticated" on public.workflow_alerts for select to authenticated using (true);
create policy "workflow alerts write authenticated" on public.workflow_alerts for all to authenticated using (true) with check (true);

alter publication supabase_realtime add table public.workflows;
alter publication supabase_realtime add table public.workflow_blocks;
alter publication supabase_realtime add table public.workflow_connections;
alter publication supabase_realtime add table public.workflow_runs;
alter publication supabase_realtime add table public.workflow_templates;
alter publication supabase_realtime add table public.productivity_tasks;
alter publication supabase_realtime add table public.workflow_alerts;
