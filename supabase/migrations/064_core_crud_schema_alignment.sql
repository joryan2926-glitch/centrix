alter table public.clients add column if not exists notes text;

alter table public.projects add column if not exists name text;
alter table public.projects add column if not exists budget numeric not null default 0;
alter table public.projects add column if not exists starts_at date;
alter table public.projects add column if not exists owner_id uuid references auth.users(id) on delete set null;

update public.projects
set name = coalesce(name, title, '')
where name is null;

create index if not exists clients_workspace_status_idx on public.clients(workspace_id, status);
create index if not exists projects_workspace_name_idx on public.projects(workspace_id, name);
