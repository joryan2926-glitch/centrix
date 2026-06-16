alter table public.companies add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.legal_documents add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.legal_announcements add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.shareholders add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.company_steps add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.company_settings add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.capital_deposits add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.legal_notifications add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;

create table if not exists public.company_development_plans (
  id text primary key,
  "companyId" text not null references public.companies(id) on delete cascade,
  title text not null,
  area text not null check (area in ('product', 'sales', 'finance', 'operations', 'legal')),
  objective text not null,
  owner text not null,
  progress numeric not null default 0,
  priority text not null check (priority in ('low', 'medium', 'high', 'critical')),
  "dueAt" timestamptz not null default now(),
  status text not null check (status in ('planned', 'in_progress', 'done', 'blocked')),
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  workspace_id uuid references public.workspaces(id) on delete cascade
);

create table if not exists public.company_advisory_sessions (
  id text primary key,
  "companyId" text not null references public.companies(id) on delete cascade,
  "expertName" text not null,
  topic text not null,
  recommendation text not null,
  status text not null check (status in ('requested', 'scheduled', 'completed')),
  "scheduledAt" timestamptz not null default now(),
  "createdAt" timestamptz not null default now(),
  workspace_id uuid references public.workspaces(id) on delete cascade
);

do $$
declare
  first_workspace uuid;
begin
  select id into first_workspace from public.workspaces order by created_at asc limit 1;
  if first_workspace is not null then
    update public.companies set workspace_id = first_workspace where workspace_id is null;
    update public.legal_documents set workspace_id = first_workspace where workspace_id is null;
    update public.legal_announcements set workspace_id = first_workspace where workspace_id is null;
    update public.shareholders set workspace_id = first_workspace where workspace_id is null;
    update public.company_steps set workspace_id = first_workspace where workspace_id is null;
    update public.company_settings set workspace_id = first_workspace where workspace_id is null;
    update public.capital_deposits set workspace_id = first_workspace where workspace_id is null;
    update public.legal_notifications set workspace_id = first_workspace where workspace_id is null;
  end if;
end $$;

alter table public.company_development_plans enable row level security;
alter table public.company_advisory_sessions enable row level security;

alter table public.company_settings drop constraint if exists company_settings_pkey;
create unique index if not exists company_settings_workspace_company_idx on public.company_settings(workspace_id, "companyId");

create index if not exists companies_workspace_updated_idx on public.companies(workspace_id, "updatedAt" desc);
create index if not exists legal_documents_workspace_company_idx on public.legal_documents(workspace_id, "companyId");
create index if not exists legal_announcements_workspace_company_idx on public.legal_announcements(workspace_id, "companyId");
create index if not exists shareholders_workspace_company_idx on public.shareholders(workspace_id, "companyId");
create index if not exists company_steps_workspace_company_idx on public.company_steps(workspace_id, "companyId", "order");
create index if not exists capital_deposits_workspace_company_idx on public.capital_deposits(workspace_id, "companyId");
create index if not exists legal_notifications_workspace_created_idx on public.legal_notifications(workspace_id, "createdAt" desc);
create index if not exists company_development_plans_workspace_updated_idx on public.company_development_plans(workspace_id, "updatedAt" desc);
create index if not exists company_advisory_sessions_workspace_scheduled_idx on public.company_advisory_sessions(workspace_id, "scheduledAt");

do $$
declare
  item record;
begin
  for item in
    select * from (values
      ('companies'),
      ('legal_documents'),
      ('legal_announcements'),
      ('shareholders'),
      ('company_steps'),
      ('company_settings'),
      ('capital_deposits'),
      ('legal_notifications'),
      ('company_development_plans'),
      ('company_advisory_sessions')
    ) as mappings(table_name)
  loop
    execute format('drop policy if exists "%s read" on public.%I', replace(item.table_name, '_', ' '), item.table_name);
    execute format('drop policy if exists "%s write" on public.%I', replace(item.table_name, '_', ' '), item.table_name);
    execute format('drop policy if exists "%s legal read" on public.%I', item.table_name, item.table_name);
    execute format('drop policy if exists "%s legal insert" on public.%I', item.table_name, item.table_name);
    execute format('drop policy if exists "%s legal update" on public.%I', item.table_name, item.table_name);
    execute format('drop policy if exists "%s legal delete" on public.%I', item.table_name, item.table_name);
    execute format('create policy "%s legal read" on public.%I for select to authenticated using (public.can_use_module(workspace_id, ''legal'', ''read''))', item.table_name, item.table_name);
    execute format('create policy "%s legal insert" on public.%I for insert to authenticated with check (public.can_use_module(workspace_id, ''legal'', ''create''))', item.table_name, item.table_name);
    execute format('create policy "%s legal update" on public.%I for update to authenticated using (public.can_use_module(workspace_id, ''legal'', ''update'')) with check (public.can_use_module(workspace_id, ''legal'', ''update''))', item.table_name, item.table_name);
    execute format('create policy "%s legal delete" on public.%I for delete to authenticated using (public.can_use_module(workspace_id, ''legal'', ''delete''))', item.table_name, item.table_name);
  end loop;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.company_development_plans;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.company_advisory_sessions;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
