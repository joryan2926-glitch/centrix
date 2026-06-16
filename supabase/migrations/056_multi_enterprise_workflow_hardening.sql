alter table public.enterprise_companies add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.enterprise_workspaces add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.franchise_units add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.enterprise_users add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.enterprise_teams add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.permission_policies add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.enterprise_activities add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.consolidated_metrics add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;

do $$
declare
  first_workspace uuid;
begin
  select id into first_workspace from public.workspaces order by created_at asc limit 1;
  if first_workspace is not null then
    update public.enterprise_companies set workspace_id = first_workspace where workspace_id is null;
    update public.enterprise_workspaces set workspace_id = first_workspace where workspace_id is null;
    update public.franchise_units set workspace_id = first_workspace where workspace_id is null;
    update public.enterprise_users set workspace_id = first_workspace where workspace_id is null;
    update public.enterprise_teams set workspace_id = first_workspace where workspace_id is null;
    update public.permission_policies set workspace_id = first_workspace where workspace_id is null;
    update public.enterprise_activities set workspace_id = first_workspace where workspace_id is null;
    update public.consolidated_metrics set workspace_id = first_workspace where workspace_id is null;
  end if;
end $$;

alter table public.consolidated_metrics drop constraint if exists consolidated_metrics_pkey;
create unique index if not exists consolidated_metrics_workspace_month_idx on public.consolidated_metrics(workspace_id, month);
create index if not exists enterprise_companies_workspace_updated_idx on public.enterprise_companies(workspace_id, "updatedAt" desc);
create index if not exists enterprise_workspaces_workspace_company_idx on public.enterprise_workspaces(workspace_id, "companyId");
create index if not exists franchise_units_workspace_company_idx on public.franchise_units(workspace_id, "companyId");
create index if not exists enterprise_users_workspace_seen_idx on public.enterprise_users(workspace_id, "lastSeenAt" desc);
create index if not exists enterprise_teams_workspace_company_idx on public.enterprise_teams(workspace_id, "companyId");
create index if not exists permission_policies_workspace_role_idx on public.permission_policies(workspace_id, role);
create index if not exists enterprise_activities_workspace_created_idx on public.enterprise_activities(workspace_id, "createdAt" desc);

do $$
declare
  item record;
begin
  for item in
    select * from (values
      ('enterprise_companies'),
      ('enterprise_workspaces'),
      ('franchise_units'),
      ('enterprise_users'),
      ('enterprise_teams'),
      ('permission_policies'),
      ('enterprise_activities'),
      ('consolidated_metrics')
    ) as mappings(table_name)
  loop
    execute format('drop policy if exists "%s read" on public.%I', replace(item.table_name, '_', ' '), item.table_name);
    execute format('drop policy if exists "%s write" on public.%I', replace(item.table_name, '_', ' '), item.table_name);
    execute format('drop policy if exists "%s multi company read" on public.%I', item.table_name, item.table_name);
    execute format('drop policy if exists "%s multi company insert" on public.%I', item.table_name, item.table_name);
    execute format('drop policy if exists "%s multi company update" on public.%I', item.table_name, item.table_name);
    execute format('drop policy if exists "%s multi company delete" on public.%I', item.table_name, item.table_name);
    execute format('create policy "%s multi company read" on public.%I for select to authenticated using (public.can_use_module(workspace_id, ''multi-company'', ''read''))', item.table_name, item.table_name);
    execute format('create policy "%s multi company insert" on public.%I for insert to authenticated with check (public.can_use_module(workspace_id, ''multi-company'', ''create''))', item.table_name, item.table_name);
    execute format('create policy "%s multi company update" on public.%I for update to authenticated using (public.can_use_module(workspace_id, ''multi-company'', ''update'')) with check (public.can_use_module(workspace_id, ''multi-company'', ''update''))', item.table_name, item.table_name);
    execute format('create policy "%s multi company delete" on public.%I for delete to authenticated using (public.can_use_module(workspace_id, ''multi-company'', ''delete''))', item.table_name, item.table_name);
  end loop;
end $$;
