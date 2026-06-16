alter table public.marketing_social_accounts add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.marketing_social_accounts add column if not exists provider_account_id text;
alter table public.marketing_social_accounts add column if not exists updated_at timestamptz not null default now();
alter table public.marketing_posts add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.marketing_posts add column if not exists publication_error text;
alter table public.marketing_campaigns add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.marketing_media_assets add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.marketing_activities add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.marketing_reports add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;

create table if not exists public.social_publication_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  post_id text not null references public.marketing_posts(id) on delete cascade,
  account_id text references public.marketing_social_accounts(id) on delete set null,
  network text not null,
  status text not null check (status in ('published', 'failed')),
  external_id text,
  error_message text,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists marketing_accounts_workspace_idx on public.marketing_social_accounts(workspace_id);
create index if not exists marketing_posts_workspace_schedule_idx on public.marketing_posts(workspace_id, status, "scheduledAt");
create index if not exists marketing_campaigns_workspace_idx on public.marketing_campaigns(workspace_id);
create index if not exists social_publication_logs_workspace_idx on public.social_publication_logs(workspace_id, created_at desc);

alter table public.social_publication_logs enable row level security;

drop policy if exists "marketing accounts read" on public.marketing_social_accounts;
drop policy if exists "marketing accounts write" on public.marketing_social_accounts;
drop policy if exists "marketing campaigns read" on public.marketing_campaigns;
drop policy if exists "marketing campaigns write" on public.marketing_campaigns;
drop policy if exists "marketing posts read" on public.marketing_posts;
drop policy if exists "marketing posts write" on public.marketing_posts;
drop policy if exists "marketing media read" on public.marketing_media_assets;
drop policy if exists "marketing media write" on public.marketing_media_assets;
drop policy if exists "marketing activities read" on public.marketing_activities;
drop policy if exists "marketing activities write" on public.marketing_activities;
drop policy if exists "marketing reports read" on public.marketing_reports;
drop policy if exists "marketing reports write" on public.marketing_reports;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'marketing_social_accounts', 'marketing_posts', 'marketing_campaigns',
    'marketing_media_assets', 'marketing_activities', 'marketing_reports'
  ]
  loop
    execute format('drop policy if exists "marketing workspace access" on public.%I', table_name);
    execute format(
      'create policy "marketing workspace access" on public.%I for all to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id))',
      table_name
    );
  end loop;
end $$;

drop policy if exists "social publication logs workspace access" on public.social_publication_logs;
create policy "social publication logs workspace access" on public.social_publication_logs
for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "social publication logs workspace insert" on public.social_publication_logs
for insert to authenticated with check (public.is_workspace_member(workspace_id));

do $$
begin
  alter publication supabase_realtime add table public.social_publication_logs;
exception when duplicate_object then null;
end $$;
