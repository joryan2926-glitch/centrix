alter table public.business_reports add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.predictive_metrics add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.ai_insights add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.business_scores add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.company_goals add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.analytics_alerts add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.performance_metrics add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.predictive_models add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.analytics_exports add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;

alter table public.ai_conversations add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.ai_messages add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.ai_generations add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.ai_templates add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.workflow_steps add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.automation_logs add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.ai_notifications add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;

alter table public.workflow_blocks add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.workflow_connections add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.workflow_runs add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.workflow_templates add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.workflow_alerts add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;

do $$
declare
  first_workspace uuid;
begin
  select id into first_workspace from public.workspaces order by created_at asc limit 1;
  if first_workspace is not null then
    update public.business_reports set workspace_id = first_workspace where workspace_id is null;
    update public.predictive_metrics set workspace_id = first_workspace where workspace_id is null;
    update public.ai_insights set workspace_id = first_workspace where workspace_id is null;
    update public.business_scores set workspace_id = first_workspace where workspace_id is null;
    update public.company_goals set workspace_id = first_workspace where workspace_id is null;
    update public.analytics_alerts set workspace_id = first_workspace where workspace_id is null;
    update public.performance_metrics set workspace_id = first_workspace where workspace_id is null;
    update public.predictive_models set workspace_id = first_workspace where workspace_id is null;
    update public.analytics_exports set workspace_id = first_workspace where workspace_id is null;

    update public.ai_conversations set workspace_id = first_workspace where workspace_id is null;
    update public.ai_messages set workspace_id = first_workspace where workspace_id is null;
    update public.ai_generations set workspace_id = first_workspace where workspace_id is null;
    update public.ai_templates set workspace_id = first_workspace where workspace_id is null;
    update public.workflow_steps set workspace_id = first_workspace where workspace_id is null;
    update public.automation_logs set workspace_id = first_workspace where workspace_id is null;
    update public.ai_notifications set workspace_id = first_workspace where workspace_id is null;

    update public.workflow_blocks set workspace_id = first_workspace where workspace_id is null;
    update public.workflow_connections set workspace_id = first_workspace where workspace_id is null;
    update public.workflow_runs set workspace_id = first_workspace where workspace_id is null;
    update public.workflow_templates set workspace_id = first_workspace where workspace_id is null;
    update public.workflow_alerts set workspace_id = first_workspace where workspace_id is null;
  end if;
end $$;

create index if not exists business_reports_workspace_generated_idx on public.business_reports(workspace_id, "generatedAt" desc);
create index if not exists predictive_metrics_workspace_module_idx on public.predictive_metrics(workspace_id, module);
create index if not exists ai_insights_workspace_created_idx on public.ai_insights(workspace_id, "createdAt" desc);
create index if not exists business_scores_workspace_rank_idx on public.business_scores(workspace_id, rank);
create index if not exists company_goals_workspace_due_idx on public.company_goals(workspace_id, "dueAt");
create index if not exists analytics_alerts_workspace_created_idx on public.analytics_alerts(workspace_id, "createdAt" desc);
create index if not exists performance_metrics_workspace_month_idx on public.performance_metrics(workspace_id, month);
create index if not exists predictive_models_workspace_status_idx on public.predictive_models(workspace_id, status);
create index if not exists analytics_exports_workspace_created_idx on public.analytics_exports(workspace_id, "createdAt" desc);

create index if not exists ai_conversations_workspace_updated_idx on public.ai_conversations(workspace_id, "updatedAt" desc);
create index if not exists ai_messages_workspace_conversation_idx on public.ai_messages(workspace_id, "conversationId", "createdAt");
create index if not exists ai_generations_workspace_created_idx on public.ai_generations(workspace_id, "createdAt" desc);
create index if not exists ai_templates_workspace_category_idx on public.ai_templates(workspace_id, category);
create index if not exists workflow_steps_workspace_order_idx on public.workflow_steps(workspace_id, "workflowId", "order");
create index if not exists automation_logs_workspace_created_idx on public.automation_logs(workspace_id, "createdAt" desc);
create index if not exists ai_notifications_workspace_created_idx on public.ai_notifications(workspace_id, "createdAt" desc);

create index if not exists workflow_blocks_workspace_workflow_idx on public.workflow_blocks(workspace_id, "workflowId");
create index if not exists workflow_connections_workspace_workflow_idx on public.workflow_connections(workspace_id, "workflowId");
create index if not exists workflow_runs_workspace_created_idx on public.workflow_runs(workspace_id, "createdAt" desc);
create index if not exists workflow_templates_workspace_category_idx on public.workflow_templates(workspace_id, category);
create index if not exists workflow_alerts_workspace_created_idx on public.workflow_alerts(workspace_id, "createdAt" desc);

drop policy if exists "bi reports read authenticated" on public.business_reports;
drop policy if exists "bi reports write authenticated" on public.business_reports;
drop policy if exists "predictive metrics read authenticated" on public.predictive_metrics;
drop policy if exists "predictive metrics write authenticated" on public.predictive_metrics;
drop policy if exists "ai insights read authenticated" on public.ai_insights;
drop policy if exists "ai insights write authenticated" on public.ai_insights;
drop policy if exists "business scores read authenticated" on public.business_scores;
drop policy if exists "business scores write authenticated" on public.business_scores;
drop policy if exists "company goals read authenticated" on public.company_goals;
drop policy if exists "company goals write authenticated" on public.company_goals;
drop policy if exists "analytics alerts read authenticated" on public.analytics_alerts;
drop policy if exists "analytics alerts write authenticated" on public.analytics_alerts;
drop policy if exists "performance metrics read authenticated" on public.performance_metrics;
drop policy if exists "performance metrics write authenticated" on public.performance_metrics;
drop policy if exists "predictive models read authenticated" on public.predictive_models;
drop policy if exists "predictive models write authenticated" on public.predictive_models;
drop policy if exists "analytics exports read authenticated" on public.analytics_exports;
drop policy if exists "analytics exports write authenticated" on public.analytics_exports;

create policy "business reports module access" on public.business_reports for all to authenticated
using (public.can_use_module(workspace_id, 'analytics', 'read'))
with check (public.can_use_module(workspace_id, 'analytics', 'update'));
create policy "predictive metrics module access" on public.predictive_metrics for all to authenticated
using (public.can_use_module(workspace_id, 'analytics', 'read'))
with check (public.can_use_module(workspace_id, 'analytics', 'update'));
create policy "ai insights analytics module access" on public.ai_insights for all to authenticated
using (public.can_use_module(workspace_id, 'analytics', 'read') or public.can_use_module(workspace_id, 'ai', 'read'))
with check (public.can_use_module(workspace_id, 'analytics', 'update') or public.can_use_module(workspace_id, 'ai', 'update'));
create policy "business scores module access" on public.business_scores for all to authenticated
using (public.can_use_module(workspace_id, 'analytics', 'read'))
with check (public.can_use_module(workspace_id, 'analytics', 'update'));
create policy "company goals module access" on public.company_goals for all to authenticated
using (public.can_use_module(workspace_id, 'analytics', 'read'))
with check (public.can_use_module(workspace_id, 'analytics', 'update'));
create policy "analytics alerts module access" on public.analytics_alerts for all to authenticated
using (public.can_use_module(workspace_id, 'analytics', 'read'))
with check (public.can_use_module(workspace_id, 'analytics', 'update'));
create policy "performance metrics module access" on public.performance_metrics for all to authenticated
using (public.can_use_module(workspace_id, 'analytics', 'read'))
with check (public.can_use_module(workspace_id, 'analytics', 'update'));
create policy "predictive models module access" on public.predictive_models for all to authenticated
using (public.can_use_module(workspace_id, 'analytics', 'read'))
with check (public.can_use_module(workspace_id, 'analytics', 'update'));
create policy "analytics exports module access" on public.analytics_exports for all to authenticated
using (public.can_use_module(workspace_id, 'analytics', 'read'))
with check (public.can_use_module(workspace_id, 'analytics', 'update'));

drop policy if exists "ai conversations read" on public.ai_conversations;
drop policy if exists "ai conversations write" on public.ai_conversations;
drop policy if exists "ai messages read" on public.ai_messages;
drop policy if exists "ai messages write" on public.ai_messages;
drop policy if exists "ai generations read" on public.ai_generations;
drop policy if exists "ai generations write" on public.ai_generations;
drop policy if exists "ai templates read" on public.ai_templates;
drop policy if exists "ai templates write" on public.ai_templates;
drop policy if exists "workflow steps read" on public.workflow_steps;
drop policy if exists "workflow steps write" on public.workflow_steps;
drop policy if exists "automation logs read" on public.automation_logs;
drop policy if exists "automation logs write" on public.automation_logs;
drop policy if exists "ai notifications read" on public.ai_notifications;
drop policy if exists "ai notifications write" on public.ai_notifications;

create policy "ai conversations module access" on public.ai_conversations for all to authenticated
using (public.can_use_module(workspace_id, 'ai', 'read'))
with check (public.can_use_module(workspace_id, 'ai', 'update'));
create policy "ai messages module access" on public.ai_messages for all to authenticated
using (public.can_use_module(workspace_id, 'ai', 'read'))
with check (public.can_use_module(workspace_id, 'ai', 'update'));
create policy "ai generations module access" on public.ai_generations for all to authenticated
using (public.can_use_module(workspace_id, 'ai', 'read'))
with check (public.can_use_module(workspace_id, 'ai', 'update'));
create policy "ai templates module access" on public.ai_templates for all to authenticated
using (public.can_use_module(workspace_id, 'ai', 'read'))
with check (public.can_use_module(workspace_id, 'ai', 'update'));
create policy "ai notifications module access" on public.ai_notifications for all to authenticated
using (public.can_use_module(workspace_id, 'ai', 'read'))
with check (public.can_use_module(workspace_id, 'ai', 'update'));

drop policy if exists "workflow steps module access" on public.workflow_steps;
drop policy if exists "workflow blocks module access" on public.workflow_blocks;
drop policy if exists "workflow connections module access" on public.workflow_connections;
drop policy if exists "workflow runs module access" on public.workflow_runs;
drop policy if exists "workflow alerts module access" on public.workflow_alerts;
drop policy if exists "automation logs module access" on public.automation_logs;
drop policy if exists "workflow templates read authenticated" on public.workflow_templates;
drop policy if exists "workflow templates write authenticated" on public.workflow_templates;

create policy "workflow steps module access" on public.workflow_steps for all to authenticated
using (public.can_use_module(workspace_id, 'workflows', 'read') or public.can_use_module(workspace_id, 'ai', 'read'))
with check (public.can_use_module(workspace_id, 'workflows', 'update') or public.can_use_module(workspace_id, 'ai', 'update'));
create policy "workflow blocks module access" on public.workflow_blocks for all to authenticated
using (public.can_use_module(workspace_id, 'workflows', 'read'))
with check (public.can_use_module(workspace_id, 'workflows', 'update'));
create policy "workflow connections module access" on public.workflow_connections for all to authenticated
using (public.can_use_module(workspace_id, 'workflows', 'read'))
with check (public.can_use_module(workspace_id, 'workflows', 'update'));
create policy "workflow runs module access" on public.workflow_runs for all to authenticated
using (public.can_use_module(workspace_id, 'workflows', 'read'))
with check (public.can_use_module(workspace_id, 'workflows', 'update'));
create policy "workflow alerts module access" on public.workflow_alerts for all to authenticated
using (public.can_use_module(workspace_id, 'workflows', 'read'))
with check (public.can_use_module(workspace_id, 'workflows', 'update'));
create policy "automation logs module access" on public.automation_logs for all to authenticated
using (public.can_use_module(workspace_id, 'workflows', 'read') or public.can_use_module(workspace_id, 'ai', 'read'))
with check (public.can_use_module(workspace_id, 'workflows', 'update') or public.can_use_module(workspace_id, 'ai', 'update'));
create policy "workflow templates module access" on public.workflow_templates for all to authenticated
using (public.can_use_module(workspace_id, 'workflows', 'read'))
with check (public.can_use_module(workspace_id, 'workflows', 'update'));
