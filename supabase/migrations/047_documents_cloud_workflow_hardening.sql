alter table public.documents add column if not exists "folderId" text references public.folders(id) on delete set null;
alter table public.documents add column if not exists extension text not null default 'file';
alter table public.documents add column if not exists "mimeType" text not null default 'application/octet-stream';
alter table public.documents add column if not exists size numeric not null default 0;
alter table public.documents add column if not exists "storagePath" text;
alter table public.documents add column if not exists url text;
alter table public.documents add column if not exists favorite boolean not null default false;
alter table public.documents add column if not exists downloads numeric not null default 0;
alter table public.documents add column if not exists "signatureStatus" text not null default 'none';
alter table public.documents add column if not exists "ocrStatus" text not null default 'not_required';
alter table public.documents add column if not exists "moduleLink" text not null default 'none';
alter table public.documents add column if not exists tags text[] not null default '{}'::text[];

create index if not exists documents_workspace_folder_idx on public.documents(workspace_id, "folderId");
create index if not exists documents_workspace_category_idx on public.documents(workspace_id, category);
create index if not exists documents_workspace_updated_idx on public.documents(workspace_id, updated_at desc);
create index if not exists documents_tags_idx on public.documents using gin(tags);
