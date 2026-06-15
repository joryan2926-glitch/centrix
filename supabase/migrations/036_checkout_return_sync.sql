drop policy if exists "billing customers member insert" on public.billing_customers;
drop policy if exists "billing customers member update" on public.billing_customers;

create policy "billing customers member insert" on public.billing_customers
  for insert to authenticated
  with check (public.is_workspace_member(workspace_id));

create policy "billing customers member update" on public.billing_customers
  for update to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
