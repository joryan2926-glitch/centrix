create table if not exists public.api_keys (
  id text primary key,
  name text not null,
  "tokenPreview" text not null,
  scopes text[] not null default '{}',
  "expiresAt" timestamptz,
  revoked boolean not null default false,
  "lastUsedAt" timestamptz,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.api_logs (
  id text primary key,
  "apiKeyId" text references public.api_keys(id) on delete set null,
  method text not null,
  endpoint text not null,
  "statusCode" integer not null default 200,
  "responseTimeMs" integer not null default 0,
  "ipAddress" text not null default '',
  "createdAt" timestamptz not null default now()
);

create table if not exists public.webhooks (
  id text primary key,
  name text not null,
  url text not null,
  events text[] not null default '{}',
  "secretPreview" text not null,
  active boolean not null default true,
  "retryEnabled" boolean not null default true,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.webhook_logs (
  id text primary key,
  "webhookId" text not null references public.webhooks(id) on delete cascade,
  event text not null,
  status text not null,
  "statusCode" integer not null default 0,
  attempts integer not null default 0,
  "responseTimeMs" integer not null default 0,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.integrations (
  id text primary key,
  provider text not null,
  name text not null,
  category text not null,
  description text not null default '',
  status text not null default 'disconnected',
  "syncEnabled" boolean not null default false,
  "lastSyncAt" timestamptz
);

create table if not exists public.oauth_connections (
  id text primary key,
  "integrationId" text not null references public.integrations(id) on delete cascade,
  "accountEmail" text not null,
  scopes text[] not null default '{}',
  "tokenStatus" text not null default 'valid',
  "connectedAt" timestamptz not null default now()
);

create table if not exists public.api_permissions (
  id text primary key,
  scope text not null,
  label text not null,
  read boolean not null default true,
  write boolean not null default false,
  admin boolean not null default false
);

create table if not exists public.api_rate_limits (
  id text primary key,
  "apiKeyId" text references public.api_keys(id) on delete cascade,
  "window" text not null default 'minute',
  "limit" integer not null default 0,
  used integer not null default 0
);

create table if not exists public.integration_notifications (
  id text primary key,
  title text not null,
  detail text not null,
  severity text not null default 'info',
  "createdAt" timestamptz not null default now()
);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'api_keys', 'api_logs', 'webhooks', 'webhook_logs', 'integrations',
    'oauth_connections', 'api_permissions', 'api_rate_limits', 'integration_notifications'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('create policy "%s authenticated read" on public.%I for select to authenticated using (true)', table_name, table_name);
    execute format('create policy "%s authenticated write" on public.%I for all to authenticated using (true) with check (true)', table_name, table_name);
    begin
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    exception
      when duplicate_object then null;
      when others then null;
    end;
  end loop;
end $$;
