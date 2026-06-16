alter table public.billing_customers add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.billing_notifications add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.stripe_events add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;

create table if not exists public.subscription_invoices (
  id text primary key,
  "subscriptionId" text not null,
  "customerId" text not null references public.billing_customers(id) on delete cascade,
  number text not null,
  amount numeric not null default 0,
  "vatAmount" numeric not null default 0,
  status text not null check (status in ('paid', 'pending', 'failed', 'refunded')),
  "pdfUrl" text,
  "dueAt" timestamptz not null default now(),
  "paidAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  workspace_id uuid references public.workspaces(id) on delete cascade
);

create table if not exists public.subscription_payments (
  id text primary key,
  "invoiceId" text not null references public.subscription_invoices(id) on delete cascade,
  "customerId" text not null references public.billing_customers(id) on delete cascade,
  "stripePaymentIntentId" text,
  "cardBrand" text not null default 'card',
  "cardLast4" text not null default '0000',
  amount numeric not null default 0,
  status text not null check (status in ('paid', 'pending', 'failed', 'refunded')),
  "createdAt" timestamptz not null default now(),
  workspace_id uuid references public.workspaces(id) on delete cascade
);

create table if not exists public.subscription_usage_limits (
  id text primary key,
  "subscriptionId" text not null,
  metric text not null check (metric in ('users', 'storage', 'ai_tokens', 'documents', 'workflows')),
  used numeric not null default 0,
  "limit" numeric not null default 0,
  workspace_id uuid references public.workspaces(id) on delete cascade
);

do $$
declare
  first_workspace uuid;
begin
  select id into first_workspace from public.workspaces order by created_at asc limit 1;
  if first_workspace is not null then
    update public.billing_customers set workspace_id = first_workspace where workspace_id is null;
    update public.subscriptions set workspace_id = first_workspace where workspace_id is null;
    update public.billing_notifications set workspace_id = first_workspace where workspace_id is null;
    update public.stripe_events set workspace_id = first_workspace where workspace_id is null;
  end if;
end $$;

alter table public.subscription_invoices enable row level security;
alter table public.subscription_payments enable row level security;
alter table public.subscription_usage_limits enable row level security;

create index if not exists billing_customers_workspace_idx on public.billing_customers(workspace_id);
create index if not exists subscriptions_workspace_updated_idx on public.subscriptions(workspace_id, "updatedAt" desc);
create index if not exists subscription_invoices_workspace_created_idx on public.subscription_invoices(workspace_id, "createdAt" desc);
create index if not exists subscription_payments_workspace_created_idx on public.subscription_payments(workspace_id, "createdAt" desc);
create index if not exists subscription_usage_limits_workspace_subscription_idx on public.subscription_usage_limits(workspace_id, "subscriptionId");
create index if not exists billing_notifications_workspace_created_idx on public.billing_notifications(workspace_id, "createdAt" desc);
create index if not exists stripe_events_workspace_created_idx on public.stripe_events(workspace_id, "createdAt" desc);

do $$
declare
  item record;
begin
  for item in
    select * from (values
      ('billing_customers'),
      ('subscriptions'),
      ('subscription_invoices'),
      ('subscription_payments'),
      ('subscription_usage_limits'),
      ('billing_notifications'),
      ('stripe_events')
    ) as mappings(table_name)
  loop
    execute format('drop policy if exists "%s billing read" on public.%I', item.table_name, item.table_name);
    execute format('drop policy if exists "%s billing insert" on public.%I', item.table_name, item.table_name);
    execute format('drop policy if exists "%s billing update" on public.%I', item.table_name, item.table_name);
    execute format('drop policy if exists "%s billing delete" on public.%I', item.table_name, item.table_name);
    execute format('create policy "%s billing read" on public.%I for select to authenticated using (public.can_use_module(workspace_id, ''billing'', ''read''))', item.table_name, item.table_name);
    execute format('create policy "%s billing insert" on public.%I for insert to authenticated with check (public.can_use_module(workspace_id, ''billing'', ''create''))', item.table_name, item.table_name);
    execute format('create policy "%s billing update" on public.%I for update to authenticated using (public.can_use_module(workspace_id, ''billing'', ''update'')) with check (public.can_use_module(workspace_id, ''billing'', ''update''))', item.table_name, item.table_name);
    execute format('create policy "%s billing delete" on public.%I for delete to authenticated using (public.can_use_module(workspace_id, ''billing'', ''delete''))', item.table_name, item.table_name);
  end loop;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.subscription_invoices;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.subscription_payments;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.subscription_usage_limits;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
