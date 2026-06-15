alter table public.financial_settings add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.expenses add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.revenues add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.accounting_entries add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.tax_records add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.financial_reports add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;

do $$
declare
  first_workspace uuid;
begin
  select id into first_workspace from public.workspaces order by created_at asc limit 1;
  if first_workspace is not null then
    update public.financial_settings set workspace_id = first_workspace where workspace_id is null;
    update public.bank_accounts set workspace_id = first_workspace where workspace_id is null;
    update public.transactions set workspace_id = first_workspace where workspace_id is null;
    update public.expenses set workspace_id = first_workspace where workspace_id is null;
    update public.revenues set workspace_id = first_workspace where workspace_id is null;
    update public.accounting_entries set workspace_id = first_workspace where workspace_id is null;
    update public.tax_records set workspace_id = first_workspace where workspace_id is null;
    update public.financial_reports set workspace_id = first_workspace where workspace_id is null;
  end if;
end $$;

drop policy if exists "finance settings read" on public.financial_settings;
drop policy if exists "finance settings write" on public.financial_settings;
drop policy if exists "finance expenses read" on public.expenses;
drop policy if exists "finance expenses write" on public.expenses;
drop policy if exists "finance revenues read" on public.revenues;
drop policy if exists "finance revenues write" on public.revenues;
drop policy if exists "finance entries read" on public.accounting_entries;
drop policy if exists "finance entries write" on public.accounting_entries;
drop policy if exists "finance taxes read" on public.tax_records;
drop policy if exists "finance taxes write" on public.tax_records;
drop policy if exists "finance reports read" on public.financial_reports;
drop policy if exists "finance reports write" on public.financial_reports;
drop policy if exists "finance categories write" on public.accounting_categories;

create policy "finance settings workspace access" on public.financial_settings for all to authenticated
using (workspace_id in (select workspace_id from public.profiles where id = auth.uid()))
with check (workspace_id in (select workspace_id from public.profiles where id = auth.uid()));
create policy "finance expenses workspace access" on public.expenses for all to authenticated
using (workspace_id in (select workspace_id from public.profiles where id = auth.uid()))
with check (workspace_id in (select workspace_id from public.profiles where id = auth.uid()));
create policy "finance revenues workspace access" on public.revenues for all to authenticated
using (workspace_id in (select workspace_id from public.profiles where id = auth.uid()))
with check (workspace_id in (select workspace_id from public.profiles where id = auth.uid()));
create policy "finance entries workspace access" on public.accounting_entries for all to authenticated
using (workspace_id in (select workspace_id from public.profiles where id = auth.uid()))
with check (workspace_id in (select workspace_id from public.profiles where id = auth.uid()));
create policy "finance taxes workspace access" on public.tax_records for all to authenticated
using (workspace_id in (select workspace_id from public.profiles where id = auth.uid()))
with check (workspace_id in (select workspace_id from public.profiles where id = auth.uid()));
create policy "finance reports workspace access" on public.financial_reports for all to authenticated
using (workspace_id in (select workspace_id from public.profiles where id = auth.uid()))
with check (workspace_id in (select workspace_id from public.profiles where id = auth.uid()));
