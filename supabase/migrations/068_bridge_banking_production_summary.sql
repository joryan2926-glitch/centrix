alter table public.bridge_connections add column if not exists accounts_count integer not null default 0;
alter table public.bridge_connections add column if not exists transactions_count integer not null default 0;
alter table public.bridge_connections add column if not exists total_balance numeric not null default 0;
alter table public.bridge_connections add column if not exists last_error text;
alter table public.bridge_connections add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists bridge_connections_workspace_status_idx
on public.bridge_connections(workspace_id, status, last_synced_at desc);
