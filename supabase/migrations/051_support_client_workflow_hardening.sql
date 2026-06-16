alter table public.support_tickets add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.support_tickets add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.support_tickets add column if not exists "clientName" text;
alter table public.support_tickets add column if not exists "clientEmail" text;
alter table public.support_tickets add column if not exists "categoryId" text;
alter table public.support_tickets add column if not exists "assignedAgentId" text;
alter table public.support_tickets add column if not exists attachments text[] not null default '{}'::text[];
alter table public.support_tickets add column if not exists "createdAt" timestamptz;
alter table public.support_tickets add column if not exists "updatedAt" timestamptz;
alter table public.support_tickets add column if not exists metadata jsonb not null default '{}'::jsonb;

do $$
declare
  first_workspace uuid;
begin
  select id into first_workspace from public.workspaces order by created_at asc limit 1;
  if first_workspace is not null then
    update public.support_tickets set workspace_id = first_workspace where workspace_id is null;
  end if;
end $$;

update public.support_tickets
set
  "clientName" = coalesce("clientName", metadata->>'clientName', 'Client CENTRIX'),
  "clientEmail" = coalesce("clientEmail", metadata->>'clientEmail', 'client@centrix.fr'),
  "categoryId" = coalesce("categoryId", category, metadata->>'categoryId', 'cat-technical'),
  "createdAt" = coalesce("createdAt", created_at),
  "updatedAt" = coalesce("updatedAt", updated_at);

create index if not exists support_tickets_workspace_updated_idx on public.support_tickets(workspace_id, updated_at desc);
create index if not exists support_messages_ticket_created_idx on public.support_messages("ticketId", "createdAt");
create index if not exists support_comments_ticket_created_idx on public.support_comments("ticketId", "createdAt" desc);
create index if not exists support_feedback_ticket_created_idx on public.support_feedback("ticketId", "createdAt" desc);
create index if not exists support_notifications_ticket_created_idx on public.support_notifications("ticketId", "createdAt" desc);

drop policy if exists "support tickets read" on public.support_tickets;
drop policy if exists "support tickets write" on public.support_tickets;
drop policy if exists "support_tickets module read" on public.support_tickets;
drop policy if exists "support_tickets module insert" on public.support_tickets;
drop policy if exists "support_tickets module update" on public.support_tickets;
drop policy if exists "support_tickets module delete" on public.support_tickets;

create policy "support_tickets module read" on public.support_tickets for select to authenticated
using (public.can_use_module(workspace_id, 'support', 'read'));
create policy "support_tickets module insert" on public.support_tickets for insert to authenticated
with check (public.can_use_module(workspace_id, 'support', 'create'));
create policy "support_tickets module update" on public.support_tickets for update to authenticated
using (public.can_use_module(workspace_id, 'support', 'update'))
with check (public.can_use_module(workspace_id, 'support', 'update'));
create policy "support_tickets module delete" on public.support_tickets for delete to authenticated
using (public.can_use_module(workspace_id, 'support', 'delete'));

drop policy if exists "support messages read" on public.support_messages;
drop policy if exists "support messages write" on public.support_messages;
drop policy if exists "support comments read" on public.support_comments;
drop policy if exists "support comments write" on public.support_comments;
drop policy if exists "support feedback read" on public.support_feedback;
drop policy if exists "support feedback write" on public.support_feedback;
drop policy if exists "support notifications read" on public.support_notifications;
drop policy if exists "support notifications write" on public.support_notifications;

create policy "support messages module access" on public.support_messages for all to authenticated
using (exists (select 1 from public.support_tickets t where t.id = "ticketId" and public.can_use_module(t.workspace_id, 'support', 'read')))
with check (exists (select 1 from public.support_tickets t where t.id = "ticketId" and public.can_use_module(t.workspace_id, 'support', 'update')));

create policy "support comments module access" on public.support_comments for all to authenticated
using (exists (select 1 from public.support_tickets t where t.id = "ticketId" and public.can_use_module(t.workspace_id, 'support', 'read')))
with check (exists (select 1 from public.support_tickets t where t.id = "ticketId" and public.can_use_module(t.workspace_id, 'support', 'update')));

create policy "support feedback module access" on public.support_feedback for all to authenticated
using (exists (select 1 from public.support_tickets t where t.id = "ticketId" and public.can_use_module(t.workspace_id, 'support', 'read')))
with check (exists (select 1 from public.support_tickets t where t.id = "ticketId" and public.can_use_module(t.workspace_id, 'support', 'update')));

create policy "support notifications module access" on public.support_notifications for all to authenticated
using ("ticketId" is null or exists (select 1 from public.support_tickets t where t.id = "ticketId" and public.can_use_module(t.workspace_id, 'support', 'read')))
with check ("ticketId" is null or exists (select 1 from public.support_tickets t where t.id = "ticketId" and public.can_use_module(t.workspace_id, 'support', 'update')));

drop policy if exists "support agents read" on public.support_agents;
drop policy if exists "support agents write" on public.support_agents;
drop policy if exists "support categories read" on public.support_categories;
drop policy if exists "support categories write" on public.support_categories;
drop policy if exists "support articles read" on public.support_articles;
drop policy if exists "support articles write" on public.support_articles;

create policy "support agents authenticated access" on public.support_agents for all to authenticated using (true) with check (true);
create policy "support categories authenticated access" on public.support_categories for all to authenticated using (true) with check (true);
create policy "support articles authenticated access" on public.support_articles for all to authenticated using (true) with check (true);
