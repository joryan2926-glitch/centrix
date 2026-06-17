-- Align module entitlements with the CENTRIX commercial plan matrix.
-- FREE: cockpit only. STARTER: core business tools. PREMIUM: AI/analytics/automation.
-- BUSINESS: advanced operations. ENTERPRISE: group/admin capabilities.

delete from public.plan_modules;

insert into public.plan_modules(plan_code, module_key)
select plan_code, module_key from (values
  ('free','dashboard'),
  ('free','notifications'),

  ('starter','dashboard'),
  ('starter','crm'),
  ('starter','clients'),
  ('starter','billing'),
  ('starter','agenda'),
  ('starter','notifications'),

  ('premium','dashboard'),
  ('premium','crm'),
  ('premium','clients'),
  ('premium','billing'),
  ('premium','agenda'),
  ('premium','ai'),
  ('premium','analytics'),
  ('premium','workflows'),
  ('premium','marketing'),
  ('premium','notifications'),

  ('business','dashboard'),
  ('business','crm'),
  ('business','clients'),
  ('business','billing'),
  ('business','agenda'),
  ('business','ai'),
  ('business','analytics'),
  ('business','workflows'),
  ('business','marketing'),
  ('business','projects'),
  ('business','hr'),
  ('business','documents'),
  ('business','integrations'),
  ('business','finance'),
  ('business','support'),
  ('business','legal'),
  ('business','marketplace'),
  ('business','academy'),
  ('business','security'),
  ('business','notifications'),

  ('enterprise','dashboard'),
  ('enterprise','crm'),
  ('enterprise','clients'),
  ('enterprise','billing'),
  ('enterprise','agenda'),
  ('enterprise','ai'),
  ('enterprise','analytics'),
  ('enterprise','workflows'),
  ('enterprise','marketing'),
  ('enterprise','projects'),
  ('enterprise','hr'),
  ('enterprise','documents'),
  ('enterprise','integrations'),
  ('enterprise','finance'),
  ('enterprise','support'),
  ('enterprise','legal'),
  ('enterprise','marketplace'),
  ('enterprise','academy'),
  ('enterprise','security'),
  ('enterprise','multi-company'),
  ('enterprise','franchises'),
  ('enterprise','white-label'),
  ('enterprise','settings'),
  ('enterprise','notifications')
) as access(plan_code, module_key)
on conflict do nothing;

update public.subscription_plans set modules = array['dashboard','notifications'] where code='free';
update public.subscription_plans set modules = array['dashboard','crm','clients','billing','agenda','notifications'] where code='starter';
update public.subscription_plans set modules = array['dashboard','crm','clients','billing','agenda','ai','analytics','workflows','marketing','notifications'] where code='premium';
update public.subscription_plans set modules = array['dashboard','crm','clients','billing','agenda','ai','analytics','workflows','marketing','projects','hr','documents','integrations','finance','support','legal','marketplace','academy','security','notifications'] where code='business';
update public.subscription_plans set modules = array['all'] where code='enterprise';
