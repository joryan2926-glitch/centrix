create table if not exists public.integration_deliveries (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  provider text not null,
  action text not null,
  status text not null default 'pending' check (status in ('pending', 'delivered', 'failed')),
  recipient text,
  external_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.meetings add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.documents add column if not exists signature_status text not null default 'none';
alter table public.documents add column if not exists signature_external_id text;

create index if not exists integration_deliveries_workspace_created_idx
  on public.integration_deliveries (workspace_id, created_at desc);
create index if not exists integration_deliveries_provider_status_idx
  on public.integration_deliveries (provider, status);

alter table public.integration_deliveries enable row level security;

drop policy if exists "integration deliveries tenant select" on public.integration_deliveries;
drop policy if exists "integration deliveries tenant insert" on public.integration_deliveries;
drop policy if exists "integration deliveries tenant update" on public.integration_deliveries;

create policy "integration deliveries tenant select"
  on public.integration_deliveries for select to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "integration deliveries tenant insert"
  on public.integration_deliveries for insert to authenticated
  with check (public.is_workspace_member(workspace_id) and created_by = auth.uid());

create policy "integration deliveries tenant update"
  on public.integration_deliveries for update to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

grant select, insert, update on public.integration_deliveries to authenticated;

do $$
begin
  alter publication supabase_realtime add table public.integration_deliveries;
exception
  when duplicate_object then null;
end $$;
