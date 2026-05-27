create table if not exists public.crm_leads (
  id text primary key,
  name text not null,
  company text not null,
  email text not null,
  phone text not null,
  status text not null check (status in ('new', 'qualified', 'proposal', 'negotiation', 'won', 'lost')),
  priority text not null check (priority in ('low', 'medium', 'high')),
  "potentialAmount" numeric not null default 0,
  probability numeric not null default 0,
  owner text not null,
  source text not null,
  tags text[] not null default '{}'::text[],
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.crm_clients (
  id text primary key,
  "leadId" text references public.crm_leads(id) on delete set null,
  name text not null,
  company text not null,
  email text not null,
  phone text not null,
  tags text[] not null default '{}'::text[],
  "lifetimeValue" numeric not null default 0,
  status text not null check (status in ('active', 'onboarding', 'at_risk')),
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.crm_notes (
  id text primary key,
  "leadId" text references public.crm_leads(id) on delete cascade,
  "clientId" text references public.crm_clients(id) on delete cascade,
  body text not null,
  "createdAt" timestamptz not null default now(),
  constraint crm_notes_has_parent check ("leadId" is not null or "clientId" is not null)
);

create table if not exists public.crm_tasks (
  id text primary key,
  "leadId" text references public.crm_leads(id) on delete cascade,
  "clientId" text references public.crm_clients(id) on delete cascade,
  title text not null,
  "dueDate" date not null,
  done boolean not null default false,
  "createdAt" timestamptz not null default now(),
  constraint crm_tasks_has_parent check ("leadId" is not null or "clientId" is not null)
);

create table if not exists public.crm_activities (
  id text primary key,
  "leadId" text references public.crm_leads(id) on delete cascade,
  "clientId" text references public.crm_clients(id) on delete cascade,
  type text not null check (type in ('call', 'email', 'meeting', 'note', 'status', 'task', 'client')),
  title text not null,
  detail text not null,
  "createdAt" timestamptz not null default now()
);

alter table public.crm_leads enable row level security;
alter table public.crm_clients enable row level security;
alter table public.crm_notes enable row level security;
alter table public.crm_tasks enable row level security;
alter table public.crm_activities enable row level security;

create policy "CRM leads read" on public.crm_leads for select to anon, authenticated using (true);
create policy "CRM leads write" on public.crm_leads for all to anon, authenticated using (true) with check (true);

create policy "CRM clients read" on public.crm_clients for select to anon, authenticated using (true);
create policy "CRM clients write" on public.crm_clients for all to anon, authenticated using (true) with check (true);

create policy "CRM notes read" on public.crm_notes for select to anon, authenticated using (true);
create policy "CRM notes write" on public.crm_notes for all to anon, authenticated using (true) with check (true);

create policy "CRM tasks read" on public.crm_tasks for select to anon, authenticated using (true);
create policy "CRM tasks write" on public.crm_tasks for all to anon, authenticated using (true) with check (true);

create policy "CRM activities read" on public.crm_activities for select to anon, authenticated using (true);
create policy "CRM activities write" on public.crm_activities for all to anon, authenticated using (true) with check (true);

alter publication supabase_realtime add table public.crm_leads;
alter publication supabase_realtime add table public.crm_clients;
alter publication supabase_realtime add table public.crm_notes;
alter publication supabase_realtime add table public.crm_tasks;
alter publication supabase_realtime add table public.crm_activities;
