-- Keep a backwards-compatible "social" entitlement alias for social media workflows.
-- UI routes still map social media pages to the "marketing" module key.

insert into public.permissions(id, module_key, action)
select 'social:' || action, 'social', action
from (values ('read'), ('create'), ('update'), ('delete'), ('export'), ('manage')) as actions(action)
on conflict (id) do nothing;

insert into public.role_permissions(role_id, permission_id)
select role_id, p.id
from (values
  ('super_admin', 'read'), ('super_admin', 'create'), ('super_admin', 'update'), ('super_admin', 'delete'), ('super_admin', 'export'), ('super_admin', 'manage'),
  ('admin', 'read'), ('admin', 'create'), ('admin', 'update'), ('admin', 'delete'), ('admin', 'export'), ('admin', 'manage'),
  ('manager', 'read'), ('manager', 'create'), ('manager', 'update'), ('manager', 'export'),
  ('employee', 'read'), ('employee', 'create'), ('employee', 'update'),
  ('user', 'read'), ('client', 'read')
) as grants(role_id, action)
join public.permissions p on p.module_key = 'social' and p.action = grants.action
on conflict do nothing;

insert into public.plan_modules(plan_code, module_key)
values
  ('premium', 'social'),
  ('business', 'social'),
  ('enterprise', 'social')
on conflict do nothing;

update public.subscription_plans
set modules = array_append(modules, 'social')
where code in ('premium', 'business')
  and not modules @> array['social'];
