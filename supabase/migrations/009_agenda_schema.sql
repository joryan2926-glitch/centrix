create table if not exists public.calendars (
  id text primary key,
  name text not null,
  color text not null,
  owner text not null,
  "sharedWith" text[] not null default '{}'::text[],
  permission text not null check (permission in ('private', 'team', 'company'))
);

create table if not exists public.calendar_events (
  id text primary key,
  "calendarId" text not null references public.calendars(id) on delete cascade,
  title text not null,
  description text not null default '',
  type text not null check (type in ('client_meeting', 'team_meeting', 'call', 'video', 'internal')),
  status text not null check (status in ('confirmed', 'pending', 'cancelled', 'completed')),
  start timestamptz not null,
  "end" timestamptz not null,
  "durationMinutes" integer not null default 60,
  participants text[] not null default '{}'::text[],
  location text not null default '',
  "videoUrl" text not null default '',
  color text not null default '#5ee7ff',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.event_participants (
  id text primary key,
  "eventId" text not null references public.calendar_events(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null check (role in ('host', 'guest')),
  response text not null check (response in ('accepted', 'pending', 'declined'))
);

create table if not exists public.reservations (
  id text primary key,
  "eventId" text references public.calendar_events(id) on delete set null,
  type text not null check (type in ('room', 'service', 'resource')),
  "resourceName" text not null,
  capacity integer not null default 1,
  start timestamptz not null,
  "end" timestamptz not null,
  status text not null check (status in ('confirmed', 'pending', 'cancelled')),
  "approvalMode" text not null check ("approvalMode" in ('auto', 'manual')),
  "createdAt" timestamptz not null default now()
);

create table if not exists public.reminders (
  id text primary key,
  "eventId" text not null references public.calendar_events(id) on delete cascade,
  "minutesBefore" integer not null default 15,
  channel text not null check (channel in ('dashboard', 'email_future')),
  sent boolean not null default false
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  "eventId" text references public.calendar_events(id) on delete cascade,
  title text not null,
  priority text not null check (priority in ('low', 'medium', 'high', 'urgent')),
  done boolean not null default false,
  "dueDate" date not null,
  checklist jsonb not null default '[]'::jsonb,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.event_comments (
  id text primary key,
  "eventId" text not null references public.calendar_events(id) on delete cascade,
  author text not null,
  body text not null,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.availability_slots (
  id text primary key,
  "userEmail" text not null,
  "dayOfWeek" integer not null check ("dayOfWeek" between 0 and 6),
  "startTime" time not null,
  "endTime" time not null
);

alter table public.calendars enable row level security;
alter table public.calendar_events enable row level security;
alter table public.event_participants enable row level security;
alter table public.reservations enable row level security;
alter table public.reminders enable row level security;
alter table public.tasks enable row level security;
alter table public.event_comments enable row level security;
alter table public.availability_slots enable row level security;

create policy "agenda calendars read" on public.calendars for select to anon, authenticated using (true);
create policy "agenda calendars write" on public.calendars for all to anon, authenticated using (true) with check (true);
create policy "agenda events read" on public.calendar_events for select to anon, authenticated using (true);
create policy "agenda events write" on public.calendar_events for all to anon, authenticated using (true) with check (true);
create policy "agenda participants read" on public.event_participants for select to anon, authenticated using (true);
create policy "agenda participants write" on public.event_participants for all to anon, authenticated using (true) with check (true);
create policy "agenda reservations read" on public.reservations for select to anon, authenticated using (true);
create policy "agenda reservations write" on public.reservations for all to anon, authenticated using (true) with check (true);
create policy "agenda reminders read" on public.reminders for select to anon, authenticated using (true);
create policy "agenda reminders write" on public.reminders for all to anon, authenticated using (true) with check (true);
create policy "agenda tasks read" on public.tasks for select to anon, authenticated using (true);
create policy "agenda tasks write" on public.tasks for all to anon, authenticated using (true) with check (true);
create policy "agenda comments read" on public.event_comments for select to anon, authenticated using (true);
create policy "agenda comments write" on public.event_comments for all to anon, authenticated using (true) with check (true);
create policy "agenda slots read" on public.availability_slots for select to anon, authenticated using (true);
create policy "agenda slots write" on public.availability_slots for all to anon, authenticated using (true) with check (true);

do $$
begin
  alter publication supabase_realtime add table public.calendar_events;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.event_participants;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.reservations;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.reminders;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.tasks;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.event_comments;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.calendars;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.availability_slots;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
