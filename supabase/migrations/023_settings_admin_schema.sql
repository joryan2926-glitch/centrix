create table if not exists public.user_settings (
  id text primary key,
  "userId" text not null,
  name text not null,
  email text not null,
  "avatarUrl" text,
  language text not null default 'fr' check (language in ('fr', 'en')),
  timezone text not null default 'Europe/Paris',
  "notificationsEmail" boolean not null default true,
  "notificationsPush" boolean not null default true,
  "twoFactorEnabled" boolean not null default false,
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.company_settings (
  "companyId" text primary key,
  "legalAddress" text not null default '',
  "accountingCurrency" text not null default 'EUR',
  "fiscalYearEnd" text not null default '12-31',
  "vatRegime" text not null default 'franchise',
  "logoUrl" text
);

alter table public.company_settings add column if not exists name text not null default 'CENTRIX';
alter table public.company_settings add column if not exists "legalName" text not null default 'CENTRIX SAS';
alter table public.company_settings add column if not exists "primaryColor" text not null default '#5ee7ff';
alter table public.company_settings add column if not exists "accentColor" text not null default '#8b5cf6';
alter table public.company_settings add column if not exists "vatNumber" text not null default '';
alter table public.company_settings add column if not exists iban text not null default '';
alter table public.company_settings add column if not exists theme text not null default 'dark';
alter table public.company_settings add column if not exists "updatedAt" timestamptz not null default now();

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  "companyId" text not null,
  plan text not null check (plan in ('starter', 'premium', 'business', 'enterprise')),
  status text not null check (status in ('active', 'trialing', 'past_due', 'canceled')),
  seats numeric not null default 1,
  "usedSeats" numeric not null default 0,
  "monthlyPrice" numeric not null default 0,
  "renewalAt" timestamptz not null default now()
);

create table if not exists public.user_roles (
  id text primary key,
  "userId" text not null,
  "companyId" text,
  name text not null,
  email text not null,
  role text not null check (role in ('super_admin', 'admin', 'manager', 'employee', 'guest')),
  active boolean not null default true,
  "lastLoginAt" timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id text primary key,
  "userId" text,
  "companyId" text,
  action text not null,
  target text not null,
  detail text not null,
  severity text not null check (severity in ('info', 'success', 'warning')),
  "createdAt" timestamptz not null default now()
);

create table if not exists public.security_logs (
  id text primary key,
  "userId" text,
  event text not null check (event in ('login', 'logout', 'password_change', 'suspicious_activity', 'session_revoked')),
  device text not null,
  "ipAddress" text not null,
  location text not null,
  severity text not null check (severity in ('info', 'success', 'warning')),
  "createdAt" timestamptz not null default now()
);

create table if not exists public.notifications (
  id text primary key,
  title text not null,
  detail text not null,
  channel text not null check (channel in ('dashboard', 'email', 'security')),
  read boolean not null default false,
  severity text not null check (severity in ('info', 'success', 'warning')),
  "createdAt" timestamptz not null default now()
);

create table if not exists public.module_settings (
  id text primary key,
  "companyId" text not null,
  module text not null check (module in ('crm', 'billing', 'finance', 'hr', 'agenda', 'marketing', 'support', 'documents', 'ai', 'legal')),
  enabled boolean not null default true,
  permissions text[] not null default '{}'::text[],
  preferences jsonb not null default '{}'::jsonb,
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.billing_history (
  id text primary key,
  "subscriptionId" uuid not null references public.subscriptions(id) on delete cascade,
  "invoiceNumber" text not null,
  amount numeric not null default 0,
  status text not null check (status in ('paid', 'pending', 'failed')),
  "paidAt" timestamptz,
  "createdAt" timestamptz not null default now()
);

alter table public.user_settings enable row level security;
alter table public.company_settings enable row level security;
alter table public.subscriptions enable row level security;
alter table public.user_roles enable row level security;
alter table public.activity_logs enable row level security;
alter table public.security_logs enable row level security;
alter table public.notifications enable row level security;
alter table public.module_settings enable row level security;
alter table public.billing_history enable row level security;

create policy "user settings read" on public.user_settings for select to anon, authenticated using (true);
create policy "user settings write" on public.user_settings for all to anon, authenticated using (true) with check (true);
create policy "admin company settings read" on public.company_settings for select to anon, authenticated using (true);
create policy "admin company settings write" on public.company_settings for all to anon, authenticated using (true) with check (true);
create policy "subscriptions read" on public.subscriptions for select to anon, authenticated using (true);
create policy "subscriptions write" on public.subscriptions for all to anon, authenticated using (true) with check (true);
create policy "user roles read" on public.user_roles for select to anon, authenticated using (true);
create policy "user roles write" on public.user_roles for all to anon, authenticated using (true) with check (true);
create policy "activity logs read" on public.activity_logs for select to anon, authenticated using (true);
create policy "activity logs write" on public.activity_logs for all to anon, authenticated using (true) with check (true);
create policy "security logs read" on public.security_logs for select to anon, authenticated using (true);
create policy "security logs write" on public.security_logs for all to anon, authenticated using (true) with check (true);
create policy "notifications read" on public.notifications for select to anon, authenticated using (true);
create policy "notifications write" on public.notifications for all to anon, authenticated using (true) with check (true);
create policy "module settings read" on public.module_settings for select to anon, authenticated using (true);
create policy "module settings write" on public.module_settings for all to anon, authenticated using (true) with check (true);
create policy "billing history read" on public.billing_history for select to anon, authenticated using (true);
create policy "billing history write" on public.billing_history for all to anon, authenticated using (true) with check (true);

do $$
begin
  alter publication supabase_realtime add table public.user_settings;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.company_settings;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.subscriptions;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.user_roles;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.activity_logs;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.security_logs;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.module_settings;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.billing_history;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
