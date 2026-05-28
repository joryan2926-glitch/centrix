create table if not exists public.business_reports (
  id text primary key,
  title text not null,
  template text not null,
  owner text not null,
  status text not null check (status in ('draft', 'scheduled', 'published', 'archived')),
  "sharedWith" text[] not null default '{}',
  "generatedAt" timestamptz not null default now()
);

create table if not exists public.predictive_metrics (
  id text primary key,
  label text not null,
  module text not null check (module in ('finance', 'crm', 'marketing', 'rh', 'support', 'marketplace')),
  "currentValue" numeric not null default 0,
  "predictedValue" numeric not null default 0,
  confidence numeric not null default 0,
  trend text not null check (trend in ('up', 'down', 'stable')),
  period text not null
);

create table if not exists public.ai_insights (
  id text primary key,
  title text not null,
  summary text not null,
  recommendation text not null,
  priority text not null check (priority in ('low', 'medium', 'high', 'critical')),
  source text not null,
  "impactScore" numeric not null default 0,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.business_scores (
  id text primary key,
  entity text not null,
  category text not null check (category in ('company', 'client', 'sales', 'marketing', 'productivity')),
  score numeric not null default 0,
  change numeric not null default 0,
  rank integer not null default 0
);

create table if not exists public.company_goals (
  id text primary key,
  title text not null,
  target numeric not null default 0,
  current numeric not null default 0,
  unit text not null,
  owner text not null,
  "dueAt" timestamptz not null
);

create table if not exists public.analytics_alerts (
  id text primary key,
  title text not null,
  detail text not null,
  priority text not null check (priority in ('low', 'medium', 'high', 'critical')),
  module text not null,
  status text not null check (status in ('open', 'acknowledged', 'resolved')),
  "createdAt" timestamptz not null default now()
);

create table if not exists public.performance_metrics (
  id text primary key,
  module text not null,
  label text not null,
  value numeric not null default 0,
  benchmark numeric not null default 0,
  month text not null
);

create table if not exists public.predictive_models (
  id text primary key,
  name text not null,
  purpose text not null,
  accuracy numeric not null default 0,
  status text not null check (status in ('training', 'active', 'paused', 'failed')),
  "lastTrainedAt" timestamptz not null default now()
);

create table if not exists public.analytics_exports (
  id text primary key,
  "reportId" text not null references public.business_reports(id) on delete cascade,
  format text not null check (format in ('pdf', 'excel', 'csv')),
  "requestedBy" text not null,
  status text not null check (status in ('queued', 'ready', 'failed')),
  "createdAt" timestamptz not null default now()
);

alter table public.business_reports enable row level security;
alter table public.predictive_metrics enable row level security;
alter table public.ai_insights enable row level security;
alter table public.business_scores enable row level security;
alter table public.company_goals enable row level security;
alter table public.analytics_alerts enable row level security;
alter table public.performance_metrics enable row level security;
alter table public.predictive_models enable row level security;
alter table public.analytics_exports enable row level security;

create policy "bi reports read authenticated" on public.business_reports for select to authenticated using (true);
create policy "bi reports write authenticated" on public.business_reports for all to authenticated using (true) with check (true);
create policy "predictive metrics read authenticated" on public.predictive_metrics for select to authenticated using (true);
create policy "predictive metrics write authenticated" on public.predictive_metrics for all to authenticated using (true) with check (true);
create policy "ai insights read authenticated" on public.ai_insights for select to authenticated using (true);
create policy "ai insights write authenticated" on public.ai_insights for all to authenticated using (true) with check (true);
create policy "business scores read authenticated" on public.business_scores for select to authenticated using (true);
create policy "business scores write authenticated" on public.business_scores for all to authenticated using (true) with check (true);
create policy "company goals read authenticated" on public.company_goals for select to authenticated using (true);
create policy "company goals write authenticated" on public.company_goals for all to authenticated using (true) with check (true);
create policy "analytics alerts read authenticated" on public.analytics_alerts for select to authenticated using (true);
create policy "analytics alerts write authenticated" on public.analytics_alerts for all to authenticated using (true) with check (true);
create policy "performance metrics read authenticated" on public.performance_metrics for select to authenticated using (true);
create policy "performance metrics write authenticated" on public.performance_metrics for all to authenticated using (true) with check (true);
create policy "predictive models read authenticated" on public.predictive_models for select to authenticated using (true);
create policy "predictive models write authenticated" on public.predictive_models for all to authenticated using (true) with check (true);
create policy "analytics exports read authenticated" on public.analytics_exports for select to authenticated using (true);
create policy "analytics exports write authenticated" on public.analytics_exports for all to authenticated using (true) with check (true);

do $$
begin
  alter publication supabase_realtime add table public.business_reports;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.predictive_metrics;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.ai_insights;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.business_scores;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.company_goals;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.analytics_alerts;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.performance_metrics;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.predictive_models;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.analytics_exports;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
