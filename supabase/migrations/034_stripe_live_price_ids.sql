-- Keep the public billing catalog aligned with the live Stripe products.
insert into public.subscription_plans (
  id,
  code,
  name,
  description,
  "monthlyPrice",
  "yearlyPrice",
  "stripePriceId",
  "userLimit",
  "storageLimitGb",
  modules,
  features,
  highlighted
)
values
  (
    'plan-starter',
    'starter',
    'Starter',
    'Pour independants et petites equipes.',
    29,
    290,
    'price_1TiQlX1KedcFY0WPn6DtDsYn',
    5,
    20,
    array['crm', 'billing', 'documents'],
    array['Facturation', 'Documents', '5 utilisateurs'],
    false
  ),
  (
    'plan-premium',
    'premium',
    'Premium',
    'Pour equipes qui veulent automatiser leurs operations.',
    79,
    790,
    'price_1TiQn41KedcFY0WPHEP8zv9b',
    20,
    100,
    array['crm', 'billing', 'finance', 'support', 'documents'],
    array['Support prioritaire', 'Finance', 'Automatisations'],
    true
  ),
  (
    'plan-business',
    'business',
    'Business',
    'Pour PME multi-modules avec reporting avance.',
    149,
    1490,
    'price_1TiQoP1KedcFY0WPqZGlq0DE',
    60,
    500,
    array['crm', 'billing', 'finance', 'hr', 'marketing', 'support', 'documents', 'ai'],
    array['IA Business', 'RH', 'Marketing', '60 utilisateurs'],
    false
  ),
  (
    'plan-enterprise',
    'enterprise',
    'Enterprise',
    'Pour groupes, franchises et besoins securite avances.',
    499,
    4990,
    'price_1TiQpM1KedcFY0WPYQ9A1f2R',
    500,
    5000,
    array['all'],
    array['SSO futur', 'SLA dedie', 'Multi-entreprises', 'Quotas sur mesure'],
    false
  )
on conflict (id) do update set
  code = excluded.code,
  name = excluded.name,
  description = excluded.description,
  "monthlyPrice" = excluded."monthlyPrice",
  "yearlyPrice" = excluded."yearlyPrice",
  "stripePriceId" = excluded."stripePriceId",
  "userLimit" = excluded."userLimit",
  "storageLimitGb" = excluded."storageLimitGb",
  modules = excluded.modules,
  features = excluded.features,
  highlighted = excluded.highlighted;
