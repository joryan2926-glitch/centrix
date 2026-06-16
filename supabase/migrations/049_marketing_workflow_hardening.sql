do $$
declare
  first_workspace uuid;
begin
  select id into first_workspace from public.workspaces order by created_at asc limit 1;
  if first_workspace is not null then
    update public.marketing_social_accounts set workspace_id = first_workspace where workspace_id is null;
    update public.marketing_posts set workspace_id = first_workspace where workspace_id is null;
    update public.marketing_campaigns set workspace_id = first_workspace where workspace_id is null;
    update public.marketing_media_assets set workspace_id = first_workspace where workspace_id is null;
    update public.marketing_activities set workspace_id = first_workspace where workspace_id is null;
    update public.marketing_reports set workspace_id = first_workspace where workspace_id is null;
  end if;
end $$;

alter table public.marketing_reports drop constraint if exists marketing_reports_pkey;
create unique index if not exists marketing_reports_workspace_month_idx on public.marketing_reports(workspace_id, month);

drop policy if exists "marketing workspace access" on public.marketing_social_accounts;
drop policy if exists "marketing workspace access" on public.marketing_posts;
drop policy if exists "marketing workspace access" on public.marketing_campaigns;
drop policy if exists "marketing workspace access" on public.marketing_media_assets;
drop policy if exists "marketing workspace access" on public.marketing_activities;
drop policy if exists "marketing workspace access" on public.marketing_reports;

create policy "marketing accounts module access" on public.marketing_social_accounts for all to authenticated
using (public.can_use_module(workspace_id, 'marketing', 'read') or public.can_use_module(workspace_id, 'marketing', 'update') or public.can_use_module(workspace_id, 'marketing', 'delete'))
with check (public.can_use_module(workspace_id, 'marketing', 'create') or public.can_use_module(workspace_id, 'marketing', 'update'));

create policy "marketing posts module access" on public.marketing_posts for all to authenticated
using (public.can_use_module(workspace_id, 'marketing', 'read') or public.can_use_module(workspace_id, 'marketing', 'update') or public.can_use_module(workspace_id, 'marketing', 'delete'))
with check (public.can_use_module(workspace_id, 'marketing', 'create') or public.can_use_module(workspace_id, 'marketing', 'update'));

create policy "marketing campaigns module access" on public.marketing_campaigns for all to authenticated
using (public.can_use_module(workspace_id, 'marketing', 'read') or public.can_use_module(workspace_id, 'marketing', 'update') or public.can_use_module(workspace_id, 'marketing', 'delete'))
with check (public.can_use_module(workspace_id, 'marketing', 'create') or public.can_use_module(workspace_id, 'marketing', 'update'));

create policy "marketing media module access" on public.marketing_media_assets for all to authenticated
using (public.can_use_module(workspace_id, 'marketing', 'read') or public.can_use_module(workspace_id, 'marketing', 'update') or public.can_use_module(workspace_id, 'marketing', 'delete'))
with check (public.can_use_module(workspace_id, 'marketing', 'create') or public.can_use_module(workspace_id, 'marketing', 'update'));

create policy "marketing activities module access" on public.marketing_activities for all to authenticated
using (public.can_use_module(workspace_id, 'marketing', 'read') or public.can_use_module(workspace_id, 'marketing', 'update') or public.can_use_module(workspace_id, 'marketing', 'delete'))
with check (public.can_use_module(workspace_id, 'marketing', 'create') or public.can_use_module(workspace_id, 'marketing', 'update'));

create policy "marketing reports module access" on public.marketing_reports for all to authenticated
using (public.can_use_module(workspace_id, 'marketing', 'read') or public.can_use_module(workspace_id, 'marketing', 'update') or public.can_use_module(workspace_id, 'marketing', 'delete'))
with check (public.can_use_module(workspace_id, 'marketing', 'create') or public.can_use_module(workspace_id, 'marketing', 'update'));
