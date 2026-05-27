create table if not exists public.service_categories (
  id text primary key,
  slug text not null unique,
  name text not null,
  color text not null default '#5ee7ff'
);

create table if not exists public.providers (
  id text primary key,
  name text not null,
  "companyName" text not null,
  email text not null,
  "stripeAccountId" text,
  verified boolean not null default false,
  premium boolean not null default false,
  level text not null check (level in ('new', 'pro', 'expert', 'top_rated')),
  availability text not null check (availability in ('available', 'busy', 'offline')),
  skills text[] not null default '{}'::text[],
  rating numeric not null default 0,
  "completedOrders" numeric not null default 0,
  revenue numeric not null default 0,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.marketplace_services (
  id text primary key,
  "providerId" text not null references public.providers(id) on delete cascade,
  "categoryId" text not null references public.service_categories(id) on delete restrict,
  title text not null,
  description text not null,
  price numeric not null default 0,
  "deliveryDays" numeric not null default 7,
  status text not null check (status in ('draft', 'published', 'featured')),
  "mediaUrls" text[] not null default '{}'::text[],
  options jsonb not null default '[]'::jsonb,
  sales numeric not null default 0,
  rating numeric not null default 0,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.marketplace_orders (
  id text primary key,
  "serviceId" text not null references public.marketplace_services(id) on delete cascade,
  "providerId" text not null references public.providers(id) on delete cascade,
  "clientName" text not null,
  "clientEmail" text not null,
  status text not null check (status in ('pending', 'accepted', 'in_progress', 'delivered', 'completed', 'canceled')),
  amount numeric not null default 0,
  "commissionAmount" numeric not null default 0,
  "dueAt" timestamptz not null,
  "deliveredAt" timestamptz,
  "stripePaymentIntentId" text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.provider_reviews (
  id text primary key,
  "providerId" text not null references public.providers(id) on delete cascade,
  "orderId" text not null references public.marketplace_orders(id) on delete cascade,
  "clientName" text not null,
  rating numeric not null check (rating between 1 and 5),
  comment text not null,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.order_messages (
  id text primary key,
  "orderId" text not null references public.marketplace_orders(id) on delete cascade,
  "authorType" text not null check ("authorType" in ('client', 'provider', 'system')),
  "authorName" text not null,
  content text not null,
  attachments text[] not null default '{}'::text[],
  "createdAt" timestamptz not null default now()
);

create table if not exists public.payouts (
  id text primary key,
  "providerId" text not null references public.providers(id) on delete cascade,
  amount numeric not null default 0,
  status text not null check (status in ('pending', 'paid', 'failed')),
  "stripeTransferId" text,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.marketplace_notifications (
  id text primary key,
  title text not null,
  detail text not null,
  severity text not null check (severity in ('info', 'success', 'warning')),
  "createdAt" timestamptz not null default now()
);

create table if not exists public.provider_portfolios (
  id text primary key,
  "providerId" text not null references public.providers(id) on delete cascade,
  title text not null,
  description text not null,
  "mediaUrl" text,
  "createdAt" timestamptz not null default now()
);

alter table public.marketplace_services enable row level security;
alter table public.service_categories enable row level security;
alter table public.providers enable row level security;
alter table public.provider_reviews enable row level security;
alter table public.marketplace_orders enable row level security;
alter table public.order_messages enable row level security;
alter table public.payouts enable row level security;
alter table public.marketplace_notifications enable row level security;
alter table public.provider_portfolios enable row level security;

create policy "marketplace services read" on public.marketplace_services for select to anon, authenticated using (true);
create policy "marketplace services write" on public.marketplace_services for all to anon, authenticated using (true) with check (true);
create policy "service categories read" on public.service_categories for select to anon, authenticated using (true);
create policy "service categories write" on public.service_categories for all to anon, authenticated using (true) with check (true);
create policy "providers read" on public.providers for select to anon, authenticated using (true);
create policy "providers write" on public.providers for all to anon, authenticated using (true) with check (true);
create policy "provider reviews read" on public.provider_reviews for select to anon, authenticated using (true);
create policy "provider reviews write" on public.provider_reviews for all to anon, authenticated using (true) with check (true);
create policy "marketplace orders read" on public.marketplace_orders for select to anon, authenticated using (true);
create policy "marketplace orders write" on public.marketplace_orders for all to anon, authenticated using (true) with check (true);
create policy "order messages read" on public.order_messages for select to anon, authenticated using (true);
create policy "order messages write" on public.order_messages for all to anon, authenticated using (true) with check (true);
create policy "payouts read" on public.payouts for select to anon, authenticated using (true);
create policy "payouts write" on public.payouts for all to anon, authenticated using (true) with check (true);
create policy "marketplace notifications read" on public.marketplace_notifications for select to anon, authenticated using (true);
create policy "marketplace notifications write" on public.marketplace_notifications for all to anon, authenticated using (true) with check (true);
create policy "provider portfolios read" on public.provider_portfolios for select to anon, authenticated using (true);
create policy "provider portfolios write" on public.provider_portfolios for all to anon, authenticated using (true) with check (true);

alter publication supabase_realtime add table public.marketplace_services;
alter publication supabase_realtime add table public.service_categories;
alter publication supabase_realtime add table public.providers;
alter publication supabase_realtime add table public.provider_reviews;
alter publication supabase_realtime add table public.marketplace_orders;
alter publication supabase_realtime add table public.order_messages;
alter publication supabase_realtime add table public.payouts;
alter publication supabase_realtime add table public.marketplace_notifications;
alter publication supabase_realtime add table public.provider_portfolios;
