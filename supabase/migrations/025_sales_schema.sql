create table if not exists public.sales_pipeline (
  id text primary key,
  label text not null,
  "order" integer not null,
  probability numeric not null default 0
);

create table if not exists public.sales_teams (
  id text primary key,
  name text not null,
  role text not null,
  active boolean not null default true,
  "closedRevenue" numeric not null default 0,
  quota numeric not null default 0,
  activities integer not null default 0
);

create table if not exists public.sales_leads (
  id text primary key,
  name text not null,
  company text not null,
  email text not null,
  phone text not null,
  sector text not null,
  source text not null,
  "potentialValue" numeric not null default 0,
  score numeric not null default 0,
  priority text not null check (priority in ('low', 'medium', 'high', 'urgent')),
  tags text[] not null default '{}',
  "ownerId" text references public.sales_teams(id) on delete set null,
  stage text not null references public.sales_pipeline(id) on delete restrict,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.sales_opportunities (
  id text primary key,
  "leadId" text not null references public.sales_leads(id) on delete cascade,
  title text not null,
  amount numeric not null default 0,
  probability numeric not null default 0,
  deadline timestamptz not null,
  status text not null references public.sales_pipeline(id) on delete restrict
);

create table if not exists public.sales_activities (
  id text primary key,
  "leadId" text not null references public.sales_leads(id) on delete cascade,
  type text not null check (type in ('call', 'email', 'meeting', 'task', 'signature')),
  title text not null,
  owner text not null,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.sales_notes (
  id text primary key,
  "leadId" text not null references public.sales_leads(id) on delete cascade,
  author text not null,
  content text not null,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.sales_quotes (
  id text primary key,
  "leadId" text not null references public.sales_leads(id) on delete cascade,
  title text not null,
  amount numeric not null default 0,
  status text not null check (status in ('draft', 'sent', 'opened', 'accepted', 'rejected')),
  "openedCount" integer not null default 0,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.sales_targets (
  id text primary key,
  "sellerId" text not null references public.sales_teams(id) on delete cascade,
  label text not null,
  "targetAmount" numeric not null default 0,
  "currentAmount" numeric not null default 0,
  period text not null
);

create table if not exists public.sales_notifications (
  id text primary key,
  title text not null,
  detail text not null,
  priority text not null check (priority in ('low', 'medium', 'high', 'urgent')),
  read boolean not null default false,
  "createdAt" timestamptz not null default now()
);

alter table public.sales_leads enable row level security;
alter table public.sales_pipeline enable row level security;
alter table public.sales_opportunities enable row level security;
alter table public.sales_activities enable row level security;
alter table public.sales_notes enable row level security;
alter table public.sales_quotes enable row level security;
alter table public.sales_targets enable row level security;
alter table public.sales_notifications enable row level security;
alter table public.sales_teams enable row level security;

create policy "sales leads read authenticated" on public.sales_leads for select to authenticated using (true);
create policy "sales leads write authenticated" on public.sales_leads for all to authenticated using (true) with check (true);
create policy "sales pipeline read authenticated" on public.sales_pipeline for select to authenticated using (true);
create policy "sales pipeline write authenticated" on public.sales_pipeline for all to authenticated using (true) with check (true);
create policy "sales opportunities read authenticated" on public.sales_opportunities for select to authenticated using (true);
create policy "sales opportunities write authenticated" on public.sales_opportunities for all to authenticated using (true) with check (true);
create policy "sales activities read authenticated" on public.sales_activities for select to authenticated using (true);
create policy "sales activities write authenticated" on public.sales_activities for all to authenticated using (true) with check (true);
create policy "sales notes read authenticated" on public.sales_notes for select to authenticated using (true);
create policy "sales notes write authenticated" on public.sales_notes for all to authenticated using (true) with check (true);
create policy "sales quotes read authenticated" on public.sales_quotes for select to authenticated using (true);
create policy "sales quotes write authenticated" on public.sales_quotes for all to authenticated using (true) with check (true);
create policy "sales targets read authenticated" on public.sales_targets for select to authenticated using (true);
create policy "sales targets write authenticated" on public.sales_targets for all to authenticated using (true) with check (true);
create policy "sales notifications read authenticated" on public.sales_notifications for select to authenticated using (true);
create policy "sales notifications write authenticated" on public.sales_notifications for all to authenticated using (true) with check (true);
create policy "sales teams read authenticated" on public.sales_teams for select to authenticated using (true);
create policy "sales teams write authenticated" on public.sales_teams for all to authenticated using (true) with check (true);

do $$
begin
  alter publication supabase_realtime add table public.sales_leads;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.sales_pipeline;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.sales_opportunities;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.sales_activities;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.sales_notes;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.sales_quotes;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.sales_targets;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.sales_notifications;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.sales_teams;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
