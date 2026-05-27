create table if not exists public.ai_conversations (
  id text primary key,
  title text not null,
  model text not null default 'gpt-5.1',
  "tokensUsed" numeric not null default 0,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.ai_messages (
  id text primary key,
  "conversationId" text not null references public.ai_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  tokens numeric not null default 0,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.ai_templates (
  id text primary key,
  category text not null check (category in ('sales', 'finance', 'legal', 'marketing', 'crm', 'productivity', 'strategy')),
  title text not null,
  prompt text not null,
  favorite boolean not null default false
);

create table if not exists public.ai_generations (
  id text primary key,
  "templateId" text references public.ai_templates(id) on delete set null,
  title text not null,
  output text not null,
  category text not null check (category in ('sales', 'finance', 'legal', 'marketing', 'crm', 'productivity', 'strategy')),
  "createdAt" timestamptz not null default now()
);

create table if not exists public.workflows (
  id text primary key,
  name text not null,
  description text not null,
  active boolean not null default true,
  trigger text not null check (trigger in ('new_client', 'invoice_paid', 'meeting_created', 'new_lead', 'email_received')),
  runs numeric not null default 0,
  "successRate" numeric not null default 100,
  "timeSavedHours" numeric not null default 0,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.workflow_steps (
  id text primary key,
  "workflowId" text not null references public.workflows(id) on delete cascade,
  type text not null check (type in ('trigger', 'condition', 'action')),
  label text not null,
  action text check (action in ('send_notification', 'create_task', 'send_email', 'create_invoice', 'update_crm', 'generate_document')),
  "positionX" numeric not null default 0,
  "positionY" numeric not null default 0,
  "order" numeric not null default 0
);

create table if not exists public.automation_logs (
  id text primary key,
  "workflowId" text not null references public.workflows(id) on delete cascade,
  status text not null check (status in ('success', 'failed', 'running')),
  message text not null,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.ai_notifications (
  id text primary key,
  title text not null,
  detail text not null,
  severity text not null check (severity in ('info', 'success', 'warning')),
  "createdAt" timestamptz not null default now()
);

alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.ai_generations enable row level security;
alter table public.workflows enable row level security;
alter table public.workflow_steps enable row level security;
alter table public.automation_logs enable row level security;
alter table public.ai_notifications enable row level security;
alter table public.ai_templates enable row level security;

create policy "ai conversations read" on public.ai_conversations for select to anon, authenticated using (true);
create policy "ai conversations write" on public.ai_conversations for all to anon, authenticated using (true) with check (true);
create policy "ai messages read" on public.ai_messages for select to anon, authenticated using (true);
create policy "ai messages write" on public.ai_messages for all to anon, authenticated using (true) with check (true);
create policy "ai generations read" on public.ai_generations for select to anon, authenticated using (true);
create policy "ai generations write" on public.ai_generations for all to anon, authenticated using (true) with check (true);
create policy "ai templates read" on public.ai_templates for select to anon, authenticated using (true);
create policy "ai templates write" on public.ai_templates for all to anon, authenticated using (true) with check (true);
create policy "workflows read" on public.workflows for select to anon, authenticated using (true);
create policy "workflows write" on public.workflows for all to anon, authenticated using (true) with check (true);
create policy "workflow steps read" on public.workflow_steps for select to anon, authenticated using (true);
create policy "workflow steps write" on public.workflow_steps for all to anon, authenticated using (true) with check (true);
create policy "automation logs read" on public.automation_logs for select to anon, authenticated using (true);
create policy "automation logs write" on public.automation_logs for all to anon, authenticated using (true) with check (true);
create policy "ai notifications read" on public.ai_notifications for select to anon, authenticated using (true);
create policy "ai notifications write" on public.ai_notifications for all to anon, authenticated using (true) with check (true);

alter publication supabase_realtime add table public.ai_conversations;
alter publication supabase_realtime add table public.ai_messages;
alter publication supabase_realtime add table public.ai_generations;
alter publication supabase_realtime add table public.workflows;
alter publication supabase_realtime add table public.workflow_steps;
alter publication supabase_realtime add table public.automation_logs;
alter publication supabase_realtime add table public.ai_notifications;
alter publication supabase_realtime add table public.ai_templates;
