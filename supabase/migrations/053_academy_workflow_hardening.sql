alter table public.courses add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.course_modules add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.lessons add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.quizzes add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.quiz_results add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.enrollments add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.certificates add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.community_posts add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.community_comments add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.student_progress add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.academy_notifications add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;

do $$
declare
  first_workspace uuid;
begin
  select id into first_workspace from public.workspaces order by created_at asc limit 1;
  if first_workspace is not null then
    update public.courses set workspace_id = first_workspace where workspace_id is null;
    update public.course_modules set workspace_id = first_workspace where workspace_id is null;
    update public.lessons set workspace_id = first_workspace where workspace_id is null;
    update public.quizzes set workspace_id = first_workspace where workspace_id is null;
    update public.quiz_results set workspace_id = first_workspace where workspace_id is null;
    update public.enrollments set workspace_id = first_workspace where workspace_id is null;
    update public.certificates set workspace_id = first_workspace where workspace_id is null;
    update public.community_posts set workspace_id = first_workspace where workspace_id is null;
    update public.community_comments set workspace_id = first_workspace where workspace_id is null;
    update public.student_progress set workspace_id = first_workspace where workspace_id is null;
    update public.academy_notifications set workspace_id = first_workspace where workspace_id is null;
  end if;
end $$;

create index if not exists courses_workspace_updated_idx on public.courses(workspace_id, "updatedAt" desc);
create index if not exists course_modules_workspace_course_idx on public.course_modules(workspace_id, "courseId", "order");
create index if not exists lessons_workspace_module_idx on public.lessons(workspace_id, "moduleId", "order");
create index if not exists quizzes_workspace_lesson_idx on public.quizzes(workspace_id, "lessonId");
create index if not exists quiz_results_workspace_completed_idx on public.quiz_results(workspace_id, "completedAt" desc);
create index if not exists enrollments_workspace_enrolled_idx on public.enrollments(workspace_id, "enrolledAt" desc);
create index if not exists certificates_workspace_issued_idx on public.certificates(workspace_id, "issuedAt" desc);
create index if not exists community_posts_workspace_created_idx on public.community_posts(workspace_id, "createdAt" desc);
create index if not exists community_comments_workspace_created_idx on public.community_comments(workspace_id, "createdAt" desc);
create index if not exists student_progress_workspace_updated_idx on public.student_progress(workspace_id, "updatedAt" desc);
create index if not exists academy_notifications_workspace_created_idx on public.academy_notifications(workspace_id, "createdAt" desc);

do $$
declare
  item record;
begin
  for item in
    select * from (values
      ('courses'),
      ('course_modules'),
      ('lessons'),
      ('quizzes'),
      ('quiz_results'),
      ('enrollments'),
      ('certificates'),
      ('community_posts'),
      ('community_comments'),
      ('student_progress'),
      ('academy_notifications')
    ) as mappings(table_name)
  loop
    execute format('drop policy if exists "academy %s read" on public.%I', replace(item.table_name, '_', ' '), item.table_name);
    execute format('drop policy if exists "academy %s write" on public.%I', replace(item.table_name, '_', ' '), item.table_name);
    execute format('drop policy if exists "%s academy read" on public.%I', item.table_name, item.table_name);
    execute format('drop policy if exists "%s academy insert" on public.%I', item.table_name, item.table_name);
    execute format('drop policy if exists "%s academy update" on public.%I', item.table_name, item.table_name);
    execute format('drop policy if exists "%s academy delete" on public.%I', item.table_name, item.table_name);
    execute format('create policy "%s academy read" on public.%I for select to authenticated using (public.can_use_module(workspace_id, ''academy'', ''read''))', item.table_name, item.table_name);
    execute format('create policy "%s academy insert" on public.%I for insert to authenticated with check (public.can_use_module(workspace_id, ''academy'', ''create''))', item.table_name, item.table_name);
    execute format('create policy "%s academy update" on public.%I for update to authenticated using (public.can_use_module(workspace_id, ''academy'', ''update'')) with check (public.can_use_module(workspace_id, ''academy'', ''update''))', item.table_name, item.table_name);
    execute format('create policy "%s academy delete" on public.%I for delete to authenticated using (public.can_use_module(workspace_id, ''academy'', ''delete''))', item.table_name, item.table_name);
  end loop;
end $$;
