alter table public.module_permissions add column if not exists can_manage boolean not null default false;

create or replace function public.can_manage_workspace(target_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.workspace_id = target_workspace_id
      and p.role in ('admin', 'manager')
  )
  or exists (
    select 1 from public.workspace_members wm
    where wm.user_id = auth.uid()
      and wm.workspace_id = target_workspace_id
      and wm.status = 'active'
      and wm.role in ('admin', 'manager')
  );
$$;

create or replace function public.can_use_module(target_workspace_id uuid, target_module_key text, requested_action text)
returns boolean
language sql
security definer
set search_path = public
as $$
  with current_access as (
    select coalesce(wm.role, p.role) as role
    from public.profiles p
    left join public.workspace_members wm on wm.workspace_id = target_workspace_id and wm.user_id = auth.uid() and wm.status = 'active'
    where p.id = auth.uid() and (p.workspace_id = target_workspace_id or wm.workspace_id = target_workspace_id)
    limit 1
  ),
  configured as (
    select mp.*
    from public.module_permissions mp
    join current_access ca on ca.role = mp.role
    where mp.workspace_id = target_workspace_id and mp.module_key = target_module_key
    limit 1
  )
  select exists (
    select 1 from current_access ca
    where ca.role = 'admin'
      or (
        not exists (select 1 from configured)
        and case requested_action
          when 'read' then true
          when 'create' then ca.role in ('manager', 'employee')
          when 'update' then ca.role in ('manager', 'employee')
          when 'delete' then ca.role = 'manager'
          when 'export' then ca.role = 'manager'
          when 'manage' then ca.role = 'manager'
          else false
        end
      )
      or exists (
        select 1 from configured c
        where case requested_action
          when 'read' then c.can_read
          when 'create' then c.can_create
          when 'update' then c.can_update
          when 'delete' then c.can_delete
          when 'export' then c.can_export
          when 'manage' then c.can_manage
          else false
        end
      )
  );
$$;

drop policy if exists "module history workspace read" on public.module_record_history;
drop policy if exists "module history workspace insert" on public.module_record_history;
create policy "module history manage read" on public.module_record_history for select to authenticated using (public.can_use_module(workspace_id, module_key, 'manage'));
create policy "module history action insert" on public.module_record_history for insert to authenticated with check (
  public.can_use_module(workspace_id, module_key, 'create')
  or public.can_use_module(workspace_id, module_key, 'update')
  or public.can_use_module(workspace_id, module_key, 'delete')
);

drop policy if exists "module permissions workspace read" on public.module_permissions;
drop policy if exists "module permissions workspace write" on public.module_permissions;
create policy "module permissions member read" on public.module_permissions for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "module permissions manager write" on public.module_permissions for all to authenticated
using (public.can_manage_workspace(workspace_id))
with check (public.can_manage_workspace(workspace_id));

drop policy if exists "permissions read authenticated" on public.user_permissions;
drop policy if exists "permissions write authenticated" on public.user_permissions;
create policy "user permissions manager read" on public.user_permissions for select to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'manager')));
create policy "user permissions manager write" on public.user_permissions for all to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'manager')))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'manager')));

drop policy if exists "permission policies read" on public.permission_policies;
drop policy if exists "permission policies write" on public.permission_policies;
create policy "permission policies authenticated read" on public.permission_policies for select to authenticated using (true);
create policy "permission policies admin write" on public.permission_policies for all to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "documents read" on public.documents;
drop policy if exists "documents write" on public.documents;
drop policy if exists "support tickets read" on public.support_tickets;
drop policy if exists "support tickets write" on public.support_tickets;
drop policy if exists "workflows read" on public.workflows;
drop policy if exists "workflows write" on public.workflows;
drop policy if exists "workflows read authenticated" on public.workflows;
drop policy if exists "workflows write authenticated" on public.workflows;
drop policy if exists "subscriptions read" on public.subscriptions;
drop policy if exists "subscriptions write" on public.subscriptions;
drop policy if exists "billing subscriptions read" on public.subscriptions;
drop policy if exists "billing subscriptions write" on public.subscriptions;
drop policy if exists "invoices read" on public.invoices;
drop policy if exists "invoices write" on public.invoices;
drop policy if exists "projects read authenticated" on public.projects;
drop policy if exists "projects write authenticated" on public.projects;
drop policy if exists "tasks read authenticated" on public.tasks;
drop policy if exists "tasks write authenticated" on public.tasks;
drop policy if exists "agenda tasks read" on public.tasks;
drop policy if exists "agenda tasks write" on public.tasks;
drop policy if exists "notifications read" on public.notifications;
drop policy if exists "notifications write" on public.notifications;

drop policy if exists "documents storage read" on storage.objects;
drop policy if exists "documents storage upload" on storage.objects;
drop policy if exists "documents storage update" on storage.objects;
drop policy if exists "documents storage delete" on storage.objects;
create policy "documents storage authenticated read" on storage.objects for select to authenticated using (bucket_id = 'centrix-documents');
create policy "documents storage owner upload" on storage.objects for insert to authenticated with check (bucket_id = 'centrix-documents' and owner = auth.uid());
create policy "documents storage owner update" on storage.objects for update to authenticated using (bucket_id = 'centrix-documents' and owner = auth.uid()) with check (bucket_id = 'centrix-documents' and owner = auth.uid());
create policy "documents storage owner delete" on storage.objects for delete to authenticated using (bucket_id = 'centrix-documents' and owner = auth.uid());

do $$
declare
  item record;
begin
  for item in
    select * from (values
      ('clients', 'clients'),
      ('prospects', 'crm'),
      ('quotes', 'billing'),
      ('invoices', 'billing'),
      ('projects', 'projects'),
      ('tasks', 'projects'),
      ('employees', 'hr'),
      ('payroll', 'hr'),
      ('notifications', 'notifications'),
      ('meetings', 'agenda'),
      ('documents', 'documents'),
      ('messages', 'notifications'),
      ('workflows', 'workflows'),
      ('analytics', 'analytics'),
      ('subscriptions', 'billing'),
      ('support_tickets', 'support')
    ) as mappings(table_name, module_key)
  loop
    execute format('drop policy if exists "%s workspace read" on public.%I', item.table_name, item.table_name);
    execute format('drop policy if exists "%s workspace insert" on public.%I', item.table_name, item.table_name);
    execute format('drop policy if exists "%s workspace update" on public.%I', item.table_name, item.table_name);
    execute format('drop policy if exists "%s workspace delete" on public.%I', item.table_name, item.table_name);
    execute format('create policy "%s module read" on public.%I for select to authenticated using (public.can_use_module(workspace_id, %L, ''read''))', item.table_name, item.table_name, item.module_key);
    execute format('create policy "%s module insert" on public.%I for insert to authenticated with check (public.can_use_module(workspace_id, %L, ''create''))', item.table_name, item.table_name, item.module_key);
    execute format('create policy "%s module update" on public.%I for update to authenticated using (public.can_use_module(workspace_id, %L, ''update'')) with check (public.can_use_module(workspace_id, %L, ''update''))', item.table_name, item.table_name, item.module_key, item.module_key);
    execute format('create policy "%s module delete" on public.%I for delete to authenticated using (public.can_use_module(workspace_id, %L, ''delete''))', item.table_name, item.table_name, item.module_key);
  end loop;
end $$;
