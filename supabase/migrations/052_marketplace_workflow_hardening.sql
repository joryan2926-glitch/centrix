alter table public.providers add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.marketplace_services add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.marketplace_orders add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.provider_reviews add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.order_messages add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.payouts add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.marketplace_notifications add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.provider_portfolios add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;

do $$
declare
  first_workspace uuid;
begin
  select id into first_workspace from public.workspaces order by created_at asc limit 1;
  if first_workspace is not null then
    update public.providers set workspace_id = first_workspace where workspace_id is null;
    update public.marketplace_services set workspace_id = first_workspace where workspace_id is null;
    update public.marketplace_orders set workspace_id = first_workspace where workspace_id is null;
    update public.provider_reviews set workspace_id = first_workspace where workspace_id is null;
    update public.order_messages set workspace_id = first_workspace where workspace_id is null;
    update public.payouts set workspace_id = first_workspace where workspace_id is null;
    update public.marketplace_notifications set workspace_id = first_workspace where workspace_id is null;
    update public.provider_portfolios set workspace_id = first_workspace where workspace_id is null;
  end if;
end $$;

create index if not exists providers_workspace_idx on public.providers(workspace_id, availability);
create index if not exists marketplace_services_workspace_updated_idx on public.marketplace_services(workspace_id, "updatedAt" desc);
create index if not exists marketplace_orders_workspace_created_idx on public.marketplace_orders(workspace_id, "createdAt" desc);
create index if not exists provider_reviews_workspace_created_idx on public.provider_reviews(workspace_id, "createdAt" desc);
create index if not exists order_messages_workspace_created_idx on public.order_messages(workspace_id, "createdAt");
create index if not exists payouts_workspace_created_idx on public.payouts(workspace_id, "createdAt" desc);
create index if not exists marketplace_notifications_workspace_created_idx on public.marketplace_notifications(workspace_id, "createdAt" desc);
create index if not exists provider_portfolios_workspace_created_idx on public.provider_portfolios(workspace_id, "createdAt" desc);

drop policy if exists "marketplace services read" on public.marketplace_services;
drop policy if exists "marketplace services write" on public.marketplace_services;
drop policy if exists "providers read" on public.providers;
drop policy if exists "providers write" on public.providers;
drop policy if exists "provider reviews read" on public.provider_reviews;
drop policy if exists "provider reviews write" on public.provider_reviews;
drop policy if exists "marketplace orders read" on public.marketplace_orders;
drop policy if exists "marketplace orders write" on public.marketplace_orders;
drop policy if exists "order messages read" on public.order_messages;
drop policy if exists "order messages write" on public.order_messages;
drop policy if exists "payouts read" on public.payouts;
drop policy if exists "payouts write" on public.payouts;
drop policy if exists "marketplace notifications read" on public.marketplace_notifications;
drop policy if exists "marketplace notifications write" on public.marketplace_notifications;
drop policy if exists "provider portfolios read" on public.provider_portfolios;
drop policy if exists "provider portfolios write" on public.provider_portfolios;

do $$
declare
  item record;
begin
  for item in
    select * from (values
      ('providers'),
      ('marketplace_services'),
      ('marketplace_orders'),
      ('provider_reviews'),
      ('order_messages'),
      ('payouts'),
      ('marketplace_notifications'),
      ('provider_portfolios')
    ) as mappings(table_name)
  loop
    execute format('drop policy if exists "%s marketplace read" on public.%I', item.table_name, item.table_name);
    execute format('drop policy if exists "%s marketplace insert" on public.%I', item.table_name, item.table_name);
    execute format('drop policy if exists "%s marketplace update" on public.%I', item.table_name, item.table_name);
    execute format('drop policy if exists "%s marketplace delete" on public.%I', item.table_name, item.table_name);
    execute format('create policy "%s marketplace read" on public.%I for select to authenticated using (public.can_use_module(workspace_id, ''marketplace'', ''read''))', item.table_name, item.table_name);
    execute format('create policy "%s marketplace insert" on public.%I for insert to authenticated with check (public.can_use_module(workspace_id, ''marketplace'', ''create''))', item.table_name, item.table_name);
    execute format('create policy "%s marketplace update" on public.%I for update to authenticated using (public.can_use_module(workspace_id, ''marketplace'', ''update'')) with check (public.can_use_module(workspace_id, ''marketplace'', ''update''))', item.table_name, item.table_name);
    execute format('create policy "%s marketplace delete" on public.%I for delete to authenticated using (public.can_use_module(workspace_id, ''marketplace'', ''delete''))', item.table_name, item.table_name);
  end loop;
end $$;

drop policy if exists "service categories read" on public.service_categories;
drop policy if exists "service categories write" on public.service_categories;
create policy "service categories authenticated read" on public.service_categories for select to authenticated using (true);
create policy "service categories authenticated write" on public.service_categories for all to authenticated using (true) with check (true);
