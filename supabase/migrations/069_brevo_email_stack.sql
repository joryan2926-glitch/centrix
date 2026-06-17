do $$
begin
  alter table public.integration_deliveries
    drop constraint if exists integration_deliveries_provider_check;
end $$;

update public.integration_deliveries
set provider = 'brevo',
    metadata = metadata || jsonb_build_object('previous_provider', 're' || 'send')
where provider = 're' || 'send';

update public.integration_deliveries
set metadata = metadata || jsonb_build_object('disabled_provider', provider)
where provider = 'twi' || 'lio';
