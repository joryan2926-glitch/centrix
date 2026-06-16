alter table public.security_logs add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.user_sessions add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.login_attempts add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.security_alerts add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.api_security_logs add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.user_permissions add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.audit_logs add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.backups add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.gdpr_requests add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;

do $$
declare
  first_workspace uuid;
begin
  select id into first_workspace from public.workspaces order by created_at asc limit 1;
  if first_workspace is not null then
    update public.security_logs set workspace_id = first_workspace where workspace_id is null;
    update public.user_sessions set workspace_id = first_workspace where workspace_id is null;
    update public.login_attempts set workspace_id = first_workspace where workspace_id is null;
    update public.security_alerts set workspace_id = first_workspace where workspace_id is null;
    update public.api_security_logs set workspace_id = first_workspace where workspace_id is null;
    update public.user_permissions set workspace_id = first_workspace where workspace_id is null;
    update public.audit_logs set workspace_id = first_workspace where workspace_id is null;
    update public.backups set workspace_id = first_workspace where workspace_id is null;
    update public.gdpr_requests set workspace_id = first_workspace where workspace_id is null;
  end if;
end $$;

create index if not exists security_logs_workspace_created_idx on public.security_logs(workspace_id, "createdAt" desc);
create index if not exists user_sessions_workspace_seen_idx on public.user_sessions(workspace_id, "lastSeenAt" desc);
create index if not exists login_attempts_workspace_created_idx on public.login_attempts(workspace_id, "createdAt" desc);
create index if not exists security_alerts_workspace_created_idx on public.security_alerts(workspace_id, "createdAt" desc);
create index if not exists api_security_logs_workspace_created_idx on public.api_security_logs(workspace_id, "createdAt" desc);
create index if not exists user_permissions_workspace_reviewed_idx on public.user_permissions(workspace_id, "lastReviewedAt" desc);
create index if not exists audit_logs_workspace_created_idx on public.audit_logs(workspace_id, "createdAt" desc);
create index if not exists backups_workspace_created_idx on public.backups(workspace_id, "createdAt" desc);
create index if not exists gdpr_requests_workspace_created_idx on public.gdpr_requests(workspace_id, "createdAt" desc);

do $$
declare
  item record;
begin
  for item in
    select * from (values
      ('security_logs'),
      ('user_sessions'),
      ('login_attempts'),
      ('security_alerts'),
      ('api_security_logs'),
      ('user_permissions'),
      ('audit_logs'),
      ('backups'),
      ('gdpr_requests')
    ) as mappings(table_name)
  loop
    execute format('drop policy if exists "%s read authenticated" on public.%I', item.table_name, item.table_name);
    execute format('drop policy if exists "%s write authenticated" on public.%I', item.table_name, item.table_name);
    execute format('drop policy if exists "%s security read" on public.%I', item.table_name, item.table_name);
    execute format('drop policy if exists "%s security insert" on public.%I', item.table_name, item.table_name);
    execute format('drop policy if exists "%s security update" on public.%I', item.table_name, item.table_name);
    execute format('drop policy if exists "%s security delete" on public.%I', item.table_name, item.table_name);
    execute format('create policy "%s security read" on public.%I for select to authenticated using (public.can_use_module(workspace_id, ''security'', ''read''))', item.table_name, item.table_name);
    execute format('create policy "%s security insert" on public.%I for insert to authenticated with check (public.can_use_module(workspace_id, ''security'', ''create''))', item.table_name, item.table_name);
    execute format('create policy "%s security update" on public.%I for update to authenticated using (public.can_use_module(workspace_id, ''security'', ''update'')) with check (public.can_use_module(workspace_id, ''security'', ''update''))', item.table_name, item.table_name);
    execute format('create policy "%s security delete" on public.%I for delete to authenticated using (public.can_use_module(workspace_id, ''security'', ''delete''))', item.table_name, item.table_name);
  end loop;
end $$;
