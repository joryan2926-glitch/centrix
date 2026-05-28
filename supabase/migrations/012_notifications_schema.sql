create table if not exists public.realtime_notifications (
  id text primary key,
  title text not null,
  detail text not null,
  module text not null check (module in ('crm','billing','projects','support','security','marketing','documents','system')),
  severity text not null check (severity in ('info','success','warning','critical')),
  read boolean not null default false,
  action_url text,
  created_at timestamptz not null default now(),
  remind_at timestamptz
);

create table if not exists public.notification_preferences (
  id text primary key,
  module text not null unique check (module in ('crm','billing','projects','support','security','marketing','documents','system')),
  email boolean not null default true,
  push boolean not null default true,
  dashboard boolean not null default true
);

create table if not exists public.notification_rules (
  id text primary key,
  name text not null,
  trigger text not null,
  channel text not null check (channel in ('dashboard','email','push','all')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.realtime_notifications enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.notification_rules enable row level security;

create policy "Authenticated users can manage realtime notifications"
  on public.realtime_notifications for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can manage notification preferences"
  on public.notification_preferences for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can manage notification rules"
  on public.notification_rules for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

do $$
begin
  alter publication supabase_realtime add table public.realtime_notifications;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.notification_preferences;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.notification_rules;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
