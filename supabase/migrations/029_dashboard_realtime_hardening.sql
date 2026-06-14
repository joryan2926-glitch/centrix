do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'clients',
    'prospects',
    'quotes',
    'invoices',
    'projects',
    'tasks',
    'meetings',
    'notifications',
    'support_tickets',
    'analytics'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('alter table public.%I replica identity full', table_name);

    begin
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    exception
      when duplicate_object then null;
    end;
  end loop;
end $$;
