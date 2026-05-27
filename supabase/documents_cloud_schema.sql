insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'centrix-documents',
  'centrix-documents',
  false,
  52428800,
  array[
    'application/pdf',
    'application/zip',
    'image/png',
    'image/jpeg',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do nothing;

create table if not exists public.folders (
  id text primary key,
  "parentId" text references public.folders(id) on delete cascade,
  name text not null,
  space text not null check (space in ('personal', 'company')),
  color text not null default '#5ee7ff',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.documents (
  id text primary key,
  "folderId" text references public.folders(id) on delete set null,
  name text not null,
  extension text not null,
  "mimeType" text not null,
  size numeric not null default 0,
  category text not null check (category in ('contract', 'invoice', 'quote', 'hr', 'legal', 'accounting', 'image', 'archive', 'other')),
  "storagePath" text,
  url text,
  favorite boolean not null default false,
  shared boolean not null default false,
  downloads numeric not null default 0,
  "signatureStatus" text not null default 'none' check ("signatureStatus" in ('none', 'pending', 'signed', 'rejected')),
  "ocrStatus" text not null default 'not_required' check ("ocrStatus" in ('pending', 'indexed', 'failed', 'not_required')),
  "moduleLink" text not null default 'none' check ("moduleLink" in ('crm', 'billing', 'hr', 'legal', 'finance', 'none')),
  tags text[] not null default '{}'::text[],
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.document_shares (
  id text primary key,
  "documentId" text not null references public.documents(id) on delete cascade,
  email text not null,
  permission text not null check (permission in ('read', 'write', 'admin')),
  "secureLink" text not null,
  "expiresAt" timestamptz,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.document_comments (
  id text primary key,
  "documentId" text not null references public.documents(id) on delete cascade,
  author text not null,
  content text not null,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.document_versions (
  id text primary key,
  "documentId" text not null references public.documents(id) on delete cascade,
  version numeric not null default 1,
  size numeric not null default 0,
  "storagePath" text,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.storage_usage (
  id text primary key,
  space text not null check (space in ('personal', 'company')),
  "usedBytes" numeric not null default 0,
  "limitBytes" numeric not null default 0,
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.document_tags (
  id text primary key,
  label text not null unique,
  color text not null default '#5ee7ff'
);

create table if not exists public.document_notifications (
  id text primary key,
  "documentId" text references public.documents(id) on delete cascade,
  title text not null,
  detail text not null,
  severity text not null check (severity in ('info', 'success', 'warning')),
  "createdAt" timestamptz not null default now()
);

alter table public.documents enable row level security;
alter table public.folders enable row level security;
alter table public.document_shares enable row level security;
alter table public.document_comments enable row level security;
alter table public.document_versions enable row level security;
alter table public.storage_usage enable row level security;
alter table public.document_tags enable row level security;
alter table public.document_notifications enable row level security;

create policy "documents read" on public.documents for select to anon, authenticated using (true);
create policy "documents write" on public.documents for all to anon, authenticated using (true) with check (true);
create policy "folders read" on public.folders for select to anon, authenticated using (true);
create policy "folders write" on public.folders for all to anon, authenticated using (true) with check (true);
create policy "document shares read" on public.document_shares for select to anon, authenticated using (true);
create policy "document shares write" on public.document_shares for all to anon, authenticated using (true) with check (true);
create policy "document comments read" on public.document_comments for select to anon, authenticated using (true);
create policy "document comments write" on public.document_comments for all to anon, authenticated using (true) with check (true);
create policy "document versions read" on public.document_versions for select to anon, authenticated using (true);
create policy "document versions write" on public.document_versions for all to anon, authenticated using (true) with check (true);
create policy "storage usage read" on public.storage_usage for select to anon, authenticated using (true);
create policy "storage usage write" on public.storage_usage for all to anon, authenticated using (true) with check (true);
create policy "document tags read" on public.document_tags for select to anon, authenticated using (true);
create policy "document tags write" on public.document_tags for all to anon, authenticated using (true) with check (true);
create policy "document notifications read" on public.document_notifications for select to anon, authenticated using (true);
create policy "document notifications write" on public.document_notifications for all to anon, authenticated using (true) with check (true);

create policy "documents storage read" on storage.objects for select to anon, authenticated using (bucket_id = 'centrix-documents');
create policy "documents storage upload" on storage.objects for insert to anon, authenticated with check (bucket_id = 'centrix-documents');
create policy "documents storage update" on storage.objects for update to anon, authenticated using (bucket_id = 'centrix-documents') with check (bucket_id = 'centrix-documents');
create policy "documents storage delete" on storage.objects for delete to anon, authenticated using (bucket_id = 'centrix-documents');

alter publication supabase_realtime add table public.documents;
alter publication supabase_realtime add table public.folders;
alter publication supabase_realtime add table public.document_shares;
alter publication supabase_realtime add table public.document_comments;
alter publication supabase_realtime add table public.document_versions;
alter publication supabase_realtime add table public.storage_usage;
alter publication supabase_realtime add table public.document_tags;
alter publication supabase_realtime add table public.document_notifications;
