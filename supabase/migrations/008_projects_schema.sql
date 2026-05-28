create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category text not null,
  client text not null,
  status text not null check (status in ('planned', 'in_progress', 'waiting', 'completed', 'cancelled')),
  priority text not null check (priority in ('low', 'medium', 'high', 'urgent')),
  progress numeric not null default 0,
  budget numeric not null default 0,
  owner text not null,
  deadline timestamptz not null,
  archived boolean not null default false
);

create table if not exists public.project_members (
  id text primary key,
  "projectId" uuid not null references public.projects(id) on delete cascade,
  name text not null,
  role text not null,
  online boolean not null default false
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  "projectId" uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text not null,
  status text not null check (status in ('todo', 'in_progress', 'review', 'done')),
  priority text not null check (priority in ('low', 'medium', 'high', 'urgent')),
  assignee text not null,
  "dueAt" timestamptz not null,
  "estimateHours" numeric not null default 0,
  "actualHours" numeric not null default 0,
  recurring boolean not null default false,
  "dependencyId" uuid references public.tasks(id) on delete set null
);

create table if not exists public.task_comments (
  id text primary key,
  "taskId" uuid not null references public.tasks(id) on delete cascade,
  author text not null,
  content text not null,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.task_checklists (
  id text primary key,
  "taskId" uuid not null references public.tasks(id) on delete cascade,
  label text not null,
  done boolean not null default false
);

create table if not exists public.project_files (
  id text primary key,
  "projectId" uuid not null references public.projects(id) on delete cascade,
  name text not null,
  type text not null,
  "sizeMb" numeric not null default 0,
  url text not null,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.project_activity (
  id text primary key,
  "projectId" uuid not null references public.projects(id) on delete cascade,
  actor text not null,
  action text not null,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.project_notifications (
  id text primary key,
  "projectId" uuid not null references public.projects(id) on delete cascade,
  title text not null,
  detail text not null,
  read boolean not null default false,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.time_tracking (
  id text primary key,
  "taskId" uuid not null references public.tasks(id) on delete cascade,
  "userName" text not null,
  minutes numeric not null default 0,
  "startedAt" timestamptz not null,
  "endedAt" timestamptz not null
);

alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.tasks enable row level security;
alter table public.task_comments enable row level security;
alter table public.task_checklists enable row level security;
alter table public.project_files enable row level security;
alter table public.project_activity enable row level security;
alter table public.project_notifications enable row level security;
alter table public.time_tracking enable row level security;

create policy "projects read authenticated" on public.projects for select to authenticated using (true);
create policy "projects write authenticated" on public.projects for all to authenticated using (true) with check (true);
create policy "project members read authenticated" on public.project_members for select to authenticated using (true);
create policy "project members write authenticated" on public.project_members for all to authenticated using (true) with check (true);
create policy "tasks read authenticated" on public.tasks for select to authenticated using (true);
create policy "tasks write authenticated" on public.tasks for all to authenticated using (true) with check (true);
create policy "task comments read authenticated" on public.task_comments for select to authenticated using (true);
create policy "task comments write authenticated" on public.task_comments for all to authenticated using (true) with check (true);
create policy "task checklists read authenticated" on public.task_checklists for select to authenticated using (true);
create policy "task checklists write authenticated" on public.task_checklists for all to authenticated using (true) with check (true);
create policy "project files read authenticated" on public.project_files for select to authenticated using (true);
create policy "project files write authenticated" on public.project_files for all to authenticated using (true) with check (true);
create policy "project activity read authenticated" on public.project_activity for select to authenticated using (true);
create policy "project activity write authenticated" on public.project_activity for all to authenticated using (true) with check (true);
create policy "project notifications read authenticated" on public.project_notifications for select to authenticated using (true);
create policy "project notifications write authenticated" on public.project_notifications for all to authenticated using (true) with check (true);
create policy "time tracking read authenticated" on public.time_tracking for select to authenticated using (true);
create policy "time tracking write authenticated" on public.time_tracking for all to authenticated using (true) with check (true);

do $$
begin
  alter publication supabase_realtime add table public.projects;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.project_members;
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
  alter publication supabase_realtime add table public.task_comments;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.task_checklists;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.project_files;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.project_activity;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.project_notifications;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.time_tracking;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
