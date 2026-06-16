alter table public.tasks add column if not exists completed_at timestamptz;

create index if not exists tasks_workspace_completed_idx on public.tasks(workspace_id, completed_at desc);
