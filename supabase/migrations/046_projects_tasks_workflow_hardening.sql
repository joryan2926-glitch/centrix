alter table public.projects add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists projects_workspace_due_idx on public.projects(workspace_id, due_at);
create index if not exists projects_workspace_metadata_idx on public.projects using gin(metadata);
create index if not exists tasks_workspace_project_status_idx on public.tasks(workspace_id, project_id, status);
create index if not exists tasks_workspace_due_idx on public.tasks(workspace_id, due_at);
