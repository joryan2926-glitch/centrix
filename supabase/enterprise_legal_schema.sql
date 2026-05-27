create table if not exists public.legal_forms (
  id text primary key,
  code text not null check (code in ('SASU', 'SAS', 'EURL', 'SARL', 'EI', 'MICRO', 'SCI', 'ASSOCIATION')),
  name text not null,
  description text not null,
  liability text not null,
  "socialRegime" text not null,
  "taxRegime" text not null,
  "minCapital" numeric not null default 0,
  "bestFor" text[] not null default '{}'::text[],
  complexity text not null check (complexity in ('simple', 'standard', 'advanced'))
);

create table if not exists public.companies (
  id text primary key,
  name text not null,
  "legalFormId" text not null references public.legal_forms(id) on delete restrict,
  status text not null check (status in ('draft', 'in_review', 'submitted', 'registered')),
  activity text not null,
  city text not null,
  "capitalAmount" numeric not null default 0,
  "capitalDeposited" numeric not null default 0,
  progress numeric not null default 0,
  siren text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.shareholders (
  id text primary key,
  "companyId" text not null references public.companies(id) on delete cascade,
  name text not null,
  role text not null check (role in ('founder', 'president', 'manager', 'partner', 'beneficiary')),
  shares numeric not null default 0,
  contribution numeric not null default 0,
  email text not null
);

create table if not exists public.company_steps (
  id text primary key,
  "companyId" text not null references public.companies(id) on delete cascade,
  title text not null,
  description text not null,
  status text not null check (status in ('todo', 'in_progress', 'done', 'blocked')),
  "dueAt" timestamptz not null default now(),
  "order" numeric not null default 0
);

create table if not exists public.legal_documents (
  id text primary key,
  "companyId" text not null references public.companies(id) on delete cascade,
  type text not null check (type in ('statuts', 'pv', 'capital_certificate', 'beneficiaries', 'headquarters', 'contract')),
  title text not null,
  status text not null check (status in ('draft', 'generated', 'signed', 'archived')),
  url text,
  "generatedAt" timestamptz,
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.legal_announcements (
  id text primary key,
  "companyId" text not null references public.companies(id) on delete cascade,
  title text not null,
  journal text not null,
  department text not null,
  price numeric not null default 0,
  status text not null check (status in ('draft', 'validated', 'published')),
  content text not null,
  "publishedAt" timestamptz
);

create table if not exists public.company_settings (
  "companyId" text primary key references public.companies(id) on delete cascade,
  "legalAddress" text not null default '',
  "accountingCurrency" text not null default 'EUR' check ("accountingCurrency" in ('EUR', 'USD', 'GBP')),
  "fiscalYearEnd" text not null default '12-31',
  "vatRegime" text not null default 'franchise' check ("vatRegime" in ('franchise', 'real_simplified', 'real_normal')),
  "logoUrl" text
);

create table if not exists public.capital_deposits (
  id text primary key,
  "companyId" text not null references public.companies(id) on delete cascade,
  "bankName" text not null,
  iban text not null,
  amount numeric not null default 0,
  status text not null check (status in ('pending', 'documents_sent', 'deposited', 'certificate_received')),
  "certificateUrl" text,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.legal_notifications (
  id text primary key,
  "companyId" text not null references public.companies(id) on delete cascade,
  title text not null,
  detail text not null,
  severity text not null check (severity in ('info', 'success', 'warning')),
  "createdAt" timestamptz not null default now()
);

alter table public.companies enable row level security;
alter table public.legal_forms enable row level security;
alter table public.legal_documents enable row level security;
alter table public.legal_announcements enable row level security;
alter table public.shareholders enable row level security;
alter table public.company_steps enable row level security;
alter table public.company_settings enable row level security;
alter table public.capital_deposits enable row level security;
alter table public.legal_notifications enable row level security;

create policy "legal forms read" on public.legal_forms for select to anon, authenticated using (true);
create policy "legal forms write" on public.legal_forms for all to anon, authenticated using (true) with check (true);
create policy "companies read" on public.companies for select to anon, authenticated using (true);
create policy "companies write" on public.companies for all to anon, authenticated using (true) with check (true);
create policy "legal documents read" on public.legal_documents for select to anon, authenticated using (true);
create policy "legal documents write" on public.legal_documents for all to anon, authenticated using (true) with check (true);
create policy "legal announcements read" on public.legal_announcements for select to anon, authenticated using (true);
create policy "legal announcements write" on public.legal_announcements for all to anon, authenticated using (true) with check (true);
create policy "shareholders read" on public.shareholders for select to anon, authenticated using (true);
create policy "shareholders write" on public.shareholders for all to anon, authenticated using (true) with check (true);
create policy "company steps read" on public.company_steps for select to anon, authenticated using (true);
create policy "company steps write" on public.company_steps for all to anon, authenticated using (true) with check (true);
create policy "company settings read" on public.company_settings for select to anon, authenticated using (true);
create policy "company settings write" on public.company_settings for all to anon, authenticated using (true) with check (true);
create policy "capital deposits read" on public.capital_deposits for select to anon, authenticated using (true);
create policy "capital deposits write" on public.capital_deposits for all to anon, authenticated using (true) with check (true);
create policy "legal notifications read" on public.legal_notifications for select to anon, authenticated using (true);
create policy "legal notifications write" on public.legal_notifications for all to anon, authenticated using (true) with check (true);

alter publication supabase_realtime add table public.companies;
alter publication supabase_realtime add table public.legal_forms;
alter publication supabase_realtime add table public.legal_documents;
alter publication supabase_realtime add table public.legal_announcements;
alter publication supabase_realtime add table public.shareholders;
alter publication supabase_realtime add table public.company_steps;
alter publication supabase_realtime add table public.company_settings;
alter publication supabase_realtime add table public.capital_deposits;
alter publication supabase_realtime add table public.legal_notifications;
