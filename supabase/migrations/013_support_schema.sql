create table if not exists public.support_agents (
  id text primary key,
  name text not null,
  email text not null,
  role text not null check (role in ('agent', 'lead', 'admin')),
  online boolean not null default false,
  "avatarUrl" text,
  "activeTickets" numeric not null default 0,
  "satisfactionScore" numeric not null default 0
);

create table if not exists public.support_categories (
  id text primary key,
  name text not null,
  color text not null default '#5ee7ff',
  "slaHours" numeric not null default 24
);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  "clientName" text not null,
  "clientEmail" text not null,
  priority text not null check (priority in ('low', 'medium', 'high', 'urgent')),
  "categoryId" text not null references public.support_categories(id) on delete restrict,
  status text not null check (status in ('open', 'pending', 'in_progress', 'resolved', 'closed')),
  "assignedAgentId" text references public.support_agents(id) on delete set null,
  attachments text[] not null default '{}'::text[],
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.support_messages (
  id text primary key,
  "ticketId" uuid not null references public.support_tickets(id) on delete cascade,
  "authorName" text not null,
  "authorType" text not null check ("authorType" in ('client', 'agent', 'system')),
  content text not null,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.support_comments (
  id text primary key,
  "ticketId" uuid not null references public.support_tickets(id) on delete cascade,
  "agentId" text not null references public.support_agents(id) on delete cascade,
  content text not null,
  internal boolean not null default true,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.support_articles (
  id text primary key,
  "categoryId" text not null references public.support_categories(id) on delete cascade,
  title text not null,
  excerpt text not null,
  content text not null,
  views numeric not null default 0,
  likes numeric not null default 0,
  published boolean not null default false,
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.support_feedback (
  id text primary key,
  "ticketId" uuid not null references public.support_tickets(id) on delete cascade,
  rating numeric not null check (rating between 1 and 5),
  comment text not null,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.support_notifications (
  id text primary key,
  "ticketId" uuid references public.support_tickets(id) on delete cascade,
  title text not null,
  detail text not null,
  severity text not null check (severity in ('info', 'success', 'warning')),
  "createdAt" timestamptz not null default now()
);

alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;
alter table public.support_comments enable row level security;
alter table public.support_agents enable row level security;
alter table public.support_categories enable row level security;
alter table public.support_articles enable row level security;
alter table public.support_feedback enable row level security;
alter table public.support_notifications enable row level security;

create policy "support tickets read" on public.support_tickets for select to anon, authenticated using (true);
create policy "support tickets write" on public.support_tickets for all to anon, authenticated using (true) with check (true);
create policy "support messages read" on public.support_messages for select to anon, authenticated using (true);
create policy "support messages write" on public.support_messages for all to anon, authenticated using (true) with check (true);
create policy "support comments read" on public.support_comments for select to anon, authenticated using (true);
create policy "support comments write" on public.support_comments for all to anon, authenticated using (true) with check (true);
create policy "support agents read" on public.support_agents for select to anon, authenticated using (true);
create policy "support agents write" on public.support_agents for all to anon, authenticated using (true) with check (true);
create policy "support categories read" on public.support_categories for select to anon, authenticated using (true);
create policy "support categories write" on public.support_categories for all to anon, authenticated using (true) with check (true);
create policy "support articles read" on public.support_articles for select to anon, authenticated using (true);
create policy "support articles write" on public.support_articles for all to anon, authenticated using (true) with check (true);
create policy "support feedback read" on public.support_feedback for select to anon, authenticated using (true);
create policy "support feedback write" on public.support_feedback for all to anon, authenticated using (true) with check (true);
create policy "support notifications read" on public.support_notifications for select to anon, authenticated using (true);
create policy "support notifications write" on public.support_notifications for all to anon, authenticated using (true) with check (true);

do $$
begin
  alter publication supabase_realtime add table public.support_tickets;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.support_messages;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.support_comments;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.support_agents;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.support_categories;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.support_articles;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.support_feedback;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.support_notifications;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
