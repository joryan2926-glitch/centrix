create table if not exists public.ai_usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  endpoint text not null,
  created_at timestamptz not null default now()
);

create index if not exists ai_usage_events_user_endpoint_created_idx
  on public.ai_usage_events (user_id, endpoint, created_at desc);

alter table public.ai_usage_events enable row level security;

drop policy if exists "ai usage self read" on public.ai_usage_events;
create policy "ai usage self read"
  on public.ai_usage_events
  for select
  to authenticated
  using (user_id = auth.uid());

revoke insert, update, delete on public.ai_usage_events from anon, authenticated;
grant select on public.ai_usage_events to authenticated;

create or replace function public.check_ai_rate_limit(
  p_endpoint text,
  p_limit integer default 20,
  p_window_seconds integer default 60
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_workspace_id uuid;
  safe_limit integer := greatest(1, least(coalesce(p_limit, 20), 100));
  safe_window integer := greatest(10, least(coalesce(p_window_seconds, 60), 86400));
  current_count integer;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select workspace_id into current_workspace_id
  from public.profiles
  where id = current_user_id;

  select count(*) into current_count
  from public.ai_usage_events
  where user_id = current_user_id
    and endpoint = left(coalesce(p_endpoint, 'unknown'), 80)
    and created_at >= now() - make_interval(secs => safe_window);

  if current_count >= safe_limit then
    return jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'retry_after_seconds', safe_window
    );
  end if;

  insert into public.ai_usage_events (user_id, workspace_id, endpoint)
  values (current_user_id, current_workspace_id, left(coalesce(p_endpoint, 'unknown'), 80));

  return jsonb_build_object(
    'allowed', true,
    'remaining', greatest(0, safe_limit - current_count - 1),
    'retry_after_seconds', safe_window
  );
end;
$$;

revoke all on function public.check_ai_rate_limit(text, integer, integer) from public, anon;
grant execute on function public.check_ai_rate_limit(text, integer, integer) to authenticated;
