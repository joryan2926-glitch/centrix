create index if not exists bank_accounts_workspace_sync_idx on public.bank_accounts(workspace_id, "lastSyncAt" desc);
create index if not exists transactions_workspace_bank_date_idx on public.transactions(workspace_id, "bankAccountId", date desc);
create index if not exists bridge_connections_workspace_user_idx on public.bridge_connections(workspace_id, user_id);

do $$
declare
  item record;
begin
  for item in
    select * from (values
      ('financial_settings'),
      ('bank_accounts'),
      ('transactions'),
      ('expenses'),
      ('revenues'),
      ('accounting_entries'),
      ('tax_records'),
      ('financial_reports')
    ) as mappings(table_name)
  loop
    execute format('drop policy if exists "%s finance read" on public.%I', item.table_name, item.table_name);
    execute format('drop policy if exists "%s finance insert" on public.%I', item.table_name, item.table_name);
    execute format('drop policy if exists "%s finance update" on public.%I', item.table_name, item.table_name);
    execute format('drop policy if exists "%s finance delete" on public.%I', item.table_name, item.table_name);
    execute format('create policy "%s finance read" on public.%I for select to authenticated using (public.can_use_module(workspace_id, ''finance'', ''read''))', item.table_name, item.table_name);
    execute format('create policy "%s finance insert" on public.%I for insert to authenticated with check (public.can_use_module(workspace_id, ''finance'', ''create''))', item.table_name, item.table_name);
    execute format('create policy "%s finance update" on public.%I for update to authenticated using (public.can_use_module(workspace_id, ''finance'', ''update'')) with check (public.can_use_module(workspace_id, ''finance'', ''update''))', item.table_name, item.table_name);
    execute format('create policy "%s finance delete" on public.%I for delete to authenticated using (public.can_use_module(workspace_id, ''finance'', ''delete''))', item.table_name, item.table_name);
  end loop;
end $$;

drop policy if exists "bridge connections finance read" on public.bridge_connections;
drop policy if exists "bridge connections finance insert" on public.bridge_connections;
drop policy if exists "bridge connections finance update" on public.bridge_connections;
drop policy if exists "bridge connections finance delete" on public.bridge_connections;

create policy "bridge connections finance read"
on public.bridge_connections for select to authenticated
using (user_id = auth.uid() and public.can_use_module(workspace_id, 'finance', 'read'));

create policy "bridge connections finance insert"
on public.bridge_connections for insert to authenticated
with check (user_id = auth.uid() and public.can_use_module(workspace_id, 'finance', 'create'));

create policy "bridge connections finance update"
on public.bridge_connections for update to authenticated
using (user_id = auth.uid() and public.can_use_module(workspace_id, 'finance', 'update'))
with check (user_id = auth.uid() and public.can_use_module(workspace_id, 'finance', 'update'));

create policy "bridge connections finance delete"
on public.bridge_connections for delete to authenticated
using (user_id = auth.uid() and public.can_use_module(workspace_id, 'finance', 'delete'));
