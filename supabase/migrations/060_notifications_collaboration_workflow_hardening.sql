alter table public.realtime_notifications add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.notification_preferences add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.notification_rules add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;

create table if not exists public.collaboration_conversations (
  id text primary key,
  name text not null,
  type text not null check (type in ('direct', 'team', 'project', 'announcement')),
  module text not null check (module in ('crm','billing','projects','support','security','marketing','documents','system')),
  unread_count numeric not null default 0,
  updated_at timestamptz not null default now(),
  workspace_id uuid references public.workspaces(id) on delete cascade
);

create table if not exists public.collaboration_messages (
  id text primary key,
  conversation_id text not null references public.collaboration_conversations(id) on delete cascade,
  author text not null,
  role text not null check (role in ('admin', 'manager', 'employee', 'client')),
  content text not null,
  attachment_name text,
  created_at timestamptz not null default now(),
  workspace_id uuid references public.workspaces(id) on delete cascade
);

create table if not exists public.user_presence (
  id text primary key,
  name text not null,
  role text not null,
  status text not null check (status in ('online', 'away', 'offline')),
  last_seen_at timestamptz not null default now(),
  workspace_id uuid references public.workspaces(id) on delete cascade
);

create table if not exists public.shared_files (
  id text primary key,
  conversation_id text not null references public.collaboration_conversations(id) on delete cascade,
  name text not null,
  file_type text not null,
  size_mb numeric not null default 0,
  secure_url text not null default '#',
  created_at timestamptz not null default now(),
  workspace_id uuid references public.workspaces(id) on delete cascade
);

do $$
declare
  first_workspace uuid;
begin
  select id into first_workspace from public.workspaces order by created_at asc limit 1;
  if first_workspace is not null then
    update public.realtime_notifications set workspace_id = first_workspace where workspace_id is null;
    update public.notification_preferences set workspace_id = first_workspace where workspace_id is null;
    update public.notification_rules set workspace_id = first_workspace where workspace_id is null;
  end if;
end $$;

alter table public.collaboration_conversations enable row level security;
alter table public.collaboration_messages enable row level security;
alter table public.user_presence enable row level security;
alter table public.shared_files enable row level security;

alter table public.notification_preferences drop constraint if exists notification_preferences_module_key;
create unique index if not exists notification_preferences_workspace_module_idx on public.notification_preferences(workspace_id, module);
create index if not exists realtime_notifications_workspace_created_idx on public.realtime_notifications(workspace_id, created_at desc);
create index if not exists notification_rules_workspace_created_idx on public.notification_rules(workspace_id, created_at desc);
create index if not exists collaboration_conversations_workspace_updated_idx on public.collaboration_conversations(workspace_id, updated_at desc);
create index if not exists collaboration_messages_workspace_created_idx on public.collaboration_messages(workspace_id, conversation_id, created_at);
create index if not exists user_presence_workspace_seen_idx on public.user_presence(workspace_id, last_seen_at desc);
create index if not exists shared_files_workspace_created_idx on public.shared_files(workspace_id, conversation_id, created_at desc);

do $$
declare
  item record;
begin
  for item in
    select * from (values
      ('realtime_notifications'),
      ('notification_preferences'),
      ('notification_rules'),
      ('collaboration_conversations'),
      ('collaboration_messages'),
      ('user_presence'),
      ('shared_files')
    ) as mappings(table_name)
  loop
    execute format('drop policy if exists "Authenticated users can manage %s" on public.%I', replace(item.table_name, '_', ' '), item.table_name);
    execute format('drop policy if exists "%s collaboration read" on public.%I', item.table_name, item.table_name);
    execute format('drop policy if exists "%s collaboration insert" on public.%I', item.table_name, item.table_name);
    execute format('drop policy if exists "%s collaboration update" on public.%I', item.table_name, item.table_name);
    execute format('drop policy if exists "%s collaboration delete" on public.%I', item.table_name, item.table_name);
    execute format('create policy "%s collaboration read" on public.%I for select to authenticated using (public.can_use_module(workspace_id, ''notifications'', ''read'') or public.can_use_module(workspace_id, ''collaboration'', ''read''))', item.table_name, item.table_name);
    execute format('create policy "%s collaboration insert" on public.%I for insert to authenticated with check (public.can_use_module(workspace_id, ''notifications'', ''create'') or public.can_use_module(workspace_id, ''collaboration'', ''create''))', item.table_name, item.table_name);
    execute format('create policy "%s collaboration update" on public.%I for update to authenticated using (public.can_use_module(workspace_id, ''notifications'', ''update'') or public.can_use_module(workspace_id, ''collaboration'', ''update'')) with check (public.can_use_module(workspace_id, ''notifications'', ''update'') or public.can_use_module(workspace_id, ''collaboration'', ''update''))', item.table_name, item.table_name);
    execute format('create policy "%s collaboration delete" on public.%I for delete to authenticated using (public.can_use_module(workspace_id, ''notifications'', ''delete'') or public.can_use_module(workspace_id, ''collaboration'', ''delete''))', item.table_name, item.table_name);
  end loop;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.collaboration_conversations;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.collaboration_messages;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.user_presence;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.shared_files;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
