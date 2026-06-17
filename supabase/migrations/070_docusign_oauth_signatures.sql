create table if not exists public.docusign_connections (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  account_id text not null,
  account_name text,
  base_uri text not null,
  access_token text not null,
  refresh_token text not null,
  token_type text not null default 'Bearer',
  expires_at timestamptz not null,
  scopes text[] not null default '{}',
  connected_email text,
  status text not null default 'connected' check (status in ('connected', 'expired', 'revoked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, account_id)
);

create table if not exists public.docusign_signature_requests (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  connection_id uuid references public.docusign_connections(id) on delete set null,
  envelope_id text not null,
  source_type text not null check (source_type in ('document', 'quote', 'contract', 'mandate')),
  source_id text not null,
  signer_email text not null,
  signer_name text not null,
  subject text not null,
  status text not null default 'sent' check (status in ('created', 'sent', 'delivered', 'completed', 'declined', 'voided', 'failed')),
  signed_document_id uuid references public.documents(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  sent_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (workspace_id, envelope_id)
);

create index if not exists docusign_connections_workspace_idx
  on public.docusign_connections (workspace_id, status, updated_at desc);

create index if not exists docusign_signature_requests_workspace_idx
  on public.docusign_signature_requests (workspace_id, status, updated_at desc);

create index if not exists docusign_signature_requests_source_idx
  on public.docusign_signature_requests (workspace_id, source_type, source_id);

alter table public.docusign_connections enable row level security;
alter table public.docusign_signature_requests enable row level security;

drop policy if exists "docusign connections tenant select" on public.docusign_connections;
drop policy if exists "docusign connections tenant insert" on public.docusign_connections;
drop policy if exists "docusign connections tenant update" on public.docusign_connections;

create policy "docusign connections tenant select"
  on public.docusign_connections for select to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "docusign connections tenant insert"
  on public.docusign_connections for insert to authenticated
  with check (public.is_workspace_member(workspace_id));

create policy "docusign connections tenant update"
  on public.docusign_connections for update to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

drop policy if exists "docusign signatures tenant select" on public.docusign_signature_requests;
drop policy if exists "docusign signatures tenant insert" on public.docusign_signature_requests;
drop policy if exists "docusign signatures tenant update" on public.docusign_signature_requests;

create policy "docusign signatures tenant select"
  on public.docusign_signature_requests for select to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "docusign signatures tenant insert"
  on public.docusign_signature_requests for insert to authenticated
  with check (public.is_workspace_member(workspace_id));

create policy "docusign signatures tenant update"
  on public.docusign_signature_requests for update to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

grant select, insert, update on public.docusign_connections to authenticated;
grant select, insert, update on public.docusign_signature_requests to authenticated;

do $$
begin
  alter publication supabase_realtime add table public.docusign_connections;
exception
  when duplicate_object then null;
  when others then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.docusign_signature_requests;
exception
  when duplicate_object then null;
  when others then null;
end $$;
