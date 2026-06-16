alter table public.prospects add column if not exists tags text[] not null default '{}'::text[];
alter table public.prospects add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists prospects_workspace_stage_idx on public.prospects(workspace_id, stage);
create index if not exists prospects_workspace_tags_idx on public.prospects using gin(tags);
create index if not exists prospects_workspace_metadata_idx on public.prospects using gin(metadata);
