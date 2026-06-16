alter table public.workflows add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.workflows add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.workflows add column if not exists description text;
alter table public.workflows add column if not exists status text not null default 'draft';
alter table public.workflows add column if not exists trigger_type text not null default 'manual';
alter table public.workflows add column if not exists steps jsonb not null default '[]'::jsonb;
alter table public.workflows add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.workflows add column if not exists created_at timestamptz not null default now();
alter table public.workflows add column if not exists updated_at timestamptz not null default now();

do $$
declare
  first_workspace uuid;
begin
  select id into first_workspace from public.workspaces order by created_at asc limit 1;
  if first_workspace is not null then
    update public.workflows set workspace_id = first_workspace where workspace_id is null;
  end if;
end $$;

create index if not exists workflows_workspace_updated_idx on public.workflows(workspace_id, updated_at desc);
create index if not exists workflows_module_idx on public.workflows((metadata->>'module'));

alter table public.productivity_tasks add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;

do $$
declare
  first_workspace uuid;
begin
  select id into first_workspace from public.workspaces order by created_at asc limit 1;
  if first_workspace is not null then
    update public.productivity_tasks set workspace_id = first_workspace where workspace_id is null;
  end if;
end $$;

create index if not exists productivity_tasks_workspace_created_idx on public.productivity_tasks(workspace_id, "createdAt" desc);
create index if not exists workflow_steps_workflow_idx on public.workflow_steps("workflowId");
create index if not exists automation_logs_workflow_created_idx on public.automation_logs("workflowId", "createdAt" desc);
create index if not exists workflow_blocks_workflow_idx on public.workflow_blocks("workflowId");
create index if not exists workflow_runs_workflow_created_idx on public.workflow_runs("workflowId", "createdAt" desc);
create index if not exists workflow_alerts_workflow_created_idx on public.workflow_alerts("workflowId", "createdAt" desc);

drop policy if exists "workflows read" on public.workflows;
drop policy if exists "workflows write" on public.workflows;
drop policy if exists "workflows read authenticated" on public.workflows;
drop policy if exists "workflows write authenticated" on public.workflows;
drop policy if exists "workflows module read" on public.workflows;
drop policy if exists "workflows module insert" on public.workflows;
drop policy if exists "workflows module update" on public.workflows;
drop policy if exists "workflows module delete" on public.workflows;

create policy "workflows module read" on public.workflows for select to authenticated
using (public.can_use_module(workspace_id, 'workflows', 'read'));
create policy "workflows module insert" on public.workflows for insert to authenticated
with check (public.can_use_module(workspace_id, 'workflows', 'create'));
create policy "workflows module update" on public.workflows for update to authenticated
using (public.can_use_module(workspace_id, 'workflows', 'update'))
with check (public.can_use_module(workspace_id, 'workflows', 'update'));
create policy "workflows module delete" on public.workflows for delete to authenticated
using (public.can_use_module(workspace_id, 'workflows', 'delete'));

drop policy if exists "workflow steps read" on public.workflow_steps;
drop policy if exists "workflow steps write" on public.workflow_steps;
drop policy if exists "workflow blocks read authenticated" on public.workflow_blocks;
drop policy if exists "workflow blocks write authenticated" on public.workflow_blocks;
drop policy if exists "workflow connections read authenticated" on public.workflow_connections;
drop policy if exists "workflow connections write authenticated" on public.workflow_connections;
drop policy if exists "workflow runs read authenticated" on public.workflow_runs;
drop policy if exists "workflow runs write authenticated" on public.workflow_runs;
drop policy if exists "workflow alerts read authenticated" on public.workflow_alerts;
drop policy if exists "workflow alerts write authenticated" on public.workflow_alerts;
drop policy if exists "automation logs read" on public.automation_logs;
drop policy if exists "automation logs write" on public.automation_logs;
drop policy if exists "productivity tasks read authenticated" on public.productivity_tasks;
drop policy if exists "productivity tasks write authenticated" on public.productivity_tasks;

create policy "workflow steps module access" on public.workflow_steps for all to authenticated
using (exists (select 1 from public.workflows w where w.id = "workflowId" and public.can_use_module(w.workspace_id, 'workflows', 'read')))
with check (exists (select 1 from public.workflows w where w.id = "workflowId" and public.can_use_module(w.workspace_id, 'workflows', 'update')));

create policy "workflow blocks module access" on public.workflow_blocks for all to authenticated
using (exists (select 1 from public.workflows w where w.id = "workflowId" and public.can_use_module(w.workspace_id, 'workflows', 'read')))
with check (exists (select 1 from public.workflows w where w.id = "workflowId" and public.can_use_module(w.workspace_id, 'workflows', 'update')));

create policy "workflow connections module access" on public.workflow_connections for all to authenticated
using (exists (select 1 from public.workflows w where w.id = "workflowId" and public.can_use_module(w.workspace_id, 'workflows', 'read')))
with check (exists (select 1 from public.workflows w where w.id = "workflowId" and public.can_use_module(w.workspace_id, 'workflows', 'update')));

create policy "workflow runs module access" on public.workflow_runs for all to authenticated
using (exists (select 1 from public.workflows w where w.id = "workflowId" and public.can_use_module(w.workspace_id, 'workflows', 'read')))
with check (exists (select 1 from public.workflows w where w.id = "workflowId" and public.can_use_module(w.workspace_id, 'workflows', 'update')));

create policy "workflow alerts module access" on public.workflow_alerts for all to authenticated
using (exists (select 1 from public.workflows w where w.id = "workflowId" and public.can_use_module(w.workspace_id, 'workflows', 'read')))
with check (exists (select 1 from public.workflows w where w.id = "workflowId" and public.can_use_module(w.workspace_id, 'workflows', 'update')));

create policy "automation logs module access" on public.automation_logs for all to authenticated
using (exists (select 1 from public.workflows w where w.id = "workflowId" and public.can_use_module(w.workspace_id, 'workflows', 'read')))
with check (exists (select 1 from public.workflows w where w.id = "workflowId" and public.can_use_module(w.workspace_id, 'workflows', 'update')));

create policy "productivity tasks module access" on public.productivity_tasks for all to authenticated
using (public.can_use_module(workspace_id, 'workflows', 'read') or public.can_use_module(workspace_id, 'workflows', 'update') or public.can_use_module(workspace_id, 'workflows', 'delete'))
with check (public.can_use_module(workspace_id, 'workflows', 'create') or public.can_use_module(workspace_id, 'workflows', 'update'));
