create table if not exists public.billing_documents (
  id text primary key,
  number text not null,
  type text not null check (type in ('quote', 'invoice')),
  status text not null check (status in ('draft', 'pending', 'paid')),
  "clientName" text not null,
  "clientEmail" text not null,
  "clientAddress" text not null,
  "issueDate" date not null,
  "dueDate" date not null,
  notes text not null default '',
  lines jsonb not null default '[]'::jsonb,
  history jsonb not null default '[]'::jsonb,
  "createdAt" timestamptz not null,
  "updatedAt" timestamptz not null
);

alter table public.billing_documents enable row level security;

create policy "Allow authenticated billing read"
  on public.billing_documents
  for select
  to authenticated
  using (true);

create policy "Allow authenticated billing write"
  on public.billing_documents
  for all
  to authenticated
  using (true)
  with check (true);
