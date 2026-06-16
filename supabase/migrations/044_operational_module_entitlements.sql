insert into public.plan_modules(plan_code,module_key)
select pm.plan_code, mapping.operation_key
from public.plan_modules pm
join (values
  ('activities','dashboard'),('alerts','dashboard'),('prospects','crm'),('quotes','billing'),('treasury','finance'),
  ('contracts','legal'),('business-plan','legal'),('funding','legal'),('compliance','legal'),('formalities','legal'),
  ('recruitment','hr'),('salaries','hr'),('leave','hr'),('expenses','hr'),('time','hr'),
  ('tasks','projects'),('gantt','projects'),('collaboration','projects'),('messaging','projects'),
  ('emailing','marketing'),('sms','marketing'),('advertising','marketing'),('content-generation','ai'),
  ('financial-analysis','finance'),('document-generator','documents'),('data-chat','ai'),
  ('sav','support'),('faq','support'),('experts','marketplace'),('trainers','academy'),
  ('consultants','marketplace'),('resources','academy'),('connections','security'),('audit','security'),
  ('access','security'),('permissions','settings'),('users','settings'),('roles','settings')
) mapping(operation_key,parent_key) on mapping.parent_key=pm.module_key
on conflict do nothing;
