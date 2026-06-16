alter table public.calendars add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.calendar_events add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.event_participants add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.reservations add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.reminders add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.event_comments add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.availability_slots add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;

do $$
declare
  first_workspace uuid;
begin
  select id into first_workspace from public.workspaces order by created_at asc limit 1;
  if first_workspace is not null then
    update public.calendars set workspace_id = first_workspace where workspace_id is null;
    update public.calendar_events set workspace_id = first_workspace where workspace_id is null;
    update public.event_participants set workspace_id = first_workspace where workspace_id is null;
    update public.reservations set workspace_id = first_workspace where workspace_id is null;
    update public.reminders set workspace_id = first_workspace where workspace_id is null;
    update public.event_comments set workspace_id = first_workspace where workspace_id is null;
    update public.availability_slots set workspace_id = first_workspace where workspace_id is null;
  end if;
end $$;

drop policy if exists "agenda calendars read" on public.calendars;
drop policy if exists "agenda calendars write" on public.calendars;
drop policy if exists "agenda events read" on public.calendar_events;
drop policy if exists "agenda events write" on public.calendar_events;
drop policy if exists "agenda participants read" on public.event_participants;
drop policy if exists "agenda participants write" on public.event_participants;
drop policy if exists "agenda reservations read" on public.reservations;
drop policy if exists "agenda reservations write" on public.reservations;
drop policy if exists "agenda reminders read" on public.reminders;
drop policy if exists "agenda reminders write" on public.reminders;
drop policy if exists "agenda comments read" on public.event_comments;
drop policy if exists "agenda comments write" on public.event_comments;
drop policy if exists "agenda slots read" on public.availability_slots;
drop policy if exists "agenda slots write" on public.availability_slots;

create policy "agenda calendars module read" on public.calendars for select to authenticated
using (public.can_use_module(workspace_id, 'agenda', 'read'));
create policy "agenda calendars module write" on public.calendars for all to authenticated
using (public.can_use_module(workspace_id, 'agenda', 'update'))
with check (public.can_use_module(workspace_id, 'agenda', 'create') or public.can_use_module(workspace_id, 'agenda', 'update'));

create policy "agenda events module read" on public.calendar_events for select to authenticated
using (public.can_use_module(workspace_id, 'agenda', 'read'));
create policy "agenda events module write" on public.calendar_events for all to authenticated
using (public.can_use_module(workspace_id, 'agenda', 'update') or public.can_use_module(workspace_id, 'agenda', 'delete'))
with check (public.can_use_module(workspace_id, 'agenda', 'create') or public.can_use_module(workspace_id, 'agenda', 'update'));

create policy "agenda participants module read" on public.event_participants for select to authenticated
using (public.can_use_module(workspace_id, 'agenda', 'read'));
create policy "agenda participants module write" on public.event_participants for all to authenticated
using (public.can_use_module(workspace_id, 'agenda', 'update') or public.can_use_module(workspace_id, 'agenda', 'delete'))
with check (public.can_use_module(workspace_id, 'agenda', 'create') or public.can_use_module(workspace_id, 'agenda', 'update'));

create policy "agenda reservations module read" on public.reservations for select to authenticated
using (public.can_use_module(workspace_id, 'agenda', 'read'));
create policy "agenda reservations module write" on public.reservations for all to authenticated
using (public.can_use_module(workspace_id, 'agenda', 'update') or public.can_use_module(workspace_id, 'agenda', 'delete'))
with check (public.can_use_module(workspace_id, 'agenda', 'create') or public.can_use_module(workspace_id, 'agenda', 'update'));

create policy "agenda reminders module read" on public.reminders for select to authenticated
using (public.can_use_module(workspace_id, 'agenda', 'read'));
create policy "agenda reminders module write" on public.reminders for all to authenticated
using (public.can_use_module(workspace_id, 'agenda', 'update') or public.can_use_module(workspace_id, 'agenda', 'delete'))
with check (public.can_use_module(workspace_id, 'agenda', 'create') or public.can_use_module(workspace_id, 'agenda', 'update'));

create policy "agenda comments module read" on public.event_comments for select to authenticated
using (public.can_use_module(workspace_id, 'agenda', 'read'));
create policy "agenda comments module write" on public.event_comments for all to authenticated
using (public.can_use_module(workspace_id, 'agenda', 'update') or public.can_use_module(workspace_id, 'agenda', 'delete'))
with check (public.can_use_module(workspace_id, 'agenda', 'create') or public.can_use_module(workspace_id, 'agenda', 'update'));

create policy "agenda slots module read" on public.availability_slots for select to authenticated
using (public.can_use_module(workspace_id, 'agenda', 'read'));
create policy "agenda slots module write" on public.availability_slots for all to authenticated
using (public.can_use_module(workspace_id, 'agenda', 'update') or public.can_use_module(workspace_id, 'agenda', 'delete'))
with check (public.can_use_module(workspace_id, 'agenda', 'create') or public.can_use_module(workspace_id, 'agenda', 'update'));
