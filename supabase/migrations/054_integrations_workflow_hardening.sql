alter table public.api_keys add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.api_logs add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.webhooks add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.webhook_logs add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.integrations add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.oauth_connections add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.api_permissions add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.api_rate_limits add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.integration_notifications add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;

do $$
declare
  first_workspace uuid;
begin
  select id into first_workspace from public.workspaces order by created_at asc limit 1;
  if first_workspace is not null then
    update public.api_keys set workspace_id = first_workspace where workspace_id is null;
    update public.api_logs set workspace_id = first_workspace where workspace_id is null;
    update public.webhooks set workspace_id = first_workspace where workspace_id is null;
    update public.webhook_logs set workspace_id = first_workspace where workspace_id is null;
    update public.integrations set workspace_id = first_workspace where workspace_id is null;
    update public.oauth_connections set workspace_id = first_workspace where workspace_id is null;
    update public.api_permissions set workspace_id = first_workspace where workspace_id is null;
    update public.api_rate_limits set workspace_id = first_workspace where workspace_id is null;
    update public.integration_notifications set workspace_id = first_workspace where workspace_id is null;
  end if;
end $$;

create index if not exists api_keys_workspace_created_idx on public.api_keys(workspace_id, "createdAt" desc);
create index if not exists api_logs_workspace_created_idx on public.api_logs(workspace_id, "createdAt" desc);
create index if not exists webhooks_workspace_created_idx on public.webhooks(workspace_id, "createdAt" desc);
create index if not exists webhook_logs_workspace_created_idx on public.webhook_logs(workspace_id, "createdAt" desc);
create index if not exists integrations_workspace_provider_idx on public.integrations(workspace_id, provider);
create index if not exists oauth_connections_workspace_integration_idx on public.oauth_connections(workspace_id, "integrationId");
create index if not exists api_permissions_workspace_scope_idx on public.api_permissions(workspace_id, scope);
create index if not exists api_rate_limits_workspace_key_idx on public.api_rate_limits(workspace_id, "apiKeyId");
create index if not exists integration_notifications_workspace_created_idx on public.integration_notifications(workspace_id, "createdAt" desc);

do $$
declare
  item record;
begin
  for item in
    select * from (values
      ('api_keys'),
      ('api_logs'),
      ('webhooks'),
      ('webhook_logs'),
      ('integrations'),
      ('oauth_connections'),
      ('api_permissions'),
      ('api_rate_limits'),
      ('integration_notifications')
    ) as mappings(table_name)
  loop
    execute format('drop policy if exists "%s authenticated read" on public.%I', item.table_name, item.table_name);
    execute format('drop policy if exists "%s authenticated write" on public.%I', item.table_name, item.table_name);
    execute format('drop policy if exists "%s integrations read" on public.%I', item.table_name, item.table_name);
    execute format('drop policy if exists "%s integrations insert" on public.%I', item.table_name, item.table_name);
    execute format('drop policy if exists "%s integrations update" on public.%I', item.table_name, item.table_name);
    execute format('drop policy if exists "%s integrations delete" on public.%I', item.table_name, item.table_name);
    execute format('create policy "%s integrations read" on public.%I for select to authenticated using (public.can_use_module(workspace_id, ''integrations'', ''read''))', item.table_name, item.table_name);
    execute format('create policy "%s integrations insert" on public.%I for insert to authenticated with check (public.can_use_module(workspace_id, ''integrations'', ''create''))', item.table_name, item.table_name);
    execute format('create policy "%s integrations update" on public.%I for update to authenticated using (public.can_use_module(workspace_id, ''integrations'', ''update'')) with check (public.can_use_module(workspace_id, ''integrations'', ''update''))', item.table_name, item.table_name);
    execute format('create policy "%s integrations delete" on public.%I for delete to authenticated using (public.can_use_module(workspace_id, ''integrations'', ''delete''))', item.table_name, item.table_name);
  end loop;
end $$;
