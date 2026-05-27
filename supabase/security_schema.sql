create table if not exists public.security_logs (
  id text primary key,
  event text not null,
  category text not null check (category in ('auth', 'data', 'api', 'admin', 'system')),
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  actor text not null,
  "ipAddress" text not null,
  location text not null,
  device text not null,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.user_sessions (
  id text primary key,
  "userName" text not null,
  email text not null,
  device text not null,
  browser text not null,
  "ipAddress" text not null,
  location text not null,
  status text not null check (status in ('active', 'expired', 'revoked')),
  "riskScore" integer not null default 0,
  "lastSeenAt" timestamptz not null default now(),
  "expiresAt" timestamptz not null
);

create table if not exists public.login_attempts (
  id text primary key,
  email text not null,
  "ipAddress" text not null,
  location text not null,
  success boolean not null default false,
  suspicious boolean not null default false,
  reason text not null,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.security_alerts (
  id text primary key,
  title text not null,
  description text not null,
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  status text not null check (status in ('open', 'investigating', 'resolved', 'blocked')),
  source text not null check (source in ('auth', 'api', 'data', 'backup', 'compliance')),
  "assignedTo" text not null,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.api_security_logs (
  id text primary key,
  endpoint text not null,
  method text not null check (method in ('GET', 'POST', 'PUT', 'PATCH', 'DELETE')),
  "statusCode" integer not null,
  "latencyMs" integer not null,
  "apiKeyLabel" text not null,
  "ipAddress" text not null,
  blocked boolean not null default false,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.user_permissions (
  id text primary key,
  "userName" text not null,
  role text not null check (role in ('super_admin', 'security_admin', 'admin', 'manager', 'employee', 'guest')),
  modules text[] not null default '{}',
  "mfaEnabled" boolean not null default false,
  "sensitiveAccess" boolean not null default false,
  "lastReviewedAt" timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id text primary key,
  action text not null,
  actor text not null,
  target text not null,
  module text not null,
  before text not null,
  after text not null,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.backups (
  id text primary key,
  name text not null,
  scope text not null check (scope in ('database', 'storage', 'full')),
  status text not null check (status in ('completed', 'running', 'failed')),
  "sizeGb" numeric not null default 0,
  encrypted boolean not null default true,
  "retentionDays" integer not null default 30,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.gdpr_requests (
  id text primary key,
  requester text not null,
  email text not null,
  type text not null check (type in ('export', 'delete', 'rectify', 'consent')),
  status text not null check (status in ('pending', 'processing', 'completed', 'rejected')),
  "dueAt" timestamptz not null,
  "createdAt" timestamptz not null default now()
);

alter table public.security_logs enable row level security;
alter table public.user_sessions enable row level security;
alter table public.login_attempts enable row level security;
alter table public.security_alerts enable row level security;
alter table public.api_security_logs enable row level security;
alter table public.user_permissions enable row level security;
alter table public.audit_logs enable row level security;
alter table public.backups enable row level security;
alter table public.gdpr_requests enable row level security;

create policy "security read authenticated" on public.security_logs for select to authenticated using (true);
create policy "security write authenticated" on public.security_logs for all to authenticated using (true) with check (true);
create policy "sessions read authenticated" on public.user_sessions for select to authenticated using (true);
create policy "sessions write authenticated" on public.user_sessions for all to authenticated using (true) with check (true);
create policy "attempts read authenticated" on public.login_attempts for select to authenticated using (true);
create policy "attempts write authenticated" on public.login_attempts for all to authenticated using (true) with check (true);
create policy "alerts read authenticated" on public.security_alerts for select to authenticated using (true);
create policy "alerts write authenticated" on public.security_alerts for all to authenticated using (true) with check (true);
create policy "api security read authenticated" on public.api_security_logs for select to authenticated using (true);
create policy "api security write authenticated" on public.api_security_logs for all to authenticated using (true) with check (true);
create policy "permissions read authenticated" on public.user_permissions for select to authenticated using (true);
create policy "permissions write authenticated" on public.user_permissions for all to authenticated using (true) with check (true);
create policy "audit read authenticated" on public.audit_logs for select to authenticated using (true);
create policy "audit write authenticated" on public.audit_logs for all to authenticated using (true) with check (true);
create policy "backups read authenticated" on public.backups for select to authenticated using (true);
create policy "backups write authenticated" on public.backups for all to authenticated using (true) with check (true);
create policy "gdpr read authenticated" on public.gdpr_requests for select to authenticated using (true);
create policy "gdpr write authenticated" on public.gdpr_requests for all to authenticated using (true) with check (true);

alter publication supabase_realtime add table public.security_logs;
alter publication supabase_realtime add table public.user_sessions;
alter publication supabase_realtime add table public.login_attempts;
alter publication supabase_realtime add table public.security_alerts;
alter publication supabase_realtime add table public.api_security_logs;
alter publication supabase_realtime add table public.user_permissions;
alter publication supabase_realtime add table public.audit_logs;
alter publication supabase_realtime add table public.backups;
alter publication supabase_realtime add table public.gdpr_requests;
