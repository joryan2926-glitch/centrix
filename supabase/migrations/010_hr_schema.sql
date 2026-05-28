create table if not exists public.hr_employees (
  id text primary key,
  "firstName" text not null,
  "lastName" text not null,
  email text not null,
  phone text not null,
  role text not null,
  department text not null check (department in ('product', 'sales', 'finance', 'people', 'engineering', 'marketing')),
  status text not null check (status in ('active', 'onboarding', 'offboarding', 'leave')),
  location text not null,
  manager text not null,
  "startDate" date not null,
  "avatarInitials" text not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.hr_contracts (
  id text primary key,
  "employeeId" text not null references public.hr_employees(id) on delete cascade,
  type text not null check (type in ('cdi', 'cdd', 'freelance', 'internship')),
  "startDate" date not null,
  "endDate" date,
  "weeklyHours" numeric not null default 35,
  signed boolean not null default false,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.hr_leaves (
  id text primary key,
  "employeeId" text not null references public.hr_employees(id) on delete cascade,
  type text not null check (type in ('paid', 'sick', 'remote', 'parental', 'unpaid')),
  "startDate" date not null,
  "endDate" date not null,
  status text not null check (status in ('pending', 'approved', 'rejected')),
  days numeric not null default 1,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.hr_absences (
  id text primary key,
  "employeeId" text not null references public.hr_employees(id) on delete cascade,
  reason text not null,
  date date not null,
  justified boolean not null default false,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.hr_salaries (
  id text primary key,
  "employeeId" text not null references public.hr_employees(id) on delete cascade,
  "grossAnnual" numeric not null default 0,
  bonus numeric not null default 0,
  currency text not null default 'EUR',
  "effectiveDate" date not null,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.hr_documents (
  id text primary key,
  "employeeId" text not null references public.hr_employees(id) on delete cascade,
  title text not null,
  category text not null check (category in ('contract', 'payroll', 'identity', 'policy')),
  url text not null,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.hr_schedule (
  id text primary key,
  "employeeId" text not null references public.hr_employees(id) on delete cascade,
  date date not null,
  label text not null,
  kind text not null check (kind in ('shift', 'meeting', 'review', 'training')),
  "createdAt" timestamptz not null default now()
);

create table if not exists public.hr_notifications (
  id text primary key,
  title text not null,
  detail text not null,
  tone text not null check (tone in ('info', 'success', 'warning')),
  "createdAt" timestamptz not null default now()
);

alter table public.hr_employees enable row level security;
alter table public.hr_contracts enable row level security;
alter table public.hr_leaves enable row level security;
alter table public.hr_absences enable row level security;
alter table public.hr_salaries enable row level security;
alter table public.hr_documents enable row level security;
alter table public.hr_schedule enable row level security;
alter table public.hr_notifications enable row level security;

create policy "HR employees read" on public.hr_employees for select to anon, authenticated using (true);
create policy "HR employees write" on public.hr_employees for all to anon, authenticated using (true) with check (true);
create policy "HR contracts read" on public.hr_contracts for select to anon, authenticated using (true);
create policy "HR contracts write" on public.hr_contracts for all to anon, authenticated using (true) with check (true);
create policy "HR leaves read" on public.hr_leaves for select to anon, authenticated using (true);
create policy "HR leaves write" on public.hr_leaves for all to anon, authenticated using (true) with check (true);
create policy "HR absences read" on public.hr_absences for select to anon, authenticated using (true);
create policy "HR absences write" on public.hr_absences for all to anon, authenticated using (true) with check (true);
create policy "HR salaries read" on public.hr_salaries for select to anon, authenticated using (true);
create policy "HR salaries write" on public.hr_salaries for all to anon, authenticated using (true) with check (true);
create policy "HR documents read" on public.hr_documents for select to anon, authenticated using (true);
create policy "HR documents write" on public.hr_documents for all to anon, authenticated using (true) with check (true);
create policy "HR schedule read" on public.hr_schedule for select to anon, authenticated using (true);
create policy "HR schedule write" on public.hr_schedule for all to anon, authenticated using (true) with check (true);
create policy "HR notifications read" on public.hr_notifications for select to anon, authenticated using (true);
create policy "HR notifications write" on public.hr_notifications for all to anon, authenticated using (true) with check (true);

do $$
begin
  alter publication supabase_realtime add table public.hr_employees;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.hr_contracts;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.hr_leaves;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.hr_absences;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.hr_salaries;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.hr_documents;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.hr_schedule;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.hr_notifications;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
