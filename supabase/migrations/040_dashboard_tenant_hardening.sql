drop policy if exists "dashboard metrics workspace read" on public.dashboard_metrics;
drop policy if exists "dashboard metrics workspace write" on public.dashboard_metrics;
drop policy if exists "dashboard analytics workspace read" on public.dashboard_analytics;
drop policy if exists "dashboard analytics workspace write" on public.dashboard_analytics;
drop policy if exists "module events workspace read" on public.module_events;
drop policy if exists "module events workspace write" on public.module_events;
drop policy if exists "module tasks workspace read" on public.module_tasks;
drop policy if exists "module tasks workspace write" on public.module_tasks;
drop policy if exists "module connections workspace read" on public.module_connections;
drop policy if exists "module connections workspace write" on public.module_connections;

create policy "dashboard metrics tenant read" on public.dashboard_metrics for select to authenticated
using (public.is_workspace_member(workspace_id));
create policy "dashboard metrics tenant write" on public.dashboard_metrics for all to authenticated
using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));

create policy "dashboard analytics tenant read" on public.dashboard_analytics for select to authenticated
using (public.is_workspace_member(workspace_id));
create policy "dashboard analytics tenant write" on public.dashboard_analytics for all to authenticated
using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));

create policy "module events tenant read" on public.module_events for select to authenticated
using (public.is_workspace_member(workspace_id));
create policy "module events tenant write" on public.module_events for all to authenticated
using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));

create policy "module tasks tenant read" on public.module_tasks for select to authenticated
using (public.is_workspace_member(workspace_id));
create policy "module tasks tenant write" on public.module_tasks for all to authenticated
using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));

create policy "module connections tenant read" on public.module_connections for select to authenticated
using (public.is_workspace_member(workspace_id));
create policy "module connections tenant write" on public.module_connections for all to authenticated
using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));

create index if not exists dashboard_metrics_workspace_idx on public.dashboard_metrics(workspace_id, sort_order);
create index if not exists dashboard_analytics_workspace_idx on public.dashboard_analytics(workspace_id, period_index);
create index if not exists module_events_workspace_created_idx on public.module_events(workspace_id, created_at desc);
create index if not exists module_tasks_workspace_created_idx on public.module_tasks(workspace_id, created_at desc);
create index if not exists module_connections_workspace_idx on public.module_connections(workspace_id, created_at desc);
