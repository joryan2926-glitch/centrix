create table if not exists public.marketing_social_accounts (
  id text primary key,
  network text not null check (network in ('facebook', 'instagram', 'linkedin', 'tiktok', 'x', 'youtube')),
  handle text not null,
  "displayName" text not null,
  followers numeric not null default 0,
  "engagementRate" numeric not null default 0,
  reach numeric not null default 0,
  connected boolean not null default true,
  color text not null default '#5ee7ff',
  "createdAt" timestamptz not null default now()
);

create table if not exists public.marketing_campaigns (
  id text primary key,
  name text not null,
  type text not null check (type in ('email', 'social', 'paid', 'launch')),
  objective text not null,
  status text not null check (status in ('active', 'paused', 'completed')),
  budget numeric not null default 0,
  spent numeric not null default 0,
  revenue numeric not null default 0,
  leads numeric not null default 0,
  "startsAt" date not null,
  "endsAt" date not null,
  color text not null default '#8b5cf6'
);

create table if not exists public.marketing_posts (
  id text primary key,
  "campaignId" text references public.marketing_campaigns(id) on delete set null,
  "accountIds" text[] not null default '{}'::text[],
  title text not null,
  content text not null,
  status text not null check (status in ('draft', 'scheduled', 'published', 'error')),
  "scheduledAt" timestamptz not null,
  "publishedAt" timestamptz,
  hashtags text[] not null default '{}'::text[],
  mentions text[] not null default '{}'::text[],
  "mediaUrls" text[] not null default '{}'::text[],
  category text not null check (category in ('education', 'product', 'brand', 'community', 'ads')),
  metrics jsonb not null default '{"impressions":0,"engagement":0,"clicks":0,"leads":0}'::jsonb,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.marketing_media_assets (
  id text primary key,
  type text not null check (type in ('image', 'video', 'template')),
  title text not null,
  url text not null,
  tags text[] not null default '{}'::text[],
  "createdAt" timestamptz not null default now()
);

create table if not exists public.marketing_activities (
  id text primary key,
  title text not null,
  detail text not null,
  tone text not null check (tone in ('info', 'success', 'warning')),
  "createdAt" timestamptz not null default now()
);

create table if not exists public.marketing_reports (
  month text primary key,
  reach numeric not null default 0,
  engagement numeric not null default 0,
  clicks numeric not null default 0,
  leads numeric not null default 0
);

alter table public.marketing_social_accounts enable row level security;
alter table public.marketing_campaigns enable row level security;
alter table public.marketing_posts enable row level security;
alter table public.marketing_media_assets enable row level security;
alter table public.marketing_activities enable row level security;
alter table public.marketing_reports enable row level security;

create policy "marketing accounts read" on public.marketing_social_accounts for select to anon, authenticated using (true);
create policy "marketing accounts write" on public.marketing_social_accounts for all to anon, authenticated using (true) with check (true);
create policy "marketing campaigns read" on public.marketing_campaigns for select to anon, authenticated using (true);
create policy "marketing campaigns write" on public.marketing_campaigns for all to anon, authenticated using (true) with check (true);
create policy "marketing posts read" on public.marketing_posts for select to anon, authenticated using (true);
create policy "marketing posts write" on public.marketing_posts for all to anon, authenticated using (true) with check (true);
create policy "marketing media read" on public.marketing_media_assets for select to anon, authenticated using (true);
create policy "marketing media write" on public.marketing_media_assets for all to anon, authenticated using (true) with check (true);
create policy "marketing activities read" on public.marketing_activities for select to anon, authenticated using (true);
create policy "marketing activities write" on public.marketing_activities for all to anon, authenticated using (true) with check (true);
create policy "marketing reports read" on public.marketing_reports for select to anon, authenticated using (true);
create policy "marketing reports write" on public.marketing_reports for all to anon, authenticated using (true) with check (true);

do $$
begin
  alter publication supabase_realtime add table public.marketing_social_accounts;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.marketing_posts;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.marketing_campaigns;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.marketing_media_assets;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.marketing_activities;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.marketing_reports;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
