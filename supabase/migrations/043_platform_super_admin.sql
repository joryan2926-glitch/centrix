create or replace function public.platform_super_admin_id()
returns uuid language sql security definer set search_path=public stable as $$
  select id from auth.users order by created_at asc limit 1;
$$;

update public.users set role='admin',updated_at=now()
where role='super_admin' and id is distinct from public.platform_super_admin_id();
update public.profiles set role='admin',updated_at=now()
where role='super_admin' and id is distinct from public.platform_super_admin_id();
update public.workspace_members set role='admin',updated_at=now()
where role='super_admin' and user_id is distinct from public.platform_super_admin_id();

update public.users set role='super_admin',updated_at=now() where id=public.platform_super_admin_id();
update public.profiles set role='super_admin',updated_at=now() where id=public.platform_super_admin_id();
update public.workspace_members set role='super_admin',updated_at=now() where user_id=public.platform_super_admin_id();

create or replace function public.normalize_centrix_owner_role()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.id is distinct from public.platform_super_admin_id() then
    update public.users set role='admin',updated_at=now() where id=new.id;
    update public.profiles set role='admin',updated_at=now() where id=new.id;
    update public.workspace_members set role='admin',updated_at=now() where user_id=new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists zz_normalize_centrix_owner_role on auth.users;
create trigger zz_normalize_centrix_owner_role
after insert on auth.users
for each row execute function public.normalize_centrix_owner_role();
