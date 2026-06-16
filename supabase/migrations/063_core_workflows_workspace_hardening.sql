alter table public.sales_pipeline add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.sales_teams add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.sales_leads add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.sales_opportunities add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.sales_activities add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.sales_notes add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.sales_quotes add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.sales_targets add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.sales_notifications add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;

alter table public.hr_employees add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.hr_contracts add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.hr_leaves add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.hr_absences add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.hr_salaries add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.hr_documents add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.hr_schedule add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.hr_notifications add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;

alter table public.user_settings add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.company_settings add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.subscriptions add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.user_roles add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.activity_logs add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.security_logs add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.notifications add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.module_settings add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.billing_history add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;

alter table public.sales_pipeline replica identity full;
alter table public.sales_teams replica identity full;
alter table public.sales_leads replica identity full;
alter table public.sales_opportunities replica identity full;
alter table public.sales_activities replica identity full;
alter table public.sales_notes replica identity full;
alter table public.sales_quotes replica identity full;
alter table public.sales_targets replica identity full;
alter table public.sales_notifications replica identity full;

alter table public.hr_employees replica identity full;
alter table public.hr_contracts replica identity full;
alter table public.hr_leaves replica identity full;
alter table public.hr_absences replica identity full;
alter table public.hr_salaries replica identity full;
alter table public.hr_documents replica identity full;
alter table public.hr_schedule replica identity full;
alter table public.hr_notifications replica identity full;

alter table public.user_settings replica identity full;
alter table public.company_settings replica identity full;
alter table public.subscriptions replica identity full;
alter table public.user_roles replica identity full;
alter table public.activity_logs replica identity full;
alter table public.security_logs replica identity full;
alter table public.notifications replica identity full;
alter table public.module_settings replica identity full;
alter table public.billing_history replica identity full;

do $$
declare
  first_workspace uuid;
begin
  select id into first_workspace from public.workspaces order by created_at asc limit 1;
  if first_workspace is not null then
    update public.sales_pipeline set workspace_id = first_workspace where workspace_id is null;
    update public.sales_teams set workspace_id = first_workspace where workspace_id is null;
    update public.sales_leads set workspace_id = first_workspace where workspace_id is null;
    update public.sales_opportunities set workspace_id = first_workspace where workspace_id is null;
    update public.sales_activities set workspace_id = first_workspace where workspace_id is null;
    update public.sales_notes set workspace_id = first_workspace where workspace_id is null;
    update public.sales_quotes set workspace_id = first_workspace where workspace_id is null;
    update public.sales_targets set workspace_id = first_workspace where workspace_id is null;
    update public.sales_notifications set workspace_id = first_workspace where workspace_id is null;

    update public.hr_employees set workspace_id = first_workspace where workspace_id is null;
    update public.hr_contracts set workspace_id = first_workspace where workspace_id is null;
    update public.hr_leaves set workspace_id = first_workspace where workspace_id is null;
    update public.hr_absences set workspace_id = first_workspace where workspace_id is null;
    update public.hr_salaries set workspace_id = first_workspace where workspace_id is null;
    update public.hr_documents set workspace_id = first_workspace where workspace_id is null;
    update public.hr_schedule set workspace_id = first_workspace where workspace_id is null;
    update public.hr_notifications set workspace_id = first_workspace where workspace_id is null;

    update public.user_settings set workspace_id = first_workspace where workspace_id is null;
    update public.company_settings set workspace_id = first_workspace where workspace_id is null;
    update public.subscriptions set workspace_id = first_workspace where workspace_id is null;
    update public.user_roles set workspace_id = first_workspace where workspace_id is null;
    update public.activity_logs set workspace_id = first_workspace where workspace_id is null;
    update public.security_logs set workspace_id = first_workspace where workspace_id is null;
    update public.notifications set workspace_id = first_workspace where workspace_id is null;
    update public.module_settings set workspace_id = first_workspace where workspace_id is null;
    update public.billing_history set workspace_id = first_workspace where workspace_id is null;
  end if;
end $$;

create index if not exists sales_pipeline_workspace_order_idx on public.sales_pipeline(workspace_id, "order");
create index if not exists sales_teams_workspace_active_idx on public.sales_teams(workspace_id, active);
create index if not exists sales_leads_workspace_created_idx on public.sales_leads(workspace_id, "createdAt" desc);
create index if not exists sales_opportunities_workspace_deadline_idx on public.sales_opportunities(workspace_id, deadline);
create index if not exists sales_activities_workspace_created_idx on public.sales_activities(workspace_id, "createdAt" desc);
create index if not exists sales_notes_workspace_created_idx on public.sales_notes(workspace_id, "createdAt" desc);
create index if not exists sales_quotes_workspace_created_idx on public.sales_quotes(workspace_id, "createdAt" desc);
create index if not exists sales_targets_workspace_period_idx on public.sales_targets(workspace_id, period);
create index if not exists sales_notifications_workspace_created_idx on public.sales_notifications(workspace_id, "createdAt" desc);

create index if not exists hr_employees_workspace_updated_idx on public.hr_employees(workspace_id, "updatedAt" desc);
create index if not exists hr_contracts_workspace_employee_idx on public.hr_contracts(workspace_id, "employeeId");
create index if not exists hr_leaves_workspace_created_idx on public.hr_leaves(workspace_id, "createdAt" desc);
create index if not exists hr_absences_workspace_date_idx on public.hr_absences(workspace_id, date desc);
create index if not exists hr_salaries_workspace_employee_idx on public.hr_salaries(workspace_id, "employeeId");
create index if not exists hr_documents_workspace_created_idx on public.hr_documents(workspace_id, "createdAt" desc);
create index if not exists hr_schedule_workspace_date_idx on public.hr_schedule(workspace_id, date);
create index if not exists hr_notifications_workspace_created_idx on public.hr_notifications(workspace_id, "createdAt" desc);

create index if not exists user_settings_workspace_updated_idx on public.user_settings(workspace_id, "updatedAt" desc);
create index if not exists company_settings_workspace_idx on public.company_settings(workspace_id);
create index if not exists subscriptions_workspace_status_idx on public.subscriptions(workspace_id, status);
create index if not exists user_roles_workspace_login_idx on public.user_roles(workspace_id, "lastLoginAt" desc);
create index if not exists activity_logs_workspace_created_idx on public.activity_logs(workspace_id, "createdAt" desc);
create index if not exists security_logs_workspace_created_idx on public.security_logs(workspace_id, "createdAt" desc);
create index if not exists notifications_workspace_created_idx on public.notifications(workspace_id, created_at desc);
create index if not exists module_settings_workspace_module_idx on public.module_settings(workspace_id, module);
create index if not exists billing_history_workspace_created_idx on public.billing_history(workspace_id, "createdAt" desc);

drop policy if exists "sales leads read authenticated" on public.sales_leads;
drop policy if exists "sales leads write authenticated" on public.sales_leads;
drop policy if exists "sales pipeline read authenticated" on public.sales_pipeline;
drop policy if exists "sales pipeline write authenticated" on public.sales_pipeline;
drop policy if exists "sales opportunities read authenticated" on public.sales_opportunities;
drop policy if exists "sales opportunities write authenticated" on public.sales_opportunities;
drop policy if exists "sales activities read authenticated" on public.sales_activities;
drop policy if exists "sales activities write authenticated" on public.sales_activities;
drop policy if exists "sales notes read authenticated" on public.sales_notes;
drop policy if exists "sales notes write authenticated" on public.sales_notes;
drop policy if exists "sales quotes read authenticated" on public.sales_quotes;
drop policy if exists "sales quotes write authenticated" on public.sales_quotes;
drop policy if exists "sales targets read authenticated" on public.sales_targets;
drop policy if exists "sales targets write authenticated" on public.sales_targets;
drop policy if exists "sales notifications read authenticated" on public.sales_notifications;
drop policy if exists "sales notifications write authenticated" on public.sales_notifications;
drop policy if exists "sales teams read authenticated" on public.sales_teams;
drop policy if exists "sales teams write authenticated" on public.sales_teams;

create policy "sales leads module access" on public.sales_leads for all to authenticated using (public.can_use_module(workspace_id, 'crm', 'read')) with check (public.can_use_module(workspace_id, 'crm', 'update'));
create policy "sales pipeline module access" on public.sales_pipeline for all to authenticated using (public.can_use_module(workspace_id, 'crm', 'read')) with check (public.can_use_module(workspace_id, 'crm', 'update'));
create policy "sales opportunities module access" on public.sales_opportunities for all to authenticated using (public.can_use_module(workspace_id, 'crm', 'read')) with check (public.can_use_module(workspace_id, 'crm', 'update'));
create policy "sales activities module access" on public.sales_activities for all to authenticated using (public.can_use_module(workspace_id, 'crm', 'read')) with check (public.can_use_module(workspace_id, 'crm', 'update'));
create policy "sales notes module access" on public.sales_notes for all to authenticated using (public.can_use_module(workspace_id, 'crm', 'read')) with check (public.can_use_module(workspace_id, 'crm', 'update'));
create policy "sales quotes module access" on public.sales_quotes for all to authenticated using (public.can_use_module(workspace_id, 'crm', 'read')) with check (public.can_use_module(workspace_id, 'crm', 'update'));
create policy "sales targets module access" on public.sales_targets for all to authenticated using (public.can_use_module(workspace_id, 'crm', 'read')) with check (public.can_use_module(workspace_id, 'crm', 'update'));
create policy "sales notifications module access" on public.sales_notifications for all to authenticated using (public.can_use_module(workspace_id, 'crm', 'read')) with check (public.can_use_module(workspace_id, 'crm', 'update'));
create policy "sales teams module access" on public.sales_teams for all to authenticated using (public.can_use_module(workspace_id, 'crm', 'read')) with check (public.can_use_module(workspace_id, 'crm', 'update'));

drop policy if exists "HR employees read" on public.hr_employees;
drop policy if exists "HR employees write" on public.hr_employees;
drop policy if exists "HR contracts read" on public.hr_contracts;
drop policy if exists "HR contracts write" on public.hr_contracts;
drop policy if exists "HR leaves read" on public.hr_leaves;
drop policy if exists "HR leaves write" on public.hr_leaves;
drop policy if exists "HR absences read" on public.hr_absences;
drop policy if exists "HR absences write" on public.hr_absences;
drop policy if exists "HR salaries read" on public.hr_salaries;
drop policy if exists "HR salaries write" on public.hr_salaries;
drop policy if exists "HR documents read" on public.hr_documents;
drop policy if exists "HR documents write" on public.hr_documents;
drop policy if exists "HR schedule read" on public.hr_schedule;
drop policy if exists "HR schedule write" on public.hr_schedule;
drop policy if exists "HR notifications read" on public.hr_notifications;
drop policy if exists "HR notifications write" on public.hr_notifications;

create policy "hr employees module access" on public.hr_employees for all to authenticated using (public.can_use_module(workspace_id, 'hr', 'read')) with check (public.can_use_module(workspace_id, 'hr', 'update'));
create policy "hr contracts module access" on public.hr_contracts for all to authenticated using (public.can_use_module(workspace_id, 'hr', 'read')) with check (public.can_use_module(workspace_id, 'hr', 'update'));
create policy "hr leaves module access" on public.hr_leaves for all to authenticated using (public.can_use_module(workspace_id, 'hr', 'read')) with check (public.can_use_module(workspace_id, 'hr', 'update'));
create policy "hr absences module access" on public.hr_absences for all to authenticated using (public.can_use_module(workspace_id, 'hr', 'read')) with check (public.can_use_module(workspace_id, 'hr', 'update'));
create policy "hr salaries module access" on public.hr_salaries for all to authenticated using (public.can_use_module(workspace_id, 'hr', 'read')) with check (public.can_use_module(workspace_id, 'hr', 'update'));
create policy "hr documents module access" on public.hr_documents for all to authenticated using (public.can_use_module(workspace_id, 'hr', 'read')) with check (public.can_use_module(workspace_id, 'hr', 'update'));
create policy "hr schedule module access" on public.hr_schedule for all to authenticated using (public.can_use_module(workspace_id, 'hr', 'read')) with check (public.can_use_module(workspace_id, 'hr', 'update'));
create policy "hr notifications module access" on public.hr_notifications for all to authenticated using (public.can_use_module(workspace_id, 'hr', 'read')) with check (public.can_use_module(workspace_id, 'hr', 'update'));

drop policy if exists "user settings read" on public.user_settings;
drop policy if exists "user settings write" on public.user_settings;
drop policy if exists "admin company settings read" on public.company_settings;
drop policy if exists "admin company settings write" on public.company_settings;
drop policy if exists "subscriptions read" on public.subscriptions;
drop policy if exists "subscriptions write" on public.subscriptions;
drop policy if exists "user roles read" on public.user_roles;
drop policy if exists "user roles write" on public.user_roles;
drop policy if exists "activity logs read" on public.activity_logs;
drop policy if exists "activity logs write" on public.activity_logs;
drop policy if exists "security logs read" on public.security_logs;
drop policy if exists "security logs write" on public.security_logs;
drop policy if exists "notifications read" on public.notifications;
drop policy if exists "notifications write" on public.notifications;
drop policy if exists "module settings read" on public.module_settings;
drop policy if exists "module settings write" on public.module_settings;
drop policy if exists "billing history read" on public.billing_history;
drop policy if exists "billing history write" on public.billing_history;

create policy "user settings module access" on public.user_settings for all to authenticated using (public.can_use_module(workspace_id, 'settings', 'read')) with check (public.can_use_module(workspace_id, 'settings', 'update'));
create policy "company settings module access" on public.company_settings for all to authenticated using (public.can_use_module(workspace_id, 'settings', 'read')) with check (public.can_use_module(workspace_id, 'settings', 'update'));
create policy "subscriptions settings module access" on public.subscriptions for all to authenticated using (public.can_use_module(workspace_id, 'settings', 'read') or public.can_use_module(workspace_id, 'billing', 'read')) with check (public.can_use_module(workspace_id, 'settings', 'update') or public.can_use_module(workspace_id, 'billing', 'update'));
create policy "user roles module access" on public.user_roles for all to authenticated using (public.can_use_module(workspace_id, 'settings', 'read')) with check (public.can_use_module(workspace_id, 'settings', 'update'));
create policy "activity logs module access" on public.activity_logs for all to authenticated using (public.can_use_module(workspace_id, 'settings', 'read')) with check (public.can_use_module(workspace_id, 'settings', 'update'));
create policy "security logs settings module access" on public.security_logs for all to authenticated using (public.can_use_module(workspace_id, 'settings', 'read') or public.can_use_module(workspace_id, 'security', 'read')) with check (public.can_use_module(workspace_id, 'settings', 'update') or public.can_use_module(workspace_id, 'security', 'update'));
create policy "notifications settings module access" on public.notifications for all to authenticated using (public.can_use_module(workspace_id, 'settings', 'read') or public.can_use_module(workspace_id, 'notifications', 'read')) with check (public.can_use_module(workspace_id, 'settings', 'update') or public.can_use_module(workspace_id, 'notifications', 'update'));
create policy "module settings module access" on public.module_settings for all to authenticated using (public.can_use_module(workspace_id, 'settings', 'read')) with check (public.can_use_module(workspace_id, 'settings', 'update'));
create policy "billing history settings module access" on public.billing_history for all to authenticated using (public.can_use_module(workspace_id, 'settings', 'read') or public.can_use_module(workspace_id, 'billing', 'read')) with check (public.can_use_module(workspace_id, 'settings', 'update') or public.can_use_module(workspace_id, 'billing', 'update'));
