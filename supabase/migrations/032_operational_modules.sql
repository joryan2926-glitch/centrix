create table if not exists public.module_records (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  module_key text not null,
  record_type text not null default 'General',
  title text not null,
  description text not null default '',
  status text not null default 'active' check (status in ('draft', 'active', 'pending', 'completed', 'archived')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  amount numeric not null default 0,
  owner_name text not null default '',
  due_at date,
  tags text[] not null default '{}'::text[],
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.module_record_history (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  module_key text not null,
  record_id uuid references public.module_records(id) on delete set null,
  action text not null,
  detail text not null,
  actor_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.module_permissions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  module_key text not null,
  role public.workspace_role not null,
  can_read boolean not null default true,
  can_create boolean not null default false,
  can_update boolean not null default false,
  can_delete boolean not null default false,
  can_export boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, module_key, role)
);

alter table public.module_records enable row level security;
alter table public.module_record_history enable row level security;
alter table public.module_permissions enable row level security;

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
    where ca.role in ('admin', 'manager')
      or (
        not exists (select 1 from configured)
        and case requested_action
          when 'read' then true
          when 'create' then ca.role = 'employee'
          when 'update' then ca.role = 'employee'
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
          else false
        end
      )
  );
$$;

create policy "module records workspace read" on public.module_records for select to authenticated using (public.can_use_module(workspace_id, module_key, 'read'));
create policy "module records workspace insert" on public.module_records for insert to authenticated with check (public.can_use_module(workspace_id, module_key, 'create'));
create policy "module records workspace update" on public.module_records for update to authenticated using (public.can_use_module(workspace_id, module_key, 'update')) with check (public.can_use_module(workspace_id, module_key, 'update'));
create policy "module records workspace delete" on public.module_records for delete to authenticated using (public.can_use_module(workspace_id, module_key, 'delete'));
create policy "module history workspace read" on public.module_record_history for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "module history workspace insert" on public.module_record_history for insert to authenticated with check (public.is_workspace_member(workspace_id));
create policy "module permissions workspace read" on public.module_permissions for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "module permissions workspace write" on public.module_permissions for all to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.workspace_id = module_permissions.workspace_id and p.role in ('admin', 'manager')))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.workspace_id = module_permissions.workspace_id and p.role in ('admin', 'manager')));

create index if not exists module_records_workspace_module_idx on public.module_records(workspace_id, module_key, updated_at desc);
create index if not exists module_records_status_idx on public.module_records(workspace_id, module_key, status);
create index if not exists module_record_history_workspace_module_idx on public.module_record_history(workspace_id, module_key, created_at desc);

drop trigger if exists touch_module_records_updated_at on public.module_records;
create trigger touch_module_records_updated_at before update on public.module_records for each row execute function public.touch_updated_at();
drop trigger if exists touch_module_permissions_updated_at on public.module_permissions;
create trigger touch_module_permissions_updated_at before update on public.module_permissions for each row execute function public.touch_updated_at();
