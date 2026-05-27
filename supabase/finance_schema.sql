create table if not exists public.financial_settings (
  id text primary key,
  name text not null,
  "legalName" text not null,
  "vatNumber" text not null,
  iban text not null,
  currency text not null default 'EUR',
  "logoUrl" text not null default '',
  "fiscalYearStart" date not null,
  "vatRate" numeric not null default 20
);

create table if not exists public.accounting_categories (
  id text primary key,
  label text not null,
  account text not null,
  kind text not null check (kind in ('income', 'expense', 'transfer'))
);

create table if not exists public.bank_accounts (
  id text primary key,
  "companyId" text not null references public.financial_settings(id) on delete cascade,
  "bankName" text not null,
  label text not null,
  iban text not null,
  balance numeric not null default 0,
  "lastSyncAt" timestamptz not null default now()
);

create table if not exists public.transactions (
  id text primary key,
  "companyId" text not null references public.financial_settings(id) on delete cascade,
  "bankAccountId" text references public.bank_accounts(id) on delete set null,
  type text not null check (type in ('revenue', 'expense', 'transfer')),
  status text not null check (status in ('validated', 'pending', 'rejected')),
  date date not null,
  label text not null,
  counterparty text not null,
  category text not null references public.accounting_categories(id),
  tags text[] not null default '{}'::text[],
  "amountExcludingTax" numeric not null,
  "vatRate" numeric not null default 0,
  "vatAmount" numeric not null default 0,
  "amountIncludingTax" numeric not null,
  "attachmentUrl" text,
  history jsonb not null default '[]'::jsonb,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.expenses (
  id text primary key references public.transactions(id) on delete cascade,
  "companyId" text not null references public.financial_settings(id) on delete cascade,
  "bankAccountId" text references public.bank_accounts(id) on delete set null,
  type text not null,
  status text not null,
  date date not null,
  label text not null,
  counterparty text not null,
  category text not null,
  tags text[] not null default '{}'::text[],
  "amountExcludingTax" numeric not null,
  "vatRate" numeric not null default 0,
  "vatAmount" numeric not null default 0,
  "amountIncludingTax" numeric not null,
  "attachmentUrl" text,
  history jsonb not null default '[]'::jsonb,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.revenues (
  id text primary key references public.transactions(id) on delete cascade,
  "companyId" text not null references public.financial_settings(id) on delete cascade,
  "bankAccountId" text references public.bank_accounts(id) on delete set null,
  type text not null,
  status text not null,
  date date not null,
  label text not null,
  counterparty text not null,
  category text not null,
  tags text[] not null default '{}'::text[],
  "amountExcludingTax" numeric not null,
  "vatRate" numeric not null default 0,
  "vatAmount" numeric not null default 0,
  "amountIncludingTax" numeric not null,
  "attachmentUrl" text,
  history jsonb not null default '[]'::jsonb,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.accounting_entries (
  id text primary key,
  "companyId" text not null references public.financial_settings(id) on delete cascade,
  "transactionId" text not null references public.transactions(id) on delete cascade,
  account text not null,
  debit numeric not null default 0,
  credit numeric not null default 0,
  label text not null,
  date date not null
);

create table if not exists public.tax_records (
  id text primary key,
  "companyId" text not null references public.financial_settings(id) on delete cascade,
  period text not null,
  "collectedVat" numeric not null default 0,
  "deductibleVat" numeric not null default 0,
  "vatDue" numeric not null default 0,
  status text not null check (status in ('draft', 'ready', 'filed'))
);

create table if not exists public.financial_reports (
  id text primary key,
  "companyId" text not null references public.financial_settings(id) on delete cascade,
  month text not null,
  revenue numeric not null default 0,
  expenses numeric not null default 0,
  cashflow numeric not null default 0,
  "netProfit" numeric not null default 0
);

alter table public.financial_settings enable row level security;
alter table public.accounting_categories enable row level security;
alter table public.bank_accounts enable row level security;
alter table public.transactions enable row level security;
alter table public.expenses enable row level security;
alter table public.revenues enable row level security;
alter table public.accounting_entries enable row level security;
alter table public.tax_records enable row level security;
alter table public.financial_reports enable row level security;

create policy "finance settings read" on public.financial_settings for select to anon, authenticated using (true);
create policy "finance settings write" on public.financial_settings for all to anon, authenticated using (true) with check (true);
create policy "finance categories read" on public.accounting_categories for select to anon, authenticated using (true);
create policy "finance categories write" on public.accounting_categories for all to anon, authenticated using (true) with check (true);
create policy "finance banks read" on public.bank_accounts for select to anon, authenticated using (true);
create policy "finance banks write" on public.bank_accounts for all to anon, authenticated using (true) with check (true);
create policy "finance tx read" on public.transactions for select to anon, authenticated using (true);
create policy "finance tx write" on public.transactions for all to anon, authenticated using (true) with check (true);
create policy "finance expenses read" on public.expenses for select to anon, authenticated using (true);
create policy "finance expenses write" on public.expenses for all to anon, authenticated using (true) with check (true);
create policy "finance revenues read" on public.revenues for select to anon, authenticated using (true);
create policy "finance revenues write" on public.revenues for all to anon, authenticated using (true) with check (true);
create policy "finance entries read" on public.accounting_entries for select to anon, authenticated using (true);
create policy "finance entries write" on public.accounting_entries for all to anon, authenticated using (true) with check (true);
create policy "finance taxes read" on public.tax_records for select to anon, authenticated using (true);
create policy "finance taxes write" on public.tax_records for all to anon, authenticated using (true) with check (true);
create policy "finance reports read" on public.financial_reports for select to anon, authenticated using (true);
create policy "finance reports write" on public.financial_reports for all to anon, authenticated using (true) with check (true);

alter publication supabase_realtime add table public.transactions;
alter publication supabase_realtime add table public.expenses;
alter publication supabase_realtime add table public.revenues;
alter publication supabase_realtime add table public.bank_accounts;
alter publication supabase_realtime add table public.accounting_entries;
alter publication supabase_realtime add table public.tax_records;
alter publication supabase_realtime add table public.financial_reports;
alter publication supabase_realtime add table public.financial_settings;
alter publication supabase_realtime add table public.accounting_categories;
