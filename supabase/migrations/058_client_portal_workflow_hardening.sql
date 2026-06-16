alter table public.client_portals add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.client_projects add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.client_documents add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.client_messages add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.client_notifications add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.client_appointments add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.client_signatures add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.client_activity_logs add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;

create table if not exists public.client_invoices (
  id text primary key,
  "portalId" text not null references public.client_portals(id) on delete cascade,
  number text not null,
  title text not null,
  amount numeric not null default 0,
  status text not null check (status in ('paid', 'pending', 'overdue', 'draft')),
  "dueAt" timestamptz not null,
  "pdfUrl" text not null default '#',
  workspace_id uuid references public.workspaces(id) on delete cascade
);

do $$
declare
  first_workspace uuid;
begin
  select id into first_workspace from public.workspaces order by created_at asc limit 1;
  if first_workspace is not null then
    update public.client_portals set workspace_id = first_workspace where workspace_id is null;
    update public.client_projects set workspace_id = first_workspace where workspace_id is null;
    update public.client_documents set workspace_id = first_workspace where workspace_id is null;
    update public.client_messages set workspace_id = first_workspace where workspace_id is null;
    update public.client_notifications set workspace_id = first_workspace where workspace_id is null;
    update public.client_appointments set workspace_id = first_workspace where workspace_id is null;
    update public.client_signatures set workspace_id = first_workspace where workspace_id is null;
    update public.client_activity_logs set workspace_id = first_workspace where workspace_id is null;
  end if;
end $$;

alter table public.client_invoices enable row level security;

create index if not exists client_portals_workspace_idx on public.client_portals(workspace_id);
create index if not exists client_invoices_workspace_due_idx on public.client_invoices(workspace_id, "dueAt");
create index if not exists client_projects_workspace_portal_idx on public.client_projects(workspace_id, "portalId");
create index if not exists client_documents_workspace_created_idx on public.client_documents(workspace_id, "createdAt" desc);
create index if not exists client_messages_workspace_created_idx on public.client_messages(workspace_id, "createdAt");
create index if not exists client_notifications_workspace_created_idx on public.client_notifications(workspace_id, "createdAt" desc);
create index if not exists client_appointments_workspace_start_idx on public.client_appointments(workspace_id, "startsAt");
create index if not exists client_signatures_workspace_requested_idx on public.client_signatures(workspace_id, "requestedAt" desc);
create index if not exists client_activity_logs_workspace_created_idx on public.client_activity_logs(workspace_id, "createdAt" desc);

do $$
declare
  item record;
begin
  for item in
    select * from (values
      ('client_portals'),
      ('client_invoices'),
      ('client_projects'),
      ('client_documents'),
      ('client_messages'),
      ('client_notifications'),
      ('client_appointments'),
      ('client_signatures'),
      ('client_activity_logs')
    ) as mappings(table_name)
  loop
    execute format('drop policy if exists "%s read authenticated" on public.%I', replace(item.table_name, '_', ' '), item.table_name);
    execute format('drop policy if exists "%s write authenticated" on public.%I', replace(item.table_name, '_', ' '), item.table_name);
    execute format('drop policy if exists "%s client portal read" on public.%I', item.table_name, item.table_name);
    execute format('drop policy if exists "%s client portal insert" on public.%I', item.table_name, item.table_name);
    execute format('drop policy if exists "%s client portal update" on public.%I', item.table_name, item.table_name);
    execute format('drop policy if exists "%s client portal delete" on public.%I', item.table_name, item.table_name);
    execute format('create policy "%s client portal read" on public.%I for select to authenticated using (public.can_use_module(workspace_id, ''clients'', ''read''))', item.table_name, item.table_name);
    execute format('create policy "%s client portal insert" on public.%I for insert to authenticated with check (public.can_use_module(workspace_id, ''clients'', ''create''))', item.table_name, item.table_name);
    execute format('create policy "%s client portal update" on public.%I for update to authenticated using (public.can_use_module(workspace_id, ''clients'', ''update'')) with check (public.can_use_module(workspace_id, ''clients'', ''update''))', item.table_name, item.table_name);
    execute format('create policy "%s client portal delete" on public.%I for delete to authenticated using (public.can_use_module(workspace_id, ''clients'', ''delete''))', item.table_name, item.table_name);
  end loop;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.client_invoices;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
