alter table public.invoices add column if not exists quote_id uuid references public.quotes(id) on delete set null;
alter table public.invoices add column if not exists vat_rate numeric not null default 20;
alter table public.invoices add column if not exists pdf_url text;
alter table public.invoices add column if not exists stripe_payment_intent_id text;

create index if not exists invoices_workspace_quote_idx on public.invoices(workspace_id, quote_id);
