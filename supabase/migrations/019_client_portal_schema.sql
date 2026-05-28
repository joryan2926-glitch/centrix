create table if not exists public.client_portals (
  id text primary key,
  "clientName" text not null,
  "companyName" text not null,
  email text not null,
  phone text not null,
  "avatarUrl" text,
  plan text not null,
  "lastLoginAt" timestamptz not null default now()
);

create table if not exists public.client_projects (
  id text primary key,
  "portalId" text not null references public.client_portals(id) on delete cascade,
  title text not null,
  description text not null,
  status text not null check (status in ('planned', 'active', 'waiting', 'completed')),
  progress numeric not null default 0,
  deadline timestamptz not null
);

create table if not exists public.client_documents (
  id text primary key,
  "portalId" text not null references public.client_portals(id) on delete cascade,
  name text not null,
  category text not null check (category in ('contract', 'quote', 'invoice', 'project', 'shared')),
  "fileType" text not null,
  "sizeMb" numeric not null default 0,
  "secureUrl" text not null,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.client_messages (
  id text primary key,
  "portalId" text not null references public.client_portals(id) on delete cascade,
  author text not null,
  role text not null check (role in ('client', 'company', 'support')),
  content text not null,
  "attachmentName" text,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.client_notifications (
  id text primary key,
  "portalId" text not null references public.client_portals(id) on delete cascade,
  title text not null,
  detail text not null,
  read boolean not null default false,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.client_appointments (
  id text primary key,
  "portalId" text not null references public.client_portals(id) on delete cascade,
  title text not null,
  type text not null check (type in ('meeting', 'support', 'project', 'billing')),
  status text not null check (status in ('confirmed', 'pending', 'cancelled')),
  "startsAt" timestamptz not null
);

create table if not exists public.client_signatures (
  id text primary key,
  "portalId" text not null references public.client_portals(id) on delete cascade,
  "documentName" text not null,
  status text not null check (status in ('pending', 'signed', 'expired')),
  "requestedAt" timestamptz not null default now(),
  "signedAt" timestamptz
);

create table if not exists public.client_activity_logs (
  id text primary key,
  "portalId" text not null references public.client_portals(id) on delete cascade,
  label text not null,
  module text not null,
  "createdAt" timestamptz not null default now()
);

alter table public.client_portals enable row level security;
alter table public.client_projects enable row level security;
alter table public.client_documents enable row level security;
alter table public.client_messages enable row level security;
alter table public.client_notifications enable row level security;
alter table public.client_appointments enable row level security;
alter table public.client_signatures enable row level security;
alter table public.client_activity_logs enable row level security;

create policy "client portals read authenticated" on public.client_portals for select to authenticated using (true);
create policy "client portals write authenticated" on public.client_portals for all to authenticated using (true) with check (true);
create policy "client projects read authenticated" on public.client_projects for select to authenticated using (true);
create policy "client projects write authenticated" on public.client_projects for all to authenticated using (true) with check (true);
create policy "client documents read authenticated" on public.client_documents for select to authenticated using (true);
create policy "client documents write authenticated" on public.client_documents for all to authenticated using (true) with check (true);
create policy "client messages read authenticated" on public.client_messages for select to authenticated using (true);
create policy "client messages write authenticated" on public.client_messages for all to authenticated using (true) with check (true);
create policy "client notifications read authenticated" on public.client_notifications for select to authenticated using (true);
create policy "client notifications write authenticated" on public.client_notifications for all to authenticated using (true) with check (true);
create policy "client appointments read authenticated" on public.client_appointments for select to authenticated using (true);
create policy "client appointments write authenticated" on public.client_appointments for all to authenticated using (true) with check (true);
create policy "client signatures read authenticated" on public.client_signatures for select to authenticated using (true);
create policy "client signatures write authenticated" on public.client_signatures for all to authenticated using (true) with check (true);
create policy "client activity read authenticated" on public.client_activity_logs for select to authenticated using (true);
create policy "client activity write authenticated" on public.client_activity_logs for all to authenticated using (true) with check (true);

do $$
begin
  alter publication supabase_realtime add table public.client_portals;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.client_projects;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.client_documents;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.client_messages;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.client_notifications;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.client_appointments;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.client_signatures;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.client_activity_logs;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
