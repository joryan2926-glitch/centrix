create table if not exists public.bridge_connections (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  external_user_id text not null,
  bridge_user_uuid text,
  item_id text,
  status text not null default 'pending' check (status in ('pending', 'connected', 'attention_required', 'disconnected')),
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

alter table public.bank_accounts add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.bank_accounts add column if not exists bridge_account_id text;
alter table public.bank_accounts add column if not exists bridge_item_id text;
alter table public.bank_accounts add column if not exists bridge_status text;
create unique index if not exists bank_accounts_bridge_account_id_idx on public.bank_accounts(bridge_account_id) where bridge_account_id is not null;

alter table public.transactions add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.transactions add column if not exists bridge_transaction_id text;
alter table public.transactions add column if not exists bridge_operation_type text;
create unique index if not exists transactions_bridge_transaction_id_idx on public.transactions(bridge_transaction_id) where bridge_transaction_id is not null;

alter table public.bridge_connections enable row level security;

drop policy if exists "finance banks read" on public.bank_accounts;
drop policy if exists "finance banks write" on public.bank_accounts;
create policy "finance banks workspace read"
on public.bank_accounts for select to authenticated
using (workspace_id in (select workspace_id from public.profiles where id = auth.uid()));
create policy "finance banks workspace write"
on public.bank_accounts for all to authenticated
using (workspace_id in (select workspace_id from public.profiles where id = auth.uid()))
with check (workspace_id in (select workspace_id from public.profiles where id = auth.uid()));

drop policy if exists "finance tx read" on public.transactions;
drop policy if exists "finance tx write" on public.transactions;
create policy "finance transactions workspace read"
on public.transactions for select to authenticated
using (workspace_id in (select workspace_id from public.profiles where id = auth.uid()));
create policy "finance transactions workspace write"
on public.transactions for all to authenticated
using (workspace_id in (select workspace_id from public.profiles where id = auth.uid()))
with check (workspace_id in (select workspace_id from public.profiles where id = auth.uid()));

drop policy if exists "bridge connections workspace read" on public.bridge_connections;
create policy "bridge connections workspace read"
on public.bridge_connections for select to authenticated
using (
  user_id = auth.uid()
  and workspace_id in (select workspace_id from public.profiles where id = auth.uid())
);

drop policy if exists "bridge connections workspace write" on public.bridge_connections;
create policy "bridge connections workspace write"
on public.bridge_connections for all to authenticated
using (
  user_id = auth.uid()
  and workspace_id in (select workspace_id from public.profiles where id = auth.uid())
)
with check (
  user_id = auth.uid()
  and workspace_id in (select workspace_id from public.profiles where id = auth.uid())
);

do $$
begin
  alter publication supabase_realtime add table public.bridge_connections;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
